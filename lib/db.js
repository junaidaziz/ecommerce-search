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
      currency TEXT
    )`);
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
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_email) REFERENCES users(email)
    )`);
  }
  return db;
}

export function addProduct(product) {
  const db = getDb();
  const stmt = db.prepare(`INSERT INTO products (id, title, vendor, description, product_type, tags, category, quantity, min_price, max_price, currency)
    VALUES (@id, @title, @vendor, @description, @product_type, @tags, @category, @quantity, @min_price, @max_price, @currency)`);
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
      currency=@currency
    WHERE id=@id`);
  stmt.run(product);
}

export function deleteProduct(id) {
  const db = getDb();
  const stmt = db.prepare('DELETE FROM products WHERE id = ?');
  stmt.run(id);
}

export function getAllFromDb() {
  const db = getDb();
  return db.prepare('SELECT * FROM products').all();
}
