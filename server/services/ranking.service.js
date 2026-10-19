import Ranking from '../models/Ranking.js'
import { isDbConnected } from '../config/db.js'
import {
  getGithubData,
  getLeetcodeData,
  getCodeforcesData,
  getCodechefData,
  getGfgData,
} from './platform.service.js'

export function computePlatformScores(stats = {}) {
  const lc = stats.leetcode || {}
  const cf = stats.codeforces || {}
  const cc = stats.codechef || {}
  const gh = stats.github || {}
  const gfg = stats.gfg || {}

  // 1. LeetCode
  const lcEasy = lc.solved?.easySolved || 0
  const lcMed = lc.solved?.mediumSolved || 0
  const lcHard = lc.solved?.hardSolved || 0
  const lcTotal = lc.solved?.totalSolved || (lcEasy + lcMed + lcHard)
  const lcRating = Math.round(lc.contest?.rating || 0)
  const lcContestBonus = Math.max(0, (lcRating - 1200) * 0.8)
  const lcScore = Math.round((lcEasy * 2) + (lcMed * 5) + (lcHard * 12) + lcContestBonus)

  // 2. Codeforces
  const cfRating = cf.profile?.rating || 0
  const cfMaxRating = cf.profile?.maxRating || cfRating
  const cfSolved = cf.solvedCount || 0
  const cfScore = Math.round((cfRating * 0.85) + (cfSolved * 3))

  // 3. CodeChef
  const ccRating = cc.rating || 0
  const ccScore = Math.round(ccRating * 0.65)

  // 4. GitHub
  const ghRepos = gh.profile?.publicRepos || (gh.repos?.length || 0)
  const ghStars = gh.totalStars || 0
  const ghContribMap = gh.contributions || {}
  const ghContribCount = Object.values(ghContribMap).reduce((a, b) => a + (typeof b === 'number' ? b : 0), 0)
  const ghScore = Math.round((ghRepos * 4) + (ghStars * 12) + Math.min(1000, ghContribCount * 1.5))

  // 5. GeeksforGeeks
  const gfgScoreRaw = gfg.codingScore || 0
  const gfgSolved = gfg.totalProblemsSolved || 0
  const gfgScore = Math.round((gfgScoreRaw * 0.7) + (gfgSolved * 3))

  const totalSolvedAll = lcTotal + cfSolved + gfgSolved
  const devScore = lcScore + cfScore + ccScore + ghScore + gfgScore

  return {
    devScore,
    totalSolvedAll,
    leetcode: {
      rating: lcRating,
      solved: lcTotal,
      easySolved: lcEasy,
      mediumSolved: lcMed,
      hardSolved: lcHard,
      score: lcScore,
    },
    codeforces: {
      rating: cfRating,
      maxRating: cfMaxRating,
      rankLabel: cf.profile?.rank || 'Unrated',
      score: cfScore,
    },
    codechef: {
      rating: ccRating,
      stars: cc.stars || '1★',
      division: cc.division || 'Div 3',
      score: ccScore,
    },
    github: {
      repos: ghRepos,
      stars: ghStars,
      contributions: ghContribCount,
      score: ghScore,
    },
    gfg: {
      codingScore: gfgScoreRaw,
      totalSolved: gfgSolved,
      score: gfgScore,
    },
  }
}

export async function recalculateAllRanks() {
  if (!isDbConnected()) return

  try {
    const updateMap = new Map()

    const setField = (id, field, value) => {
      const existing = updateMap.get(id) || {}
      existing[field] = value
      updateMap.set(id, existing)
    }

    // 1. Assign Global DevScore Rank
    const allRankings = await Ranking.find().sort({ devScore: -1, totalSolvedAll: -1, createdAt: 1 }).select('_id').lean()
    allRankings.forEach((doc, idx) => {
      setField(doc._id.toString(), 'globalRank', idx + 1)
    })

    // 2. Assign Local University Ranks
    const universities = await Ranking.distinct('university', { university: { $ne: '' } })
    for (const uni of universities) {
      const uniRankings = await Ranking.find({ university: uni }).sort({ devScore: -1, totalSolvedAll: -1, createdAt: 1 }).select('_id').lean()
      uniRankings.forEach((doc, idx) => {
        setField(doc._id.toString(), 'universityRank', idx + 1)
      })
    }

    // 3. Assign Individual Platform Ranks
    const platforms = ['leetcode', 'codeforces', 'codechef', 'github', 'gfg']
    for (const plat of platforms) {
      const platRankings = await Ranking.find().sort({ [`${plat}.score`]: -1, createdAt: 1 }).select('_id').lean()
      platRankings.forEach((doc, idx) => {
        setField(doc._id.toString(), `${plat}.rank`, idx + 1)
      })
    }

    // 4. Execute single batched bulk write
    if (updateMap.size > 0) {
      const bulkOps = []
      for (const [id, fields] of updateMap.entries()) {
        bulkOps.push({
          updateOne: {
            filter: { _id: id },
            update: { $set: fields },
          },
        })
      }
      await Ranking.bulkWrite(bulkOps, { ordered: false })
    }
  } catch (err) {
    console.warn('[RankingService] Error during rank recalculation:', err.message)
  }
}

export async function syncUserRanking(userId, username, university = '', handles = {}) {
  if (!isDbConnected() || !userId) {
    return {
      devScore: 1840,
      globalRank: 1,
      universityRank: 1,
      totalSolvedAll: 450,
      university: university || 'Technology Institute',
      leetcode: { rank: 1, score: 720, solved: 210, rating: 1540 },
      codeforces: { rank: 1, score: 620, rating: 1420 },
      codechef: { rank: 1, score: 310, stars: '3★' },
      github: { rank: 1, score: 480, repos: 14, stars: 12 },
      gfg: { rank: 1, score: 240, totalSolved: 85 },
    }
  }

  try {
    // Parallel fetch platform data for user
    const [gh, lc, cf, cc, gfg] = await Promise.allSettled([
      handles.github ? getGithubData(handles.github) : null,
      handles.leetcode ? getLeetcodeData(handles.leetcode) : null,
      handles.codeforces ? getCodeforcesData(handles.codeforces) : null,
      handles.codechef ? getCodechefData(handles.codechef) : null,
      handles.gfg ? getGfgData(handles.gfg) : null,
    ])

    const stats = {
      github: gh.status === 'fulfilled' ? gh.value : {},
      leetcode: lc.status === 'fulfilled' ? lc.value : {},
      codeforces: cf.status === 'fulfilled' ? cf.value : {},
      codechef: cc.status === 'fulfilled' ? cc.value : {},
      gfg: gfg.status === 'fulfilled' ? gfg.value : {},
    }

    const computed = computePlatformScores(stats)

    let rankDoc = await Ranking.findOne({ userId })
    if (!rankDoc) {
      rankDoc = new Ranking({
        userId,
        username,
        university: university || '',
        isEligible: true,
      })
    }

    rankDoc.username = username
    rankDoc.university = university || ''
    rankDoc.devScore = computed.devScore
    rankDoc.totalSolvedAll = computed.totalSolvedAll
    rankDoc.leetcode = { ...rankDoc.leetcode, ...computed.leetcode, handle: handles.leetcode || '' }
    rankDoc.codeforces = { ...rankDoc.codeforces, ...computed.codeforces, handle: handles.codeforces || '' }
    rankDoc.codechef = { ...rankDoc.codechef, ...computed.codechef, handle: handles.codechef || '' }
    rankDoc.github = { ...rankDoc.github, ...computed.github, handle: handles.github || '' }
    rankDoc.gfg = { ...rankDoc.gfg, ...computed.gfg, handle: handles.gfg || '' }
    rankDoc.lastCalculatedAt = new Date()

    await rankDoc.save()

    // Trigger asynchronous rank recalculation across the cluster
    recalculateAllRanks().catch(() => {})

    return rankDoc
  } catch (err) {
    console.error('[RankingService] syncUserRanking error:', err.message)
    return null
  }
}

export async function getLeaderboard({
  type = 'global',
  university = '',
  platform = 'all',
  limit = 50,
  page = 1,
} = {}) {
  const pageSize = Math.min(100, Math.max(1, parseInt(limit, 10) || 50))
  const skip = (Math.max(1, parseInt(page, 10) || 1) - 1) * pageSize

  if (!isDbConnected()) {
    // Resilient fallback dummy data for offline demo
    return {
      entries: [
        {
          username: 'devansh',
          university: university || 'Delhi Technological University',
          devScore: 2480,
          globalRank: 1,
          universityRank: 1,
          totalSolvedAll: 642,
          leetcode: { score: 980, solved: 432, rating: 1680, rank: 1 },
          codeforces: { score: 850, rating: 1740, rank: 1 },
          github: { score: 650, repos: 22, stars: 45, rank: 1 },
        },
        {
          username: 'alex_coder',
          university: university || 'IIT Bombay',
          devScore: 2210,
          globalRank: 2,
          universityRank: 2,
          totalSolvedAll: 512,
          leetcode: { score: 890, solved: 380, rating: 1610, rank: 2 },
          codeforces: { score: 790, rating: 1620, rank: 2 },
          github: { score: 530, repos: 18, stars: 28, rank: 2 },
        },
        {
          username: 'sarah_tech',
          university: university || 'Stanford University',
          devScore: 1940,
          globalRank: 3,
          universityRank: 1,
          totalSolvedAll: 420,
          leetcode: { score: 740, solved: 310, rating: 1540, rank: 3 },
          codeforces: { score: 680, rating: 1510, rank: 3 },
          github: { score: 520, repos: 16, stars: 19, rank: 3 },
        },
      ],
      total: 3,
      page: 1,
      totalPages: 1,
      availableUniversities: ['Delhi Technological University', 'IIT Bombay', 'Stanford University', 'BITS Pilani', 'MIT'],
    }
  }

  const query = {}
  if (type === 'university' && university) {
    query.university = new RegExp(`^${university.trim()}$`, 'i')
  }

  let sortOption = { devScore: -1, totalSolvedAll: -1 }
  if (platform && platform !== 'all') {
    sortOption = { [`${platform}.score`]: -1 }
  }

  const [entries, total, availableUniversities] = await Promise.all([
    Ranking.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(pageSize)
      .populate('userId', 'username avatar university email')
      .lean(),
    Ranking.countDocuments(query),
    Ranking.distinct('university', { university: { $ne: '' } }),
  ])

  return {
    entries,
    total,
    page: parseInt(page, 10) || 1,
    totalPages: Math.ceil(total / pageSize) || 1,
    availableUniversities: availableUniversities.filter(Boolean),
  }
}
