const express = require('express');
const crypto = require('crypto');
const { query, execute, queryOne } = require('../db');
const { authMiddleware } = require('../middleware/auth');
const { sendEnquiryNotification } = require('../email');
const { sanitizeInput, validateEnquiry } = require('../utils/validation');

const router = express.Router();

router.use((req, res, next) => {
  if (req.method === 'POST') return next();
  authMiddleware(req, res, next);
});

router.get('/', async (req, res) => {
  try {
    const enquiries = await query('SELECT * FROM enquiries ORDER BY date DESC');
    res.json(enquiries);
  } catch (err) {
    console.error('Get enquiries error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', async (req, res) => {
  const { name, email, phone, company, service, message, date } = req.body;

  const validation = validateEnquiry({ name, email, phone, company, service, message, date });
  if (!validation.valid) {
    return res.status(400).json({ error: validation.errors.join(', ') });
  }

  const sanitized = sanitizeInput({ name, email, phone, company, service, message, date });

  try {
    const id = crypto.randomUUID();

    await execute(
      `INSERT INTO enquiries (id, name, email, phone, company, service, message, date, is_read)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)`,
      [id, sanitized.name, sanitized.email, sanitized.phone, sanitized.company, sanitized.service, sanitized.message, sanitized.date]
    );

    sendEnquiryNotification({ name: sanitized.name, email: sanitized.email, phone: sanitized.phone, company: sanitized.company, service: sanitized.service, message: sanitized.message })
      .catch(err => console.error('Email notification failed:', err.message));

    res.status(201).json({ success: true });
  } catch (err) {
    console.error('Create enquiry error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.patch('/:id/read', async (req, res) => {
  const { id } = req.params;

  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
    return res.status(400).json({ error: 'Invalid enquiry ID format' });
  }

  try {
    const result = await execute('UPDATE enquiries SET is_read = 1 WHERE id = ?', [id]);

    if (result.rowsAffected === 0) {
      return res.status(404).json({ error: 'Enquiry not found' });
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Mark read error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.patch('/read-all', async (req, res) => {
  try {
    await execute('UPDATE enquiries SET is_read = 1 WHERE is_read = 0');
    res.json({ success: true });
  } catch (err) {
    console.error('Mark all read error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
    return res.status(400).json({ error: 'Invalid enquiry ID format' });
  }

  try {
    const result = await execute('DELETE FROM enquiries WHERE id = ?', [id]);

    if (result.rowsAffected === 0) {
      return res.status(404).json({ error: 'Enquiry not found' });
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Delete enquiry error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
