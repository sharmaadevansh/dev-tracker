# DevTrack.AI

Unified developer portfolio dashboard. Current scope: **GitHub, LeetCode, Codeforces, CodeChef, GeeksforGeeks, LinkedIn**, plus a local Project Tracker.

## Flow

1. **Login** (`/login`) — hardcoded credentials for now (no backend yet).
   - Username: `devansh`
   - Password: `devtrack2026`
   - Change these in `src/context/AuthContext.jsx` → `HARDCODED_USER`.
2. **Handle setup** (`/setup`) — enter your GitHub, LeetCode, Codeforces, CodeChef, GFG usernames and LinkedIn handle/URL once. Stored in `localStorage`, so it persists across sessions (skip any field you don't have).
3. **Dashboard** (`/dashboard`) — auto-fetches and renders live stats for every linked platform.
   - `/dashboard/repos` — searchable/filterable GitHub repo explorer.
   - `/dashboard/projects` — a project tracker (CRUD: name, description, status, tech stack, links, dates, priority), stored locally in `localStorage`.

## Run it

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
npm run preview
```

## Data sources

| Platform | API used | Notes |
|---|---|---|
| GitHub | `api.github.com` (official, public, unauthenticated) + `github-contributions-api.jogruber.de` for the contribution calendar | Unauthenticated GitHub REST calls are rate-limited to 60 req/hr per IP. For heavier use, add a personal access token and send it as a Bearer header in `src/services/api/github.js`. |
| LeetCode | `alfa-leetcode-api.onrender.com` (community wrapper around LeetCode's GraphQL API) | LeetCode has no official public API. This is a free, third-party-hosted mirror — it can go down or rate-limit. If that happens, self-host the [same project](https://github.com/alfaarghya/alfa-leetcode-api) and swap `LC_API` in `src/services/api/leetcode.js`. |
| Codeforces | `codeforces.com/api` (official, public, unauthenticated) | Solid and well-documented. `user.status` is used to count unique accepted problems, which can be slow for accounts with huge submission histories. |
| CodeChef | `codechef-api.vercel.app` (community wrapper) | No official public API. Same caveat as LeetCode/GFG — swap `CC_API` in `src/services/api/codechef.js` if it goes down. |
| GeeksforGeeks | `geeks-for-geeks-api.vercel.app` (community wrapper) | Same caveat as LeetCode — no official API exists. Swap `GFG_API` in `src/services/api/gfg.js` if it's unavailable. |
| LinkedIn | None (by design) | LinkedIn has no public, ToS-compliant API for reading arbitrary profiles, and scraping violates their terms. LinkedIn is handled as a manually-linked profile card only (`src/services/api/linkedin.js`). |

## Project Tracker

`/dashboard/projects` is fully client-side CRUD (create, edit, delete) backed by `localStorage` — no API involved. Fields match the original brief: name, description, status, tech stack, GitHub link, live link, start date, deadline, priority.

## Where to plug in the rest later

The folder structure already matches the full spec (`context/`, `services/api/`, `hooks/`, `constants/`) — adding Codeforces, CodeChef, HackerRank, the project tracker, learning tracker, notes, etc. is a matter of adding new service files under `src/services/api/` and new sections in `src/pages/`.

The real backend (Node/Express/MongoDB/JWT/cron sync) described in the original brief isn't built yet — this is the frontend-only phase, using each platform's public data live from the browser.

## Design system

Dark "chassis" theme — Void Black background, Gunmetal surfaces, Signal Red accent, Space Grotesk for display type, Inter for body, JetBrains Mono for data/terminal touches. Tokens live in `src/index.css` under `@theme`.
