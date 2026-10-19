import axios from 'axios'
import {
  getGithubData,
  getLeetcodeData,
  getCodeforcesData,
  getCodechefData,
  getGfgData,
} from '../services/platform.service.js'

export async function proxyGithub(req, res, next) {
  try {
    const { username } = req.params
    if (!username) return res.status(400).json({ error: 'Username required' })
    const data = await getGithubData(username)
    res.json(data)
  } catch (err) {
    next(err)
  }
}

export async function proxyGithubRepos(req, res, next) {
  try {
    const { username } = req.params
    if (!username) return res.status(400).json({ error: 'Username required' })
    const data = await getGithubData(username)
    res.json(data?.repos || [])
  } catch (err) {
    next(err)
  }
}

export async function proxyLeetcode(req, res, next) {
  try {
    const { username } = req.params
    if (!username) return res.status(400).json({ error: 'Username required' })
    const data = await getLeetcodeData(username)
    res.json(data)
  } catch (err) {
    next(err)
  }
}

export async function proxyCodeforces(req, res, next) {
  try {
    const { handle } = req.params
    if (!handle) return res.status(400).json({ error: 'Handle required' })
    const data = await getCodeforcesData(handle)
    res.json(data)
  } catch (err) {
    next(err)
  }
}

export async function proxyCodechef(req, res, next) {
  try {
    const { username } = req.params
    if (!username) return res.status(400).json({ error: 'Username required' })
    const data = await getCodechefData(username)
    res.json(data)
  } catch (err) {
    next(err)
  }
}

export async function proxyGfg(req, res, next) {
  try {
    const { username } = req.params
    if (!username) return res.status(400).json({ error: 'Username required' })
    const data = await getGfgData(username)
    res.json(data)
  } catch (err) {
    next(err)
  }
}

const githubProxyCache = new Map()

export async function proxyGithubCommits(req, res) {
  try {
    const { username, repo } = req.params
    if (!username || !repo) return res.status(400).json({ error: 'Username and repo required' })

    const cacheKey = `commits_${username.toLowerCase()}_${repo.toLowerCase()}`
    const cached = githubProxyCache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < 15 * 60 * 1000) {
      return res.json(cached.data)
    }

    const { data } = await axios.get(`https://api.github.com/repos/${username}/${repo}/commits`, {
      params: { per_page: 1 },
      headers: {
        'User-Agent': 'DevTrack-AI-Platform/1.0',
        ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
      },
      timeout: 5000,
    })

    if (data && data.length > 0) {
      const commitInfo = {
        message: data[0].commit?.message || 'Active repository codebase',
        author: data[0].commit?.author?.name || username,
        date: data[0].commit?.author?.date ? new Date(data[0].commit.author.date).toLocaleDateString() : new Date().toLocaleDateString(),
      }
      githubProxyCache.set(cacheKey, { data: commitInfo, timestamp: Date.now() })
      return res.json(commitInfo)
    }

    res.json({
      message: 'Active repository codebase',
      author: username,
      date: new Date().toLocaleDateString(),
    })
  } catch {
    res.json({
      message: 'Active repository codebase',
      author: req.params.username || 'Contributor',
      date: new Date().toLocaleDateString(),
    })
  }
}

export async function proxyGithubReadme(req, res) {
  try {
    const { username, repo } = req.params
    if (!username || !repo) return res.status(400).json({ error: 'Username and repo required' })

    const cacheKey = `readme_${username.toLowerCase()}_${repo.toLowerCase()}`
    const cached = githubProxyCache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < 15 * 60 * 1000) {
      return res.json({ readme: cached.data })
    }

    try {
      const resp = await axios.get(`https://raw.githubusercontent.com/${username}/${repo}/main/README.md`, {
        timeout: 4000,
      })
      githubProxyCache.set(cacheKey, { data: resp.data, timestamp: Date.now() })
      return res.json({ readme: resp.data })
    } catch {
      const resp = await axios.get(`https://raw.githubusercontent.com/${username}/${repo}/master/README.md`, {
        timeout: 4000,
      })
      githubProxyCache.set(cacheKey, { data: resp.data, timestamp: Date.now() })
      return res.json({ readme: resp.data })
    }
  } catch {
    res.json({
      readme: `### ${req.params.repo || 'Project'}\nNo README.md documentation file was found on the repository root directory.`,
    })
  }
}
