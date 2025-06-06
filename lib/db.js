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
      quantity INTEGER,
      min_price REAL,
      max_price REAL,
      currency TEXT,
      status TEXT DEFAULT 'approved'
    )`);
    const productInfo = db.prepare("PRAGMA table_info(products)").all();
    const hasStatus = productInfo.some(c => c.name === 'status');
    if (!hasStatus) {
      db.exec("ALTER TABLE products ADD COLUMN status TEXT DEFAULT 'approved'");
    }
    db.exec('CREATE TABLE IF NOT EXISTS categories (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT UNIQUE)');
    db.exec(`CREATE TABLE IF NOT EXISTS users (
      email TEXT PRIMARY KEY,
      first_name TEXT,
      last_name TEXT,
      password TEXT,
      brand_name TEXT,
      gender TEXT,
      role TEXT DEFAULT 'user'
    )`);
    db.exec(`CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_email TEXT,
      items TEXT,
      total REAL,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_email) REFERENCES users(email)
    )`);
  }
  return db;
}

export function addProduct(product) {
  const db = getDb();
  const stmt = db.prepare(`INSERT INTO products (id, title, vendor, description, product_type, tags, quantity, min_price, max_price, currency, status)
    VALUES (@id, @title, @vendor, @description, @product_type, @tags, @quantity, @min_price, @max_price, @currency, @status)`);
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
      quantity=@quantity,
      min_price=@min_price,
      max_price=@max_price,
      currency=@currency,
      status=@status
    WHERE id=@id`);
  stmt.run(product);
}

export function getAllFromDb(status = 'approved') {
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
  return db.prepare('SELECT id, name FROM categories ORDER BY name').all();
}

export function addCategory(name) {
  const db = getDb();
  const stmt = db.prepare('INSERT OR IGNORE INTO categories (name) VALUES (?)');
  stmt.run(name);
}

export function updateCategory(id, name) {
  const db = getDb();
  const stmt = db.prepare('UPDATE categories SET name = ? WHERE id = ?');
  stmt.run(name, id);
}

export function deleteCategory(id) {
  const db = getDb();
  const stmt = db.prepare('DELETE FROM categories WHERE id = ?');
  stmt.run(id);
}
