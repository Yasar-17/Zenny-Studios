// Verify hCaptcha token with the hCaptcha API.
// Returns true if valid, false otherwise.
//
// Verification is OPT-IN: it only runs when the request carries a token.
// The contact form currently renders no widget and sends no token, so
// submissions must not be rejected just because the secret env var is set.
// To enforce captcha, have the frontend send `hcaptcha_token` with its POST
// (and add the widget to contact.html).
export async function verifyHcaptcha(token) {
  const secret = process.env.HCAPTCHA_SECRET_KEY;
  if (!secret || !token) return true;

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
