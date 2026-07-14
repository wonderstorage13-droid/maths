# Maths Practice

A white-theme, indigo-accent maths practice website. Pure HTML/CSS/JS — no build
step, no backend. All progress is saved in the browser's `localStorage`.

## Run it

Just open `index.html` in a browser for a quick look — but **AI Practice**
and **Leaderboard Sync** need the `functions/` folder running on Cloudflare
Pages (they won't work from a plain `file://` open or from static-only
hosts without server functions).

### Deploy to Cloudflare Pages

1. Push this whole folder (including `functions/`) to a GitHub repo.
2. Cloudflare dashboard → Workers & Pages → Create → Pages → connect the repo.
   - Build command: none / leave blank
   - Build output directory: `/` (the repo root — where `index.html` lives)
3. After the first deploy, go to your project → **Settings → Environment
   variables** and add:
   - `GROQ_API_KEY` — your key from console.groq.com (mark it **Secret**)
   - `SHEET_URL` — your Google Apps Script Web App URL (optional — only
     needed if you want scores mirrored into a Google Sheet)
4. Redeploy (env var changes need a new deployment to take effect).

Cloudflare Pages automatically turns everything under `functions/` into
serverless API routes — `functions/api/ai-question.js` becomes
`/api/ai-question`, `functions/api/leaderboard.js` becomes
`/api/leaderboard`. Your Groq key and sheet URL live only in Cloudflare's
environment variables — never in the browser or in this repo.

## Features

- **Onboarding** (`index.html`) — asks for a name once, generates a one-time
  player ID, and saves both to `localStorage`. Returning visitors skip
  straight to the dashboard.
- **Dashboard** (`dashboard.html`) — questions solved, accuracy, study time,
  daily goal ring, continue-practicing shortcuts, and recommended topics.
- **Practice** (`practice.html`) — all 51 topics, filterable by category.
- **Topics** (`topics.html`) — every topic with your solved count and best
  accuracy, plus a search box (also reachable from the top search bar).
- **Question runner** (`runner.html?id=<topicId>`) — a 10-question timed
  round. Every question is generated on the fly by a JS function in
  `js/questions.js`, so there's no fixed question bank to run out of, no AI
  call, and no explanations shown — just instant, shuffled questions.
- **Mock Tests** (`mocktest.html`) — links out to
  `commercesehoga.github.io/dashboard` `/ssc` `/banking` `/cuet` `/jee-neet`.
- **Progress** (`progress.html`) — a bar per topic (best accuracy) plus
  overall stats.
- **Bookmarks** (`bookmarks.html`) — topics you've starred from Practice or
  Topics.
- **Notes** — the sidebar "Notes" link opens `thunderstudy.indevs.in` in a
  new tab.
- **AI Practice** (`ai-practice.html`) — one AI-generated question per day,
  served by the `/api/ai-question` Cloudflare Function using **your**
  `GROQ_API_KEY` environment variable. It's timed but never counts toward
  your topic scores or the leaderboard, and resets at midnight.
- **Leaderboard** (`leaderboard.html`) — every finished practice round is
  logged locally and also sent to `/api/leaderboard`, which forwards it to
  your `SHEET_URL` (a Google Apps Script Web App) if you've set one — the
  same pattern used by CUET-style leaderboards.
- **Settings** (`settings.html`) — edit your name and view your (read-only)
  player ID. The Groq key and sheet URL are configured once by the site
  owner in Cloudflare, not per visitor.

## Adding a Google Sheet leaderboard (optional)

1. Open a Google Sheet → Extensions → Apps Script.
2. Add a `doPost(e)` function that reads `e.postData.contents` (JSON) and
   appends a row.
3. Deploy as a Web App (execute as you, access "Anyone").
4. Paste the deployment URL into Cloudflare Pages → Settings → Environment
   variables → `SHEET_URL`, then redeploy.

## Notes on the question bank

`js/questions.js` defines 51 topics across Foundations, Commercial Maths,
Time/Speed/Work, Algebra, Geometry & Mensuration, Data & Statistics, and
Miscellaneous (SSC/Banking/CUET-style topics included: profit & loss, SI/CI,
time & work, boats & streams, etc). Each topic has a generator function that
produces a fresh multiple-choice question every call — effectively unlimited
questions, always shuffled, with zero network calls.
