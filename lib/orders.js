import { getDb } from './db.js';

export function addOrder({ user_email, items, total, status = 'pending' }) {
  const db = getDb();
  const stmt = db.prepare(`INSERT INTO orders (user_email, items, total, status) VALUES (?, ?, ?, ?)`);
  const info = stmt.run(user_email, JSON.stringify(items), total, status);
  return info.lastInsertRowid;
}

export function getOrdersForUser(email) {
  const db = getDb();
  const stmt = db.prepare(`SELECT * FROM orders WHERE user_email = ? ORDER BY created_at DESC`);
  return stmt.all(email).map(row => ({ ...row, items: JSON.parse(row.items) }));
}

export function getAllOrders() {
  const db = getDb();
  const stmt = db.prepare(`SELECT * FROM orders ORDER BY created_at DESC`);
  return stmt.all().map(row => ({ ...row, items: JSON.parse(row.items) }));
}

export function getOrdersForVendor(vendor) {
  const db = getDb();
  const stmt = db.prepare(`SELECT * FROM orders ORDER BY created_at DESC`);
  const rows = stmt.all();
  return rows
    .all()
    .map(row => ({ ...row, items: JSON.parse(row.items) }))
    .filter(order => order.items.some(item => item.VENDOR === vendor));
}

