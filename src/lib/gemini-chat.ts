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
  // Extract API keys securely from server-side environment bindings or process.env
  const grokKey = env?.GROK_API_KEY || process.env.GROK_API_KEY;
  const openrouterKey = env?.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY;
  const cfToken = env?.CLOUDFLARE_API_TOKEN || process.env.CLOUDFLARE_API_TOKEN;
  const cfAccountId = env?.CLOUDFLARE_ACCOUNT_ID || process.env.CLOUDFLARE_ACCOUNT_ID;
  const geminiKey =
    env?.MY_GEMINI_API_KEY ||
    env?.GEMINI_API_KEY ||
    process.env.MY_GEMINI_API_KEY ||
    process.env.GEMINI_API_KEY;

  if (!grokKey && !openrouterKey && !cfToken && !geminiKey) {
    console.warn('[AI Chat Waterfall] No API Keys available in server environment variables.');
    return "ধন্যবাদ আপনার বার্তার জন্য! আমাদের সাপোর্ট টিম খুব শীঘ্রই আপনার সাথে যোগাযোগ করবে।";
  }

  try {
    // 1. Fetch Dynamic Store Settings
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
      console.warn('[AI Chat Waterfall] Failed to read site_settings', e);
    }

    const adminPhone = settingsMap.footer_phone || settingsMap.contact_phone || settingsMap.phone || '+880 1712 345 678';
    const adminEmail = settingsMap.footer_email || settingsMap.contact_email || settingsMap.email || 'contact@skworl.com';

    // Extract potential phone numbers or order IDs from message & customer details
    const textToSearch = `${customerName || ''} ${customerMessage || ''}`;
    const digitMatches = textToSearch.match(/\d+/g) || [];
    const phoneCandidates = digitMatches.filter(d => d.length >= 7);
    const idCandidates = digitMatches.map(d => parseInt(d, 10)).filter(n => !isNaN(n) && n > 0 && n < 1000000);

    // Analyze intent to optimize database queries
    const lowerMsg = customerMessage.toLowerCase();
    const isOrderIntent = /order|track|status|delivery|ship|parcel|id|আইডি|অর্ডার|ডেলিভারি|কুরিয়ার|অবস্থা|পাব/i.test(customerMessage) || phoneCandidates.length > 0 || idCandidates.length > 0;
    const isProductIntent = /product|item|hoodie|shirt|jacket|price|cost|size|stock|color|buy|collection|দাম|সাইজ|স্টক|পণ্য|কালেকশন|টিশার্ট/i.test(customerMessage);

    // 2. Conditional Fetch: Active Products Catalog
    let productsList: any[] = [];
    if (isProductIntent || lowerMsg.length < 25) {
      try {
        const productsRes = await db.execute(`
          SELECT p.id, p.name, p.price, p.stock_quantity, p.sizes, p.colors, c.name as category_name
          FROM products p
          LEFT JOIN categories c ON p.category_id = c.id
          WHERE p.is_active = 1
          ORDER BY p.created_at DESC
          LIMIT 15
        `);

        productsList = productsRes.rows.map(r => ({
          id: Number(r.id),
          name: String(r.name),
          price: `${Number(r.price)} BDT`,
          category: String(r.category_name || 'General'),
          stock: Number(r.stock_quantity) > 0 ? 'In Stock' : 'Out of Stock',
          sizes: String(r.sizes || ''),
          colors: String(r.colors || '')
        }));
      } catch (e) {
        console.warn('[AI Chat Waterfall] Failed to read products from DB', e);
      }
    }

    // 3. Conditional Fetch: Matching Orders
    let matchingOrders: any[] = [];
    if (isOrderIntent) {
      try {
        let sqlConditions: string[] = [];
        let sqlArgs: any[] = [];

        if (customerEmail && customerEmail.includes('@')) {
          sqlConditions.push(`customer_name LIKE ?`);
          sqlArgs.push(`%${customerEmail.trim()}%`);
        }

        if (phoneCandidates.length > 0) {
          phoneCandidates.forEach(phone => {
            const cleanPhone = phone.slice(-10);
            sqlConditions.push(`phone LIKE ?`);
            sqlArgs.push(`%${cleanPhone}%`);
          });
        }

        if (idCandidates.length > 0) {
          idCandidates.forEach(orderId => {
            sqlConditions.push(`id = ?`);
            sqlArgs.push(orderId);
          });
        }

        if (customerName && customerName.length > 2 && customerName !== 'Customer') {
          sqlConditions.push(`customer_name LIKE ?`);
          sqlArgs.push(`%${customerName}%`);
        }

        if (sqlConditions.length > 0) {
          const query = `
            SELECT id, customer_name, phone, address, items, subtotal, status, created_at 
            FROM orders 
            WHERE ${sqlConditions.join(' OR ')}
            ORDER BY created_at DESC 
            LIMIT 5
          `;
          const orderRes = await db.execute({ sql: query, args: sqlArgs });
          matchingOrders = orderRes.rows.map(r => ({
            order_id: `#${r.id}`,
            customer_name: String(r.customer_name),
            phone: String(r.phone),
            address: String(r.address),
            items: String(r.items),
            subtotal: `${Number(r.subtotal)} BDT`,
            status: String(r.status || 'pending').toUpperCase(),
            date: String(r.created_at)
          }));
        }
      } catch (e) {
        console.warn('[AI Chat Waterfall] Failed to read orders from Turso DB', e);
      }
    }

    // 4. Fetch recent chat history for session context
    let historyMessages: { role: 'user' | 'assistant'; content: string }[] = [];
    let priorRows: any[] = [];
    try {
      const historyRes = await db.execute({
        sql: `SELECT sender_type, sender_name, message FROM chat_messages WHERE session_id = ? ORDER BY created_at ASC LIMIT 10`,
        args: [sessionId]
      });

      // Exclude the current customer message (which was just inserted as the latest row) to get true prior conversation history
      const allRows = historyRes.rows;
      priorRows = allRows.slice(0, Math.max(0, allRows.length - 1));

      historyMessages = priorRows.map(r => ({
        role: r.sender_type === 'admin' ? ('assistant' as const) : ('user' as const),
        content: String(r.message || '').trim()
      }));
    } catch (e) {
      console.warn('[AI Chat Waterfall] Failed to read history', e);
    }

    // System prompt with [DATABASE_CONTEXT] & strict conversational rules
    const systemInstruction = `
You are the polite, helpful, and conversational AI Customer Support Representative for "SK WORLD" (a top fashion e-commerce brand in Bangladesh).

CURRENT CUSTOMER PROFILE:
- Customer Name: ${customerName || 'Customer'}
- Customer Email: ${customerEmail || 'Not provided'}

[DATABASE_CONTEXT]
STORE CONFIGURATION & CONTACT INFO:
- Brand Name: ${settingsMap.logo_text || settingsMap.site_name || 'SK WORLD'}
- Admin Support Phone: ${adminPhone}
- Admin Support Email: ${adminEmail}
- Delivery Fee (Dhaka): ${settingsMap.delivery_charge_dhaka || '70'} BDT
- Delivery Fee (Outside Dhaka): ${settingsMap.delivery_charge_outside || '130'} BDT
- Payment Options: Cash on Delivery (COD) nationwide across Bangladesh
- Exchange Policy: Easy 7-day size exchange

PRODUCT CATALOG SNAPSHOT:
${productsList.length > 0 ? JSON.stringify(productsList, null, 2) : 'No products requested or matched'}

CUSTOMER ORDERS MATCHING QUERY:
${matchingOrders.length > 0 ? JSON.stringify(matchingOrders, null, 2) : 'No matching order found for this query'}

CRITICAL RULES:
1. CONVERSATIONAL INTENT & GREETING RULE:
   - Answer directly based on what the customer actually asked.
   - DO NOT output delivery information, delivery charges, or store policies unless the customer explicitly asks for them or asks about shipping/delivery.
   - If the customer says a simple greeting (like 'hello', 'hi', 'hey', 'سلام', 'আসসালামু আলাইকুম'), reply with a warm, natural, welcoming greeting (e.g., "Hello! How can I help you today at SK WORLD?" or "আসসালামু আলাইকুম! SK WORLD-এ আপনাকে স্বাগতম। কীভাবে সাহায্য করতে পারি?").

2. STRICT CONTACT INFO RULE:
   - Whenever asked for contact info (phone number, hotline, admin email, address), strictly provide the Admin Support Phone (${adminPhone}) and Admin Support Email (${adminEmail}) from [DATABASE_CONTEXT]. NEVER invent or hallucinate any fake contact details.

3. ORDER TRACKING:
   - Status translation: PENDING = প্রসেসিং এ আছে, SHIPPED = কুরিয়ারে পাঠানো হয়েছে, DELIVERED = ডেলিভারি সম্পন্ন হয়েছে, CANCELLED = বাতিল হয়েছে.
   - If an order matches in CUSTOMER ORDERS MATCHING QUERY, state the exact Order ID, Status, Items, and Total.

4. TONE & LANGUAGE:
   - Match the customer's language (Bangla, Banglish, or English).
   - Polite, natural, professional, and concise.
`.trim();

    const fullPromptForGemini = [
      systemInstruction,
      priorRows.length > 0
        ? `Recent Prior Conversation:\n${priorRows.map(r => `${r.sender_type === 'admin' ? 'Support' : 'Customer'}: ${r.message}`).join('\n')}`
        : '',
      `Customer Input (${customerName || 'Customer'}): "${customerMessage}"`,
      `Write a warm, polite, database-accurate AI customer support response:`
    ].filter(Boolean).join('\n\n');

    // ==============================================================
    // API WATERFALL (FALLBACK CHAIN) IMPLEMENTATION
    // ==============================================================

    // Attempt 1 (Primary): Gemini API (GEMINI_API_KEY)
    if (geminiKey) {
      const geminiReply = await tryGeminiApi(geminiKey, fullPromptForGemini);
      if (geminiReply) return geminiReply;
    }

    // Attempt 2: Grok API (GROK_API_KEY)
    if (grokKey) {
      const grokReply = await tryGrokApi(grokKey, systemInstruction, historyMessages, customerMessage);
      if (grokReply) return grokReply;
    }

    // Attempt 3: OpenRouter API (OPENROUTER_API_KEY)
    if (openrouterKey) {
      const openRouterReply = await tryOpenRouterApi(openrouterKey, systemInstruction, historyMessages, customerMessage);
      if (openRouterReply) return openRouterReply;
    }

    // Attempt 4: Cloudflare Workers AI (CLOUDFLARE_API_TOKEN)
    if (cfToken) {
      const cfReply = await tryCloudflareAi(cfToken, cfAccountId, systemInstruction, historyMessages, customerMessage);
      if (cfReply) return cfReply;
    }

    return "ধন্যবাদ আপনার বার্তার জন্য! SK WORLD-এর সাপোর্ট টিম খুব শীঘ্রই আপনার উত্তর দিচ্ছে।";
  } catch (err: any) {
    return "ধন্যবাদ আপনার বার্তার জন্য! SK WORLD-এর সাপোর্ট টিম খুব শীঘ্রই আপনার উত্তর দিচ্ছে।";
  }
}

// -------------------------------------------------------------
// HELPER FUNCTIONS FOR API WATERFALL ATTEMPTS
// -------------------------------------------------------------

async function tryGrokApi(
  grokKey: string,
  systemInstruction: string,
  historyMsgs: any[],
  customerMessage: string
): Promise<string | null> {
  try {
    const cleanKey = grokKey.trim();
    if (!cleanKey || cleanKey.length < 10) return null;

    const messages = [
      { role: 'system', content: systemInstruction },
      ...historyMsgs,
      { role: 'user', content: customerMessage }
    ];

    const grokModels = ['grok-beta', 'grok-2'];

    for (const model of grokModels) {
      try {
        const res = await fetch('https://api.x.ai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${cleanKey}`
          },
          body: JSON.stringify({
            model,
            messages,
            temperature: 0.7,
            max_tokens: 800
          })
        });

        if (res.ok) {
          const data = await res.json();
          const content = data?.choices?.[0]?.message?.content;
          if (content && typeof content === 'string' && content.trim().length > 0) {
            return content.trim();
          }
        } else {
          const errText = await res.text();
          if (errText.includes('Incorrect API key') || res.status === 401 || res.status === 403) {
            break;
          }
        }
      } catch (mErr: any) {
        // Silently continue to next fallback
      }
    }
  } catch (err: any) {
    // Silently continue
  }
  return null;
}

async function tryOpenRouterApi(
  openRouterKey: string,
  systemInstruction: string,
  historyMsgs: any[],
  customerMessage: string
): Promise<string | null> {
  try {
    const cleanKey = openRouterKey.trim();
    if (!cleanKey || cleanKey.length < 10) return null;

    const messages = [
      { role: 'system', content: systemInstruction },
      ...historyMsgs,
      { role: 'user', content: customerMessage }
    ];

    const models = [
      'google/gemini-2.0-flash-001',
      'meta-llama/llama-3.1-8b-instruct',
      'openai/gpt-4o-mini'
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
            messages,
            temperature: 0.7,
            max_tokens: 800
          })
        });

        if (res.ok) {
          const data = await res.json();
          const content = data?.choices?.[0]?.message?.content;
          if (content && typeof content === 'string' && content.trim().length > 0) {
            return content.trim();
          }
        } else {
          const errText = await res.text();
          if (errText.includes('Unauthorized') || errText.includes('Invalid API key') || res.status === 401 || res.status === 403) {
            break;
          }
        }
      } catch (mErr: any) {
        // Silently continue
      }
    }
  } catch (err: any) {
    // Silently continue
  }
  return null;
}

async function tryCloudflareAi(
  cfToken: string,
  accountId: string | undefined,
  systemInstruction: string,
  historyMsgs: any[],
  customerMessage: string
): Promise<string | null> {
  try {
    let resolvedAccountId = accountId;
    if (!resolvedAccountId) {
      // Auto-discover account ID using token
      const accRes = await fetch('https://api.cloudflare.com/client/v4/accounts', {
        headers: { 'Authorization': `Bearer ${cfToken.trim()}` }
      });
      if (accRes.ok) {
        const accData = await accRes.json();
        if (accData.result && accData.result.length > 0) {
          resolvedAccountId = accData.result[0].id;
        }
      }
    }

    if (!resolvedAccountId) return null;

    const messages = [
      { role: 'system', content: systemInstruction },
      ...historyMsgs,
      { role: 'user', content: customerMessage }
    ];

    const cfModels = [
      '@cf/meta/llama-3.1-8b-instruct',
      '@cf/mistral/mistral-7b-instruct-v0.2'
    ];

    for (const model of cfModels) {
      try {
        const url = `https://api.cloudflare.com/client/v4/accounts/${resolvedAccountId}/ai/run/${model}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${cfToken.trim()}`
          },
          body: JSON.stringify({ messages })
        });

        if (res.ok) {
          const data = await res.json();
          const content = data?.result?.response || data?.result?.description || data?.choices?.[0]?.message?.content;
          if (content && typeof content === 'string' && content.trim().length > 0) {
            return content.trim();
          }
        }
      } catch (e) {
        // Silently continue
      }
    }
  } catch (err: any) {
    // Silently continue
  }
  return null;
}

async function tryGeminiApi(
  geminiKey: string,
  fullPrompt: string
): Promise<string | null> {
  try {
    const ai = new GoogleGenAI({
      apiKey: geminiKey.trim(),
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const geminiModels = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];

    for (const modelName of geminiModels) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: fullPrompt,
          config: {
            temperature: 0.7,
            maxOutputTokens: 800
          }
        });
        if (response.text?.trim()) {
          return response.text.trim();
        }
      } catch (modelErr: any) {
        // Silently continue to next gemini model
      }
    }
  } catch (err: any) {
    // Silently continue
  }
  return null;
}
