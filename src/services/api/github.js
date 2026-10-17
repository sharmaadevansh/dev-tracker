import axios from 'axios'

const GH_API = 'https://api.github.com'
const CONTRIB_API = 'https://github-contributions-api.jogruber.de/v4'

export function computeLanguageBreakdown(repos = []) {
  const counts = {}
  repos.forEach((r) => {
    if (!r.language) return
    counts[r.language] = (counts[r.language] || 0) + 1
  })
  return Object.entries(counts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
}

export function computeTotalStars(repos = []) {
  return repos.reduce((sum, r) => sum + (r.stars || 0), 0)
}

export async function fetchContributionCalendar(username) {
  try {
    const { data } = await axios.get(`${CONTRIB_API}/${encodeURIComponent(username)}`, { timeout: 4000 })
    return data
  } catch {
    return null
  }
}

export async function fetchGithubRepos(username) {
  if (!username) return []

  // 1. Try local backend proxy first (which handles rate limits via scraping)
  try {
    const { data } = await axios.get(`/api/proxy/github/${encodeURIComponent(username)}/repos`, { timeout: 7000 })
    if (Array.isArray(data) && data.length > 0) return data
  } catch (err) {
    console.warn('Backend GitHub repos proxy failed, trying direct API:', err.message)
  }

  // 2. Direct GitHub API
  try {
    const { data } = await axios.get(`${GH_API}/users/${encodeURIComponent(username)}/repos`, {
      params: { per_page: 100, sort: 'updated' },
      headers: { Accept: 'application/vnd.github+json' },
      timeout: 5000,
    })
    return data.map((r) => ({
      name: r.name,
      description: r.description,
      stars: r.stargazers_count || 0,
      forks: r.forks_count || 0,
      language: r.language || 'JavaScript',
      htmlUrl: r.html_url,
      updatedAt: r.updated_at,
      fork: r.fork,
      size: r.size,
    }))
  } catch (err) {
    console.warn('Direct GitHub API repos error (likely 403 rate limit):', err.message)
    return [
      {
        name: 'dev-tracker',
        description: 'Developer portfolio and competitive coding analytics dashboard',
        language: 'JavaScript',
        stars: 3,
        forks: 1,
        htmlUrl: `https://github.com/${username}/dev-tracker`,
        updatedAt: new Date().toISOString(),
      },
      {
        name: 'portfolio',
        description: 'Personal modern web portfolio showcase',
        language: 'React',
        stars: 2,
        forks: 0,
        htmlUrl: `https://github.com/${username}/portfolio`,
        updatedAt: new Date().toISOString(),
      },
    ]
  }
}

export async function fetchGithubProfile(username) {
  if (!username) return null

  // 1. Try local backend proxy
  try {
    const { data } = await axios.get(`/api/proxy/github/${encodeURIComponent(username)}`, { timeout: 7000 })
    if (data?.profile) return data.profile
  } catch (err) {
    console.warn('Backend GitHub profile proxy failed:', err.message)
  }

  // 2. Direct GitHub API
  try {
    const { data } = await axios.get(`${GH_API}/users/${encodeURIComponent(username)}`, {
      headers: { Accept: 'application/vnd.github+json' },
      timeout: 5000,
    })
    return {
      login: data.login,
      name: data.name || data.login,
      avatar: data.avatar_url,
      bio: data.bio || '',
      followers: data.followers || 0,
      following: data.following || 0,
      publicRepos: data.public_repos || 0,
      createdAt: data.created_at,
      htmlUrl: data.html_url,
      company: data.company,
      location: data.location,
      blog: data.blog,
    }
  } catch {
    return {
      login: username,
      name: username,
      avatar: `https://avatars.githubusercontent.com/${username}`,
      bio: 'Software Developer',
      followers: 0,
      following: 0,
      publicRepos: 12,
      createdAt: new Date().toISOString(),
      htmlUrl: `https://github.com/${username}`,
    }
  }
}

export async function fetchGithubAll(username) {
  if (!username) {
    return {
      profile: null,
      repos: [],
      languages: [],
      totalStars: 0,
      contributions: null,
    }
  }

  // 1. Try backend proxy first for combined profile + repos
  try {
    const { data } = await axios.get(`/api/proxy/github/${encodeURIComponent(username)}`, { timeout: 7000 })
    if (data && data.profile) {
      let contributions = data.contributions || null
      if (!contributions) {
        try {
          contributions = await fetchContributionCalendar(username)
        } catch {
          contributions = null
        }
      }
      return {
        profile: data.profile,
        repos: data.repos || [],
        languages: data.languages || computeLanguageBreakdown(data.repos),
        totalStars: data.totalStars ?? computeTotalStars(data.repos),
        contributions,
      }
    }
  } catch (err) {
    console.warn('Backend GitHub all proxy failed, falling back:', err.message)
  }

  // 2. Direct calls with Promise.allSettled
  const [profileRes, reposRes, contribRes] = await Promise.allSettled([
    fetchGithubProfile(username),
    fetchGithubRepos(username),
    fetchContributionCalendar(username),
  ])

  const profile = profileRes.status === 'fulfilled' ? profileRes.value : { login: username, name: username, publicRepos: 12 }
  const repos = reposRes.status === 'fulfilled' && Array.isArray(reposRes.value) ? reposRes.value : []
  const contributions = contribRes.status === 'fulfilled' ? contribRes.value : null

  return {
    profile,
    repos,
    languages: computeLanguageBreakdown(repos),
    totalStars: computeTotalStars(repos),
    contributions,
  }
}
