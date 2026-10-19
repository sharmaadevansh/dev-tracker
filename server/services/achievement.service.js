// Gamification & Achievements Engine for DevTrack.AI
// Evaluates user progress across CP platforms, repositories, university rank, and problem counts

export const ALL_ACHIEVEMENTS = [
  {
    id: 'first_steps',
    title: 'First Steps',
    description: 'Linked your first competitive programming or developer handle',
    category: 'Platform',
    tier: 'Bronze',
    icon: 'Rocket',
    check: (stats) => {
      const handles = stats.handles || {}
      return Object.values(handles).some((h) => typeof h === 'string' && h.trim().length > 0)
    },
    getProgress: (stats) => {
      const handles = stats.handles || {}
      const count = Object.values(handles).filter((h) => typeof h === 'string' && h.trim().length > 0).length
      return { current: count, target: 1, percent: count > 0 ? 100 : 0 }
    },
  },
  {
    id: 'century_solver',
    title: 'Century Solver',
    description: 'Solved 100+ coding problems across all integrated platforms',
    category: 'Problem Solving',
    tier: 'Silver',
    icon: 'Target',
    check: (stats) => (stats.totalSolvedAll || 0) >= 100,
    getProgress: (stats) => {
      const current = stats.totalSolvedAll || 0
      return { current, target: 100, percent: Math.min(100, Math.round((current / 100) * 100)) }
    },
  },
  {
    id: 'code_ninja',
    title: 'Code Ninja',
    description: 'Solved 500+ coding problems across platforms',
    category: 'Problem Solving',
    tier: 'Gold',
    icon: 'Zap',
    check: (stats) => (stats.totalSolvedAll || 0) >= 500,
    getProgress: (stats) => {
      const current = stats.totalSolvedAll || 0
      return { current, target: 500, percent: Math.min(100, Math.round((current / 500) * 100)) }
    },
  },
  {
    id: 'grandmaster',
    title: 'Algorithm Grandmaster',
    description: 'Solved 1,000+ problems across LeetCode, GFG, Codeforces & CodeChef',
    category: 'Problem Solving',
    tier: 'Platinum',
    icon: 'Crown',
    check: (stats) => (stats.totalSolvedAll || 0) >= 1000,
    getProgress: (stats) => {
      const current = stats.totalSolvedAll || 0
      return { current, target: 1000, percent: Math.min(100, Math.round((current / 1000) * 100)) }
    },
  },
  {
    id: 'contest_veteran',
    title: 'Contest Veteran',
    description: 'Reached a competitive contest rating of 1,400+ on LeetCode or Codeforces',
    category: 'Competitive',
    tier: 'Gold',
    icon: 'Trophy',
    check: (stats) => {
      const lcRating = stats.leetcode?.rating || 0
      const cfRating = stats.codeforces?.rating || 0
      return lcRating >= 1400 || cfRating >= 1400
    },
    getProgress: (stats) => {
      const best = Math.max(stats.leetcode?.rating || 0, stats.codeforces?.rating || 0)
      return { current: best, target: 1400, percent: Math.min(100, Math.round((best / 1400) * 100)) }
    },
  },
  {
    id: 'open_sourcerer',
    title: 'Open Sourcerer',
    description: 'Maintained 10+ public GitHub repositories or earned 20+ GitHub stars',
    category: 'Open Source',
    tier: 'Silver',
    icon: 'GitBranch',
    check: (stats) => {
      const repos = stats.github?.repos || 0
      const stars = stats.github?.stars || 0
      return repos >= 10 || stars >= 20
    },
    getProgress: (stats) => {
      const repos = stats.github?.repos || 0
      return { current: repos, target: 10, percent: Math.min(100, Math.round((repos / 10) * 100)) }
    },
  },
  {
    id: 'campus_top5',
    title: 'Campus Leader',
    description: 'Secured a Top 5 ranking within your University leaderboard',
    category: 'Leaderboard',
    tier: 'Gold',
    icon: 'Award',
    check: (stats) => {
      const uRank = stats.universityRank || 0
      return uRank > 0 && uRank <= 5
    },
    getProgress: (stats) => {
      const uRank = stats.universityRank || 0
      return { current: uRank > 0 ? `#${uRank}` : 'Unranked', target: '#5 or better', percent: uRank > 0 && uRank <= 5 ? 100 : uRank > 0 ? 50 : 0 }
    },
  },
  {
    id: 'global_elite',
    title: 'Global Elite',
    description: 'Achieved a Top 50 Global Rank across all registered developers',
    category: 'Leaderboard',
    tier: 'Diamond',
    icon: 'Flame',
    check: (stats) => {
      const gRank = stats.globalRank || 0
      return gRank > 0 && gRank <= 50
    },
    getProgress: (stats) => {
      const gRank = stats.globalRank || 0
      return { current: gRank > 0 ? `#${gRank}` : 'Unranked', target: '#50 or better', percent: gRank > 0 && gRank <= 50 ? 100 : gRank > 0 ? 40 : 0 }
    },
  },
]

export function evaluateAchievements(stats) {
  const result = ALL_ACHIEVEMENTS.map((item) => {
    const isUnlocked = Boolean(item.check(stats))
    const progress = item.getProgress(stats)
    return {
      id: item.id,
      title: item.title,
      description: item.description,
      category: item.category,
      tier: item.tier,
      icon: item.icon,
      unlocked: isUnlocked,
      progress,
    }
  })

  const unlockedCount = result.filter((r) => r.unlocked).length
  return {
    total: ALL_ACHIEVEMENTS.length,
    unlockedCount,
    completionPercentage: Math.round((unlockedCount / ALL_ACHIEVEMENTS.length) * 100),
    achievements: result,
  }
}
