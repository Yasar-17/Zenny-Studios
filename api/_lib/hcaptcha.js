// Verify hCaptcha token with the hCaptcha API.
// Returns true if valid, false otherwise.
// If HCAPTCHA_SECRET_KEY is not set, verification is skipped (dev mode).
export async function verifyHcaptcha(token) {
  const secret = process.env.HCAPTCHA_SECRET_KEY;
  if (!secret) return true; // skip in dev if not configured
  if (!token) return false;

  try {
    const res = await fetch('https://api.hcaptcha.com/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret, response: token }),
    });
    const data = await res.json();
    return data.success === true;
  } catch {
    return false;
  }
}
