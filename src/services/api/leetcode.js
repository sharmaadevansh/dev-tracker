import axios from 'axios'

const LC_API = 'https://alfa-leetcode-api.onrender.com'
const client = axios.create({ baseURL: LC_API, timeout: 8000 })

export async function fetchLeetcodeProfile(username) {
  const { data } = await client.get(`/${encodeURIComponent(username)}`)
  return {
    name: data.name || username,
    avatar: data.avatar,
    ranking: data.ranking || 0,
    reputation: data.reputation || 0,
    about: data.about || '',
  }
}

export async function fetchLeetcodeSolved(username) {
  const { data } = await client.get(`/${encodeURIComponent(username)}/solved`)
  return {
    totalSolved: data.solvedProblem ?? 0,
    easySolved: data.easySolved ?? 0,
    mediumSolved: data.mediumSolved ?? 0,
    hardSolved: data.hardSolved ?? 0,
    totalEasy: data.totalEasy || 0,
    totalMedium: data.totalMedium || 0,
    totalHard: data.totalHard || 0,
    acceptanceRate: data.acceptanceRate || 0,
  }
}

export async function fetchLeetcodeContest(username) {
  const { data } = await client.get(`/${encodeURIComponent(username)}/contest`)
  return {
    rating: data.contestRating || 0,
    globalRanking: data.contestGlobalRanking || 0,
    topPercentage: data.contestTopPercentage || 0,
    attended: data.contestAttend || 0,
  }
}

export async function fetchLeetcodeCalendar(username) {
  const { data } = await client.get(`/${encodeURIComponent(username)}/calendar`)
  const parsed = data.submissionCalendar ? (typeof data.submissionCalendar === 'string' ? JSON.parse(data.submissionCalendar) : data.submissionCalendar) : {}
  const streak = Object.keys(parsed).length || 0
  return { raw: parsed, activeDays: streak }
}

export async function fetchLeetcodeAll(username) {
  if (!username) return { profile: null, solved: null, contest: null, calendar: null }

  // 1. Try local backend proxy first (fast, reliable, bypasses CORS/Render delays)
  try {
    const { data } = await axios.get(`/api/proxy/leetcode/${encodeURIComponent(username)}`, { timeout: 6000 })
    if (data && data.profile) return data
  } catch (err) {
    console.warn('Backend LeetCode proxy failed, trying direct API:', err.message)
  }

  // 2. Direct client calls
  try {
    const [profile, solved, contest, calendar] = await Promise.allSettled([
      fetchLeetcodeProfile(username),
      fetchLeetcodeSolved(username),
      fetchLeetcodeContest(username),
      fetchLeetcodeCalendar(username),
    ])

    return {
      profile: profile.status === 'fulfilled' ? profile.value : { name: username },
      solved: solved.status === 'fulfilled' ? solved.value : { totalSolved: 0, easySolved: 0, mediumSolved: 0, hardSolved: 0, acceptanceRate: 0 },
      contest: contest.status === 'fulfilled' ? contest.value : { rating: 0, globalRanking: 0, topPercentage: 0, attended: 0 },
      calendar: calendar.status === 'fulfilled' ? calendar.value : { raw: {}, activeDays: 0 },
    }
  } catch (err) {
    console.warn('LeetCode fetch error, returning fallback:', err.message)
    return {
      profile: { name: username },
      solved: { totalSolved: 0, easySolved: 0, mediumSolved: 0, hardSolved: 0, acceptanceRate: 0 },
      contest: { rating: 0, globalRanking: 0, topPercentage: 0, attended: 0 },
      calendar: { raw: {}, activeDays: 0 },
    }
  }
}
