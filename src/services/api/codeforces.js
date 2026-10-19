import axios from 'axios'

const CF_API = 'https://codeforces.com/api'

export function getCodeforcesRankColor(rank = '') {
  const r = rank.toLowerCase()
  if (r.includes('grandmaster')) return { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/40', hex: '#ef4444' }
  if (r.includes('master')) return { text: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/40', hex: '#f97316' }
  if (r.includes('candidate')) return { text: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/40', hex: '#a855f7' }
  if (r.includes('expert')) return { text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/40', hex: '#3b82f6' }
  if (r.includes('specialist')) return { text: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/40', hex: '#06b6d4' }
  if (r.includes('pupil')) return { text: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/40', hex: '#22c55e' }
  return { text: 'text-chrome-dim', bg: 'bg-steel/30', border: 'border-hairline', hex: '#a0a0a0' }
}

export async function fetchCodeforcesProfile(handle) {
  const { data } = await axios.get(`${CF_API}/user.info`, { params: { handles: handle }, timeout: 7000 })
  if (data.status !== 'OK') throw new Error('Codeforces user not found')
  const u = data.result[0]
  return {
    handle: u.handle,
    rating: u.rating,
    maxRating: u.maxRating,
    rank: u.rank,
    maxRank: u.maxRank,
    avatar: u.titlePhoto,
    contribution: u.contribution,
  }
}

export async function fetchCodeforcesRatingHistory(handle) {
  const { data } = await axios.get(`${CF_API}/user.rating`, { params: { handle }, timeout: 7000 })
  if (data.status !== 'OK') return []
  return data.result.map((c) => ({
    contestName: c.contestName,
    rank: c.rank,
    oldRating: c.oldRating,
    newRating: c.newRating,
    date: new Date(c.ratingUpdateTimeSeconds * 1000).toLocaleDateString('en-IN', {
      month: 'short',
      year: '2-digit',
    }),
  }))
}

export async function fetchCodeforcesSubmissions(handle) {
  const { data } = await axios.get(`${CF_API}/user.status`, {
    params: { handle, from: 1, count: 5000 },
    timeout: 7000,
  })
  if (data.status !== 'OK') return { solvedCount: 0, submissionDates: {} }
  const solved = new Set()
  const submissionDates = {}
  data.result.forEach((s) => {
    if (s.creationTimeSeconds) {
      const d = new Date(s.creationTimeSeconds * 1000).toISOString().slice(0, 10)
      submissionDates[d] = (submissionDates[d] || 0) + 1
    }
    if (s.verdict === 'OK') {
      solved.add(`${s.problem.contestId}-${s.problem.index}`)
    }
  })
  return { solvedCount: solved.size, submissionDates }
}

export async function fetchCodeforcesAll(handle) {
  if (!handle) return { profile: null, ratingHistory: [], solvedCount: 0, submissionDates: {} }

  // 1. Direct official Codeforces API
  try {
    const [profile, ratingHistory, submissions] = await Promise.allSettled([
      fetchCodeforcesProfile(handle),
      fetchCodeforcesRatingHistory(handle),
      fetchCodeforcesSubmissions(handle),
    ])
    
    if (profile.status === 'fulfilled' && profile.value) {
      return {
        profile: profile.value,
        ratingHistory: ratingHistory.status === 'fulfilled' ? ratingHistory.value : [],
        solvedCount: submissions.status === 'fulfilled' ? submissions.value.solvedCount : 0,
        submissionDates: submissions.status === 'fulfilled' ? submissions.value.submissionDates : {},
      }
    }
  } catch (err) {
    console.warn('Direct Codeforces API request failed:', err.message)
  }

  // 2. Try backend proxy
  try {
    const { data } = await axios.get(`/api/proxy/codeforces/${encodeURIComponent(handle)}`, { timeout: 6000 })
    return data
  } catch {
    // 3. Fallback
    return {
      profile: {
        handle,
        rating: 0,
        maxRating: 0,
        rank: 'unrated',
        maxRank: 'unrated',
        avatar: '',
        contribution: 0,
      },
      ratingHistory: [],
      solvedCount: 0,
      submissionDates: {},
      isDemo: false,
    }
  }
}
