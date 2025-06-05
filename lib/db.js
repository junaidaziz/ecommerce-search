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
      currency TEXT
    )`);
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
  const stmt = db.prepare(`INSERT INTO products (id, title, vendor, description, product_type, tags, quantity, min_price, max_price, currency)
    VALUES (@id, @title, @vendor, @description, @product_type, @tags, @quantity, @min_price, @max_price, @currency)`);
  stmt.run(product);
}

export function getAllFromDb() {
  const db = getDb();
  return db.prepare('SELECT * FROM products').all();
}
