import { createClient, Client } from '@libsql/client';
import { Category, Product, Order, SiteSettings, Subscriber } from '../types';

let globalClient: Client | null = null;
let initialized = false;
let initPromise: Promise<void> | null = null;

export function getDbClient(env?: Record<string, any>): Client {
  if (globalClient) return globalClient;

  const url = env?.TURSO_DATABASE_URL || (typeof process !== 'undefined' ? process.env.TURSO_DATABASE_URL : '') || '';
  const authToken = env?.TURSO_AUTH_TOKEN || (typeof process !== 'undefined' ? process.env.TURSO_AUTH_TOKEN : '') || '';

  if (url && url.startsWith('libsql://') || url.startsWith('https://')) {
    globalClient = createClient({
      url,
      authToken,
    });
  } else {
    // In-memory or local file fallback for preview when TURSO is not yet configured
    globalClient = createClient({
      url: 'file::memory:',
    });
  }

  return globalClient;
}

export async function ensureDbInitialized(env?: Record<string, any>): Promise<Client> {
  const db = getDbClient(env);
  if (!initialized) {
    if (!initPromise) {
      initPromise = (async () => {
        try {
          await initDatabaseSchema(db);
          await seedDefaultData(db);
          initialized = true;
        } catch (err) {
          initPromise = null;
          throw err;
        }
      })();
    }
    await initPromise;
  }
  return db;
}

export async function initDatabaseSchema(db: Client) {
  // 1. Categories
  await db.execute(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      image_url TEXT,
      sort_order INTEGER DEFAULT 0
    );
  `);

  // 2. Products
  await db.execute(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      category_id INTEGER,
      images TEXT NOT NULL,
      sizes TEXT NOT NULL,
      colors TEXT NOT NULL,
      image_colors TEXT,
      stock_quantity INTEGER DEFAULT 10,
      is_featured INTEGER DEFAULT 0,
      is_trending INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  try {
    await db.execute(`ALTER TABLE products ADD COLUMN image_colors TEXT;`);
  } catch (e) {
    // Column already exists
  }

  // 3. Orders
  await db.execute(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      address TEXT NOT NULL,
      items TEXT NOT NULL,
      subtotal REAL NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 4. Site Settings
  await db.execute(`
    CREATE TABLE IF NOT EXISTS site_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  // 5. Admin Users
  await db.execute(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL
    );
  `);

  // 6. Subscribers
  await db.execute(`
    CREATE TABLE IF NOT EXISTS subscribers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      subscribed_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 7. Testimonials
  await db.execute(`
    CREATE TABLE IF NOT EXISTS testimonials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      role TEXT,
      review TEXT NOT NULL,
      rating INTEGER DEFAULT 5,
      avatar_url TEXT,
      is_visible INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 8. Chat Messages
  await db.execute(`
    CREATE TABLE IF NOT EXISTS chat_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT NOT NULL,
      sender_type TEXT NOT NULL,
      sender_name TEXT DEFAULT 'Customer',
      message TEXT NOT NULL,
      is_read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

export async function seedDefaultData(db: Client) {
  // Check if testimonials table is empty and seed
  try {
    const testCheck = await db.execute('SELECT COUNT(*) as count FROM testimonials');
    const testCount = Number(testCheck.rows[0]?.count || 0);
    if (testCount === 0) {
      const seedTestimonials = [
        {
          name: 'Siam Ahmed',
          role: 'Dhaka, Bangladesh',
          review: 'SK WORL heavyweight hoodie is absolute luxury! The 450gsm fabric fit feels like high-end European streetwear. Ordered via COD and got delivery in 24 hours.',
          rating: 5,
          avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
        },
        {
          name: 'Tanvir Hasan',
          role: 'Chittagong, Bangladesh',
          review: 'The raw edge oversized tee fitting is unmatched. True to size, premium stitching, and the fabric softness remains even after multiple washes.',
          rating: 5,
          avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'
        },
        {
          name: 'Nusrat Jahan',
          role: 'Sylhet, Bangladesh',
          review: 'Top tier streetwear brand in BD right now! Customer support via live chat helped me pick the right oversized size.',
          rating: 5,
          avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200'
        }
      ];
      for (const t of seedTestimonials) {
        await db.execute({
          sql: 'INSERT INTO testimonials (name, role, review, rating, avatar_url, is_visible) VALUES (?, ?, ?, ?, ?, 1)',
          args: [t.name, t.role, t.review, t.rating, t.avatar_url]
        });
      }
    }
  } catch (err) {
    console.warn('Testimonial seed check warning:', err);
  }

  // Check if categories table is empty
  const catCheck = await db.execute('SELECT COUNT(*) as count FROM categories');
  const catCount = Number(catCheck.rows[0]?.count || 0);

  if (catCount === 0) {
    // Insert Categories
    const categories = [
      { name: 'Hoodies', slug: 'hoodies', image_url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=800', sort_order: 1 },
      { name: 'Sweatshirts', slug: 'sweatshirts', image_url: 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&q=80&w=800', sort_order: 2 },
      { name: 'Shirts', slug: 'shirts', image_url: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&q=80&w=800', sort_order: 3 },
      { name: 'T-Shirts', slug: 't-shirts', image_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=800', sort_order: 4 },
      { name: 'Jackets', slug: 'jackets', image_url: 'https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&q=80&w=800', sort_order: 5 }
    ];

    for (const c of categories) {
      await db.execute({
        sql: 'INSERT INTO categories (name, slug, image_url, sort_order) VALUES (?, ?, ?, ?)',
        args: [c.name, c.slug, c.image_url, c.sort_order]
      });
    }

    // Insert Demo Products
    const products = [
      {
        name: 'SK Heavyweight Oversized Hoodie',
        slug: 'sk-heavyweight-oversized-hoodie',
        category_id: 1,
        price: 120,
        description: 'Boxy luxury fit hoodie crafted with 450gsm double-layered French Terry cotton, dropped shoulders, and brushed interior softness.',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=800',
          'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&q=80&w=800'
        ]),
        sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
        colors: JSON.stringify(['Washed Black', 'Off White', 'Olive']),
        stock_quantity: 25,
        is_featured: 1,
        is_trending: 1,
        is_active: 1
      },
      {
        name: 'Raw Edge Boxy Sweatshirt',
        slug: 'raw-edge-boxy-sweatshirt',
        category_id: 2,
        price: 95,
        description: 'Heavy fleece crewneck featuring raw seam finishes and subtle tonal SK crest logo embroidery on left cuff.',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&q=80&w=800',
          'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&q=80&w=800'
        ]),
        sizes: JSON.stringify(['M', 'L', 'XL']),
        colors: JSON.stringify(['Ash Grey', 'Charcoal']),
        stock_quantity: 18,
        is_featured: 1,
        is_trending: 0,
        is_active: 1
      },
      {
        name: 'Milano Utility Zip Shirt',
        slug: 'milano-utility-zip-shirt',
        category_id: 3,
        price: 110,
        description: 'Structured woven cotton shirt jacket with dual chest flap pockets and gunmetal matte black hardware.',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&q=80&w=800',
          'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&q=80&w=800'
        ]),
        sizes: JSON.stringify(['S', 'M', 'L']),
        colors: JSON.stringify(['Sand Stone', 'Black']),
        stock_quantity: 12,
        is_featured: 0,
        is_trending: 1,
        is_active: 1
      },
      {
        name: 'Outcast Heavy Graphic Tee',
        slug: 'outcast-heavy-graphic-tee',
        category_id: 4,
        price: 55,
        description: 'Vintage washed 260gsm jersey tee with screenprinted archive logo graphics front and back.',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=800',
          'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&q=80&w=800'
        ]),
        sizes: JSON.stringify(['S', 'M', 'L', 'XL', 'XXL']),
        colors: JSON.stringify(['Vintage Off-White', 'Washed Black']),
        stock_quantity: 30,
        is_featured: 1,
        is_trending: 1,
        is_active: 1
      },
      {
        name: 'Minimalist Wool Blend Bomber Jacket',
        slug: 'minimalist-wool-blend-bomber-jacket',
        category_id: 5,
        price: 210,
        description: 'Tailored outerwear piece featuring a high ribbed collar, concealed zip closure, and satin interior lining.',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&q=80&w=800',
          'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=800'
        ]),
        sizes: JSON.stringify(['M', 'L']),
        colors: JSON.stringify(['Midnight Navy', 'Deep Charcoal']),
        stock_quantity: 8,
        is_featured: 1,
        is_trending: 1,
        is_active: 1
      },
      {
        name: 'Monogram Essential Drop Tee',
        slug: 'monogram-essential-drop-tee',
        category_id: 4,
        price: 50,
        description: 'Clean daily staple with dropped shoulders, wide rib neckline, and minimal crest branding.',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&q=80&w=800',
          'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=800'
        ]),
        sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
        colors: JSON.stringify(['Bone White', 'Sage Green']),
        stock_quantity: 40,
        is_featured: 0,
        is_trending: 0,
        is_active: 1
      },
      {
        name: 'Tactical Cargo Over-Jacket',
        slug: 'tactical-cargo-over-jacket',
        category_id: 5,
        price: 240,
        description: 'Water-resistant tech shell with multi-pocket system, dual-way zipper, and adjustable hem drawstrings.',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&q=80&w=800',
          'https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&q=80&w=800'
        ]),
        sizes: JSON.stringify(['M', 'L', 'XL']),
        colors: JSON.stringify(['Matte Black', 'Desert Khaki']),
        stock_quantity: 0, // Out of stock demo item
        is_featured: 0,
        is_trending: 1,
        is_active: 1
      },
      {
        name: 'Archive Washed Zip Hoodie',
        slug: 'archive-washed-zip-hoodie',
        category_id: 1,
        price: 135,
        description: 'Full double-zip hoodie with custom SK metal hardware and hand-distressed ribbed cuffs.',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&q=80&w=800',
          'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=800'
        ]),
        sizes: JSON.stringify(['S', 'M', 'L']),
        colors: JSON.stringify(['Acid Wash Grey']),
        stock_quantity: 15,
        is_featured: 0,
        is_trending: 0,
        is_active: 1
      }
    ];

    for (const p of products) {
      await db.execute({
        sql: `INSERT INTO products (name, slug, category_id, price, description, images, sizes, colors, stock_quantity, is_featured, is_trending, is_active)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          p.name, p.slug, p.category_id, p.price, p.description,
          p.images, p.sizes, p.colors, p.stock_quantity,
          p.is_featured, p.is_trending, p.is_active
        ]
      });
    }
  }

  // Check Site Settings
  const settingCheck = await db.execute('SELECT COUNT(*) as count FROM site_settings');
  if (Number(settingCheck.rows[0]?.count || 0) === 0) {
    const defaultSettings: Record<string, string> = {
      hero_headline: 'YOURSELF INTO THE RIGHT GEAR',
      hero_subheading: 'MILANO SUMMER & WINTER COLLECTION 2026. ELEVATED STREETWEAR & ESSENTIAL CUTS DESIGNED FOR THE MODERN ICON.',
      hero_image_url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=1600',
      hero_cta_text: 'VIEW SUMMER COLLECTIONS',
      sale_banner_percent: '30',
      sale_banner_text: 'SUMMER FLASH SALE — UP TO 30% OFF ON ALL HOODIES & JACKETS WITH FREE EXPRESS SHIPPING',
      newsletter_heading: 'JOIN THE SK WORL INSIDERS CLUB',
      footer_email: 'contact@skworl.com',
      footer_phone: '+39 02 8945 1200',
      social_instagram: 'https://instagram.com',
      social_twitter: 'https://twitter.com',
      social_facebook: 'https://facebook.com',
      social_youtube: 'https://youtube.com',
      feature1_heading: 'PREMIUM MILANO FABRIC',
      feature1_text: 'Crafted from heavy 450gsm French Terry cotton for structure, comfort, and longevity.',
      feature1_image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=1200',
      feature2_heading: 'EXPRESS WORLDWIDE SHIPPING',
      feature2_text: 'Dispatched within 24 hours in zero-plastic eco-friendly luxury packaging.',
      feature2_image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=1200',
      logo_text: 'SK WORL'
    };

    for (const [key, value] of Object.entries(defaultSettings)) {
      await db.execute({
        sql: 'INSERT INTO site_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO NOTHING',
        args: [key, value]
      });
    }
  }

  // Check Admin User
  try {
    await db.execute({
      sql: 'INSERT INTO admin_users (email, password_hash) VALUES (?, ?) ON CONFLICT(email) DO UPDATE SET password_hash=excluded.password_hash',
      args: ['skbadol229229@gmail.com', 'Badol@138215']
    });
  } catch (e) {
    console.error('[DB] Admin user seed error:', e);
  }
}
