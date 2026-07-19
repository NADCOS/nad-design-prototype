# NAD Design — Vite + React (Vercel-ready)

A complete, independent Vite + React project for the NAD Design AI interior/architectural design studio: project type → design level → style → materials → furniture → upload → summary → AI generator, with EN/AR + RTL, light/dark mode, guest/admin auth, an admin dashboard, and AI image generation via **Google Nano Banana 2 (Gemini 3.1 Flash Image)** through a secure serverless function.

This project has **no dependency on the Claude Artifact environment** — it runs entirely on its own with `npm install && npm run dev`, and deploys to Vercel as a standard Vite app plus one serverless API route.

## 1. Requirements

- Node.js 18+ and npm
- A [Google AI Studio](https://aistudio.google.com/) Gemini API key (only needed for real AI generation — see §10)
- A GitHub account (to host the repo) and a Vercel account (to deploy)

## 2. Install dependencies

```bash
cd nad-design      # or wherever you extracted/cloned this project
npm install
```

## 3. Run locally

```bash
npm run dev
```

Open the printed local URL (typically `http://localhost:5173`). Every client-journey step, the admin dashboard, and the login flow work with mock data out of the box — no environment variables are required for local browsing (AI generation will show a friendly "not configured" error until `GEMINI_API_KEY` is set — see §10).

## 4. Production build

```bash
npm run build
```

This outputs a fully static site to `dist/` (`dist/index.html` + `dist/assets/...`). Sanity-check it locally with:

```bash
npm run preview
```

## 5. Upload to GitHub

```bash
git init
git add .
git commit -m "NAD Design — initial Vite + React export"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

The repository root must contain `index.html`, `package.json`, `vite.config.js`, `vercel.json`, `src/`, and `public/` directly (not nested inside a subfolder or a zip) — this project is already laid out that way.

## 6. Import into Vercel

1. Go to [vercel.com/new](https://vercel.com/new) and import the GitHub repository.
2. Vercel auto-detects the **Vite** framework preset from `vercel.json` / `package.json`. Confirm these build settings:
   - **Framework Preset:** Vite
   - **Root Directory:** `./`
   - **Install Command:** `npm install`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. Add the environment variable(s) from §10 below (skip them to run in demo/mock mode).
4. Click **Deploy**.

`vercel.json` includes a SPA rewrite (`"/(.*)" → "/index.html"`) so React Router routes like `/design/materials` or `/admin` load correctly on a hard refresh or a direct/shared link — Vercel won't 404 them.

## 7. Redeploying after updates

Push to your GitHub branch (`git push`) — Vercel redeploys automatically on every push to the connected branch. For a manual redeploy, use **Deployments → Redeploy** in the Vercel dashboard, or `vercel --prod` via the Vercel CLI.

## 8. Project structure

```
nad-design/
├── index.html
├── package.json
├── vite.config.js
├── vercel.json
├── .gitignore
├── .env.example
├── README.md
├── public/
│   └── assets/            # logo, hero photo, prefilled material textures
├── api/                    # Vercel serverless functions (server-only — never bundled into the client)
│   ├── generate-design.js, admin-*.js, guest-lookup.js   # one route per file
│   └── _lib/                    # shared helpers only — underscore prefix keeps Vercel from
│       ├── nanoBanana.js        #   counting these as separate Serverless Functions (12-function
│       ├── supabaseAdmin.js     #   cap on the Hobby plan)
│       └── verifyAdmin.js
└── src/
    ├── main.jsx             # React Router + app root
    ├── App.jsx              # route table + theme/RTL shell (header, WhatsApp button, toast)
    ├── index.css            # global resets + @keyframes (all other styling is inline, ported as-is)
    ├── components/          # reusable UI: Header, ProjectProgress, cards, modals, PriceSummary, etc.
    ├── pages/               # one file per route: HomePage, LoginPage, AdminPage, TypePage, LevelPage,
    │                        # StylePage, MaterialsPage, FurniturePage, UploadPage, SummaryPage, GeneratePage
    ├── data/                # project types, design levels, styles, materials, furniture, suppliers,
    │                        # navigation (step order), translations (EN/AR strings)
    ├── hooks/
    │   └── useAppState.js   # global app state + every handler (Context + hook), ported from the
    │                        # original single-file prototype so pages/components can share one source of truth
    ├── services/
    │   └── nanoBananaClient.js  # frontend fetch wrapper for POST /api/generate-design (session limits, error mapping)
    ├── utils/
    │   ├── promptBuilder.js     # builds the structured Nano Banana prompt from the client's selections
    │   ├── imageToBase64.js     # data-URL <-> base64 helpers
    │   ├── pricing.js           # computeCost / computeWarnings — pure cost-estimation logic
    │   └── sx.js                # tiny CSS-string → React style object helper (used throughout for hover states)
    └── config/
        └── aiGeneration.js  # model name, aspect ratios, image sizes, prompt/upload limits, session generation cap
```

## 9. What's preserved from the approved prototype

Nothing about the approved design was changed — this is a straight restructuring:

- Same colours, typography (Century Gothic / Noto Kufi Arabic), spacing, card layouts, and branding.
- Same navigation and step flow (Project → Level → Style → Materials → Furniture → Upload → Summary → Generate), now backed by real routes (`/design/type`, `/design/level`, …) via React Router instead of in-memory-only state — refreshing or sharing a step link now works correctly.
- Same interactions: project-type/level/style selection, material swatches + board, furniture selection + fabric/wood/metal customization (geometry never changes — only the finish), upload preview, real-time cost calculator, prompt preview + edit, before/after comparison, admin image overrides, guest/admin login gating.
- The one intentional visual change (already approved in an earlier revision): the **material preview popup** uses a 50%-opaque frosted-glass panel with a backdrop blur and dark, high-contrast text for readability — this exact treatment is preserved in `components/MaterialPreviewModal.jsx`.
- Accessibility additions (new, non-visual): proper `<button type="button">` elements instead of bare `<span onClick>`, form `<label htmlFor>` associations, `alt` text on images, `role`/`aria-*` attributes on tabs/modals/progress dots, and visible native focus rings (no custom `outline: none`).

## 10. Nano Banana 2 (Gemini) setup

The AI Generation page calls `POST /api/generate-design`, a Vercel serverless function — **the client never calls Google directly and never sees an API key.**

1. Get a Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey).
2. In Vercel: **Project → Settings → Environment Variables**, add:
   - `GEMINI_API_KEY` = your key (mark it **Sensitive**)
   - `NANO_BANANA_MODEL` = `gemini-3.1-flash-image` (optional — this is the default if unset)
3. Locally, copy `.env.example` to `.env` and fill in the same two variables to test AI generation on `localhost` (Vite dev server proxies `/api/*` to the same serverless functions when using `vercel dev`; plain `vite dev` will show the "not configured" error for `/api/generate-design` since it doesn't run serverless functions — use `vercel dev` locally if you want to test real generation before deploying).

**Never** prefix these with `VITE_` — anything prefixed `VITE_` is inlined into the public JS bundle. `GEMINI_API_KEY` must only ever be read inside `api/_lib/nanoBanana.js`.

### Current mock/demo states

- Without `GEMINI_API_KEY` set, `/api/generate-design` still validates every request (prompt length, image type/size) but returns a clear "AI design generator is not configured yet" error — the rest of the UI (loading state, error state, retry button) works exactly as it will in production.
- The client-side session cap (3 generations per browser session, configurable in `src/config/aiGeneration.js`) and short cooldown between requests are enforced regardless of whether the API key is set.
- Supplier, pricing override, consultation, and client-list data in the admin dashboard are in-memory/`localStorage` mocks — see `src/hooks/useAppState.js`.

### Remaining steps for full production readiness

- Add the real `GEMINI_API_KEY` in Vercel once you're ready to generate real images (see above).
- Replace the client-side session generation cap with real per-user credits (Supabase auth + a `generations` table), and move image storage from base64 responses to Supabase Storage — `api/_lib/nanoBanana.js` already returns a single `imageDataUrl` field so this swap won't require frontend changes.
- Replace the `mailto:` guest-registration notification (`src/hooks/useAppState.js` → `registerGuest`) with a real transactional email/webhook.
- Move mock catalogue data (`src/data/*.js`) to a real backend/CMS if suppliers, pricing, or products need to be managed outside code.

## 11. Environment variables reference

| Variable | Where it's read | Notes |
|---|---|---|
| `GEMINI_API_KEY` | `api/_lib/nanoBanana.js` only | Server-only secret. Never in frontend code, never `.env.example`. |
| `NANO_BANANA_MODEL` | `api/_lib/nanoBanana.js` only | Optional — defaults to `gemini-3.1-flash-image`. |
| `ADMIN_PASSCODE` | `api/admin-login.js` only | Server-only. Without it, admin login always fails (previously the passcode was hardcoded client-side). |
| `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` | `api/_lib/supabaseAdmin.js` only | Server-only. Bypasses RLS for `generation_logs`, `registrations`, and `suppliers` — see `api/admin-registrations.js` and `api/admin-suppliers.js` for the table SQL. |

### Registrations & suppliers are now Supabase-backed

Both used to live only in the admin's browser `localStorage` (invisible to other admins/devices). They now persist through `api/admin-registrations.js`, `api/guest-lookup.js`, and `api/admin-suppliers.js` — run the `create table` SQL at the top of those two files once in the Supabase SQL editor. Without `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY` set, the app falls back to the previous localStorage-only behavior so local demo browsing still needs no env vars.

## 12. Build validation checklist

- ✅ `npm install` completes with no missing/unused dependencies.
- ✅ `npm run dev` serves the app at `http://localhost:5173`.
- ✅ `npm run build` completes and produces `dist/index.html` + `dist/assets/*`.
- ✅ `npm run preview` serves the production build locally so you can click through every step before deploying.
- ✅ All image paths are project-relative (`/assets/nad-logo.jpg`, `/assets/hero.jpeg`, `/assets/marble.jpeg`, etc.) — nothing points at a temporary or external URL.
- ✅ Every route (`/`, `/login`, `/admin`, `/design/type` … `/design/generate`) loads directly and survives a hard refresh once `vercel.json`'s SPA rewrite is active.
- ✅ No Claude-specific imports, temporary asset URLs, or environment-specific code remain.
