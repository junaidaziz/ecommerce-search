import fs from 'fs';
import path from 'path';

const usersFile = path.join(process.cwd(), 'data', 'users.json');

function loadUsers() {
  if (!fs.existsSync(usersFile)) {
    return [];
  }
  const raw = fs.readFileSync(usersFile, 'utf-8');
  try {
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

function saveUsers(users) {
  fs.mkdirSync(path.dirname(usersFile), { recursive: true });
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
}

export function addUser({ email, password }) {
  const users = loadUsers();
  if (users.find(u => u.email === email)) {
    throw new Error('User exists');
  }
  users.push({ email, password });
  saveUsers(users);
}

export function findUser(email) {
  const users = loadUsers();
  return users.find(u => u.email === email);
}
