import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbFile = path.join(process.cwd(), 'data', 'products.db');

let db;

export function getDb() {
  if (!db) {
    if (!fs.existsSync(path.dirname(dbFile))) {
      fs.mkdirSync(path.dirname(dbFile), { recursive: true });
    }
    db = new Database(dbFile);
    db.exec(`CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      title TEXT,
      vendor TEXT,
      description TEXT,
      product_type TEXT,
      tags TEXT,
      category TEXT,
      quantity INTEGER,
      min_price REAL,
      max_price REAL,
      currency TEXT,
      status TEXT DEFAULT 'approved',
      images TEXT
    )`);
    const productInfo = db.prepare('PRAGMA table_info(products)').all();
    const hasStatus = productInfo.some((c) => c.name === 'status');
    if (!hasStatus) {
      db.exec("ALTER TABLE products ADD COLUMN status TEXT DEFAULT 'approved'");
    }
    const hasImages = productInfo.some((c) => c.name === 'images');
    if (!hasImages) {
      db.exec('ALTER TABLE products ADD COLUMN images TEXT');
    }
    db.exec(
      'CREATE TABLE IF NOT EXISTS categories (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT UNIQUE, parent_id INTEGER, image TEXT, FOREIGN KEY(parent_id) REFERENCES categories(id))'
    );
    const catInfo = db.prepare('PRAGMA table_info(categories)').all();
    const hasParent = catInfo.some((c) => c.name === 'parent_id');
    if (!hasParent) {
      db.exec('ALTER TABLE categories ADD COLUMN parent_id INTEGER');
    }
    const hasImage = catInfo.some((c) => c.name === 'image');
    if (!hasImage) {
      db.exec('ALTER TABLE categories ADD COLUMN image TEXT');
    }
    db.exec(`CREATE TABLE IF NOT EXISTS users (
      email TEXT PRIMARY KEY,
      first_name TEXT,
      last_name TEXT,
      password TEXT,
      brand_name TEXT,
      gender TEXT,
      role TEXT DEFAULT 'user',
      verified INTEGER DEFAULT 0,
      verification_token TEXT,
      reset_token TEXT,
      reset_expires INTEGER
    )`);
    db.exec(`CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_email TEXT,
      items TEXT,
      total REAL,
      status TEXT DEFAULT 'pending',
      shipping_name TEXT,
      shipping_address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_email) REFERENCES users(email)
    )`);

    const orderInfo = db.prepare('PRAGMA table_info(orders)').all();
    const hasShipName = orderInfo.some((c) => c.name === 'shipping_name');
    if (!hasShipName) {
      db.exec('ALTER TABLE orders ADD COLUMN shipping_name TEXT');
    }
    const hasShipAddr = orderInfo.some((c) => c.name === 'shipping_address');
    if (!hasShipAddr) {
      db.exec('ALTER TABLE orders ADD COLUMN shipping_address TEXT');
    }

    db.exec(`CREATE TABLE IF NOT EXISTS carts (
      user_email TEXT PRIMARY KEY,
      items TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_email) REFERENCES users(email)
    )`);

    db.exec(`CREATE TABLE IF NOT EXISTS wishlists (
      user_email TEXT PRIMARY KEY,
      items TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_email) REFERENCES users(email)
    )`);

    db.exec(`CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id TEXT,
      user_email TEXT,
      rating INTEGER,
      comment TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(product_id) REFERENCES products(id),
      FOREIGN KEY(user_email) REFERENCES users(email)
    )`);
  }
  return db;
}

export function addProduct(product) {
  const db = getDb();
  const stmt = db.prepare(`INSERT INTO products (
      id, title, vendor, description, product_type, tags, category,
      quantity, min_price, max_price, currency, status, images
    ) VALUES (
      @id, @title, @vendor, @description, @product_type, @tags, @category,
      @quantity, @min_price, @max_price, @currency, @status, @images
    )`);
  stmt.run(product);
}

export function updateProduct(product) {
  const db = getDb();
  const stmt = db.prepare(`UPDATE products SET
      title=@title,
      vendor=@vendor,
      description=@description,
      product_type=@product_type,
      tags=@tags,
      category=@category,
      quantity=@quantity,
      min_price=@min_price,
      max_price=@max_price,
      currency=@currency,
      status=@status,
      images=@images
    WHERE id=@id`);
  stmt.run(product);
}

export function deleteProduct(id) {
  const db = getDb();
  const stmt = db.prepare('DELETE FROM products WHERE id = ?');
  stmt.run(id);
}

export function getAllFromDb(status = null) {
  const db = getDb();
  if (status) {
    return db.prepare('SELECT * FROM products WHERE status = ?').all(status);
  }
  return db.prepare('SELECT * FROM products').all();
}

export function getPendingFromDb() {
  const db = getDb();
  return db.prepare("SELECT * FROM products WHERE status = 'pending'").all();
}

export function setProductStatus(id, status) {
  const db = getDb();
  const stmt = db.prepare('UPDATE products SET status = ? WHERE id = ?');
  stmt.run(status, id);
}

export function getCategories() {
  const db = getDb();
  return db
    .prepare(
      'SELECT id, name, parent_id as parentId, image FROM categories ORDER BY name'
    )
    .all();
}

export function addCategory(name, parentId = null, image = null) {
  const db = getDb();
  const stmt = db.prepare(
    'INSERT OR IGNORE INTO categories (name, parent_id, image) VALUES (?, ?, ?)'
  );
  stmt.run(name, parentId, image);
}

export function updateCategory(id, name, parentId = null, image = null) {
  const db = getDb();
  const stmt = db.prepare(
    'UPDATE categories SET name = ?, parent_id = ?, image = ? WHERE id = ?'
  );
  stmt.run(name, parentId, image, id);
}

export function deleteCategory(id) {
  const db = getDb();
  const stmt = db.prepare('DELETE FROM categories WHERE id = ?');
  stmt.run(id);
}

export function getCategoryById(id) {
  const db = getDb();
  const stmt = db.prepare(
    'SELECT id, name, parent_id as parentId, image FROM categories WHERE id = ?'
  );
  return stmt.get(id);
}

export function getCategoryByName(name) {
  const db = getDb();
  const stmt = db.prepare(
    'SELECT id, name, parent_id as parentId, image FROM categories WHERE lower(name) = lower(?)'
  );
  return stmt.get(name);
}

export function countProductsForCategory(name) {
  const db = getDb();
  const stmt = db.prepare(
    'SELECT COUNT(*) as count FROM products WHERE lower(category) = lower(?)'
  );
  const row = stmt.get(name);
  return row ? row.count : 0;
}

export function getProductById(id) {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM products WHERE id = ?');
  return stmt.get(id);
}

export function updateProductQuantity(id, quantity) {
  const db = getDb();
  const stmt = db.prepare('UPDATE products SET quantity = ? WHERE id = ?');
  stmt.run(quantity, id);
}

export function decreaseProductQuantity(id, delta) {
  const product = getProductById(id);
  if (!product) return;
  const newQty = Math.max(0, (product.quantity || 0) - delta);
  updateProductQuantity(id, newQty);
}

export function getCart(email) {
  const db = getDb();
  const row = db
    .prepare('SELECT items FROM carts WHERE user_email = ?')
    .get(email);
  if (!row) return [];
  try {
    return JSON.parse(row.items);
  } catch (_) {
    return [];
  }
}

export function setCart(email, items) {
  const db = getDb();
  const stmt = db.prepare(`INSERT INTO carts (user_email, items)
    VALUES (?, ?)
    ON CONFLICT(user_email) DO UPDATE SET items=excluded.items, updated_at=CURRENT_TIMESTAMP`);
  stmt.run(email, JSON.stringify(items));
}

export function clearCart(email) {
  const db = getDb();
  db.prepare('DELETE FROM carts WHERE user_email = ?').run(email);
}

export function getWishlist(email) {
  const db = getDb();
  const row = db
    .prepare('SELECT items FROM wishlists WHERE user_email = ?')
    .get(email);
  if (!row) return [];
  try {
    return JSON.parse(row.items);
  } catch (_) {
    return [];
  }
}

export function setWishlist(email, items) {
  const db = getDb();
  const stmt = db.prepare(`INSERT INTO wishlists (user_email, items)
    VALUES (?, ?)
    ON CONFLICT(user_email) DO UPDATE SET items=excluded.items, updated_at=CURRENT_TIMESTAMP`);
  stmt.run(email, JSON.stringify(items));
}

export function clearWishlist(email) {
  const db = getDb();
  db.prepare('DELETE FROM wishlists WHERE user_email = ?').run(email);
}

export function addReview({ productId, userEmail, rating, comment }) {
  const db = getDb();
  const stmt = db.prepare(
    'INSERT INTO reviews (product_id, user_email, rating, comment) VALUES (?, ?, ?, ?)'
  );
  stmt.run(productId, userEmail, rating, comment);
}

export function getReviewsForProduct(productId) {
  const db = getDb();
  const stmt = db.prepare(
    'SELECT product_id as productId, user_email as userEmail, rating, comment, created_at as createdAt FROM reviews WHERE product_id = ? ORDER BY created_at DESC'
  );
  return stmt.all(productId);
}

export function getAverageRating(productId) {
  const db = getDb();
  const stmt = db.prepare(
    'SELECT AVG(rating) as avg, COUNT(*) as count FROM reviews WHERE product_id = ?'
  );
  const row = stmt.get(productId);
  return { average: row?.avg || 0, count: row?.count || 0 };
}
