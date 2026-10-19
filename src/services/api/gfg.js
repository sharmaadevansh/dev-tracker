import axios from 'axios'

export async function fetchGfgProfile(username) {
  if (!username) return null

  // 1. Try local backend proxy
  try {
    const { data } = await axios.get(`/api/proxy/gfg/${encodeURIComponent(username)}`, { timeout: 7000 })
    return {
      userName: data.userName || username,
      instituteRank: data.instituteRank || 'Unranked',
      institute: data.institute || '',
      codingScore: data.codingScore || 0,
      monthlyScore: data.monthlyScore || 0,
      totalProblemsSolved: data.totalProblemsSolved || 0,
      currentStreak: data.currentStreak || 0,
      maxStreak: data.maxStreak || 0,
      solvedStats: data.solvedStats || null,
    }
  } catch (err) {
    console.warn('Backend GFG proxy failed, trying public mirror:', err.message)
  }

  // 2. Try public mirror
  try {
    const { data } = await axios.get(`https://geeks-for-geeks-api.vercel.app/${encodeURIComponent(username)}`, { timeout: 4000 })
    const info = data.info || data
    return {
      userName: info.userName || username,
      instituteRank: info.instituteRank || 'Unranked',
      institute: info.institute || '',
      codingScore: info.codingScore || 0,
      monthlyScore: info.monthlyScore || 0,
      totalProblemsSolved: info.totalProblemsSolved || 0,
      currentStreak: info.currentStreak ?? info.streak ?? 0,
      maxStreak: info.maxStreak || 0,
      solvedStats: data.solvedStats || null,
    }
  } catch {
    // 3. Fallback
    return {
      userName: username,
      instituteRank: 'Unranked',
      institute: '',
      codingScore: 0,
      monthlyScore: 0,
      totalProblemsSolved: 0,
      currentStreak: 0,
      maxStreak: 0,
      solvedStats: null,
      isDemo: false,
    }
  }
}
