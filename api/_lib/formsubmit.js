// Fire a server-to-server FormSubmit email notification for a new enquiry.
// FORM_SUBMIT_EMAIL must be set to the studio inbox you want alerts sent to.
// If it is not set, notifications are skipped (silent no-op).
export async function sendFormSubmitNotification(enquiry) {
  const to = process.env.FORM_SUBMIT_EMAIL;
  if (!to) return;

  const payload = {
    _subject: `New enquiry from ${enquiry.name || 'unknown'} — ${enquiry.service || 'General'}`,
    _template: 'table',
    _captcha: 'false',
    name: enquiry.name,
    email: enquiry.email,
    phone: enquiry.phone,
    company: enquiry.company || '-',
    service: enquiry.service || '-',
    message: enquiry.message,
  };

  // FormSubmit checks the Origin/Referer to confirm the request comes from a
  // real web page; server-side calls must spoof these to be accepted.
  const siteUrl = process.env.SITE_URL || 'https://zennystudios.com';

  const res = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(to)}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Origin': siteUrl,
      'Referer': `${siteUrl}/contact.html`,
      'User-Agent': 'Zenny-Studios-Serverless/1.0',
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => null);
  if (!res.ok || data?.success !== 'true') {
    throw new Error(`FormSubmit error: ${data?.message || `HTTP ${res.status}`}`);
  }
}
