# DevTracker — System Audit & Baseline Specification (Phase 0)

## 1. Executive Summary

**DevTracker** is a developer analytics platform designed to aggregate profiles, track coding milestones across multiple platforms (GitHub, LeetCode, Codeforces, CodeChef, GeeksforGeeks), and organize projects, notes, and goals.

This audit establishes the baseline architectural, security, and data flow state of the project prior to migrating to a production-grade multi-tenant SaaS architecture.

---

## 2. System Inventory

### 2.1 Workspace & Git Environment
- **Local Directory**: `C:\Users\sharm\Desktop\DEV-TRACKER`
- **Application Package**: `devtrack-ai` (version 0.0.0, `"type": "module"`)
- **Remote Repository**: `sharmaadevansh/dev-tracker`
- **Git Status**: Initially uninitialized (missing `.git` folder). Requires initialization and `.gitignore` hardening.

### 2.2 Technology Stack
- **Frontend**:
  - React 19 (`react`, `react-dom`)
  - Vite 8 (`vite`, `@vitejs/plugin-react`)
  - React Router v7 (`react-router-dom`)
  - TanStack React Query v5 (`@tanstack/react-query`)
  - Tailwind CSS v4 (`tailwindcss`, `@tailwindcss/postcss`)
  - Framer Motion (`framer-motion`)
  - Recharts (`recharts`)
  - Lucide React (`lucide-react`)
- **Backend**:
  - Node.js (v25.9.0 runtime, ES Modules)
  - Express 5.2.1 (`express`)
  - CORS (`cors`)
  - Axios (`axios`)
- **Persistence**:
  - Server-side: Local JSON flat file (`server/data/db.json`)
  - Client-side: Browser `sessionStorage` (auth token) & `localStorage` (handles, projects, notes, goals, resumes, learning)

---

## 3. Architecture & Data Flow Baseline

### 3.1 Frontend Routing & Pages
The client routing is declared in `src/App.jsx`:
- `/login`: Public terminal-style login portal (`src/pages/Login.jsx`).
- `/setup`: Protected handles configuration screen (`src/pages/UsernameSetup.jsx`).
- `/dashboard`: Protected dashboard layout (`src/layouts/DashboardLayout.jsx`) with nested sub-routes:
  - `/dashboard` (index): `Dashboard.jsx` (Overview Hub)
  - `/dashboard/analytics`: `CodingAnalytics.jsx` (Recharts stats & rating trends)
  - `/dashboard/repos`: `Repositories.jsx` (GitHub repository browser)
  - `/dashboard/projects`: `Projects.jsx` (Project tracker & heatmaps)
  - `/dashboard/learning`: `LearningTracker.jsx` (Roadmap checklist)
  - `/dashboard/goals`: `DailyGoals.jsx` (Daily tasks checklist)
  - `/dashboard/notes`: `Notes.jsx` (Markdown notes)
  - `/dashboard/resume`: `ResumeTracker.jsx` (ATS resume scanner)
  - `/dashboard/profile`: `Profile.jsx` (Account credentials management)

### 3.2 State Management
- `AuthContext.jsx`: Maintains `isAuthenticated`, `user`, and `authReady`. Synchronizes token via browser `sessionStorage`. Validates session on mount via `GET /api/auth/me`.
- `UserContext.jsx`: Maintains handle strings and boolean active platform toggles. Synchronizes with `GET /api/handles` and `PUT /api/handles`.
- TanStack React Query: Caches server data for projects, notes, goals, summary, and external platform proxy calls.

### 3.3 Backend API Endpoints (`server/index.js`)

| Method | Route | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Service health check |
| `POST` | `/api/auth/login` | Validates credentials against `db.json`, returns token |
| `GET` | `/api/auth/me` | Returns current username (protected) |
| `PUT` | `/api/auth/credentials` | Updates username/password (protected) |
| `GET` | `/api/handles` | Returns platform handles & active toggles (protected) |
| `PUT` | `/api/handles` | Updates platform handles & active toggles (protected) |
| `GET` | `/api/dashboard-summary` | Aggregated counts across modules (protected) |
| `GET`, `POST` | `/api/projects` | List / Create project (protected) |
| `PUT`, `DELETE` | `/api/projects/:id` | Update / Delete project (protected) |
| `GET`, `POST`, `PUT`, `DELETE` | `/api/notes`, `/api/goals`, `/api/resumes` | Resource CRUD via `crudRoutes` (protected) |
| `GET`, `PUT` | `/api/learning` | Retrieve / Replace learning roadmap (protected) |
| `GET` | `/api/proxy/github/:username` | Profile, repos, language breakdown, contribution calendar |
| `GET` | `/api/proxy/github/:username/repos` | Repositories list |
| `GET` | `/api/proxy/leetcode/:username` | LeetCode GraphQL query & stats |
| `GET` | `/api/proxy/codeforces/:handle` | Codeforces user info & rating history |
| `GET` | `/api/proxy/codechef/:username` | CodeChef user profile scraper |
| `GET` | `/api/proxy/gfg/:username` | GeeksforGeeks user profile scraper |

---

## 4. Key Findings & Technical Debt

### 4.1 Security Vulnerabilities
1. **Plaintext Passwords**: User passwords in `server/data/db.json` are stored as unhashed text.
2. **Hardcoded Fallback Secret**: `TOKEN_SECRET` defaults to `'devtrack-local-secret'`.
3. **No Token Expiration**: The HMAC token has no `exp` timestamp check.
4. **No Rate Limiting**: The `/api/auth/login` endpoint is exposed to brute-force attacks.

### 4.2 Data Persistence & Concurrency
1. **Race Conditions**: `fs.readFile()` and `fs.writeFile()` on `db.json` will overwrite each other under concurrent requests.
2. **Single-Tenant Data Model**: No user isolation (`userId`) exists on records; any authenticated user modifies global records.

### 4.3 Frontend-Backend Disconnects
1. `ResumeTracker.jsx` exclusively uses browser `localStorage`, bypassing `crudRoutes('resumes')`.
2. `LearningTracker.jsx` exclusively uses `localStorage`, bypassing `/api/learning`.
3. `Sidebar.jsx` is unused dead code in `src/components/`.

### 4.4 External API & Scraping Fragility
1. CodeChef and GeeksforGeeks proxy routes rely on regex parsing of live HTML, vulnerable to third-party layout updates.
2. GitHub API is subject to unauthenticated 60 req/hr rate limits.
3. Lack of server-side cache (Redis / in-memory LRU) leads to duplicate external requests.

---

## 5. Target Architecture & Next Phases

1. **Phase 1**: Initialize Git repository, configure `.gitignore` (ignore `dist/`, `.env`, OS artifacts), setup `main` branch.
2. **Phase 2**: MongoDB & Mongoose connection, connection lifecycle, and environment variables.
3. **Phase 3**: Mongoose models (`User`, `PlatformStats`, `Project`, etc.) with `userId` multi-tenancy.
4. **Phase 4**: User CRUD and safe data migration from `db.json` to MongoDB.
5. **Phase 5**: Layered backend refactoring (`routes/`, `controllers/`, `services/`, `middleware/`).
6. **Phase 6**: Secure authentication with `bcrypt` password hashing and standard JWT expiration.
