import axios from 'axios'

// GFG has no official public API. This uses a community-maintained wrapper.
// If it's ever unavailable, self-host https://github.com/harshitbansal05/GFG-API
// or the equivalent, and point GFG_API at your own deployment.
const GFG_API = 'https://geeks-for-geeks-api.vercel.app'

export async function fetchGfgProfile(username) {
  const { data } = await axios.get(`${GFG_API}/${username}`)
  const info = data.info || data
  return {
    userName: info.userName || username,
    instituteRank: info.instituteRank,
    institute: info.institute,
    codingScore: info.codingScore,
    monthlyScore: info.monthlyScore,
    totalProblemsSolved: info.totalProblemsSolved,
    currentStreak: info.currentStreak ?? info.streak,
    maxStreak: info.maxStreak,
    solvedStats: data.solvedStats || null,
  }
}
