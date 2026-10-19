import { Router } from 'express'
import {
  proxyGithub,
  proxyGithubRepos,
  proxyGithubCommits,
  proxyGithubReadme,
  proxyLeetcode,
  proxyCodeforces,
  proxyCodechef,
  proxyGfg,
} from '../controllers/proxy.controller.js'

const router = Router()

router.get('/github/:username', proxyGithub)
router.get('/github/:username/repos', proxyGithubRepos)
router.get('/github/:username/:repo/commits', proxyGithubCommits)
router.get('/github/:username/:repo/readme', proxyGithubReadme)
router.get('/leetcode/:username', proxyLeetcode)
router.get('/codeforces/:handle', proxyCodeforces)
router.get('/codechef/:username', proxyCodechef)
router.get('/gfg/:username', proxyGfg)

export default router
