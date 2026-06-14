# Lumina – Your AI Wellness Companion

GenAI-powered mental wellness companion for students preparing for **NEET, JEE, CUET, CAT, GATE, and UPSC**. Daily journaling, mood tracking, and personalised AI insights via Google Gemini.

Inspired by companion-style exam prep wellness apps — with a unique **Lumina** identity, onboarding flow, and aurora-inspired design.

## Local setup

1. **Install:** `npm install`
2. **Configure:** Copy `.env.example` to `.env` and set `GEMINI_API_KEY` from [Google AI Studio](https://aistudio.google.com/apikey)
3. **Run:** `npm run dev`

## Deploy to Vercel

### Option A — GitHub (recommended)

1. **Push code to GitHub**
   ```bash
   git add .
   git commit -m "Prepare Mental Wellness Tracker for Vercel"
   git push origin main
   ```

2. **Import on Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Vercel auto-detects **Vite** — keep these settings:
     - **Build Command:** `npm run build`
     - **Output Directory:** `dist`
     - **Install Command:** `npm install`

3. **Add environment variable** (required before first deploy)
   - In Vercel → your project → **Settings** → **Environment Variables**
   - Add:
     | Name | Value |
     |------|-------|
     | `GEMINI_API_KEY` | Your Gemini API key (server-side only) |
   - Enable for **Production**, **Preview**, and **Development**

4. **Deploy**
   - Click **Deploy**
   - Wait for the build to finish — your live URL will look like `https://your-project.vercel.app`

5. **Secure your API key** (after deploy)
   - In [Google AI Studio](https://aistudio.google.com/apikey), restrict the key to your Vercel domain (e.g. `https://your-project.vercel.app/*`)
   - The key is stored server-side via `/api/gemini` — it is never bundled into the client

6. **Redeploy after env changes**
   - If you add or change `GEMINI_API_KEY`, go to **Deployments** → **Redeploy**

### Option B — Vercel CLI

1. Install CLI: `npm i -g vercel`
2. From the project folder: `vercel login`
3. Link project: `vercel link`
4. Add env var: `vercel env add GEMINI_API_KEY`
5. Deploy: `vercel --prod`

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm test` | Run test suite |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run lint` | ESLint check |
| `npm run build` | Production build (same as Vercel) |

## Architecture

```
App (useReducer state)
├── /api/gemini         — server proxy (API key stays server-side)
├── JournalEntry        — daily text + sanitisation
├── MoodSelector        — 1–10 emoji scale
├── AIInsights          — parsed Gemini response sections
├── HistoryView         — entries + SVG mood sparkline (lazy-loaded)
└── useGemini()         — proxy calls, loading, errors, rate limiting
```

## Security

- Gemini API key stored as `GEMINI_API_KEY` on the server only — never sent to the browser
- Client calls `/api/gemini` proxy with validated, sanitised payloads
- Server-side rate limiting (15 requests/minute per IP)
- Client-side cooldown between submissions (2 seconds)
- Security headers: CSP, X-Frame-Options, nosniff, Permissions-Policy
- User input sanitised (HTML/script/event handlers stripped, 2000 char limit)
- Submit disabled while a request is in-flight

## Accessibility

- Semantic landmarks: `header`, `main`, `footer`, `nav`, `aside`
- Skip link, focus management on page navigation, mobile menu focus trap
- ARIA labels, `aria-pressed` mood buttons, keyboard arrow navigation
- Step progress labels (Step 1–4 of 4) for screen readers
- WCAG AA colour contrast via Tailwind palette
- `prefers-reduced-motion` support

## Testing

Tests cover components, hooks, sanitisation, and validation. Run `npm test` before submitting.
