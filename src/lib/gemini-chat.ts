import { GoogleGenAI } from '@google/genai';
import { Client } from '@libsql/client';

export async function generateGeminiChatReply(
  sessionId: string,
  customerMessage: string,
  customerName: string,
  db: Client,
  env?: Record<string, any>,
  customerEmail?: string
): Promise<string> {
  const msgTrimmed = (customerMessage || '').trim();
  if (!msgTrimmed) {
    return 'অনুগ্রহ করে আপনার প্রশ্নটি বিস্তারিত লিখুন।';
  }

  // 1. Fetch Dynamic Store Settings & Products & Orders from Turso DB
  let settingsMap: Record<string, string> = {
    site_name: 'SK WORLD',
    footer_phone: '+880 1712 345 678',
    footer_email: 'contact@skworl.com',
    delivery_charge_dhaka: '70',
    delivery_charge_outside: '130'
  };

  try {
    const settingsRes = await db.execute('SELECT key, value FROM site_settings');
    settingsRes.rows.forEach(r => {
      settingsMap[String(r.key)] = String(r.value);
    });
  } catch (e) {
    console.warn('[AI Support] Failed to read site_settings from DB', e);
  }

  const adminPhone = settingsMap.footer_phone || settingsMap.contact_phone || settingsMap.phone || '+880 1712 345 678';
  const adminEmail = settingsMap.footer_email || settingsMap.contact_email || settingsMap.email || 'contact@skworl.com';
  const delDhaka = settingsMap.delivery_charge_dhaka || '70';
  const delOutside = settingsMap.delivery_charge_outside || '130';

  // Extract phone numbers or order IDs from customer query
  const textToSearch = `${customerName || ''} ${msgTrimmed}`;
  const digitMatches = textToSearch.match(/\d+/g) || [];
  const phoneCandidates = digitMatches.filter(d => d.length >= 7);
  const idCandidates = digitMatches.map(d => parseInt(d, 10)).filter(n => !isNaN(n) && n > 0 && n < 1000000);

  const lowerMsg = msgTrimmed.toLowerCase();

  // Fetch active products
  let productsList: any[] = [];
  try {
    const productsRes = await db.execute(`
      SELECT p.id, p.name, p.price, p.stock_quantity, p.sizes, p.colors, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = 1
      ORDER BY p.created_at DESC
      LIMIT 10
    `);
    productsList = productsRes.rows.map(r => ({
      id: Number(r.id),
      name: String(r.name),
      price: `${Number(r.price)} BDT`,
      category: String(r.category_name || 'General'),
      stock: Number(r.stock_quantity) > 0 ? 'In Stock' : 'Out of Stock',
      sizes: String(r.sizes || '')
    }));
  } catch (e) {
    console.warn('[AI Support] Failed to read products', e);
  }

  // Fetch matching orders
  let matchingOrders: any[] = [];
  try {
    let sqlConditions: string[] = [];
    let sqlArgs: any[] = [];

    if (customerEmail && customerEmail.includes('@')) {
      sqlConditions.push(`customer_name LIKE ?`);
      sqlArgs.push(`%${customerEmail.trim()}%`);
    }
    if (phoneCandidates.length > 0) {
      phoneCandidates.forEach(phone => {
        sqlConditions.push(`phone LIKE ?`);
        sqlArgs.push(`%${phone.slice(-10)}%`);
      });
    }
    if (idCandidates.length > 0) {
      idCandidates.forEach(orderId => {
        sqlConditions.push(`id = ?`);
        sqlArgs.push(orderId);
      });
    }

    if (sqlConditions.length > 0) {
      const orderRes = await db.execute({
        sql: `SELECT id, customer_name, phone, address, items, subtotal, status, created_at FROM orders WHERE ${sqlConditions.join(' OR ')} ORDER BY created_at DESC LIMIT 5`,
        args: sqlArgs
      });
      matchingOrders = orderRes.rows.map(r => ({
        order_id: `#${r.id}`,
        customer_name: String(r.customer_name),
        phone: String(r.phone),
        subtotal: `${Number(r.subtotal)} BDT`,
        status: String(r.status || 'pending').toUpperCase(),
        date: String(r.created_at)
      }));
    }
  } catch (e) {
    console.warn('[AI Support] Failed to read matching orders', e);
  }

  // Build Instant Rule-based Smart Answer as baseline/fallback
  const smartDatabaseAnswer = buildSmartDatabaseAnswer(
    msgTrimmed,
    customerName,
    delDhaka,
    delOutside,
    adminPhone,
    adminEmail,
    productsList,
    matchingOrders
  );

  // 2. Try LLM APIs with strict timeout (max 3.5 seconds)
  const grokKey = env?.GROK_API_KEY || process.env.GROK_API_KEY;
  const openrouterKey = env?.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY;
  const cfToken = env?.CLOUDFLARE_API_TOKEN || process.env.CLOUDFLARE_API_TOKEN;
  const cfAccountId = env?.CLOUDFLARE_ACCOUNT_ID || process.env.CLOUDFLARE_ACCOUNT_ID;
  const geminiKey =
    env?.GEMINI_API_KEY ||
    process.env.GEMINI_API_KEY ||
    env?.MY_GEMINI_API_KEY ||
    process.env.MY_GEMINI_API_KEY;

  // System instruction for LLM
  const systemInstruction = `
You are the polite, helpful AI Customer Support Representative for "SK WORLD" fashion brand in Bangladesh.

CUSTOMER: ${customerName || 'Customer'} (${customerEmail || 'No email'})

STORE DATA:
- Delivery Fee: Dhaka ${delDhaka} BDT, Outside Dhaka ${delOutside} BDT (COD Nationwide)
- Helpline: ${adminPhone}, Email: ${adminEmail}
- Exchange: 7-day easy size exchange policy

PRODUCT CATALOG:
${productsList.length > 0 ? JSON.stringify(productsList, null, 2) : 'Catalog available on website'}

CUSTOMER MATCHING ORDERS:
${matchingOrders.length > 0 ? JSON.stringify(matchingOrders, null, 2) : 'No matching order found'}

CRITICAL INSTRUCTIONS:
1. Match customer's language (Bangla or English).
2. Be concise, polite, natural, and helpful.
3. Keep responses accurate based on STORE DATA above.
`.trim();

  // Try calling LLMs with 3.5s race timeout
  try {
    const llmPromise = (async () => {
      // 1. Try Gemini
      if (geminiKey && geminiKey.trim().length > 10) {
        const geminiRes = await tryGeminiApi(geminiKey, `${systemInstruction}\n\nCustomer question: "${msgTrimmed}"`);
        if (geminiRes) return geminiRes;
      }

      // 2. Try Grok / Groq
      if (grokKey && grokKey.trim().length > 10) {
        const grokRes = await tryGrokApi(grokKey, systemInstruction, msgTrimmed);
        if (grokRes) return grokRes;
      }

      // 3. Try OpenRouter
      if (openrouterKey && openrouterKey.trim().length > 10) {
        const routerRes = await tryOpenRouterApi(openrouterKey, systemInstruction, msgTrimmed);
        if (routerRes) return routerRes;
      }

      // 4. Try Cloudflare AI
      if (cfToken && cfToken.trim().length > 10) {
        const cfRes = await tryCloudflareAi(cfToken, cfAccountId, systemInstruction, msgTrimmed);
        if (cfRes) return cfRes;
      }

      return null;
    })();

    // 3.5s timeout race
    const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 3500));
    const llmResult = await Promise.race([llmPromise, timeoutPromise]);

    if (llmResult && llmResult.trim().length > 5) {
      return llmResult.trim();
    }
  } catch (e) {
    console.warn('[AI Support LLM Race Error]', e);
  }

  // Fallback to Instant Database Engine Answer
  return smartDatabaseAnswer;
}

// ----------------------------------------------------------------------
// INSTANT DATABASE ANSWER GENERATOR
// ----------------------------------------------------------------------
function buildSmartDatabaseAnswer(
  msg: string,
  customerName: string,
  delDhaka: string,
  delOutside: string,
  adminPhone: string,
  adminEmail: string,
  products: any[],
  orders: any[]
): string {
  const lower = msg.toLowerCase();

  // 1. Delivery Charge / Shipping query
  if (/charge|delivery|ship|ডেলিভারি|চার্জ|কুরিয়ার|ভাড়া|পাঠানো/i.test(msg)) {
    return `SK WORLD-এর ডেলিভারি চার্জ:\n\n• ঢাকা সিটির ভেতরে: ৳${delDhaka}\n• ঢাকা সিটির বাইরে: ৳${delOutside}\n\nআমরা সারা বাংলাদেশে ক্যাশ অন ডেলিভারি (COD) সুবিধা দিচ্ছি। আপনার পছন্দের প্রোডাক্টটি অর্ডার করতে শপ সেকশন ভিজিট করুন! 🛍️`;
  }

  // 2. Size & Exchange policy query
  if (/size|exchange|return|measurement|সাইজ|মেজারমেন্ট|রিটার্ন|চেঞ্জ|পাল্টানো/i.test(msg)) {
    return `SK WORLD-এর এক্সচেঞ্জ পলিসি & সাইজ গাইড:\n\n• সাইজ সংক্রান্ত সমস্যায় প্রোডাক্ট পাওয়ার ৭ দিনের মধ্যে সহজ এক্সচেঞ্জ সুবিধা পাবেন।\n• শুধুমাত্র আন-ওয়ার্ন (অব্যবহৃত) অবস্থায় প্রোডাক্ট রিটার্ন বা সাইজ সোয়াপ করা যাবে।\n\nসাহায্যের জন্য হেল্পলাইনে যোগাযোগ করুন: ${adminPhone}`;
  }

  // 3. Greeting
  if (/^(hello|hi|hey|سلام|আসসালামু|আসসালামু আলাইকুম|হ্যালো|হাই)/i.test(lower) && msg.length < 25) {
    return `আসসালামু আলাইকুম ${customerName ? customerName : ''}! SK WORLD-এ আপনাকে স্বাগতম। 🌟\n\nপ্রোডাক্ট কালেকশন, দাম, সাইজ বা অর্ডার ট্র্যাকিং সংক্রান্ত যেকোনো প্রশ্ন আমাদের করুন।`;
  }

  // 4. Order Tracking query
  if (/order|track|status|অর্ডার|ট্র্যাক|অবস্থা|আইডি/i.test(msg) || orders.length > 0) {
    if (orders.length > 0) {
      const o = orders[0];
      const statusMap: Record<string, string> = {
        PENDING: 'প্রসেসিং এ আছে (Processing)',
        SHIPPED: 'কুরিয়ারে পাঠানো হয়েছে (Shipped)',
        DELIVERED: 'ডেলিভারি সম্পন্ন হয়েছে (Delivered)',
        CANCELLED: 'বাতিল হয়েছে (Cancelled)'
      };
      const banglaStatus = statusMap[o.status] || o.status;
      return `আপনার সাম্প্রতিক অর্ডারের তথ্য:\n\n📦 অর্ডার আইডি: ${o.order_id}\n👤 নাম: ${o.customer_name}\n💰 মোট: ${o.subtotal}\n📌 স্ট্যাটাস: ${banglaStatus}\n\nযেকোনো সহায়তায় কল করুন: ${adminPhone}`;
    }
    return `আপনার অর্ডার সম্পর্কিত তথ্য জানতে আপনার মোবাইল নম্বর অথবা অর্ডার আইডিটি মেসেজে লিখুন। আমরা সাথে সাথেই তথ্য জানিয়ে দিচ্ছি! 📦`;
  }

  // 5. Products / Prices / Catalog query
  if (/product|item|hoodie|shirt|jacket|price|cost|stock|collection|দাম|সাইজ|স্টক|পণ্য|কালেকশন|টিশার্ট|হালকা/i.test(msg)) {
    if (products.length > 0) {
      const top4 = products.slice(0, 4);
      const itemsFormatted = top4.map(p => `• ${p.name} - ${p.price} (${p.stock})`).join('\n');
      return `আমাদের বর্তমান জনপ্রিয় কালেকশন ও দাম:\n\n${itemsFormatted}\n\nসম্পূর্ণ কালেকশন দেখতে ওয়েবসাইট শপ পেইজ ভিজিট করুন অথবা আপনার কাঙ্ক্ষিত প্রোডাক্টটির নাম লিখে মেসেজ করুন! ✨`;
    }
    return `আমাদের শপে প্রিমিয়াম ৪০GSM হেভিওয়েট হুডি, বক্সি ফিট টিশার্ট এবং জ্যাকেট কালেকশন এভেলেবল আছে। অনুগ্রহ করে নির্দিষ্ট প্রোডাক্টের নাম লিখুন অথবা শপ পেজ দেখুন।`;
  }

  // 6. Contact & Helpline query
  if (/contact|phone|number|email|help|support|হেল্পলাইন|ফোন|নম্বর|যোগাযোগ/i.test(msg)) {
    return `SK WORLD সাপোর্ট হটলাইন:\n\n📞 ফোন: ${adminPhone}\n✉️ ইমেইল: ${adminEmail}\n⏰ সময়: প্রতিদিন সকাল ১০টা - রাত ১০টা`;
  }

  // Default warm response with helpline
  return `ধন্যবাদ আপনার বার্তার জন্য, ${customerName}! SK WORLD-এর সাপোর্ট প্রতিনিধি আপনার প্রশ্নটি পেয়েছে। সরাসরি কথা বলতে হটলাইনে কল করতে পারেন: ${adminPhone}`;
}

// ----------------------------------------------------------------------
// HELPER CALLS WITH FAST TIMEOUTS
// ----------------------------------------------------------------------

async function tryGeminiApi(apiKey: string, prompt: string): Promise<string | null> {
  const cleanKey = apiKey.trim();
  try {
    const ai = new GoogleGenAI({ apiKey: cleanKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: { temperature: 0.7, maxOutputTokens: 500 }
    });
    if (response.text?.trim()) return response.text.trim();
  } catch (e) {
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${cleanKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 500 }
        }),
        signal: AbortSignal.timeout(3000)
      });
      if (res.ok) {
        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text?.trim()) return text.trim();
      }
    } catch (err) {}
  }
  return null;
}

async function tryGrokApi(apiKey: string, systemInstruction: string, userMsg: string): Promise<string | null> {
  const cleanKey = apiKey.trim();
  const isGroq = cleanKey.startsWith('gsk_');

  const messages = [
    { role: 'system', content: systemInstruction },
    { role: 'user', content: userMsg }
  ];

  if (isGroq) {
    const groqModels = ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant'];
    for (const model of groqModels) {
      try {
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${cleanKey}`
          },
          body: JSON.stringify({ model, messages, temperature: 0.7, max_tokens: 500 }),
          signal: AbortSignal.timeout(3000)
        });
        if (res.ok) {
          const data = await res.json();
          const content = data?.choices?.[0]?.message?.content;
          if (content && typeof content === 'string' && content.trim()) return content.trim();
        }
      } catch (e) {}
    }
  } else {
    try {
      const res = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${cleanKey}`
        },
        body: JSON.stringify({ model: 'grok-beta', messages, temperature: 0.7, max_tokens: 500 }),
        signal: AbortSignal.timeout(3000)
      });
      if (res.ok) {
        const data = await res.json();
        const content = data?.choices?.[0]?.message?.content;
        if (content && typeof content === 'string' && content.trim()) return content.trim();
      }
    } catch (e) {}
  }
  return null;
}

async function tryOpenRouterApi(apiKey: string, systemInstruction: string, userMsg: string): Promise<string | null> {
  const cleanKey = apiKey.trim();
  const models = [
    'google/gemini-2.0-flash-001',
    'meta-llama/llama-3.3-70b-instruct:free',
    'meta-llama/llama-3.1-8b-instruct:free'
  ];

  for (const model of models) {
    try {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${cleanKey}`,
          'HTTP-Referer': 'https://skworldbd.com',
          'X-Title': 'SK WORLD Bangladesh'
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemInstruction },
            { role: 'user', content: userMsg }
          ],
          temperature: 0.7,
          max_tokens: 500
        }),
        signal: AbortSignal.timeout(3000)
      });
      if (res.ok) {
        const data = await res.json();
        const content = data?.choices?.[0]?.message?.content;
        if (content && typeof content === 'string' && content.trim()) return content.trim();
      }
    } catch (e) {}
  }
  return null;
}

async function tryCloudflareAi(apiKey: string, accountId: string | undefined, systemInstruction: string, userMsg: string): Promise<string | null> {
  if (!accountId) return null;
  try {
    const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/meta/llama-3.1-8b-instruct`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey.trim()}`
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: systemInstruction },
          { role: 'user', content: userMsg }
        ]
      }),
      signal: AbortSignal.timeout(3000)
    });
    if (res.ok) {
      const data = await res.json();
      if (data.result?.response) return data.result.response.trim();
    }
  } catch (e) {}
  return null;
}
