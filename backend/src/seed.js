require('dotenv').config();
const bcrypt = require('bcryptjs');
const { getDb, closeDb } = require('./db');

const email = process.env.ADMIN_EMAIL || 'admin@zennystudios.com';
const password = process.env.ADMIN_PASSWORD || 'zenny2025';

const db = getDb();

const existing = db.prepare('SELECT id FROM admins WHERE email = ?').get(email);

if (existing) {
  const hash = bcrypt.hashSync(password, 12);
  db.prepare('UPDATE admins SET password_hash = ? WHERE email = ?').run(hash, email);
  console.log(`Admin user "${email}" updated.`);
} else {
  const hash = bcrypt.hashSync(password, 12);
  db.prepare('INSERT INTO admins (email, password_hash) VALUES (?, ?)').run(email, hash);
  console.log(`Admin user "${email}" created.`);
}

closeDb();
