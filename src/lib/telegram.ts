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

export async function autoSyncTelegramWebhook(baseUrl: string, db?: any, env?: Record<string, any>): Promise<boolean> {
  if (!baseUrl || !baseUrl.startsWith('http') || !db) return false;

  const targetWebhook = `${baseUrl.replace(/\/$/, '')}/api/telegram-webhook`;

  try {
    const res = await db.execute(`SELECT value FROM site_settings WHERE key = 'telegram_webhook_url'`);
    const currentRegistered = res.rows.length > 0 ? String(res.rows[0].value) : '';

    if (currentRegistered === targetWebhook) {
      return true; // Already synced
    }

    const { token } = await getTelegramCredentials(db, env);
    if (!token) return false;

    console.log(`[Telegram] Syncing Telegram Webhook to: ${targetWebhook}`);
    const webhookRes = await fetch(`https://api.telegram.org/bot${token}/setWebhook?url=${encodeURIComponent(targetWebhook)}`);
    const data = await webhookRes.json();

    if (data.ok) {
      await db.execute({
        sql: `INSERT INTO site_settings (key, value) VALUES ('telegram_webhook_url', ?) ON CONFLICT(key) DO UPDATE SET value = ?`,
        args: [targetWebhook, targetWebhook]
      });
      return true;
    } else {
      console.error('[Telegram Webhook Sync Error]', data);
      return false;
    }
  } catch (err) {
    console.error('[Telegram Webhook Sync Exception]', err);
    return false;
  }
}

export async function sendTelegramChatMessage(
  sessionId: string,
  senderName: string,
  chatMessage: string,
  db?: any,
  env?: Record<string, any>,
  baseUrl?: string
): Promise<boolean> {
  const { token, chatId } = await getTelegramCredentials(db, env);

  if (!token || !chatId) {
    console.log('[Telegram Chat] Telegram credentials missing.');
    return false;
  }

  // Auto sync webhook if baseUrl provided
  if (baseUrl && db) {
    autoSyncTelegramWebhook(baseUrl, db, env).catch((e) => console.error('[AutoSync Webhook Catch]', e));
  }

  const messageText =
    `💬 *NEW LIVE CHAT MESSAGE*\n\n` +
    `👤 *Customer:* ${senderName || 'Storefront Visitor'}\n` +
    `🆔 *Session ID:* \`${sessionId}\`\n\n` +
    `📝 *Message:*\n"${chatMessage}"\n\n` +
    `─────────────\n` +
    `💡 *To Reply:* Reply directly to this message on Telegram, or type your message below!`;

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
    const msg = update?.message || update?.edited_message || update?.channel_post;
    if (!msg) return { success: false };

    const text: string = (msg.text || msg.caption || '').trim();
    const replyToText: string = msg.reply_to_message?.text || msg.reply_to_message?.caption || '';

    // Search for session ID in reply_to_message or in message text itself
    let targetSessionId = '';

    // 1. Try matching session ID in reply_to_message
    const sessionMatchReply = replyToText.match(/(chat_cust_[a-zA-Z0-9_]+)/) || replyToText.match(/Session ID:\s*`?([a-zA-Z0-9_]+)`?/i);
    if (sessionMatchReply) {
      targetSessionId = sessionMatchReply[1];
    }

    // 2. Try matching session ID directly in text e.g. #chat_cust_...
    if (!targetSessionId && text) {
      const textSessionMatch = text.match(/#(chat_cust_[a-zA-Z0-9_]+)/) || text.match(/(chat_cust_[a-zA-Z0-9_]+)/);
      if (textSessionMatch) {
        targetSessionId = textSessionMatch[1];
      }
    }

    // 3. Fallback: If admin replied without specifying session ID, target the most recent customer session!
    if (!targetSessionId && db) {
      const res = await db.execute(`SELECT session_id FROM chat_messages WHERE sender_type = 'customer' ORDER BY id DESC LIMIT 1`);
      if (res.rows.length > 0 && res.rows[0].session_id) {
        targetSessionId = String(res.rows[0].session_id);
      }
    }

    if (!targetSessionId) {
      console.log('[Telegram Webhook] No target session ID identified in message/reply.');
      return { success: false };
    }

    // Clean up session ID from cleanReplyText if text contains it
    let cleanReplyText = text;
    cleanReplyText = cleanReplyText.replace(`#${targetSessionId}`, '').replace(targetSessionId, '').trim();

    if (!cleanReplyText) {
      return { success: false };
    }

    const senderTitle = 'SK WORL Support';

    // Insert response into chat_messages
    await db.execute({
      sql: `INSERT INTO chat_messages (session_id, sender_type, sender_name, message, is_read) VALUES (?, 'admin', ?, ?, 0)`,
      args: [targetSessionId, senderTitle, cleanReplyText]
    });

    // Send confirmation back to Telegram
    const { token } = await getTelegramCredentials(db, env);
    if (token && msg.chat?.id) {
      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: msg.chat.id,
          reply_to_message_id: msg.message_id,
          text: `✅ Reply sent to customer on website (Session \`${targetSessionId}\`)`,
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
    if (data.ok && db) {
      await db.execute({
        sql: `INSERT INTO site_settings (key, value) VALUES ('telegram_webhook_url', ?) ON CONFLICT(key) DO UPDATE SET value = ?`,
        args: [webhookUrl, webhookUrl]
      });
    }
    return { ok: Boolean(data.ok), description: data.description || JSON.stringify(data) };
  } catch (err: any) {
    return { ok: false, description: err.message };
  }
}

