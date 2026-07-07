const express = require('express');
const { getDb } = require('../db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.use((req, res, next) => {
  if (req.method === 'POST') return next();
  authMiddleware(req, res, next);
});

router.get('/', (req, res) => {
  try {
    const db = getDb();
    const enquiries = db.prepare('SELECT * FROM enquiries ORDER BY date DESC').all();
    res.json(enquiries);
  } catch (err) {
    console.error('Get enquiries error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', (req, res) => {
  const { id, name, email, phone, company, service, message, date } = req.body;

  if (!id || !name || !email || !phone || !message || !date) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const db = getDb();
    db.prepare(`
      INSERT OR REPLACE INTO enquiries (id, name, email, phone, company, service, message, date, read)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)
    `).run(id, name, email, phone, company || '', service || '', message, date);

    res.status(201).json({ success: true });
  } catch (err) {
    console.error('Create enquiry error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.patch('/:id/read', (req, res) => {
  const { id } = req.params;

  try {
    const db = getDb();
    const result = db.prepare('UPDATE enquiries SET read = 1 WHERE id = ?').run(id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Enquiry not found' });
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Mark read error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.patch('/read-all', (req, res) => {
  try {
    const db = getDb();
    db.prepare('UPDATE enquiries SET read = 1 WHERE read = 0').run();
    res.json({ success: true });
  } catch (err) {
    console.error('Mark all read error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', (req, res) => {
  const { id } = req.params;

  try {
    const db = getDb();
    const result = db.prepare('DELETE FROM enquiries WHERE id = ?').run(id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Enquiry not found' });
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Delete enquiry error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
