import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

const dbFile = path.join(process.cwd(), 'data', 'products.db');
if (!fs.existsSync(path.dirname(dbFile))) {
  fs.mkdirSync(path.dirname(dbFile), { recursive: true });
}
const db = new Database(dbFile);

// Users table with role
db.exec(`CREATE TABLE IF NOT EXISTS users (
  email TEXT PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  password TEXT,
  brand_name TEXT,
  gender TEXT,
  role TEXT DEFAULT 'user'
)`);

// Products table
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
  status TEXT DEFAULT 'approved'
)`);
db.exec(
  'CREATE TABLE IF NOT EXISTS categories (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT UNIQUE)'
);

// Categories table for grouping products
db.exec(`CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE
)`);

// Orders table
db.exec(`CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_email TEXT,
  items TEXT,
  total REAL,
  status TEXT DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_email) REFERENCES users(email)
)`);

console.log('Database migrated');
