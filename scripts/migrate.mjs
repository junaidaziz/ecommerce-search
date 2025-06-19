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
// Categories table for grouping products
db.exec(`CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE,
  parent_id INTEGER,
  FOREIGN KEY(parent_id) REFERENCES categories(id)
)`);

// Seed base categories if none exist
const existingCount = db.prepare('SELECT COUNT(*) as c FROM categories').get();
if (existingCount.c === 0) {
  const sample = [
    { name: 'Electronics', subs: ['Mobiles', 'Laptops'] },
    { name: 'Fashion', subs: ['Men', 'Women'] },
  ];
  const insert = db.prepare(
    'INSERT INTO categories (name, parent_id) VALUES (?, ?)'
  );
  sample.forEach((cat) => {
    const info = insert.run(cat.name, null);
    const parentId = info.lastInsertRowid;
    cat.subs.forEach((sub) => insert.run(sub, parentId));
  });
}

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

const adminExists = db
  .prepare("SELECT email FROM users WHERE role = 'super-admin'")
  .get();
if (!adminExists) {
  db.prepare(
    `INSERT INTO users (email, first_name, last_name, password, brand_name, gender, role)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(
    'admin@example.com',
    'Super',
    'Admin',
    'password',
    null,
    '',
    'super-admin'
  );
  console.log('Seeded super-admin user: admin@example.com / password');
}

console.log('Database migrated');
