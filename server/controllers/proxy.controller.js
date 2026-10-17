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
