import { getDb } from './db.js';

export function addUser({ email, password, first_name, last_name, brand_name, gender, role = 'user' }) {
  const db = getDb();
  const stmt = db.prepare(`INSERT INTO users (email, first_name, last_name, password, brand_name, gender, role)
    VALUES (?, ?, ?, ?, ?, ?, ?)`);
  stmt.run(email, first_name, last_name, password, brand_name || null, gender, role);
}

export function findUser(email) {
  const db = getDb();
  const stmt = db.prepare('SELECT email, first_name, last_name, password, brand_name, gender, role FROM users WHERE email = ?');
  return stmt.get(email);
}

export function getAllUsers() {
  const db = getDb();
  return db.prepare('SELECT email, first_name, last_name, brand_name, gender, role FROM users').all();
}

export function updateUserRole(email, role) {
  const db = getDb();
  const stmt = db.prepare('UPDATE users SET role = ? WHERE email = ?');
  stmt.run(role, email);
}

export function deleteUser(email) {
  const db = getDb();
  const stmt = db.prepare('DELETE FROM users WHERE email = ?');
  stmt.run(email);
}

