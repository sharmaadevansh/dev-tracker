import axios from 'axios'

// Official, public, unauthenticated Codeforces API — no key needed.
const CF_API = 'https://codeforces.com/api'

export async function fetchCodeforcesProfile(handle) {
  const { data } = await axios.get(`${CF_API}/user.info`, { params: { handles: handle } })
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
  const { data } = await axios.get(`${CF_API}/user.rating`, { params: { handle } })
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
    params: { handle, from: 1, count: 10000 },
  })
  if (data.status !== 'OK') return { solvedCount: 0 }
  const solved = new Set()
  data.result.forEach((s) => {
    if (s.verdict === 'OK') {
      solved.add(`${s.problem.contestId}-${s.problem.index}`)
    }
  })
  return { solvedCount: solved.size }
}

export async function fetchCodeforcesAll(handle) {
  const [profile, ratingHistory, submissions] = await Promise.allSettled([
    fetchCodeforcesProfile(handle),
    fetchCodeforcesRatingHistory(handle),
    fetchCodeforcesSubmissions(handle),
  ])
  return {
    profile: profile.status === 'fulfilled' ? profile.value : null,
    ratingHistory: ratingHistory.status === 'fulfilled' ? ratingHistory.value : [],
    solvedCount: submissions.status === 'fulfilled' ? submissions.value.solvedCount : 0,
  }
}
