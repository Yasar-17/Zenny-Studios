// ===== Input hardening =====
// Defence in depth: strip HTML tags, then enforce field length caps. Also
// strips C1 / control chars (including NUL) so embedded control bytes cannot
// confuse downstream consumers or DB drivers.
//
// NOTE: input is stored as plain text — escaping is the renderer's job
// (admin.html escapes every field before injecting into the DOM), so storing
// HTML-escaped values would double-encode text such as "<b>hello</b>".

function stripHtml(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/<[^>]*>/g, '');
}

// Remove control chars (0x00-0x1F, 0x7F, and the C1 range 0x80-0x9F),
// keeping tab/newline/carriage-return.
function stripControl(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F\x80-\x9F]/g, '');
}

export function sanitizeInput(data) {
  data = data || {};
  return {
    name: stripHtml(stripControl(String(data.name || ''))).trim().slice(0, 100),
    email: stripHtml(stripControl(String(data.email || ''))).trim().toLowerCase().slice(0, 254),
    phone: stripControl(String(data.phone || '')).trim().replace(/[^\d+\-\s()]/g, '').slice(0, 20),
    company: stripHtml(stripControl(String(data.company || ''))).trim().slice(0, 100),
    service: stripHtml(stripControl(String(data.service || ''))).trim().slice(0, 100),
    message: stripHtml(stripControl(String(data.message || ''))).trim().slice(0, 5000),
  };
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEnquiry(data) {
  const errors = [];

  if (!data.name || String(data.name).trim().length < 2) {
    errors.push('Name must be at least 2 characters');
  }
  if (!data.email || !EMAIL_RE.test(String(data.email))) {
    errors.push('Valid email is required');
  }
  if (!data.phone || String(data.phone).trim().length < 6) {
    errors.push('Valid phone number is required');
  }
  if (!data.message || String(data.message).trim().length < 10) {
    errors.push('Message must be at least 10 characters');
  }
  if (data.message && String(data.message).length > 5000) {
    errors.push('Message is too long (max 5000 characters)');
  }
  return { valid: errors.length === 0, errors };
}