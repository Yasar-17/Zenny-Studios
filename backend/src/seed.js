require('dotenv').config();
const bcrypt = require('bcryptjs');
const { execute, queryOne, initTables } = require('./db');

async function seed() {
  await initTables();

  const email = (process.env.ADMIN_EMAIL || '').trim();
  const password = (process.env.ADMIN_PASSWORD || '').trim();

  if (!email || !password) {
    console.error('Error: ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env');
    process.exit(1);
  }

  if (password.length < 8) {
    console.error('Error: ADMIN_PASSWORD must be at least 8 characters long');
    process.exit(1);
  }

  const existing = await queryOne('SELECT id FROM admins WHERE email = ?', [email]);

  const hash = bcrypt.hashSync(password, 12);

  if (existing) {
    await execute('UPDATE admins SET password_hash = ? WHERE email = ?', [hash, email]);
    console.log(`Admin user "${email}" updated.`);
  } else {
    await execute('INSERT INTO admins (email, password_hash) VALUES (?, ?)', [email, hash]);
    console.log(`Admin user "${email}" created.`);
  }
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
