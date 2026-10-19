# 🚀 DevTrack.AI — Comprehensive Project Evaluation & Audit Report

**Date of Audit:** October 18, 2026  
**Environment:** Node.js v25.9.0 | React 19 | Express 5.2.1 | MongoDB 8.9.5 | Vite 8.1.4  
**Dev Servers Verified:** Frontend (`http://localhost:5173`) & Backend (`http://localhost:5000`)

---

## 📑 Table of Contents
1. [Executive Summary & Concept](#1-executive-summary--concept)
2. [Runtime Verification & Test Results](#2-runtime-verification--test-results)
3. [Core Idea & Architectural Vision](#3-core-idea--architectural-vision)
4. [Bugs, Runtime Errors & Code Flaws](#4-bugs-runtime-errors--code-flaws)
5. [System Weaknesses & Limitations](#5-system-weaknesses--limitations)
6. [Aestheticness & UI/UX Evaluation](#6-aestheticness--uiux-evaluation)
7. [Priority Action Plan & Recommendations](#7-priority-action-plan--recommendations)

---

## 1. Executive Summary & Concept

**DevTrack.AI** is a developer productivity hub and unified portfolio dashboard. It solves **developer profile fragmentation** by aggregating competitive programming statistics (LeetCode, Codeforces, CodeChef, GeeksforGeeks), open-source contributions (GitHub), and career profiles (LinkedIn) into a single cohesive interface.

Beyond simple aggregation, it functions as a personal career cockpit with project tracking, DSA/CS roadmaps, markdown notes, resume ATS scoring, automated AI roasts, and global/university leaderboards powered by a composite **DevScore** algorithm.

---

## 2. Runtime Verification & Test Results

Both frontend and backend services were executed and validated in a live development session:

| Component | Target Port | Status | Details |
| :--- | :--- | :--- | :--- |
| **Backend API** | `http://localhost:5000` | 🟢 Active | Express 5 connected to MongoDB at `127.0.0.1/devtrack` |
| **Frontend SPA** | `http://localhost:5173` | 🟢 Active | Vite 8 dev server with `/api` reverse proxy |
| **Test Suite** | `npm run test` | 🟢 17/17 Passed | Integration suite covering auth, projects, summary, leaderboards, and badges |
| **Linter** | `npm run lint` | 🟡 0 Errors, 48 Warnings | Unused variables, redundant imports, and regex escapes |
| **Production Build** | `npm run build` | 🟢 Passed | Built in 7.51s (Bundle size warning: 1,341 kB single chunk) |

---

## 3. Core Idea & Architectural Vision

### 3.1 Dual-Purpose Value Proposition
1. **The Individual Developer Cockpit:**
   - **Daily Goals & Heatmaps:** Daily task checklist with category tags and consistency tracking.
   - **Project Tracker:** Full CRUD manager for personal projects with priority, status, and repository/live links.
   - **Learning Roadmap:** Structured syllabus for Data Structures & Algorithms, System Design, Operating Systems, DBMS, and Computer Networks with subtopic checkboxes.
   - **Developer Notes:** In-browser markdown notebook with real-time preview and folder categorization.
   - **Resume ATS Analyzer:** Keyword matcher and ATS readiness score gauge.

2. **The Social & Competitive Showcase:**
   - **Composite DevScore:** Weighted formula aggregating LeetCode problem difficulty, Codeforces rating, CodeChef stars, GitHub stars & contributions, and GFG score.
   - **Campus & Global Leaderboards:** League tables filterable by global standing, specific universities, or individual platforms.
   - **Public Profile (`/u/:username`):** Sharable portfolio showcase for recruiters and peers.
   - **Dynamic SVG Badges (`/api/badge/:username`):** Embeddable live vector status cards for GitHub `README.md` profiles.
   - **AI Comedy Roast (`/api/roast/:username`):** Gemini-powered (or heuristic fallback) comedic portfolio critique.
   - **Head-to-Head Compare (`/api/ranking/compare`):** Side-by-side metric comparison between two developers.

---

## 4. Bugs, Runtime Errors & Code Flaws

### 🔴 Critical & High Severity Bugs

#### 1. Heatmap Component Prop Mismatch — Silent Heatmap Blackout
- **Files:** `src/pages/DailyGoals.jsx` (L274) & `src/pages/Projects.jsx` (L137)
- **Issue:** Both pages pass `<Heatmap rows={7} cols={4} lastActiveDayIndex={27} />`. However, `Heatmap.jsx` does not accept `lastActiveDayIndex` as a prop; it expects `data` (an ISO date map or timestamp map).
- **Impact:** Because `data` is omitted, `Heatmap` initializes an empty count map, rendering 28 grey zeroed cells with `Total tracked: 0`. The visual heatmap on Projects and Goals is broken.

#### 2. Missing Codeforces Submission Data in Analytics Heatmap
- **File:** `src/pages/CodingAnalytics.jsx` (L481)
- **Issue:** The page renders `<Heatmap data={codeforces.data?.submissionDates} ... />`.
- **Impact:** The backend `getCodeforcesData()` in `server/services/platform.service.js` never calculates or returns `submissionDates`. Consequently, `codeforces.data?.submissionDates` is always `undefined`, leaving the Codeforces activity heatmap permanently empty.

#### 3. Uncaught `TypeError` in Profile Password Update Flow
- **Files:** `src/pages/Profile.jsx` (L15) & `src/context/AuthContext.jsx` (L101)
- **Issue:** `Profile.jsx` initializes password state with `useState(user.password)`. In JWT auth or registration, passwords are never stored in user session state (`undefined`).
- **Impact:**
  - Triggers React's uncontrolled-to-controlled input warning.
  - If a user submits credentials without typing in the password field, `updateCredentials(username, password)` calls `newPassword.trim()` on `undefined`, triggering an unhandled `TypeError: Cannot read properties of undefined (reading 'trim')` and breaking the component.

#### 4. Hardcoded `localhost:5000` in Roast Share Links
- **File:** `server/controllers/viral.controller.js` (L309)
- **Issue:** The viral share text is hardcoded:
  ```js
  shareText: `... Roast yours at http://localhost:5000/u/${cleanUser}`
  ```
- **Impact:** When users click "Share on Twitter / LinkedIn", the shared link points to `localhost:5000` instead of the public domain or client URL (`process.env.CLIENT_URL`).

#### 5. Unauthenticated Client-Side GitHub API 60-Request Rate Limit Trap
- **File:** `src/pages/Repositories.jsx` (L58, L88)
- **Issue:** The browser directly makes unauthenticated HTTP requests to `api.github.com/repos/:user/:repo/commits` and `raw.githubusercontent.com`.
- **Impact:** GitHub restricts unauthenticated client IPs to **60 requests/hour**. Browsing a few repositories or running on a shared network (e.g., college campus or office Wi-Fi) immediately results in `HTTP 403 Rate Limit Exceeded`.

#### 6. Multi-User LocalStorage Data Bleed & Privacy Leak
- **Files:** `src/pages/Projects.jsx`, `src/pages/DailyGoals.jsx`, `src/pages/Notes.jsx`, `src/pages/ResumeTracker.jsx`, `src/context/UserContext.jsx`
- **Issue:** Storage keys (`devtrack_projects`, `devtrack_notes`, `devtrack_goals`, `devtrack_resumes`) are shared globally in browser `localStorage` without a user ID prefix.
- **Impact:** If User A logs out and User B logs in on the same browser, TanStack Query loads User A's projects, goals, and notes from `localStorage` as `initialData` before server synchronization completes.

---

## 5. System Weaknesses & Limitations

### 🟡 Architectural & Scalability Weaknesses

#### 1. Sequential O(N) Blocking Writes in Rank Recalculation
- **File:** `server/services/ranking.service.js` (L90–L123)
- **Detail:** When any user syncs their score, `recalculateAllRanks()` performs sequential `await allRankings[i].save()` inside nested `for` loops across all users, all universities, and all 5 individual platforms.
- **Problem:** For $N$ users, this creates $O(N)$ sequential blocking database operations. With 500+ users, this will cause HTTP requests to timeout. Needs MongoDB `bulkWrite()`.

#### 2. Mocked Client-Side ATS Resume Scanner
- **File:** `src/pages/ResumeTracker.jsx` (L153–L158)
- **Detail:** The resume scanner does not parse or extract text from uploaded PDF/Word documents. It runs a synthetic `setTimeout(resolve, 800)` and assigns a pseudo-random score (`Math.floor(Math.random() * 16) + 78`) with predefined keyword lists.
- **Problem:** Users uploading different resumes receive artificial scores rather than genuine analysis.

#### 3. Fragile Web Scraping with Silent Fake Fallbacks
- **File:** `server/services/platform.service.js` (L441, L500, L548)
- **Detail:** CodeChef, Codeforces, and GeeksforGeeks integrations use regex parsing against raw public HTML.
- **Problem:** If platform DOM changes or bot defenses trigger, the server catches the error and silently injects hardcoded dummy numbers (e.g., rating 1650, 3★, 427 solved) without alerting the user that the live profile could not be fetched.

#### 4. Monolithic Frontend Bundle (1.34 MB Single Chunk)
- **File:** `src/App.jsx`
- **Detail:** All 13 page components are statically imported at the top of `App.jsx` without `React.lazy()` or `Suspense`.
- **Problem:** Produces a massive `1,341.96 kB` JavaScript bundle, triggering Vite chunk size warnings and slowing down initial mobile load times.

#### 5. Hardcoded Consistency Metrics in Daily Goals
- **File:** `src/pages/DailyGoals.jsx` (L59)
- **Detail:** `const [streak, setStreak] = useState(4)` is static and never connects to the user's historical completion dates.

---

## 6. Aestheticness & UI/UX Evaluation

### 🌟 Visual Strengths
- **Clean Modern Cyber-Light Palette:** Uses an off-white foundation (`#f7f9fa`) with pure white card surfaces (`#ffffff`), hairline borders (`rgba(0,0,0,0.06)`), and vivid neon lime (`#b8f22f`) and violet (`#8c63ff`) accents.
- **Distinctive Typography:** Cohesive font pairing using *Space Grotesk* for headlines, *Inter* for body readability, and *JetBrains Mono* for technical handles and metrics.
- **Interactive Network Node Graph:** The Dashboard Overview features an interactive SVG canvas displaying node connections between LeetCode, GitHub, LinkedIn, and DevTrack Hub with live status rings.
- **Custom Dynamic SVG Badges:** Crisp vector badge generator suitable for embedding in GitHub README files.
- **Smooth Micro-Interactions:** Consistent Framer Motion transitions across modals, checklist items, and tab navigation.

### 🎨 Areas for Visual & UX Improvement
- **No Dark Mode Toggle:** For a developer-focused tool with cyber aesthetics, a dark mode is an essential developer expectation.
- **Empty Heatmap Visuals:** Gray, zero-activity heatmaps on Projects and Goals detract from the visual finish of the dashboard.
- **Responsive Mobile Navigation:** On screens under 1024px, the navigation switches to a horizontal scrolling ribbon. A bottom tab bar or sliding drawer would offer a cleaner mobile experience.
- **Contrast Ratios on Badges:** Certain lime tags (`text-signal-dim` on light backgrounds) require careful contrast calibration to ensure strict WCAG AA accessibility compliance.

---

## 7. Priority Action Plan & Recommendations

### Phase 1: High Priority Bug Fixes
1. **Fix Heatmap Data Feed:**
   - Update `DailyGoals.jsx` and `Projects.jsx` to pass an actual activity map based on item `createdAt` dates.
   - Update `platform.service.js` to compute `submissionDates` for Codeforces.
2. **Harden Profile Credential Updates:**
   - Default `password` in `Profile.jsx` to empty string `''` and validate existence before calling `.trim()`.
3. **Scope LocalStorage by User:**
   - Prefix storage keys with the active user ID (e.g., `devtrack_${userId}_projects`) to eliminate cross-account data bleed.
4. **Fix Roast URL:**
   - Replace hardcoded `localhost:5000` with `process.env.CLIENT_URL || window.location.origin`.

### Phase 2: Performance & Scalability
1. **Implement Route Lazy Loading:**
   - Convert `App.jsx` page imports to `React.lazy()` with a `<Suspense>` fallback loader to reduce initial bundle size from 1.34 MB to under 250 kB.
2. **Optimize Database Rank Recalculation:**
   - Replace sequential `await doc.save()` loops in `ranking.service.js` with batched `Ranking.bulkWrite()` operations.
3. **Proxy GitHub API Calls:**
   - Route GitHub commit and README requests through the backend `/api/proxy` to leverage server-side caching and avoid client-side 403 rate limits.

### Phase 3: Feature Enhancements
1. **Real ATS Resume Parser:** Integrate a lightweight parser (`pdf-parse`) on the backend to extract actual text and match resume keywords against role definitions.
2. **Theme Switcher:** Add a dark/light mode toggle with CSS variables.
3. **Dynamic Streak Calculation:** Compute actual streak lengths from consecutive days with completed goals.

---

*Report prepared automatically via automated runtime inspection, test execution, browser subagent walkthrough, and static code audit.*
