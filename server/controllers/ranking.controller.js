import User from '../models/User.js'
import Ranking from '../models/Ranking.js'
import { getLeaderboard, syncUserRanking } from '../services/ranking.service.js'
import { isDbConnected } from '../config/db.js'
import { evaluateAchievements } from '../services/achievement.service.js'

export async function fetchLeaderboard(req, res, next) {
  try {
    const { type = 'global', university = '', platform = 'all', page = 1, limit = 50 } = req.query
    const result = await getLeaderboard({ type, university, platform, page, limit })
    res.json(result)
  } catch (err) {
    next(err)
  }
}

export async function fetchMyRanking(req, res, next) {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    if (!isDbConnected()) {
      return res.json({
        devScore: 1980,
        globalRank: 1,
        universityRank: 1,
        totalSolvedAll: 450,
        university: req.user.university || 'Tech University',
        leetcode: { rank: 1, score: 720, solved: 210, rating: 1540 },
        codeforces: { rank: 1, score: 620, rating: 1420 },
        codechef: { rank: 1, score: 310, stars: '3★' },
        github: { rank: 1, score: 480, repos: 14, stars: 12 },
        gfg: { rank: 1, score: 240, totalSolved: 85 },
      })
    }

    let rank = await Ranking.findOne({ userId: req.user._id })
    if (!rank) {
      const user = await User.findById(req.user._id)
      rank = await syncUserRanking(
        user._id,
        user.username,
        user.university || '',
        user.handles || {}
      )
    }

    res.json(rank || {
      devScore: 0,
      globalRank: 0,
      universityRank: 0,
      totalSolvedAll: 0,
    })
  } catch (err) {
    next(err)
  }
}

export async function triggerRankingSync(req, res, next) {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    const user = await User.findById(req.user._id)
    if (!user) return res.status(404).json({ error: 'User not found' })

    const updatedRank = await syncUserRanking(
      user._id,
      user.username,
      user.university || '',
      user.handles || {}
    )

    res.json({ ok: true, ranking: updatedRank })
  } catch (err) {
    next(err)
  }
}

export async function fetchUniversities(req, res, next) {
  try {
    if (!isDbConnected()) {
      return res.json([
        'Delhi Technological University',
        'IIT Bombay',
        'IIT Delhi',
        'Stanford University',
        'BITS Pilani',
        'MIT',
        'NIT Trichy',
      ])
    }

    const unis = await User.distinct('university', { university: { $ne: '' } })
    res.json(unis.filter(Boolean).sort())
  } catch (err) {
    next(err)
  }
}

async function getUserStatsProfile(username) {
  const clean = username.trim().toLowerCase()
  let user = null
  if (isDbConnected()) {
    user = await User.findOne({ username: clean })
  }

  if (!user) {
    // Generate deterministic profile for unregistered rivals / demo / offline
    const charCodeSum = clean.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
    const baseSolved = 200 + (charCodeSum % 600)
    const lcSolved = Math.round(baseSolved * 0.6)
    const lcRating = 1400 + (charCodeSum % 650)
    const cfRating = 1350 + ((charCodeSum * 3) % 700)
    const repos = 8 + (charCodeSum % 25)
    const stars = 12 + (charCodeSum % 60)
    const devScore = baseSolved * 2 + lcRating + repos * 15
    const gRank = 1 + (charCodeSum % 50)
    const uRank = 1 + (charCodeSum % 10)

    return {
      username: clean,
      university: charCodeSum % 2 === 0 ? 'Delhi Technological University' : 'IIT Delhi',
      handles: { github: clean, leetcode: clean, codeforces: clean, codechef: clean, gfg: clean },
      devScore,
      globalRank: gRank,
      universityRank: uRank,
      totalSolvedAll: baseSolved,
      leetcode: { solved: lcSolved, rating: lcRating, rank: gRank },
      codeforces: { rating: cfRating, rank: gRank },
      github: { repos, stars, rank: gRank },
      codechef: { stars: '3★', rank: gRank },
      gfg: { totalSolved: Math.round(baseSolved * 0.2), rank: gRank },
    }
  }

  let ranking = await Ranking.findOne({ userId: user._id })
  if (!ranking) {
    ranking = await syncUserRanking(user._id, user.username, user.university || '', user.handles || {})
  }

  return {
    username: user.username,
    university: user.university || '',
    handles: user.handles || {},
    devScore: ranking?.devScore || 0,
    globalRank: ranking?.globalRank || 0,
    universityRank: ranking?.universityRank || 0,
    totalSolvedAll: ranking?.totalSolvedAll || 0,
    leetcode: ranking?.leetcode || { solved: 0, rating: 0, rank: 0 },
    codeforces: ranking?.codeforces || { rating: 0, rank: 0 },
    github: ranking?.github || { repos: 0, stars: 0, rank: 0 },
    codechef: ranking?.codechef || { stars: '1★', rank: 0 },
    gfg: ranking?.gfg || { totalSolved: 0, rank: 0 },
  }
}

export async function fetchAchievements(req, res, next) {
  try {
    const targetUser = req.params.username || req.user?.username
    if (!targetUser) {
      return res.status(400).json({ error: 'Username is required' })
    }

    const stats = await getUserStatsProfile(targetUser)
    if (!stats) {
      return res.status(404).json({ error: 'Developer not found' })
    }

    const evaluation = evaluateAchievements(stats)
    res.json(evaluation)
  } catch (err) {
    next(err)
  }
}

export async function compareDevelopers(req, res, next) {
  try {
    const { u1, u2 } = req.query
    if (!u1 || !u2) {
      return res.status(400).json({ error: 'Both u1 and u2 parameters are required' })
    }

    const [userA, userB] = await Promise.all([
      getUserStatsProfile(u1),
      getUserStatsProfile(u2),
    ])

    if (!userA || !userB) {
      return res.status(404).json({
        error: !userA && !userB 
          ? 'Neither developer was found' 
          : !userA 
          ? `Developer ${u1} was not found` 
          : `Developer ${u2} was not found`,
      })
    }

    const compareMetric = (valA, valB, higherIsBetter = true) => {
      const a = Number(valA) || 0
      const b = Number(valB) || 0
      const diff = Math.abs(a - b)
      let leader = 'tie'
      if (a !== b) {
        if (higherIsBetter) {
          leader = a > b ? 'u1' : 'u2'
        } else {
          leader = (a > 0 && (b === 0 || a < b)) ? 'u1' : 'u2'
        }
      }
      return { u1: a, u2: b, diff, leader }
    }

    const metrics = {
      devScore: compareMetric(userA.devScore, userB.devScore, true),
      totalSolved: compareMetric(userA.totalSolvedAll, userB.totalSolvedAll, true),
      leetcodeSolved: compareMetric(userA.leetcode?.solved, userB.leetcode?.solved, true),
      leetcodeRating: compareMetric(userA.leetcode?.rating, userB.leetcode?.rating, true),
      codeforcesRating: compareMetric(userA.codeforces?.rating, userB.codeforces?.rating, true),
      githubRepos: compareMetric(userA.github?.repos, userB.github?.repos, true),
      githubStars: compareMetric(userA.github?.stars, userB.github?.stars, true),
      globalRank: compareMetric(userA.globalRank, userB.globalRank, false),
    }

    let u1Wins = 0
    let u2Wins = 0
    for (const key of ['devScore', 'totalSolved', 'leetcodeSolved', 'leetcodeRating', 'codeforcesRating', 'githubRepos', 'githubStars']) {
      if (metrics[key].leader === 'u1') u1Wins++
      if (metrics[key].leader === 'u2') u2Wins++
    }

    const overallLeader = u1Wins > u2Wins ? userA.username : u2Wins > u1Wins ? userB.username : 'Tie'

    res.json({
      developerA: userA,
      developerB: userB,
      metrics,
      summary: {
        u1Wins,
        u2Wins,
        overallLeader,
      },
    })
  } catch (err) {
    next(err)
  }
}

