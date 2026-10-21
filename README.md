# 🚀 DevTrack.AI

> **The Ultimate All-in-One Developer Intelligence Platform**  
> Aggregating coding metrics across competitive programming and open-source platforms into an AI-powered developer hub, institutional leaderboard, and professional portfolio.

[![Live App](https://img.shields.io/badge/Live%20Demo-dev--tracker--v2i0.onrender.com-brightgreen?logo=render&style=flat-square)](https://dev-tracker-v2i0.onrender.com)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black&style=flat-square)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express%205-339933?logo=node.js&logoColor=white&style=flat-square)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas%20%2F%20Mongoose-47A248?logo=mongodb&logoColor=white&style=flat-square)](https://www.mongodb.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC?logo=tailwind-css&logoColor=white&style=flat-square)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Admin Management Console](#-admin-management-console)
- [Leaderboard & DevScore System](#-leaderboard--devscore-system)
- [Tech Stack & Architecture](#-tech-stack--architecture)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Configuration](#-environment-configuration)
- [API Documentation](#-api-documentation)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## 📌 Overview

**DevTrack.AI** solves developer portfolio fragmentation. Instead of juggling separate accounts on GitHub, LeetCode, Codeforces, CodeChef, and GeeksforGeeks, DevTrack.AI connects them into a single, unified interface that automatically tracks:

- 🐙 **GitHub** — Public repositories, stars, forks, and real-time commit heatmaps.
- 🧩 **LeetCode** — Solved problem counts (Easy/Medium/Hard), contest rating, and acceptance ratios.
- ⚔️ **Codeforces** — Contest rating, max rating, ranking badges, and solved problems.
- 🍜 **CodeChef** — Star ratings (1★ to 7★), division ranking, and contest milestones.
- 📚 **GeeksforGeeks** — Coding score and solved problem counts.
- 💼 **LinkedIn** — Direct portfolio integration and profile affiliation.

---

## ✨ Key Features

### 1. 📊 Centralized Developer Constellation Dashboard
- Interactive visual constellation graph linking your coding profiles.
- Live background synchronization with visual indicators.
- Instant overview of total questions solved, platform ratings, and active streaks.

### 2. 🏆 Competitive Leaderboards & University Leagues
- **Global Top 100:** Composite rankings based on an algorithmic **DevScore**.
- **University / Campus League:** Compare rankings against peers in your college or institution.
- **Platform Breakdown:** Filter rankings specifically by LeetCode, Codeforces, GitHub, CodeChef, or GFG.
- **Verified Developer Badges:** Official verification tick (`✔`) displayed on verified profiles.

### 3. 🌐 Public Developer Profiles & Viral Tools (`/u/:username`)
- Shareable public portfolio showcasing composite ratings, university affiliation, and project showcases.
- **Dynamic SVG GitHub Badges:** Embeddable markdown cards (`/api/badge/:username.svg`) for GitHub READMEs.
- **AI Portfolio Roast:** AI-driven constructive roasts and insights based on your problem-solving metrics.

### 4. 📄 ATS Resume Tracker & AI Optimizer (`/dashboard/resume`)
- Multi-section resume builder with real-time ATS scoring.
- AI Bullet Point Optimizer with keyword tailoring for target job roles.
- Interactive PDF export and authentic share links.

### 5. 📈 Deep Coding Analytics & Heatmaps (`/dashboard/analytics`)
- Aggregated multi-platform activity heatmaps.
- Difficulty breakdown radar charts and competitive milestone tracking.

### 6. 📁 Personal Project & Repository Explorer
- Full GitHub repository browser with language filters and sorting.
- Custom Project Tracker with tech stack tags, status tracking, deadlines, and live demo links.

### 7. 🎯 Daily Goals & Scratchpad Notes
- Custom problem-solving goals with completion streaks.
- Markdown-enabled developer scratchpad for interview prep, code snippets, and study notes.

---

## 🛡️ Admin Management Console

DevTrack.AI comes with an administrator suite accessible at `/admin` (or `/login/admin`):

- **Live System Telemetry:** Real-time monitoring of MongoDB status, Node.js process memory, uptime, and database records.
- **User Management:**
  - Search, paginate, and inspect all registered accounts.
  - **Account Verification:** Toggle official `Verified Developer` status.
  - **Account Suspension:** Suspend or reactivate user access with session safeguards.
  - **Edit Credentials:** Safely modify usernames, emails, university affiliations, and passwords with automatic cascade updates to the leaderboard.
  - **Permanent Deletion:** Cascade delete users and all related child documents (projects, notes, goals, resumes, rankings).
- **Content Moderation:** Inspect and purge flagged projects, notes, goals, and resumes across all users.
- **Platform Maintenance:** Trigger global rank recalculations or flush demo data with one click.

---

## 🧮 Leaderboard & DevScore System

The **DevScore** represents a developer's composite technical footprint:

$$\text{DevScore} = S_{\text{LeetCode}} + S_{\text{Codeforces}} + S_{\text{CodeChef}} + S_{\text{GitHub}} + S_{\text{GFG}}$$

- **LeetCode:** Weighted combination of contest rating and solved problems (weighted by difficulty: Easy × 1, Medium × 3, Hard × 5).
- **Codeforces:** Scaled proportionally from live Elo rating and max rating.
- **CodeChef:** Calculated from contest rating and star classification.
- **GitHub:** Proportional to public repositories, stars received, and contributions.
- **GeeksforGeeks:** Direct coding score and problem solve tally.

Rankings automatically recalculate in the background upon profile syncs.

---

## 🛠️ Tech Stack & Architecture

### Frontend
- **Framework:** React 19 + Vite 8
- **Routing:** React Router v7
- **State & Server Cache:** TanStack React Query v5
- **Styling:** Vanilla CSS + TailwindCSS (v4) with Custom Design Tokens
- **Animations:** Framer Motion
- **Icons:** Lucide React

### Backend
- **Runtime:** Node.js (ES Modules)
- **Framework:** Express 5
- **Database:** MongoDB Atlas via Mongoose
- **Authentication:** JSON Web Tokens (JWT) + bcryptjs password hashing
- **Security:** Helmet, CORS, and Express rate limiting
- **Resilience:** Dual-mode architecture (graceful in-memory fallback when database is offline)

---

## 📂 Project Structure

```text
DEV-TRACKER/
├── server/
│   ├── config/             # Database connection & Atlas configuration
│   ├── controllers/        # Route controllers (auth, admin, ranking, viral, etc.)
│   ├── middleware/         # JWT verification, role-based access control, error handling
│   ├── models/             # Mongoose schemas (User, Ranking, Project, Note, Goal, Resume)
│   ├── routes/             # Express API routes
│   ├── services/           # Platform scraping, DevScore math, AI integrations
│   ├── app.js              # Express app setup & middleware pipeline
│   └── index.js            # Server entry point
├── src/
│   ├── components/         # Reusable UI components (Navbar, ProfileDropdown, Modals)
│   ├── context/            # AuthContext, UserContext, ThemeContext
│   ├── pages/              # App views:
│   │   ├── AdminDashboard  # Admin control center
│   │   ├── AdminLogin      # Dedicated admin authentication
│   │   ├── Dashboard       # Central Constellation hub
│   │   ├── Leaderboard     # Global & campus rankings
│   │   ├── CodingAnalytics # Heatmaps & comparative charts
│   │   ├── PublicProfile   # Shareable portfolio & viral badges
│   │   ├── ResumeTracker   # ATS Resume builder
│   │   ├── Projects        # Project tracker
│   │   ├── Repositories    # GitHub browser
│   │   ├── DailyGoals      # Target streaks
│   │   ├── Notes           # Developer scratchpad
│   │   └── Profile         # Account identity settings
│   ├── services/api/       # Axios API client integrations
│   ├── App.jsx             # Route definitions & protected route guards
│   └── main.jsx            # React root mount
├── dist/                   # Production build output
├── vite.config.js          # Vite build & proxy settings
└── package.json            # Scripts & dependencies
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm or pnpm
- MongoDB Atlas connection string (or a local MongoDB instance)

### 1. Clone the repository
```bash
git clone https://github.com/sharmaadevansh/dev-tracker.git
cd dev-tracker
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Create a `.env` file in the root directory (refer to [Environment Configuration](#-environment-configuration)).

### 4. Run the application

**Run both frontend and backend concurrently:**
```bash
npm run dev:full
```

Or run them individually:
```bash
# Frontend only (http://localhost:5173)
npm run dev

# Backend only (http://localhost:5000)
npm run dev:backend
```

### 5. Production build
```bash
npm run build
npm start
```

---

## ⚙️ Environment Configuration

Create a `.env` file in the project root:

```env
# Server Configuration
PORT=5000
NODE_ENV=production

# Database
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/devtrack?retryWrites=true&w=majority

# Authentication Secrets
TOKEN_SECRET=your-super-secure-jwt-secret-key-at-least-32-chars
TOKEN_EXPIRES_IN=7d

# Initial Admin Account Seed (Auto-generated on startup if not exists)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=yourSecureAdminPassword123!
ADMIN_EMAIL=admin@devtrack.local

# Optional External API Keys (for enhanced rate limits)
GITHUB_TOKEN=ghp_yourPersonalAccessToken
```

---

## 🌐 API Documentation

### Core Endpoints

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register a new user account | Public |
| `POST` | `/api/auth/login` | Log in and receive JWT token | Public |
| `GET` | `/api/auth/me` | Fetch active user credentials & status | Authenticated |
| `PUT` | `/api/auth/credentials`| Update username or password | Authenticated |
| `GET` | `/api/ranking/leaderboard` | Get paginated global/university leaderboard | Public |
| `POST` | `/api/ranking/sync` | Manually sync current user ranking | Authenticated |
| `GET` | `/api/profile/:username` | Fetch public developer portfolio data | Public |
| `GET` | `/api/badge/:username.svg` | Generate dynamic SVG badge for READMEs | Public |
| `GET` | `/api/roast/:username` | Generate AI portfolio roast | Public |

### Admin Endpoints (Require `role: 'admin'`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/admin/stats` | Telemetry & system metrics |
| `GET` | `/api/admin/users` | List all accounts with search & pagination |
| `PUT` | `/api/admin/users/:id` | Update user credentials & university affiliation |
| `PATCH` | `/api/admin/users/:id/verify` | Toggle `isVerified` developer badge |
| `PATCH` | `/api/admin/users/:id/suspend` | Toggle account suspension |
| `DELETE` | `/api/admin/users/:id` | Cascade delete user and all associated data |
| `GET` | `/api/admin/content` | Content moderation listing (projects, notes, etc.) |
| `DELETE` | `/api/admin/content/:type/:id` | Moderate/remove user content item |

---

## ☁️ Deployment

DevTrack.AI is configured for zero-configuration full-stack deployment on **Render**, **Railway**, or **Heroku**:

1. Connect your GitHub repository to [Render](https://render.com).
2. Create a new **Web Service**.
3. Set the following build and start settings:
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
4. Add the environment variables specified in `.env` (`MONGODB_URI`, `TOKEN_SECRET`, `ADMIN_PASSWORD`, etc.).
5. Deploy! Express will serve the compiled static frontend from `dist/` and handle all `/api` requests seamlessly.

---

## 🤝 Contributing

Contributions make the open-source community an incredible place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. **Fork the Project**
2. **Create your Feature Branch**
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. **Commit your Changes**
   ```bash
   git commit -m "feat: add AmazingFeature with telemetry support"
   ```
4. **Push to the Branch**
   ```bash
   git push origin feature/AmazingFeature
   ```
5. **Open a Pull Request**

---

## 👨‍💻 Author & Maintainer

<table align="center">
  <tr>
    <td align="center">
      <a href="https://github.com/sharmaadevansh">
        <img src="https://github.com/sharmaadevansh.png?size=120" width="100px;" alt="Devansh Sharma" style="border-radius: 50%;" />
        <br />
        <sub><b>Devansh Sharma</b></sub>
      </a>
      <br />
      <sub>Full-Stack Software Engineer & Open-Source Builder</sub>
      <br /><br />
      <a href="https://github.com/sharmaadevansh" title="GitHub">
        <img src="https://img.shields.io/badge/GitHub-181717?style=flat-square&logo=github&logoColor=white" alt="GitHub" />
      </a>
      <a href="https://www.linkedin.com/in/sharmaadevansh/" title="LinkedIn">
        <img src="https://img.shields.io/badge/LinkedIn-0A66C2?style=flat-square&logo=linkedin&logoColor=white" alt="LinkedIn" />
      </a>
      <a href="mailto:devanshpaulistya@gmail.com" title="Email">
        <img src="https://img.shields.io/badge/Email-EA4335?style=flat-square&logo=gmail&logoColor=white" alt="Email" />
      </a>
    </td>
  </tr>
</table>

---

## 🙏 Acknowledgments

Special thanks to the developer platforms and open-source communities powering **DevTrack.AI**:

- [GitHub REST API](https://docs.github.com/en/rest) — Source of truth for repositories, stars, and contribution events.
- [Codeforces Public API](https://codeforces.com/apiHelp) — Official competition rating and problem metadata.
- [Lucide Icons](https://lucide.dev/) — High-fidelity modern iconography.
- [Render](https://render.com/) — Cloud application hosting and continuous deployment infrastructure.

---

## 📜 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for complete terms and permissions.

```text
MIT License

Copyright (c) 2026 Devansh Sharma

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

<div align="center">

### ⭐ Show Your Support

If you found **DevTrack.AI** insightful, well-structured, or helpful for your developer workflow, consider giving it a **Star** on GitHub!

<br />

[![GitHub stars](https://img.shields.io/github/stars/sharmaadevansh/dev-tracker?style=social)](https://github.com/sharmaadevansh/dev-tracker)
[![GitHub forks](https://img.shields.io/github/forks/sharmaadevansh/dev-tracker?style=social)](https://github.com/sharmaadevansh/dev-tracker/fork)

<br />

<sub>Built with ⚡, modern design tokens, and clean full-stack architecture.</sub>

</div>

