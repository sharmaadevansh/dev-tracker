# 🚀 DevTrack.AI

> A unified developer portfolio dashboard that aggregates coding profiles, GitHub activity, and personal projects into a single modern interface.

![React](https://img.shields.io/badge/React-19-blue?logo=react)
![Vite](https://img.shields.io/badge/Vite-Frontend-purple?logo=vite)
![License](https://img.shields.io/badge/License-MIT-green)
![Status](https://img.shields.io/badge/Status-Active-success)

---

## 📌 Overview

**DevTrack.AI** is a developer dashboard designed to eliminate the need to visit multiple coding platforms separately.

It consolidates your:

- 🐙 GitHub profile & repositories
- 🧩 LeetCode statistics
- ⚔️ Codeforces profile
- 🍜 CodeChef profile
- 📚 GeeksforGeeks profile
- 💼 LinkedIn profile
- 📂 Personal Project Tracker

into one clean and responsive dashboard.

---

# ✨ Features

### 🔐 Authentication

- Login screen
- Protected routes
- Session persistence using Local Storage
- Easily replaceable with JWT authentication in future

---

### 👤 One-Time Profile Setup

Configure your coding handles once.

Supported platforms:

- GitHub
- LeetCode
- Codeforces
- CodeChef
- GeeksforGeeks
- LinkedIn

The information is stored locally and automatically loaded on future visits.

---

### 📊 Developer Dashboard

A centralized dashboard displaying live statistics from multiple platforms.

Current integrations include:

- GitHub
- LeetCode
- Codeforces
- CodeChef
- GeeksforGeeks
- LinkedIn

---

### 🐙 GitHub Repository Explorer

- Repository Search
- Language Filter
- Sort repositories
- Repository cards
- Stars
- Forks
- Open repository directly

---

### 📁 Project Tracker

A lightweight project management tool.

Features include:

- Create Project
- Edit Project
- Delete Project
- Track Status
- Priority Management
- Technology Stack
- GitHub Link
- Live Demo Link
- Start Date
- Deadline

Currently powered by Local Storage.

---

# 🛠️ Tech Stack

### Frontend

- React
- Vite
- React Router
- Context API
- CSS

### APIs

| Platform | Source |
|-----------|--------|
| GitHub | Official REST API |
| LeetCode | Community API |
| Codeforces | Official API |
| CodeChef | Community API |
| GeeksforGeeks | Community API |

---

# 📂 Folder Structure

```text
src
│
├── assets
├── components
├── constants
├── context
├── hooks
├── layouts
├── pages
├── services
│   └── api
├── utils
└── App.jsx
```

---

# 🚀 Getting Started

Clone the repository

```bash
git clone https://github.com/sharmaadevansh/dev-tracker.git
```

Move inside the project

```bash
cd dev-tracker
```

Install dependencies

```bash
npm install
```

Start development server

```bash
npm run dev
```

Build production

```bash
npm run build
```

Preview production build

```bash
npm run preview
```

---

# 🔑 Demo Credentials

```
Username : devansh
Password : devtrack2026
```

These credentials can be modified inside:

```
src/context/AuthContext.jsx
```

---

# 🌐 API Information

### GitHub

Uses the official GitHub REST API.

> Note:
> Unauthenticated requests are limited to **60 requests/hour**.

For higher limits, add a GitHub Personal Access Token.

---

### LeetCode

Uses a community-maintained wrapper around the official GraphQL API.

---

### Codeforces

Uses the official public Codeforces API.

---

### CodeChef

Uses a community-maintained API.

---

### GeeksforGeeks

Uses a community-maintained API.

---

### LinkedIn

LinkedIn does not provide a public API for reading arbitrary profiles.

Therefore, DevTrack.AI stores only your profile link and displays it inside the dashboard.

---

# 🎨 Design System

The UI follows a modern developer aesthetic.

### Colors

- Void Black
- Gunmetal
- Signal Red

### Typography

- Space Grotesk
- Inter
- JetBrains Mono

---

# 🔮 Roadmap

Upcoming features include:

- JWT Authentication
- Node.js Backend
- MongoDB Database
- User Accounts
- Cloud Sync
- HackerRank Integration
- Coding Contest Calendar
- Learning Tracker
- Notes Section
- Resume Generator
- Analytics Dashboard
- Dark/Light Theme
- GitHub Contribution Heatmap
- Weekly Progress Reports
- Notifications

---

# 🤝 Contributing

Contributions are always welcome.

1. Fork the repository

2. Create a new branch

```bash
git checkout -b feature-name
```

3. Commit your changes

```bash
git commit -m "Added feature"
```

4. Push

```bash
git push origin feature-name
```

5. Open a Pull Request

---

# 📜 License

This project is licensed under the MIT License.

---

# ⭐ Support

If you found this project helpful,

**Give it a ⭐ on GitHub.**

It helps the project reach more developers and motivates future improvements.
