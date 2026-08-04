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

    // 1. Fetch Store Settings
    let settingsMap: Record<string, string> = {
      site_name: 'SK WORLD',
      contact_phone: '+8801700000000',
      contact_email: 'info@skworld.com',
      delivery_charge_dhaka: '70',
      delivery_charge_outside: '130'
    };
    try {
      const settingsRes = await db.execute('SELECT * FROM site_settings');
      settingsRes.rows.forEach(r => {
        settingsMap[String(r.key)] = String(r.value);
      });
    } catch (e) {
      console.warn('[Gemini Chat] Failed to read site_settings', e);
    }

    // 2. Fetch Active Products from Turso DB
    let productsList: any[] = [];
    try {
      const productsRes = await db.execute(`
        SELECT p.id, p.name, p.price, p.stock_quantity, p.sizes, p.colors, p.description, c.name as category_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.is_active = 1
        ORDER BY p.created_at DESC
        LIMIT 50
      `);

      productsList = productsRes.rows.map(r => ({
        id: Number(r.id),
        name: String(r.name),
        price: `${Number(r.price)} BDT`,
        category: String(r.category_name || 'General'),
        stock: Number(r.stock_quantity),
        sizes: String(r.sizes || ''),
        colors: String(r.colors || ''),
        description: String(r.description || '').substring(0, 120)
      }));
    } catch (e) {
      console.warn('[Gemini Chat] Failed to read products from DB', e);
    }

    // 3. Fetch Categories
    let categoriesList: string[] = [];
    try {
      const categoriesRes = await db.execute('SELECT name FROM categories ORDER BY name ASC');
      categoriesList = categoriesRes.rows.map(r => String(r.name));
    } catch (e) {
      console.warn('[Gemini Chat] Failed to read categories', e);
    }

    // 4. Extract potential phone numbers or order IDs from customerMessage or customerName
    const textToSearch = `${customerName || ''} ${customerMessage || ''}`;
    // Find numbers (e.g. 11 digit phones or order ID digits)
    const digitMatches = textToSearch.match(/\d+/g) || [];
    
    // Clean phone numbers (e.g. 01712345678, 88017...)
    const phoneCandidates = digitMatches.filter(d => d.length >= 7);
    const idCandidates = digitMatches.map(d => parseInt(d, 10)).filter(n => !isNaN(n) && n > 0 && n < 1000000);

    // 5. Query Turso DB for specific matching orders
    let matchingOrders: any[] = [];
    try {
      let sqlConditions: string[] = [];
      let sqlArgs: any[] = [];

      // Email or Name condition (orders table has customer_name, phone, address, items, subtotal, status, created_at)
      if (customerEmail && customerEmail.includes('@')) {
        sqlConditions.push(`customer_name LIKE ?`);
        sqlArgs.push(`%${customerEmail.trim()}%`);
      }

      // Phone condition
      if (phoneCandidates.length > 0) {
        phoneCandidates.forEach(phone => {
          const cleanPhone = phone.slice(-10);
          sqlConditions.push(`phone LIKE ?`);
          sqlArgs.push(`%${cleanPhone}%`);
        });
      }

      // Order ID condition
      if (idCandidates.length > 0) {
        idCandidates.forEach(orderId => {
          sqlConditions.push(`id = ?`);
          sqlArgs.push(orderId);
        });
      }

      // Name condition if non-empty
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
          LIMIT 10
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

      // Always fetch last 10 overall orders for general context
      if (matchingOrders.length === 0) {
        const recentOrdersRes = await db.execute(`
          SELECT id, customer_name, phone, address, items, subtotal, status, created_at 
          FROM orders 
          ORDER BY created_at DESC 
          LIMIT 10
        `);
        matchingOrders = recentOrdersRes.rows.map(r => ({
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

    // 6. Fetch recent chat history for context (last 10 messages)
    let historyText = '';
    let hasPriorHistory = false;
    try {
      const historyRes = await db.execute({
        sql: `SELECT sender_type, sender_name, message FROM chat_messages WHERE session_id = ? ORDER BY created_at ASC LIMIT 10`,
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

    // System prompt with Full Database Knowledge
    const systemInstruction = `
You are the warm, cordial, helpful AI Customer Support Representative for "SK WORLD" (a top fashion e-commerce store in Bangladesh).

CURRENT CUSTOMER PROFILE:
- Name: ${customerName || 'Customer'}
- Email: ${customerEmail || 'Not provided'}

TURSO DATABASE KNOWLEDGE BASE:

1. STORE INFORMATION & POLICIES:
- Brand Name: ${settingsMap.site_name || 'SK WORLD'}
- Contact Phone: ${settingsMap.contact_phone || settingsMap.phone || '+8801700000000'}
- Contact Email: ${settingsMap.contact_email || settingsMap.email || 'info@skworld.com'}
- Delivery Charges: Inside Dhaka: ${settingsMap.delivery_charge_dhaka || '70'} BDT, Outside Dhaka: ${settingsMap.delivery_charge_outside || '130'} BDT.
- Payment Methods: Cash on Delivery (COD), bkash/Nagad available upon request.
- Delivery Time: 2-3 days inside Dhaka, 3-5 days outside Dhaka.
- Exchange/Return Policy: Easy 7-day exchange for size issues or product defects.

2. PRODUCT CATALOG (FETCHED REAL-TIME FROM TURSO DB):
${productsList.length > 0 ? JSON.stringify(productsList, null, 2) : 'No products found'}

3. ORDERS IN DATABASE (FETCHED REAL-TIME FROM TURSO DB):
${matchingOrders.length > 0 ? JSON.stringify(matchingOrders, null, 2) : 'No specific matching orders found in DB'}

CRITICAL CONVERSATION & GREETING RULES:
1. GREETING RULE:
   ${hasPriorHistory 
      ? 'CRITICAL: Since this is an ONGOING conversation with prior messages, DO NOT say "Assalamu Alaikum", "Hello", "Welcome to SK WORLD", or any introductory greetings. Jump straight to answering the user\'s question directly and cordially.'
      : 'This is the FIRST message from the customer. Greet them warmly once with "আসসালামু আলাইকুম!" or "Hello!", using their name if provided.'}

2. ORDER TRACKING:
   - When customer asks about their order or provides a phone number / Order ID / Email, check the "ORDERS IN DATABASE" list above.
   - If an order matches, provide complete, accurate details (Order ID, Status, Items, Subtotal, Address).
   - Status translation: PENDING = প্রসেসিং এ আছে, SHIPPED = কুরিয়ারে পাঠানো হয়েছে, DELIVERED = ডেলিভারি সম্পন্ন হয়েছে, CANCELLED = বাতিল হয়েছে.
   - If no matching order is found, ask them kindly to check their phone number, email, or order ID.

3. TONE & LANGUAGE:
   - Extremely polite, respectful, and friendly ("অত্যন্ত আন্তরিক ও শালীন").
   - Match the language:
     * Bangla input -> clear, elegant Bangla response.
     * Banglish input -> natural Banglish or clean Bangla response.
     * English input -> courteous English response.

4. FORMATTING:
   - Clean spacing, clear bullet points for list of items/details.
   - No code or raw JSON blocks.
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
