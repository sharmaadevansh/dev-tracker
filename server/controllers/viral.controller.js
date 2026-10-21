import axios from 'axios'
import User from '../models/User.js'
import Ranking from '../models/Ranking.js'
import Project from '../models/Project.js'
import { isDbConnected } from '../config/db.js'
import { syncUserRanking } from '../services/ranking.service.js'
import { evaluateAchievements } from '../services/achievement.service.js'


export async function getPublicProfile(req, res, next) {
  try {
    const { username } = req.params
    const cleanUser = username ? username.trim().toLowerCase() : ''

    if (!cleanUser) {
      return res.status(400).json({ error: 'Username is required' })
    }

    if (!isDbConnected()) {
      return res.json({
        username: cleanUser,
        university: '',
        createdAt: new Date().toISOString(),
        handles: {
          github: cleanUser,
          leetcode: cleanUser,
          codeforces: cleanUser,
          codechef: cleanUser,
          gfg: cleanUser,
          linkedin: cleanUser,
        },
        activePlatforms: {
          github: true,
          leetcode: true,
          codeforces: true,
          codechef: true,
          gfg: true,
          linkedin: true,
        },
        ranking: {
          devScore: 0,
          globalRank: 0,
          universityRank: 0,
          totalSolvedAll: 0,
          leetcode: { score: 0, solved: 0, rating: 0, rank: 0 },
          codeforces: { score: 0, rating: 0, rank: 0 },
          github: { score: 0, repos: 0, stars: 0, rank: 0 },
          codechef: { score: 0, stars: '0★', rank: 0 },
          gfg: { score: 0, totalSolved: 0, rank: 0 },
        },
        achievements: [],
        projects: [],
      })
    }

    const user = await User.findOne({ username: cleanUser })
    if (!user) {
      return res.status(404).json({ error: 'Developer profile not found' })
    }

    let ranking = await Ranking.findOne({ userId: user._id })
    if (!ranking) {
      ranking = await syncUserRanking(user._id, user.username, user.university || '', user.handles || {})
    }

    const projects = await Project.find({ userId: user._id }).sort({ createdAt: -1 }).limit(10)

    res.json({
      username: user.username,
      university: user.university || '',
      email: user.email ? `${user.username}@users.devtrack.ai` : '',
      role: user.role || 'user',
      isVerified: !!user.isVerified,
      createdAt: user.createdAt,
      handles: user.handles || {},
      activePlatforms: user.activePlatforms || {},
      ranking: ranking || {
        devScore: 0,
        globalRank: 0,
        universityRank: 0,
        totalSolvedAll: 0,
      },
      achievements: evaluateAchievements({
        ...(ranking?.toObject ? ranking.toObject() : (ranking || {})),
        handles: user.handles || {},
      }),
      projects,
    })
  } catch (err) {
    next(err)
  }
}

export async function generateBadgeSvg(req, res, next) {
  try {
    const { username } = req.params
    const cleanUser = username ? username.trim().toLowerCase() : 'developer'

    let ranking = null
    let university = 'Developer Community'

    if (isDbConnected()) {
      const user = await User.findOne({ username: cleanUser })
      if (user) {
        university = user.university || 'Independent Developer'
        ranking = await Ranking.findOne({ userId: user._id })
      }
    }

    const score = ranking?.devScore ?? 0
    const globalRank = ranking?.globalRank ? `#${ranking.globalRank}` : 'Unranked'
    const uniRank = ranking?.universityRank ? `#${ranking.universityRank}` : 'Unranked'
    const totalSolved = ranking?.totalSolvedAll ?? 0
    const lcSolved = ranking?.leetcode?.solved ?? 0
    const cfRating = ranking?.codeforces?.rating ? `${ranking.codeforces.rating}` : 'Unrated'
    const ghRepos = ranking?.github?.repos ?? 0

    // Build SVG Badge
    const svg = `
<svg width="520" height="230" viewBox="0 0 520 230" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0a0d14"/>
      <stop offset="100%" stop-color="#141923"/>
    </linearGradient>
    <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#b8f22f"/>
      <stop offset="50%" stop-color="#8c63ff"/>
      <stop offset="100%" stop-color="#ffd53d"/>
    </linearGradient>
    <linearGradient id="cardGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.07"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0.02"/>
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="12" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <rect width="520" height="230" rx="24" fill="url(#bgGrad)" stroke="#272f3d" stroke-width="1.5"/>
  <rect x="1.5" y="1.5" width="517" height="4" rx="2" fill="url(#accentGrad)" />

  <!-- Background decorative glow -->
  <circle cx="460" cy="50" r="60" fill="#8c63ff" fill-opacity="0.12" filter="url(#glow)"/>
  <circle cx="60" cy="180" r="50" fill="#b8f22f" fill-opacity="0.08" filter="url(#glow)"/>

  <!-- Brand header -->
  <g transform="translate(24, 30)">
    <circle cx="10" cy="10" r="10" fill="#b8f22f" fill-opacity="0.15" stroke="#b8f22f" stroke-width="1.2"/>
    <text x="10" y="14" font-family="'JetBrains Mono', monospace" font-size="10" font-weight="900" fill="#b8f22f" text-anchor="middle">&gt;_</text>
    <text x="28" y="15" font-family="'Space Grotesk', -apple-system, sans-serif" font-size="15" font-weight="800" fill="#ffffff" letter-spacing="0.5">DEVTRACK<tspan fill="#b8f22f">.AI</tspan></text>
    <rect x="400" y="0" width="70" height="20" rx="10" fill="#1e2634" stroke="#333e50" stroke-width="1"/>
    <text x="435" y="14" font-family="'JetBrains Mono', monospace" font-size="10" font-weight="700" fill="#b8f22f" text-anchor="middle">VERIFIED</text>
  </g>

  <!-- User Details -->
  <g transform="translate(24, 72)">
    <text x="0" y="0" font-family="'Space Grotesk', -apple-system, sans-serif" font-size="20" font-weight="700" fill="#ffffff">${cleanUser}</text>
    <text x="0" y="18" font-family="'JetBrains Mono', monospace" font-size="11" font-weight="500" fill="#8e9bb0">${university.slice(0, 38)}</text>
  </g>

  <!-- Score & Ranks Badges Grid -->
  <g transform="translate(24, 115)">
    <!-- DevScore Pill -->
    <rect x="0" y="0" width="110" height="48" rx="12" fill="url(#cardGrad)" stroke="#303b4d" stroke-width="1"/>
    <text x="14" y="18" font-family="'JetBrains Mono', monospace" font-size="9" font-weight="600" fill="#8e9bb0" letter-spacing="1">DEVSCORE</text>
    <text x="14" y="38" font-family="'Space Grotesk', sans-serif" font-size="18" font-weight="800" fill="#b8f22f">${score}</text>

    <!-- Global Rank Pill -->
    <rect x="120" y="0" width="110" height="48" rx="12" fill="url(#cardGrad)" stroke="#303b4d" stroke-width="1"/>
    <text x="134" y="18" font-family="'JetBrains Mono', monospace" font-size="9" font-weight="600" fill="#8e9bb0" letter-spacing="1">GLOBAL RANK</text>
    <text x="134" y="38" font-family="'Space Grotesk', sans-serif" font-size="18" font-weight="800" fill="#ffd53d">${globalRank}</text>

    <!-- University Rank Pill -->
    <rect x="240" y="0" width="110" height="48" rx="12" fill="url(#cardGrad)" stroke="#303b4d" stroke-width="1"/>
    <text x="254" y="18" font-family="'JetBrains Mono', monospace" font-size="9" font-weight="600" fill="#8e9bb0" letter-spacing="1">UNI RANK</text>
    <text x="254" y="38" font-family="'Space Grotesk', sans-serif" font-size="18" font-weight="800" fill="#8c63ff">${uniRank}</text>

    <!-- Total Solved Pill -->
    <rect x="360" y="0" width="110" height="48" rx="12" fill="url(#cardGrad)" stroke="#303b4d" stroke-width="1"/>
    <text x="374" y="18" font-family="'JetBrains Mono', monospace" font-size="9" font-weight="600" fill="#8e9bb0" letter-spacing="1">TOTAL SOLVED</text>
    <text x="374" y="38" font-family="'Space Grotesk', sans-serif" font-size="18" font-weight="800" fill="#00d5ff">${totalSolved}</text>
  </g>

  <!-- Platform Highlights Row -->
  <g transform="translate(24, 185)">
    <text x="0" y="18" font-family="'JetBrains Mono', monospace" font-size="11" fill="#7a879e">
      <tspan fill="#ffd53d" font-weight="700">LeetCode:</tspan> ${lcSolved} solved  •  
      <tspan fill="#8c63ff" font-weight="700">Codeforces:</tspan> ${cfRating} rtg  •  
      <tspan fill="#b8f22f" font-weight="700">GitHub:</tspan> ${ghRepos} repos
    </text>
    <text x="470" y="18" font-family="'JetBrains Mono', monospace" font-size="10" fill="#525f75" text-anchor="end">devtrack.ai/u/${cleanUser}</text>
  </g>
</svg>
    `.trim()

    res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8')
    res.setHeader('Cache-Control', 'public, max-age=1800')
    res.send(svg)
  } catch (err) {
    next(err)
  }
}

export async function generateAiRoast(req, res, next) {
  try {
    const { username } = req.params
    const cleanUser = username ? username.trim().toLowerCase() : ''

    let stats = {
      username: cleanUser,
      totalSolved: 0,
      lcEasy: 0,
      lcMed: 0,
      lcHard: 0,
      cfRating: 0,
      reposCount: 0,
      languages: '',
    }

    if (isDbConnected()) {
      const user = await User.findOne({ username: cleanUser })
      if (user) {
        const ranking = await Ranking.findOne({ userId: user._id })
        if (ranking) {
          stats.totalSolved = ranking.totalSolvedAll || 0
          stats.lcEasy = ranking.leetcode?.easySolved || 0
          stats.lcMed = ranking.leetcode?.mediumSolved || 0
          stats.lcHard = ranking.leetcode?.hardSolved || 0
          stats.cfRating = ranking.codeforces?.rating || 0
          stats.reposCount = ranking.github?.repos || 0
        }
      }
    }

    // Try Gemini API if key is present in environment
    const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY
    if (geminiKey) {
      try {
        const prompt = `You are a savage, witty, senior software engineering tech lead doing a comedy roast of a developer's portfolio.
Roast the developer based on these exact stats:
- Username: ${stats.username}
- Total Solved Problems: ${stats.totalSolved}
- LeetCode Easy: ${stats.lcEasy}, Medium: ${stats.lcMed}, Hard: ${stats.lcHard}
- Codeforces Rating: ${stats.cfRating}
- GitHub Repositories: ${stats.reposCount}

Keep it under 120 words. Make it hilarious, punchy, playfully sarcastic, and hyper-relevant to modern developer memes (DP phobia, abandoned side projects, CSS struggles, copying stackoverflow). Do not use profanity.`

        const response = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
          {
            contents: [{ parts: [{ text: prompt }] }],
          },
          { timeout: 8000 }
        )

        const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text
        if (text) {
          return res.json({
            roast: text.trim(),
            archetype: 'The LeetCode Easy Tourist',
            burnRating: '9.4/10',
            shareText: `My dev profile just got roasted on DevTrack.AI:\n\n"${text.trim().slice(0, 150)}..."\n\nCheck yours at devtrack.ai/u/${cleanUser}`,
          })
        }
      } catch (e) {
        console.warn('[Gemini Roast] API call failed, using heuristic engine:', e.message)
      }
    }

    // High-energy intelligent heuristic roast generator
    let roast = ''
    let archetype = 'The Midnight Refactorer'

    if (stats.totalSolved === 0 && stats.reposCount === 0 && stats.cfRating === 0) {
      archetype = 'The Stealth Ghost'
      roast = `We inspected @${stats.username}'s portfolio and found 0 tracked solved problems and 0 repositories. A profile so quiet that even Git refuses to generate a merge conflict. Link your active competitive and GitHub handles so there is something to roast!`
    } else if (stats.lcHard < 15 && stats.lcEasy > 50) {
      archetype = 'The Two-Sum Champion'
      roast = `Look at ${stats.username}: ${stats.lcEasy} Easy problems solved, but only ${stats.lcHard} Hards. You treat Dynamic Programming like an overdue student loan—pretending it doesn't exist won't make it go away. With ${stats.reposCount} GitHub repos, 90% of them are probably renamed Vite templates that died after 'npm run dev'. But hey, at least your Codeforces rating of ${stats.cfRating} guarantees you're safe from accidental job offers!`
    } else if (stats.cfRating > 1600) {
      archetype = 'The Competitive Speedrunner'
      roast = `A ${stats.cfRating} rating on Codeforces? Congratulations on spending 4 hours debugging binary search edge cases on Friday night instead of touching grass. Your GitHub commit graph looks like an ECG monitor right before cardiac arrest. Please write a README file before your next repository expires from pure negligence.`
    } else {
      archetype = 'The Tutorial Hell Voyager'
      roast = `${stats.username}'s GitHub has ${stats.reposCount} repositories, and we all know 19 of them are abandoned Todo apps with commit messages like 'fixed typo', 'final test 2', and 'why is this not working'. You have solved ${stats.totalSolved} problems, but 5 minutes in a system design interview would still reduce you to tears.`
    }

    const origin = req.get('origin') || req.get('referer')
    let clientBase = process.env.CLIENT_URL
    if (!clientBase && origin) {
      try {
        const parsed = new URL(origin)
        clientBase = `${parsed.protocol}//${parsed.host}`
      } catch {
        // Fall back to default
      }
    }
    if (!clientBase) {
      clientBase = 'http://localhost:5173'
    }

    res.json({
      roast,
      archetype,
      burnRating: '9.2/10',
      shareText: `My dev profile just got roasted on DevTrack.AI:\n\n"${roast.slice(0, 160)}..."\n\nRoast yours at ${clientBase}/u/${cleanUser}`,
    })
  } catch (err) {
    next(err)
  }
}
