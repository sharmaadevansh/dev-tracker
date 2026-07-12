import axios from 'axios'

const GH_API = 'https://api.github.com'
// Public, unauthenticated, no-key contribution calendar API (mirrors GitHub's graph).
const CONTRIB_API = 'https://github-contributions-api.jogruber.de/v4'

const gh = axios.create({ baseURL: GH_API, headers: { Accept: 'application/vnd.github+json' } })

export async function fetchGithubProfile(username) {
  const { data } = await gh.get(`/users/${username}`)
  return {
    login: data.login,
    name: data.name,
    avatar: data.avatar_url,
    bio: data.bio,
    followers: data.followers,
    following: data.following,
    publicRepos: data.public_repos,
    createdAt: data.created_at,
    htmlUrl: data.html_url,
    company: data.company,
    location: data.location,
    blog: data.blog,
  }
}

export async function fetchGithubRepos(username) {
  const { data } = await gh.get(`/users/${username}/repos`, {
    params: { per_page: 100, sort: 'updated' },
  })
  return data.map((r) => ({
    name: r.name,
    description: r.description,
    stars: r.stargazers_count,
    forks: r.forks_count,
    language: r.language,
    htmlUrl: r.html_url,
    updatedAt: r.updated_at,
    fork: r.fork,
    size: r.size,
  }))
}

export function computeLanguageBreakdown(repos) {
  const counts = {}
  repos.forEach((r) => {
    if (!r.language) return
    counts[r.language] = (counts[r.language] || 0) + 1
  })
  return Object.entries(counts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
}

export function computeTotalStars(repos) {
  return repos.reduce((sum, r) => sum + (r.stars || 0), 0)
}

export async function fetchContributionCalendar(username) {
  // Returns { total: {2024: n, ...}, contributions: [{date, count, level}] }
  const { data } = await axios.get(`${CONTRIB_API}/${username}`)
  return data
}

export async function fetchGithubAll(username) {
  const [profile, repos] = await Promise.all([
    fetchGithubProfile(username),
    fetchGithubRepos(username),
  ])
  let contributions = null
  try {
    contributions = await fetchContributionCalendar(username)
  } catch {
    contributions = null
  }
  return {
    profile,
    repos,
    languages: computeLanguageBreakdown(repos),
    totalStars: computeTotalStars(repos),
    contributions,
  }
}
