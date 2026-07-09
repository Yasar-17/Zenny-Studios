const express = require('express');
const bcrypt = require('bcryptjs');
const { queryOne } = require('../db');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../middleware/auth');

const router = express.Router();

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const admin = await queryOne('SELECT * FROM admins WHERE email = ?', [email]);

    if (!admin) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const passwordMatch = await bcrypt.compare(password, admin.password_hash);

    if (!passwordMatch) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const accessToken = generateAccessToken(admin);
    const refreshToken = generateRefreshToken(admin);

    res.cookie('zenny_access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('zenny_refresh_token', refreshToken, COOKIE_OPTIONS);

    res.json({ email: admin.email });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/refresh', async (req, res) => {
  const refreshToken = req.cookies?.zenny_refresh_token;

  if (!refreshToken) {
    return res.status(401).json({ error: 'Refresh token required' });
  }

  const payload = verifyRefreshToken(refreshToken);
  if (!payload) {
    res.clearCookie('zenny_access_token');
    res.clearCookie('zenny_refresh_token');
    return res.status(401).json({ error: 'Invalid or expired refresh token' });
  }

  try {
    const admin = await queryOne('SELECT id, email FROM admins WHERE id = ?', [payload.id]);
    if (!admin) {
      res.clearCookie('zenny_access_token');
      res.clearCookie('zenny_refresh_token');
      return res.status(401).json({ error: 'Admin not found' });
    }

    const newAccessToken = generateAccessToken(admin);
    const newRefreshToken = generateRefreshToken(admin);

    res.cookie('zenny_access_token', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('zenny_refresh_token', newRefreshToken, COOKIE_OPTIONS);

    res.json({ email: admin.email });
  } catch (err) {
    console.error('Token refresh error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('zenny_access_token');
  res.clearCookie('zenny_refresh_token');
  res.json({ success: true });
});

router.get('/me', async (req, res) => {
  const accessToken = req.cookies?.zenny_access_token;

  if (!accessToken) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const jwt = require('jsonwebtoken');
    const { JWT_SECRET } = require('../middleware/auth');
    const payload = jwt.verify(accessToken, JWT_SECRET);
    const admin = await queryOne('SELECT id, email, created_at FROM admins WHERE id = ?', [payload.id]);

    if (!admin) {
      return res.status(401).json({ error: 'Admin not found' });
    }

    res.json({ email: admin.email, created_at: admin.created_at });
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
});

module.exports = router;
