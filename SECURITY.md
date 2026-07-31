# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 2.x     | Yes       |
| < 2.0   | No        |

## Security Measures

### Headers
- **HSTS** with preload (`max-age=63072000; includeSubDomains; preload`)
- **X-Content-Type-Options: nosniff** — prevents MIME-type sniffing
- **X-Frame-Options: DENY** — prevents clickjacking
- **Referrer-Policy: strict-origin-when-cross-origin** — limits referrer leakage
- **Permissions-Policy** — disables camera, microphone, geolocation, and interest-cohort
- **Content-Security-Policy** — restricts script, style, font, image, and connection sources

### Form Protection
- **Honeypot field** — invisible field that bots fill but humans don't; submissions with this field populated are silently dropped
- **Client-side validation** — required fields, email format, phone length checks
- **Server-side rate limiting** — 5 submissions per IP per 15 minutes on the `/api/enquiries` endpoint
- **Input sanitization** — HTML entities escaped on both client and server

### Authentication (Admin Panel)
- **Supabase Auth** — email/password with secure session management
- **HTTP-only cookies** — access and refresh tokens stored in httpOnly, secure, sameSite=strict cookies
- **Token rotation** — automatic refresh token rotation on expiry
- **Rate-limited login** — 5 attempts per IP per 15 minutes
- **Generic error messages** — no email enumeration possible

### API Protection
- **Rate limiting** — per-IP limits on all public endpoints
- **RLS (Row Level Security)** — Supabase policies restrict data access by role
- **Service role key isolation** — never exposed to the browser; used only in server-side functions
- **Payload size limits** — oversized request bodies rejected early

### Reporting a Vulnerability

If you discover a security vulnerability, please email **zennysstudios@gmail.com** with:
- A description of the vulnerability
- Steps to reproduce
- Potential impact

We will respond within 48 hours and work to resolve the issue as quickly as possible. Please do not publicly disclose the vulnerability until we have had a chance to address it.
