import { getDb } from './db';

export function addOrder({
  user_email,
  items,
  total,
  status = 'pending',
  shipping_name = null,
  shipping_address = null,
}) {
  const db = getDb();
  const stmt = db.prepare(
    `INSERT INTO orders (user_email, items, total, status, shipping_name, shipping_address)
      VALUES (?, ?, ?, ?, ?, ?)`
  );
  const info = stmt.run(
    user_email,
    JSON.stringify(items),
    total,
    status,
    shipping_name,
    shipping_address
  );
  return info.lastInsertRowid;
}

export function getOrdersForUser(email) {
  const db = getDb();
  const stmt = db.prepare(
    `SELECT * FROM orders WHERE user_email = ? ORDER BY created_at DESC`
  );
  return stmt.all(email).map((row) => ({
    ...row,
    items: JSON.parse(row.items),
  }));
}

export function getAllOrders() {
  const db = getDb();
  const stmt = db.prepare(`SELECT * FROM orders ORDER BY created_at DESC`);
  return stmt.all().map((row) => ({
    ...row,
    items: JSON.parse(row.items),
  }));
}

export function getOrdersForVendor(vendor) {
  const db = getDb();
  const stmt = db.prepare(`SELECT * FROM orders ORDER BY created_at DESC`);
  const rows = stmt.all();
  return rows
    .map((row) => ({
      ...row,
      items: JSON.parse(row.items),
    }))
    .filter((order) => order.items.some((item) => item.VENDOR === vendor));
}

export function hasOrdersForProduct(productId) {
  const db = getDb();
  const stmt = db.prepare('SELECT items FROM orders');
  const rows = stmt.all();
  for (const row of rows) {
    try {
      const items = JSON.parse(row.items);
      if (items.some((item) => String(item.ID) === String(productId))) {
        return true;
      }
    } catch (_) {
      // ignore parse errors
    }
  }
  return false;
}
export function getOrderById(id) {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM orders WHERE id = ?');
  const row = stmt.get(id);
  return row ? { ...row, items: JSON.parse(row.items) } : null;
}

export function updateOrderStatus(id, status) {
  const db = getDb();
  const stmt = db.prepare('UPDATE orders SET status = ? WHERE id = ?');
  stmt.run(status, id);
}
