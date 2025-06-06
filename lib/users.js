import { getDb } from './db.js';

export function addUser({ email, password, first_name, last_name, brand_name, gender, role = 'user', verification_token }) {
  const db = getDb();
  const stmt = db.prepare(`INSERT INTO users (email, first_name, last_name, password, brand_name, gender, role, verification_token)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
  stmt.run(email, first_name, last_name, password, brand_name || null, gender, role, verification_token);
}

export function findUser(email) {
  const db = getDb();
  const stmt = db.prepare('SELECT email, first_name, last_name, password, brand_name, gender, role, verified, verification_token, reset_token, reset_expires FROM users WHERE email = ?');
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

export function verifyUser(token) {
  const db = getDb();
  const stmt = db.prepare('UPDATE users SET verified = 1, verification_token = NULL WHERE verification_token = ?');
  return stmt.run(token);
}

export function setResetToken(email, token, expires) {
  const db = getDb();
  const stmt = db.prepare('UPDATE users SET reset_token = ?, reset_expires = ? WHERE email = ?');
  return stmt.run(token, expires, email);
}

export function resetPassword(token, password) {
  const db = getDb();
  const stmt = db.prepare('UPDATE users SET password = ?, reset_token = NULL, reset_expires = NULL WHERE reset_token = ? AND reset_expires > ?');
  return stmt.run(password, token, Date.now());
}
