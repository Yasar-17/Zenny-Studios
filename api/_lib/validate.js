// ===== Input hardening =====
// Defence in depth: strip HTML tags, then HTML-escape, then enforce field
// length caps. Also strips C1 / control chars (including NUL) so embedded
// control bytes cannot confuse downstream consumers or DB drivers.

function stripHtml(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/<[^>]*>/g, '');
}

function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
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
    name: escapeHtml(stripHtml(stripControl(String(data.name || '')))).trim().slice(0, 100),
    email: escapeHtml(stripHtml(stripControl(String(data.email || '')))).trim().toLowerCase().slice(0, 254),
    phone: escapeHtml(stripControl(String(data.phone || ''))).trim().replace(/[^\d+\-\s()]/g, '').slice(0, 20),
    company: escapeHtml(stripHtml(stripControl(String(data.company || '')))).trim().slice(0, 100),
    service: escapeHtml(stripHtml(stripControl(String(data.service || '')))).trim().slice(0, 100),
    message: escapeHtml(stripHtml(stripControl(String(data.message || '')))).trim().slice(0, 5000),
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