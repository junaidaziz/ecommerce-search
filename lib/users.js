import { getDb } from './db.js';

export function addUser({ email, password, first_name, last_name, brand_name, gender }) {
  const db = getDb();
  const stmt = db.prepare(`INSERT INTO users (email, first_name, last_name, password, brand_name, gender)
    VALUES (?, ?, ?, ?, ?, ?)`);
  stmt.run(email, first_name, last_name, password, brand_name || null, gender);
}

export function findUser(email) {
  const db = getDb();
  const stmt = db.prepare('SELECT email, first_name, last_name, password, brand_name, gender FROM users WHERE email = ?');
  return stmt.get(email);
}
