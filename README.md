<div align="center">

# Zenny Studios

### Three Steps Ahead — A Creative Agency Website

A premium, fully responsive marketing website for **Zenny Studios**, a Bengaluru-based creative agency specialising in social media, content production, branding, and digital presence. The site is built as a lightweight, multi-page static frontend with a custom design system, smooth motion, and an accessibility-first structure.

</div>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Local Development](#local-development)
- [Pages](#pages)
- [Design System](#design-system)
- [Performance & Accessibility](#performance--accessibility)
- [SEO Configuration](#seo-configuration)
- [Deployment](#deployment)
- [Scripts](#scripts)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

Zenny Studios is a single-agency portfolio and lead-generation website. It communicates the studio's brand, services, and case studies, and captures new business enquiries through a guided contact form. Each project is presented on its own dedicated case-study page, giving the work room to breathe while keeping the marketing pages fast and focused.

The frontend is intentionally free of heavy build tooling. Pages are authored in semantic HTML, styled with a Tailwind CSS foundation extended by a hand-rolled token system, and enhanced with vanilla JavaScript for interaction and motion. The result is a fast, search-friendly site that is simple to maintain and easy to deploy on any static hosting platform.

---

## Features

- **Multi-page architecture** — separate, purpose-built pages for Home, Work, Services, Contact, and 19 individual project case studies.
- **Bespoke design system** — a custom colour, type, and spacing token layer (`css/theme.css`) layered on top of Tailwind for consistent, on-brand styling across pages.
- **Dark-first theme with light toggle** — a preference-aware theme switcher (`js/theme.js`) that remembers the visitor's choice, applies it before first paint, and **syncs across all open browser tabs** in real time via the `storage` event.
- **Motion and micro-interactions** — scroll-reveal animations, a custom cursor, scroll progress, stat count-ups, and parallax, all implemented with vanilla JS and `IntersectionObserver` / `requestAnimationFrame` for smooth, low-overhead effects.
- **Project case studies** — each engagement has a dedicated `/projects/<slug>.html` page with its own cover, brief, deliverables, gallery, and navigation back to the work index.
- **Lead capture** — a validated, accessible contact form that submits to the `/api/enquiries` endpoint with honeypot spam protection and optional hCaptcha verification.
- **Enquiry dashboard** — an admin inbox (`admin.html`) for staff to log in, review submissions, and manage enquiries via Supabase Auth + httpOnly session cookies.
- **SEO and social** — per-page meta descriptions, Open Graph and Twitter cards, JSON-LD structured data (Organization, WebPage, CreativeWork, BreadcrumbList), a `sitemap.xml` with `lastmod` dates, and `robots.txt`.
- **Analytics** — privacy-friendly visitor tracking via [Plausible](https://plausible.io) — no cookies, no consent banner needed.
- **404 redirect strategy** — 15+ permanent redirects for common typos, shortened slugs, and extension-less URLs via `vercel.json`.
- **Accessibility-first** — skip-to-content links on every page, `aria-live` regions for dynamic content, focus management, screen-reader announcements, and `prefers-reduced-motion` support.
- **Legal pages** — Privacy Policy and Terms & Conditions pages, with linked PDF copies in the `legal/` directory.
- **Custom 404** — a branded "not found" page with escape-route navigation and a dead-route report link.

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Markup | Semantic HTML5 | Structure and content |
| Styling | Tailwind CSS (CDN) + custom tokens | Utility-first styling with a brand design system |
| Tokens & theme | `css/theme.css`, `js/theme.js` | Design tokens, dark/light theme |
| Interactions | Vanilla JavaScript (ES6) | Motion, form validation, dashboard logic |
| Fonts | Bebas Neue, Inter (Google Fonts) | Display and body typography |
| Hosting | Static hosting (e.g. Vercel, Netlify) | Zero-build global delivery |

> The website does not require a build step. Open the HTML files directly or serve the root directory — that's it.

---

## Project Structure

```
zenny-studios/
├── index.html                  # Home / landing page
├── work.html                   # Portfolio index with project filters
├── services.html               # Services and pricing overview
├── contact.html                # Contact form and enquiry capture
├── thank-you.html             # Post-submission confirmation page
├── admin.html                  # Admin enquiry inbox (dashboard)
├── 404.html                    # Custom not-found page
├── privacy-policy.html         # Privacy policy
├── terms-and-conditions.html   # Terms & conditions
├── projects/                   # 19 individual project case studies
│   ├── antaranga.html
│   ├── apple-design.html
│   └── ... (others)
├── css/
│   └── theme.css               # Design tokens, theme variables, base styles
├── js/
│   └── theme.js                # Theme switcher and persistence
├── assets/                     # Images, logos, and project media
├── legal/                      # PDF copies of legal documents
├── robots.txt                  # Crawler directives
├── sitemap.xml                 # Search engine sitemap
├── package.json                # Project metadata and dev scripts
├── api/                        # Supabase-backed serverless API (enquiries + auth)
│   ├── _lib/                   # Shared helpers: supabase, auth, validate, rate-limit
│   ├── auth/                   # login, logout, me, refresh endpoints
│   └── enquiries/              # CRUD endpoints for enquiries
└── supabase/
    └── migrations/             # SQL schema + Row-Level Security policies
```

> The `api/` directory is the enquiry/inbox backend, powered entirely by Supabase (Postgres + Auth + RLS). The database schema lives in `supabase/migrations/0001_init.sql`.

---

## Getting Started

### Prerequisites

- A modern web browser.
- *(Optional)* [Node.js 18+](https://nodejs.org) and npm — only needed if you want to use the local development server or the password-hash utility.

### Clone the repository

```bash
git clone <repository-url>
cd zenny-studios
```

---

## Local Development

Because the site is static, you can preview it with any static server. The recommended option uses Vercel CLI (already listed as a dev dependency).

### Option 1 — Vercel dev (recommended)

```bash
npm install
npm run start
```

> **Note:** the script is intentionally named `start`, not `dev` — Vercel CLI refuses a `dev` script that invokes `vercel dev` (it would recurse into itself).

This starts a local server (default: `http://localhost:3000`) and also serves the API routes during development.

### Option 2 — Any static file server

Use any tool that serves the project root, for example:

```bash
# Python (no install required if Python 3 is present)
python -m http.server 5500

# Or, the "Live Server" extension in VS Code
```

Then open `http://localhost:5500` (or the port reported by your server).

### Opening files directly

You can also double-click any `.html` file to open it in a browser. Note that some browsers restrict local file access for certain features, so a local server is preferred for an accurate preview.

---

## Supabase Backend

The enquiry inbox (`admin.html`) and the contact form (`contact.html`) are backed by a Supabase project. Auth uses **Supabase Auth** (email + password); data lives in a Postgres `enquiries` table. All reads/writes go through the **service-role key** (server-side only), gated by a session check in code; the anon key is denied by Row-Level Security (RLS enabled, no permissive policies). The serverless endpoints in `api/` talk to Supabase via `@supabase/supabase-js`.

### One-time setup

1. Create a project at [supabase.com](https://supabase.com).
2. Open the **SQL editor** and run `supabase/migrations/0001_init.sql`, then `supabase/migrations/0002_service_role_auth.sql` (creates the table/index and removes permissive RLS policies).
3. In **Authentication → Users → Add user**, create the admin account (email + password) that will sign in to `admin.html`.
4. Copy `.env.example` to `.env` and fill in `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`. Locally, `vercel dev` reads `.env` at the project root.
5. In Vercel, add the same three variables under Project Settings → Environment Variables (for both Production and Preview) — without them every `/api/*` function fails to boot and the admin login shows a server connection error.
6. *(Recommended)* Add `ADMIN_EMAIL` to the same environment variables so only that account can access the admin inbox endpoints.

> **Security note:** `SUPABASE_SERVICE_ROLE_KEY` bypasses RLS. It is only used server-side in `api/_lib/supabase.js` and must never be exposed to the browser.

### Env vars

| Variable | Where used | Purpose |
|---|---|---|
| `SUPABASE_URL` | `api/_lib/supabase.js` | Supabase project URL |
| `SUPABASE_ANON_KEY` | `api/_lib/supabase.js` | Public anon key (RLS still applies) |
| `SUPABASE_SERVICE_ROLE_KEY` | `api/_lib/supabase.js` | Server-only key; all enquiry reads/writes (bypasses RLS — never expose it) |
| `ADMIN_EMAIL` | `api/_lib/auth.js` | Admin allowlist — only this account may access the admin inbox endpoints when set |
| `HCAPTCHA_SECRET_KEY` | `api/_lib/hcaptcha.js` | Verifies captcha tokens (opt-in — only enforced when the form sends `hcaptcha_token`) |

---

## Pages

| Path | Description |
|---|---|
| `/` (`index.html`) | Hero, services summary, featured work, stats, and call-to-action. |
| `/work.html` | Filterable portfolio grid linking to each case study. |
| `/services.html` | Detailed service offerings and engagement model. |
| `/contact.html` | Validated enquiry form with service selection. |
| `/thank-you.html` | Confirmation page shown after a successful submission. |
| `/projects/<slug>.html` | Per-project case study (19 in total). |
| `/admin.html` | Staff-only enquiry inbox (login required). Set to `noindex`. |
| `/privacy-policy.html` | Privacy policy. |
| `/terms-and-conditions.html` | Terms and conditions. |
| `/404.html` | Branded not-found page. |

---

## Design System

The design system lives in `css/theme.css` and is built around a small set of tokens that drive both the visual style and the theme switcher.

- **Colours** — a dark-first palette anchored on `#0a0a0a` (background), `#111111` (card), and a signature gold `#F5C518` (`--color-accent-gold`). Each token is defined for both `dark` and `light` themes via `[data-theme="..."]` selectors.
- **Typography** — `Bebas Neue` for display headings and `Inter` for body copy, loaded from Google Fonts with `preconnect` hints for faster loading.
- **Spacing & radius** — consistent spacing and corner-radius tokens keep cards, buttons, and sections visually aligned.
- **Motion** — animation tokens define the timing and easing used across reveal, hover, and transition effects so motion feels unified.

To customise the brand, edit the tokens at the top of `css/theme.css`. Every page consumes these tokens, so changes propagate automatically.

### Theme switcher

`js/theme.js` runs before paint to:

1. Read the saved preference from `localStorage`.
2. Fall back to the default dark theme if nothing is saved.
3. Apply the theme by setting `data-theme` on the `<html>` element.
4. Wire up any `[data-theme-toggle]` buttons to let visitors switch themes.
5. **Listen for `storage` events** — when the theme changes in one tab, all other open tabs update instantly without a reload.

---

## Performance & Accessibility

- **No heavy SPA framework** — pages are static HTML, so first paint is fast and content is indexable by search engines out of the box.
- **CDN-loaded Tailwind** — utility classes are generated in the browser via the Tailwind CDN, keeping the repository lean for a marketing site. For a production rebuild, Tailwind can be compiled to purge unused classes and ship a smaller CSS file.
- **Lazy motion** — scroll reveals use `IntersectionObserver` and stat count-ups use `requestAnimationFrame`, so animations only run when elements are visible and stay smooth on low-end devices.
- **Accessible forms** — required fields are marked, inline validation messages are shown with clear affordances, and errors are focused on submit.
- **Skip-to-content links** — every page has a keyboard-accessible "Skip to main content" link that becomes visible on focus.
- **`aria-live` regions** — dynamic content (stats, filter results, form status, toast notifications) announces changes to screen readers.
- **Semantic structure** — landmarks (`<main id="main-content">`), headings, and alt text are used throughout to support keyboard navigation and assistive technology.
- **`prefers-reduced-motion`** — motion respects the visitor's OS-level reduced-motion preference where the custom JS handles it.
- **Honeypot field** — invisible form field catches bot submissions without user friction.

---

## SEO Configuration

Each page carries its own:

- Unique `<title>` and `meta[name="description"]`.
- Open Graph (`og:title`, `og:description`, `og:image`, `og:url`) and Twitter card tags.
- JSON-LD structured data — `Organization` on the homepage, `WebPage` with `BreadcrumbList` on main pages, and `CreativeWork` with breadcrumbs on every project case study.
- A canonical-friendly structure backed by `sitemap.xml` (with `lastmod` dates) and `robots.txt`.

To update the indexed URLs, edit `sitemap.xml` and `robots.txt` at the project root. The site URL used in meta tags is `https://zennystudios.com`.

---

## Analytics

Visitor tracking is handled by [Plausible Analytics](https://plausible.io) — a lightweight, privacy-first alternative to Google Analytics:

- **No cookies** — no consent banner required under GDPR/ePrivacy.
- **No PII collected** — no personal data is stored or shared.
- **Script loaded defer** — does not block page rendering.
- **Configured in `vercel.json`** — CSP headers allow `plausible.io` for script, image, and connection sources.

To switch the tracking domain, update the `data-domain` attribute on the Plausible `<script>` tag in every HTML file, or use a shared include if you adopt a build step.

---

## 404 Redirect Strategy

The `vercel.json` file defines two layers of URL handling:

### Permanent Redirects (301)
Common typos, shortened slugs, and legacy URLs are redirected to their canonical targets:

| Source | Destination |
|---|---|
| `/projects/calisthenics-reel` | `/projects/calesthenics-reel.html` |
| `/projects/headline-ad-shoot` | `/projects/headline-adshoot.html` |
| `/projects/tavisa` | `/projects/tavisa-fashion.html` |
| `/work` | `/work.html` |
| `/services` | `/services.html` |
| `/contact` | `/contact.html` |
| `/about` | `/#about` |

### Rewrite Rule
`/projects/:slug` rewrites to `/projects/:slug.html` so clean URLs work without the `.html` extension.

To add a new redirect, append an entry to the `redirects` array in `vercel.json`.

---

## Deployment

The frontend is fully static and can be deployed to any static host.

### Vercel

1. Push this repository to GitHub, GitLab, or Bitbucket.
2. Import the project into [Vercel](https://vercel.com).
3. No build command or output directory is required — Vercel serves the root folder as static files and runs the `/api/*` serverless functions automatically.
4. Add the Supabase environment variables (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, and optionally `HCAPTCHA_SECRET_KEY`) under Project Settings → Environment Variables for both Production and Preview. See `.env.example`.

### Netlify / Cloudflare Pages / GitHub Pages

Set the publish directory to the repository root and deploy. No build step is needed.

### Custom domain

Point your domain's DNS at your hosting provider and update the `og:url`, `sitemap.xml`, and `robots.txt` entries to match your canonical URL.

---

## Scripts

Defined in `package.json`:

| Script | Command | What it does |
|---|---|---|
| `start` | `npm run start` | Starts the Vercel local dev server for the site and the `/api/*` Supabase endpoints. |

---

## Roadmap

The marketing frontend is feature-complete. Planned next steps:

- **Enable hCaptcha** — render the hCaptcha widget in `contact.html` and send `hcaptcha_token` with the POST; verification is already wired server-side (`api/_lib/hcaptcha.js`).
- **Tailwind build step** — move from the CDN to a compiled, purged Tailwind CSS file for smaller production stylesheets.
- **Blog / journal section** — content marketing pages for SEO and thought leadership.
- **Testimonials section** — client quotes and case-study endorsements.

---

## Contributing

This is a client project for Zenny Studios. To propose a change:

1. Open an issue describing the problem or improvement.
2. Keep markup semantic and accessible — add `alt` text, use landmarks, and respect the design tokens in `css/theme.css`.
3. Test on both `dark` and `light` themes before submitting.
4. Ensure no broken or placeholder characters (such as the Unicode replacement character `�`) are introduced in content or copy.

---

## License

© 2026 Zenny Studios. All rights reserved.

The source code in this repository is private and confidential. No part of it may be copied, reproduced, or distributed without prior written permission from Zenny Studios. The legal documents in the `legal/` directory govern use of the website and its content.