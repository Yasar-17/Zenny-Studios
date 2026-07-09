function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

function sanitizeInput(data) {
  return {
    name: escapeHtml(data.name || '').trim(),
    email: escapeHtml(data.email || '').trim().toLowerCase(),
    phone: escapeHtml(data.phone || '').trim().replace(/[^\d+\-\s()]/g, ''),
    company: escapeHtml(data.company || '').trim(),
    service: escapeHtml(data.service || '').trim(),
    message: escapeHtml(data.message || '').trim(),
    date: data.date || new Date().toISOString(),
  };
}

function validateEnquiry(data) {
  const errors = [];

  if (!data.name || data.name.trim().length < 2) {
    errors.push('Name must be at least 2 characters');
  }

  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Valid email is required');
  }

  if (!data.phone || data.phone.trim().length < 6) {
    errors.push('Valid phone number is required');
  }

  if (!data.message || data.message.trim().length < 10) {
    errors.push('Message must be at least 10 characters');
  }

  if (data.name && data.name.length > 100) {
    errors.push('Name is too long');
  }

  if (data.company && data.company.length > 100) {
    errors.push('Company name is too long');
  }

  if (data.service && data.service.length > 100) {
    errors.push('Service name is too long');
  }

  if (data.message && data.message.length > 5000) {
    errors.push('Message is too long');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

module.exports = { escapeHtml, sanitizeInput, validateEnquiry };
