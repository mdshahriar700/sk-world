import { Order } from '../types';

export async function getTelegramCredentials(db?: any, env?: Record<string, any>): Promise<{ token: string; chatId: string }> {
  let token = env?.TELEGRAM_BOT_TOKEN || (typeof process !== 'undefined' ? process.env.TELEGRAM_BOT_TOKEN : '') || '';
  let chatId = env?.TELEGRAM_CHAT_ID || (typeof process !== 'undefined' ? process.env.TELEGRAM_CHAT_ID : '') || '';

  if ((!token || !chatId) && db) {
    try {
      const res = await db.execute(`SELECT key, value FROM site_settings WHERE key IN ('telegram_bot_token', 'telegram_chat_id')`);
      for (const row of res.rows) {
        if (row.key === 'telegram_bot_token' && !token) token = String(row.value);
        if (row.key === 'telegram_chat_id' && !chatId) chatId = String(row.value);
      }
    } catch (e) {
      console.error('[Telegram] Failed to load settings from DB', e);
    }
  }

  return { token: token.trim(), chatId: chatId.trim() };
}

export async function sendTelegramOrderNotification(order: Order, env?: Record<string, any>, db?: any): Promise<boolean> {
  const { token, chatId } = await getTelegramCredentials(db, env);

  if (!token || !chatId) {
    console.log('[Telegram Bot] Telegram credentials missing. Configure in Admin Settings or env vars.');
    return false;
  }

  const itemsList = order.items
    .map(
      (item, idx) =>
        `${idx + 1}. *${item.productName}*\n   Size: ${item.size} | Color: ${item.color}\n   Qty: ${item.quantity} x ৳${item.price.toLocaleString()} = *৳${(item.quantity * item.price).toLocaleString()}*`
    )
    .join('\n');

  const message = `🛍️ *NEW ORDER RECEIVED [#${order.id}]*\n\n` +
    `👤 *Customer:* ${order.customer_name}\n` +
    `📞 *Phone:* ${order.phone}\n` +
    `📍 *Address:* ${order.address}\n\n` +
    `📦 *Order Items:*\n${itemsList}\n\n` +
    `💰 *Total Subtotal:* *৳${order.subtotal.toLocaleString()}*\n` +
    `⏳ *Status:* ${order.status.toUpperCase()}\n` +
    `📅 *Date:* ${new Date(order.created_at || Date.now()).toLocaleString()}`;

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown',
      }),
    });

    const data = await res.json();
    return Boolean(data.ok);
  } catch (err) {
    console.error('[Telegram Bot Order Exception]', err);
    return false;
  }
}

export async function sendTelegramChatMessage(
  sessionId: string,
  senderName: string,
  chatMessage: string,
  db?: any,
  env?: Record<string, any>
): Promise<boolean> {
  const { token, chatId } = await getTelegramCredentials(db, env);

  if (!token || !chatId) {
    console.log('[Telegram Chat] Telegram credentials missing.');
    return false;
  }

  const messageText =
    `💬 *NEW LIVE CHAT MESSAGE*\n\n` +
    `👤 *Customer:* ${senderName || 'Storefront Visitor'}\n` +
    `🆔 *Session ID:* \`${sessionId}\`\n\n` +
    `📝 *Message:*\n"${chatMessage}"\n\n` +
    `─────────────\n` +
    `💡 *To Reply:* Reply directly to this message on Telegram, or type "#" + sessionId + " Your reply message"!`;

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: messageText,
        parse_mode: 'Markdown',
      }),
    });

    const data = await res.json();
    if (!data.ok) {
      console.error('[Telegram Chat Error]', data);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[Telegram Chat Exception]', err);
    return false;
  }
}

export async function handleTelegramWebhookUpdate(update: any, db: any, env?: Record<string, any>): Promise<{ success: boolean; replyMessage?: string }> {
  try {
    const msg = update?.message || update?.edited_message;
    if (!msg || !msg.text) return { success: false };

    const text: string = msg.text.trim();
    const replyToText: string = msg.reply_to_message?.text || '';

    // Search for session ID in reply_to_message or in message text itself
    let targetSessionId = '';

    // 1. Try matching session ID in reply_to_message
    const sessionMatchReply = replyToText.match(/(chat_cust_[a-zA-Z0-9_]+)/) || replyToText.match(/Session ID:\s*`?([a-zA-Z0-9_]+)`?/i);
    if (sessionMatchReply) {
      targetSessionId = sessionMatchReply[1];
    }

    // 2. Try matching session ID directly in text e.g. #chat_cust_...
    if (!targetSessionId) {
      const textSessionMatch = text.match(/#(chat_cust_[a-zA-Z0-9_]+)/) || text.match(/(chat_cust_[a-zA-Z0-9_]+)/);
      if (textSessionMatch) {
        targetSessionId = textSessionMatch[1];
      }
    }

    if (!targetSessionId) {
      console.log('[Telegram Webhook] No target session ID identified in message/reply.');
      return { success: false };
    }

    // Clean up hashtag if text started with #chat_cust_xyz
    let cleanReplyText = text;
    if (cleanReplyText.startsWith(`#${targetSessionId}`)) {
      cleanReplyText = cleanReplyText.replace(`#${targetSessionId}`, '').trim();
    }

    if (!cleanReplyText) {
      return { success: false };
    }

    const senderFirstName = msg.from?.first_name || 'Admin';
    const senderTitle = `${senderFirstName} (Telegram)`;

    // Insert response into chat_messages
    await db.execute({
      sql: `INSERT INTO chat_messages (session_id, sender_type, sender_name, message, is_read) VALUES (?, 'admin', ?, ?, 1)`,
      args: [targetSessionId, senderTitle, cleanReplyText]
    });

    // Send confirmation back to Telegram
    const { token, chatId } = await getTelegramCredentials(db, env);
    if (token && msg.chat?.id) {
      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: msg.chat.id,
          reply_to_message_id: msg.message_id,
          text: `✅ Reply delivered to website customer in Session \`${targetSessionId}\`!`,
          parse_mode: 'Markdown'
        })
      });
    }

    return { success: true, replyMessage: cleanReplyText };
  } catch (err) {
    console.error('[Telegram Webhook Exception]', err);
    return { success: false };
  }
}

export async function setupTelegramWebhook(baseUrl: string, db?: any, env?: Record<string, any>): Promise<{ ok: boolean; description?: string }> {
  const { token } = await getTelegramCredentials(db, env);
  if (!token) {
    return { ok: false, description: 'Telegram Bot Token missing' };
  }

  const webhookUrl = `${baseUrl.replace(/\/$/, '')}/api/telegram-webhook`;

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/setWebhook?url=${encodeURIComponent(webhookUrl)}`);
    const data = await res.json();
    return { ok: Boolean(data.ok), description: data.description || JSON.stringify(data) };
  } catch (err: any) {
    return { ok: false, description: err.message };
  }
}

