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
  const apiKey =
    env?.MY_GEMINI_API_KEY ||
    env?.GEMINI_API_KEY ||
    process.env.MY_GEMINI_API_KEY ||
    process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.warn('[Gemini Chat] No Gemini API Key available in environment variables.');
    return "ধন্যবাদ আপনার বার্তার জন্য! আমাদের সাপোর্ট টিম খুব শীঘ্রই আপনার সাথে যোগাযোগ করবে।";
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

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
      console.warn('[Gemini Chat] Failed to read site_settings', e);
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

    // 2. Conditional Fetch: Active Products (only lightweight summary of top products)
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
        console.warn('[Gemini Chat] Failed to read products from DB', e);
      }
    }

    // 3. Conditional Fetch: Matching Orders (only when order intent or candidate digits are present)
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
        console.warn('[Gemini Chat] Failed to read orders from Turso DB', e);
      }
    }

    // 4. Fetch recent chat history for session context (last 8 messages)
    let historyText = '';
    let hasPriorHistory = false;
    try {
      const historyRes = await db.execute({
        sql: `SELECT sender_type, sender_name, message FROM chat_messages WHERE session_id = ? ORDER BY created_at ASC LIMIT 8`,
        args: [sessionId]
      });

      if (historyRes.rows.length > 0) {
        hasPriorHistory = true;
      }

      historyText = historyRes.rows
        .map(r => `${r.sender_name || (r.sender_type === 'admin' ? 'Support' : 'Customer')}: ${r.message}`)
        .join('\n');
    } catch (e) {
      console.warn('[Gemini Chat] Failed to read history', e);
    }

    // System prompt with [DATABASE_CONTEXT] & strict contact rules
    const systemInstruction = `
You are the polite, respectful, helpful AI Customer Support Representative for "SK WORLD" (a top fashion e-commerce brand in Bangladesh).

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
1. STRICT CONTACT INFO RULE:
   Whenever asked for contact info (phone number, hotline, admin email, address), strictly provide the Admin Support Phone (${adminPhone}) and Admin Support Email (${adminEmail}) from the [DATABASE_CONTEXT] above. NEVER invent, fabricate, or hallucinate any demo numbers, fake emails, or external contact details.

2. GREETING RULE:
   ${hasPriorHistory 
      ? 'CRITICAL: Since this is an ONGOING conversation with prior messages, DO NOT say "Assalamu Alaikum", "Hello", "Welcome to SK WORLD", or any introductory greetings. Jump straight to answering the user\'s question directly.'
      : 'This is the FIRST message from the customer. Greet them warmly once with "আসসালামু আলাইকুম!" or "Hello!", using their name if available.'}

3. ORDER TRACKING:
   - Status translation: PENDING = প্রসেসিং এ আছে, SHIPPED = কুরিয়ারে পাঠানো হয়েছে, DELIVERED = ডেলিভারি সম্পন্ন হয়েছে, CANCELLED = বাতিল হয়েছে.
   - If an order matches in CUSTOMER ORDERS MATCHING QUERY, provide exact Order ID, Status, Items, and Total.

4. TONE & LANGUAGE:
   - Match customer language (Bangla, Banglish, or English).
   - Polite, natural, and concise.
`.trim();

    const fullPrompt = [
      `System Role & Knowledge Base:\n${systemInstruction}\n`,
      `Recent Chat History:\n${historyText || 'No prior chat history'}\n`,
      `Customer Input (${customerName || 'Customer'}): "${customerMessage}"\n`,
      `Write a warm, polite, database-accurate AI customer support response:`
    ].join('\n');

    // List of models to try in case one model is experiencing high demand (503)
    const modelsToTry = ['gemini-3.6-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
    let reply = '';

    for (const modelName of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: fullPrompt,
          config: {
            temperature: 0.7,
          }
        });
        if (response.text?.trim()) {
          reply = response.text.trim();
          break;
        }
      } catch (modelErr: any) {
        console.warn(`[Gemini Chat Model Fallback] Model ${modelName} failed, trying next model. Error:`, modelErr?.message || modelErr);
      }
    }

    if (reply) {
      return reply;
    }

    return "ধন্যবাদ আপনার বার্তার জন্য! আমাদের প্রতিনিধি আপনার প্রশ্নের উত্তর দিতে তৈরি।";
  } catch (err: any) {
    console.error('[Gemini Chat Generation Error]', err);
    return "ধন্যবাদ আপনার বার্তার জন্য! আমাদের সাপোর্ট টিম খুব শীঘ্রই আপনার উত্তর দিচ্ছে।";
  }
}
