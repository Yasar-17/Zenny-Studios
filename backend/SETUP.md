# Zenny Studios API - Setup Guide

## Prerequisites

- Node.js 18+ installed
- A [Turso](https://turso.tech) account (free tier available)
- A [Resend](https://resend.com) account for email notifications

## Step 1: Install Dependencies

```bash
cd backend
npm install
```

## Step 2: Set Up Turso Database

1. Sign up at [turso.tech](https://turso.tech)
2. Install the Turso CLI: `curl -sSfL https://get.tur.so/install.sh | bash`
3. Create a database:
   ```bash
   turso db create zenny-studios
   ```
4. Get your database URL and auth token:
   ```bash
   turso db show zenny-studios --url
   turso db tokens create zenny-studios
   ```

## Step 3: Configure Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

### Generate Secure Secrets

```bash
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"
node -e "console.log('JWT_REFRESH_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"
```

### Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `JWT_SECRET` | Secret for signing access tokens (64+ hex chars) | `a1b2c3...` |
| `JWT_REFRESH_SECRET` | Secret for signing refresh tokens (64+ hex chars) | `d4e5f6...` |
| `ADMIN_EMAIL` | Admin login email | `admin@yourdomain.com` |
| `ADMIN_PASSWORD` | Admin password (min 8 chars) | `YourStrongP@ss!` |
| `TURSO_DATABASE_URL` | Your Turso database URL | `libsql://your-db.turso.io` |
| `TURSO_AUTH_TOKEN` | Your Turso auth token | `eyJhbGci...` |
| `RESEND_API_KEY` | Resend API key for emails | `re_abc123...` |
| `EMAIL_TO` | Email to receive enquiry notifications | `you@email.com` |
| `ALLOWED_ORIGINS` | Comma-separated list of allowed frontend origins | `https://yoursite.com` |
| `NODE_ENV` | Set to `production` in production | `production` |

## Step 4: Seed the Database

```bash
npm run seed
```

This creates the admin user and required tables.

## Step 5: Run the Server

Development:
```bash
npm run dev
```

Production:
```bash
npm start
```

## Deploying to Vercel

1. Push your code to GitHub
2. Connect your repo to Vercel
3. Add all environment variables in Vercel dashboard
4. Deploy

**Important:** Do NOT use local SQLite on Vercel. The filesystem is ephemeral and all data will be lost on redeploy. Turso provides persistent storage.

## Security Checklist

- [ ] `JWT_SECRET` is a cryptographically random string (64+ chars)
- [ ] `JWT_REFRESH_SECRET` is a different cryptographically random string
- [ ] `ADMIN_PASSWORD` is at least 8 characters with mixed case, numbers, and symbols
- [ ] `NODE_ENV` is set to `production`
- [ ] `ALLOWED_ORIGINS` only includes your actual domain(s)
- [ ] `.env` is in `.gitignore` and NOT committed to version control
- [ ] Database files (`*.db`) are NOT committed to version control
