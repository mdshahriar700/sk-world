import { GoogleGenAI } from '@google/genai';
import { Client } from '@libsql/client';

export async function generateGeminiChatReply(
  sessionId: string,
  customerMessage: string,
  customerName: string,
  db: Client,
  env?: Record<string, any>
): Promise<string> {
  const apiKey =
    env?.MY_GEMINI_API_KEY ||
    env?.GEMINI_API_KEY ||
    process.env.MY_GEMINI_API_KEY ||
    process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.warn('[Gemini Chat] No Gemini API Key available in environment variables.');
    return "ধন্যবাদ আপনার বার্তার জন্য! আমাদের টিম খুব শীঘ্রই আপনার সাথে যোগাযোগ করবে। (Thank you for your message! Our support team will respond shortly.)";
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
      site_name: 'SK WORL',
      contact_phone: '+8801700000000',
      contact_email: 'info@skworl.com',
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
        SELECT p.name, p.price, p.stock_quantity, p.sizes, p.colors, p.description, c.name as category_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.is_active = 1
        ORDER BY p.created_at DESC
        LIMIT 40
      `);

      productsList = productsRes.rows.map(r => ({
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

    // 4. Fetch recent chat history for context (last 10 messages)
    let historyText = '';
    try {
      const historyRes = await db.execute({
        sql: `SELECT sender_type, sender_name, message FROM chat_messages WHERE session_id = ? ORDER BY created_at ASC LIMIT 10`,
        args: [sessionId]
      });

      historyText = historyRes.rows
        .map(r => `${r.sender_name || (r.sender_type === 'admin' ? 'Support' : 'Customer')}: ${r.message}`)
        .join('\n');
    } catch (e) {
      console.warn('[Gemini Chat] Failed to read history', e);
    }

    // System prompt
    const systemInstruction = `
You are the warm, cordial, helpful AI Customer Support Representative for "SK WORL" (an online high-fashion clothing brand in Bangladesh).

STORE INFORMATION & TURSO DATABASE CONTEXT:
- Brand Name: ${settingsMap.site_name || 'SK WORL'}
- Contact Phone: ${settingsMap.contact_phone || settingsMap.phone || '+8801700000000'}
- Contact Email: ${settingsMap.contact_email || settingsMap.email || 'info@skworl.com'}
- Cash On Delivery (COD): Available all across Bangladesh.
- Delivery Charges: Inside Dhaka: 70 BDT, Outside Dhaka: 130 BDT.
- Delivery Time: 2-3 days inside Dhaka, 3-5 days outside Dhaka.
- Return/Exchange: 7-day easy exchange for size issues or defects.

AVAILABLE CATEGORIES:
${categoriesList.length > 0 ? categoriesList.join(', ') : 'Men Fashion, Women Fashion, Punjabi, Accessories, New Arrivals'}

AVAILABLE PRODUCTS IN STORE CATALOG (FROM TURSO DATABASE):
${productsList.length > 0 ? JSON.stringify(productsList, null, 2) : 'Catalog loading...'}

IMPORTANT CUSTOMER SERVICE GUIDELINES:
1. TONE: Warm, extremely polite, friendly, and respectful ("অত্যন্ত আন্তরিক, শালীন ও ফ্রেন্ডলি"). Start with a warm greeting like "আসসালামু আলাইকুম" or "Welcome to SK WORL!".
2. LANGUAGE ADAPTABILITY:
   - If customer writes in Bangla (e.g., "জামার দাম কত?", "কবে ডেলিভারি পাব?"), respond in warm, polite Bangla.
   - If customer writes in Banglish (e.g., "bhaiya delivery charge koto?", "koto din lagbe?"), respond in warm, natural Banglish or Bangla.
   - If customer writes in English, respond in fluent, courteous English.
3. ACCURACY: Always answer product prices, stock, and details based on the exact catalog data provided above.
4. ORDER HELP: If customer asks about their order status, ask for their Order ID or Phone Number politely so our management team can review it.
5. FORMATTING: Keep your answer neat, well-spaced, easy to read on mobile screens. Do not output raw JSON or code blocks.
`.trim();

    const fullPrompt = [
      `System Role & Knowledge Base:\n${systemInstruction}\n`,
      `Recent Conversation History:\n${historyText || 'No prior history'}\n`,
      `Current Message from Customer (${customerName || 'Customer'}): "${customerMessage}"\n`,
      `Write a warm, helpful, database-accurate customer support response:`
    ].join('\n');

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: fullPrompt,
      config: {
        temperature: 0.7,
      }
    });

    const reply = response.text?.trim();

    if (reply) {
      return reply;
    }

    return "ধন্যবাদ আপনার বার্তার জন্য! আমাদের প্রতিনিধি আপনার প্রশ্নের উত্তর দিতে তৈরি। (Thank you! Our support team is ready to assist you.)";
  } catch (err: any) {
    console.error('[Gemini Chat Generation Error]', err);
    return "ধন্যবাদ আপনার বার্তার জন্য! আমাদের টিম খুব শীঘ্রই আপনার উত্তর দিচ্ছে। (Thank you for contacting SK WORL!)";
  }
}
