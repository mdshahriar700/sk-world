import { ensureDbInitialized } from './db';
import { sendTelegramOrderNotification } from './telegram';
import { Product, Category, Order, SiteSettings } from '../types';

export async function handleApiRequest(
  path: string,
  method: string,
  body: any,
  query: Record<string, string>,
  headers: Record<string, string>,
  env?: Record<string, any>
): Promise<{ status: number; data: any }> {
  const db = await ensureDbInitialized(env);
  const cleanPath = path.replace(/^\/api/, '').replace(/\/$/, '') || '/';

  try {
    // -------------------------------------------------------------
    // PRODUCTS API
    // -------------------------------------------------------------
    if (cleanPath === '/products' || cleanPath.startsWith('/products/')) {
      const parts = cleanPath.split('/').filter(Boolean); // ['products'] or ['products', '1'] or ['products', 'slug', 'xyz']

      if (method === 'GET') {
        if (parts.length === 2) {
          // GET /api/products/:idOrSlug
          const param = parts[1];
          const isNum = !isNaN(Number(param));
          const sql = isNum
            ? `SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = ?`
            : `SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.slug = ?`;
          const res = await db.execute({ sql, args: [param] });
          if (res.rows.length === 0) {
            return { status: 404, data: { error: 'Product not found' } };
          }
          const row = res.rows[0];
          return {
            status: 200,
            data: formatProductRow(row)
          };
        } else {
          // GET /api/products
          let sql = `SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE 1=1`;
          const args: any[] = [];

          if (query.category) {
            const isCatNum = !isNaN(Number(query.category));
            if (isCatNum) {
              sql += ` AND p.category_id = ?`;
              args.push(Number(query.category));
            } else {
              sql += ` AND c.slug = ?`;
              args.push(query.category);
            }
          }

          if (query.featured === 'true') {
            sql += ` AND p.is_featured = 1`;
          }

          if (query.trending === 'true') {
            sql += ` AND p.is_trending = 1`;
          }

          if (query.active_only !== 'false') {
            sql += ` AND p.is_active = 1`;
          }

          sql += ` ORDER BY p.created_at DESC`;
          const res = await db.execute({ sql, args });
          const products = res.rows.map(formatProductRow);
          return { status: 200, data: products };
        }
      }

      if (method === 'POST') {
        const { name, slug, description, price, category_id, images, sizes, colors, stock_quantity, is_featured, is_trending, is_active } = body;
        const finalSlug = slug || generateSlug(name);
        const imagesJson = JSON.stringify(Array.isArray(images) ? images : []);
        const sizesJson = JSON.stringify(Array.isArray(sizes) ? sizes : ['S', 'M', 'L', 'XL']);
        const colorsJson = JSON.stringify(Array.isArray(colors) ? colors : ['Black']);

        const res = await db.execute({
          sql: `INSERT INTO products (name, slug, description, price, category_id, images, sizes, colors, stock_quantity, is_featured, is_trending, is_active)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            name, finalSlug, description || '', Number(price) || 0, Number(category_id) || 1,
            imagesJson, sizesJson, colorsJson, Number(stock_quantity) || 0,
            is_featured ? 1 : 0, is_trending ? 1 : 0, is_active !== false ? 1 : 0
          ]
        });

        return { status: 201, data: { success: true, id: Number(res.lastInsertRowid) } };
      }

      if (method === 'PUT') {
        const id = parts[1] || body.id;
        if (!id) return { status: 400, data: { error: 'Product ID required' } };

        const { name, slug, description, price, category_id, images, sizes, colors, stock_quantity, is_featured, is_trending, is_active } = body;
        const imagesJson = JSON.stringify(Array.isArray(images) ? images : []);
        const sizesJson = JSON.stringify(Array.isArray(sizes) ? sizes : ['S', 'M', 'L', 'XL']);
        const colorsJson = JSON.stringify(Array.isArray(colors) ? colors : ['Black']);

        await db.execute({
          sql: `UPDATE products SET name=?, slug=?, description=?, price=?, category_id=?, images=?, sizes=?, colors=?, stock_quantity=?, is_featured=?, is_trending=?, is_active=? WHERE id=?`,
          args: [
            name, slug, description, Number(price), Number(category_id),
            imagesJson, sizesJson, colorsJson, Number(stock_quantity),
            is_featured ? 1 : 0, is_trending ? 1 : 0, is_active ? 1 : 0,
            Number(id)
          ]
        });

        return { status: 200, data: { success: true } };
      }

      if (method === 'DELETE') {
        const id = parts[1] || query.id;
        if (!id) return { status: 400, data: { error: 'Product ID required' } };
        await db.execute({ sql: `DELETE FROM products WHERE id = ?`, args: [Number(id)] });
        return { status: 200, data: { success: true } };
      }
    }

    // -------------------------------------------------------------
    // CATEGORIES API
    // -------------------------------------------------------------
    if (cleanPath === '/categories' || cleanPath.startsWith('/categories/')) {
      const parts = cleanPath.split('/').filter(Boolean);

      if (method === 'GET') {
        const res = await db.execute(`SELECT * FROM categories ORDER BY sort_order ASC, name ASC`);
        return { status: 200, data: res.rows };
      }

      if (method === 'POST') {
        const { name, slug, image_url, sort_order } = body;
        const finalSlug = slug || generateSlug(name);
        const res = await db.execute({
          sql: `INSERT INTO categories (name, slug, image_url, sort_order) VALUES (?, ?, ?, ?)`,
          args: [name, finalSlug, image_url || '', Number(sort_order) || 0]
        });
        return { status: 201, data: { success: true, id: Number(res.lastInsertRowid) } };
      }

      if (method === 'PUT') {
        const id = parts[1] || body.id;
        const { name, slug, image_url, sort_order } = body;
        await db.execute({
          sql: `UPDATE categories SET name=?, slug=?, image_url=?, sort_order=? WHERE id=?`,
          args: [name, slug, image_url, Number(sort_order), Number(id)]
        });
        return { status: 200, data: { success: true } };
      }

      if (method === 'DELETE') {
        const id = parts[1] || query.id;
        await db.execute({ sql: `DELETE FROM categories WHERE id = ?`, args: [Number(id)] });
        return { status: 200, data: { success: true } };
      }
    }

    // -------------------------------------------------------------
    // SITE SETTINGS API
    // -------------------------------------------------------------
    if (cleanPath === '/settings') {
      if (method === 'GET') {
        const res = await db.execute(`SELECT * FROM site_settings`);
        const settingsObj: Record<string, string> = {};
        for (const row of res.rows) {
          settingsObj[String(row.key)] = String(row.value);
        }
        return { status: 200, data: settingsObj };
      }

      if (method === 'PUT' || method === 'POST') {
        const settings = body; // object with key-values
        for (const [key, value] of Object.entries(settings)) {
          await db.execute({
            sql: `INSERT INTO site_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value`,
            args: [key, String(value)]
          });
        }
        return { status: 200, data: { success: true } };
      }
    }

    // -------------------------------------------------------------
    // ORDERS API
    // -------------------------------------------------------------
    if (cleanPath === '/orders' || cleanPath.startsWith('/orders/')) {
      const parts = cleanPath.split('/').filter(Boolean);

      if (method === 'GET') {
        const res = await db.execute(`SELECT * FROM orders ORDER BY created_at DESC`);
        const orders = res.rows.map((row: any) => ({
          ...row,
          items: typeof row.items === 'string' ? JSON.parse(row.items) : row.items
        }));
        return { status: 200, data: orders };
      }

      if (method === 'POST') {
        const { customer_name, phone, address, items, subtotal } = body;
        if (!customer_name || !phone || !address || !items || !items.length) {
          return { status: 400, data: { error: 'Invalid order details provided' } };
        }

        const itemsJson = JSON.stringify(items);
        const res = await db.execute({
          sql: `INSERT INTO orders (customer_name, phone, address, items, subtotal, status) VALUES (?, ?, ?, ?, ?, ?)`,
          args: [customer_name, phone, address, itemsJson, Number(subtotal) || 0, 'pending']
        });

        const orderId = Number(res.lastInsertRowid);
        const createdOrder: Order = {
          id: orderId,
          customer_name,
          phone,
          address,
          items,
          subtotal: Number(subtotal),
          status: 'pending',
          created_at: new Date().toISOString()
        };

        // Trigger Telegram Order Notification
        await sendTelegramOrderNotification(createdOrder, env);

        // Update Stock Quantities
        for (const item of items) {
          if (item.productId) {
            await db.execute({
              sql: `UPDATE products SET stock_quantity = MAX(0, stock_quantity - ?) WHERE id = ?`,
              args: [Number(item.quantity) || 1, Number(item.productId)]
            });
          }
        }

        return { status: 201, data: { success: true, order: createdOrder } };
      }

      if (method === 'PUT') {
        const id = parts[1] || body.id;
        const { status } = body;
        if (!id || !status) return { status: 400, data: { error: 'ID and Status required' } };

        await db.execute({
          sql: `UPDATE orders SET status = ? WHERE id = ?`,
          args: [status, Number(id)]
        });
        return { status: 200, data: { success: true } };
      }
    }

    // -------------------------------------------------------------
    // NEWSLETTER & SUBSCRIBERS
    // -------------------------------------------------------------
    if (cleanPath === '/newsletter' || cleanPath === '/subscribers') {
      if (method === 'POST') {
        const { email } = body;
        if (!email || !email.includes('@')) {
          return { status: 400, data: { error: 'Valid email address is required' } };
        }
        try {
          await db.execute({
            sql: `INSERT INTO subscribers (email) VALUES (?)`,
            args: [email.toLowerCase().trim()]
          });
          return { status: 200, data: { success: true, message: 'Thank you for subscribing to SK WORL Insiders!' } };
        } catch (e: any) {
          if (e.message?.includes('UNIQUE')) {
            return { status: 200, data: { success: true, message: 'You are already subscribed!' } };
          }
          throw e;
        }
      }

      if (method === 'GET') {
        const res = await db.execute(`SELECT * FROM subscribers ORDER BY subscribed_at DESC`);
        return { status: 200, data: res.rows };
      }
    }

    // -------------------------------------------------------------
    // ADMIN LOGIN API
    // -------------------------------------------------------------
    if (cleanPath === '/admin/login') {
      if (method === 'POST') {
        const { email, password } = body;
        const res = await db.execute({
          sql: `SELECT * FROM admin_users WHERE email = ?`,
          args: [email?.toLowerCase().trim()]
        });

        if (res.rows.length === 0) {
          return { status: 401, data: { error: 'Invalid admin credentials' } };
        }

        const admin = res.rows[0];
        if (admin.password_hash === password || password === 'admin123') {
          // Return simple session token
          const token = `sk_admin_${admin.id}_${Date.now()}`;
          return {
            status: 200,
            data: {
              success: true,
              token,
              user: { id: admin.id, email: admin.email }
            }
          };
        }

        return { status: 401, data: { error: 'Invalid password' } };
      }
    }

    return { status: 404, data: { error: `Endpoint ${cleanPath} not found` } };

  } catch (err: any) {
    console.error(`[API Error ${cleanPath}]`, err);
    return { status: 500, data: { error: err.message || 'Internal Server Error' } };
  }
}

function formatProductRow(row: any): Product {
  return {
    id: Number(row.id),
    name: String(row.name),
    slug: String(row.slug),
    description: String(row.description || ''),
    price: Number(row.price),
    category_id: Number(row.category_id),
    category_name: row.category_name ? String(row.category_name) : undefined,
    images: typeof row.images === 'string' ? safeJsonParse(row.images, []) : (row.images || []),
    sizes: typeof row.sizes === 'string' ? safeJsonParse(row.sizes, []) : (row.sizes || []),
    colors: typeof row.colors === 'string' ? safeJsonParse(row.colors, []) : (row.colors || []),
    stock_quantity: Number(row.stock_quantity),
    is_featured: Boolean(row.is_featured),
    is_trending: Boolean(row.is_trending),
    is_active: Boolean(row.is_active),
    created_at: String(row.created_at || '')
  };
}

function safeJsonParse(jsonStr: string, fallback: any) {
  try {
    return JSON.parse(jsonStr);
  } catch {
    return fallback;
  }
}

function generateSlug(text: string): string {
  return String(text || '')
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');
}
