import axios from 'axios'

// Community-run public wrapper around LeetCode's GraphQL API.
// No official public API exists — if this endpoint is ever down, swap the
// base URL for another alfa-leetcode-api mirror or self-host the project
// (https://github.com/alfaarghya/alfa-leetcode-api).
const LC_API = 'https://alfa-leetcode-api.onrender.com'

export async function fetchLeetcodeProfile(username) {
  const { data } = await axios.get(`${LC_API}/${username}`)
  return {
    name: data.name,
    avatar: data.avatar,
    ranking: data.ranking,
    reputation: data.reputation,
    about: data.about,
  }
}

export async function fetchLeetcodeSolved(username) {
  const { data } = await axios.get(`${LC_API}/${username}/solved`)
  return {
    totalSolved: data.solvedProblem,
    easySolved: data.easySolved,
    mediumSolved: data.mediumSolved,
    hardSolved: data.hardSolved,
    totalEasy: data.totalEasy,
    totalMedium: data.totalMedium,
    totalHard: data.totalHard,
    acceptanceRate: data.acceptanceRate,
  }
}

export async function fetchLeetcodeContest(username) {
  const { data } = await axios.get(`${LC_API}/${username}/contest`)
  return {
    rating: data.contestRating,
    globalRanking: data.contestGlobalRanking,
    topPercentage: data.contestTopPercentage,
    attended: data.contestAttend,
  }
}

export async function fetchLeetcodeCalendar(username) {
  const { data } = await axios.get(`${LC_API}/${username}/calendar`)
  const parsed = data.submissionCalendar ? JSON.parse(data.submissionCalendar) : {}
  const streak = Object.keys(parsed).length
  return { raw: parsed, activeDays: streak }
}

export async function fetchLeetcodeAll(username) {
  const [profile, solved, contest, calendar] = await Promise.allSettled([
    fetchLeetcodeProfile(username),
    fetchLeetcodeSolved(username),
    fetchLeetcodeContest(username),
    fetchLeetcodeCalendar(username),
  ])

  return {
    profile: profile.status === 'fulfilled' ? profile.value : null,
    solved: solved.status === 'fulfilled' ? solved.value : null,
    contest: contest.status === 'fulfilled' ? contest.value : null,
    calendar: calendar.status === 'fulfilled' ? calendar.value : null,
  }
}
