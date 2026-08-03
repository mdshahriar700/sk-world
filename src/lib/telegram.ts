import { Order } from '../types';

export async function sendTelegramOrderNotification(order: Order, env?: Record<string, any>): Promise<boolean> {
  const token = env?.TELEGRAM_BOT_TOKEN || (typeof process !== 'undefined' ? process.env.TELEGRAM_BOT_TOKEN : '');
  const chatId = env?.TELEGRAM_CHAT_ID || (typeof process !== 'undefined' ? process.env.TELEGRAM_CHAT_ID : '');

  if (!token || !chatId) {
    console.log('[Telegram Bot] Telegram credentials missing. Set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID in environment.');
    return false;
  }

  const itemsList = order.items
    .map(
      (item, idx) =>
        `${idx + 1}. *${item.productName}*\n   Size: ${item.size} | Color: ${item.color}\n   Qty: ${item.quantity} x $${item.price.toFixed(2)} = *$${(item.quantity * item.price).toFixed(2)}*`
    )
    .join('\n');

  const message = `🛍️ *NEW ORDER RECEIVED [#${order.id}]*\n\n` +
    `👤 *Customer:* ${order.customer_name}\n` +
    `📞 *Phone:* ${order.phone}\n` +
    `📍 *Address:* ${order.address}\n\n` +
    `📦 *Order Items:*\n${itemsList}\n\n` +
    `💰 *Total Subtotal:* *$${order.subtotal.toFixed(2)}*\n` +
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
    if (!data.ok) {
      console.error('[Telegram Bot Error]', data);
      return false;
    }
    console.log('[Telegram Bot] Notification sent successfully for order #' + order.id);
    return true;
  } catch (err) {
    console.error('[Telegram Bot Exception]', err);
    return false;
  }
}
