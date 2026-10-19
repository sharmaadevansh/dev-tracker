import { Router } from 'express'
import {
  fetchLeaderboard,
  fetchMyRanking,
  triggerRankingSync,
  fetchUniversities,
  compareDevelopers,
  fetchAchievements,
} from '../controllers/ranking.controller.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.get('/leaderboard', fetchLeaderboard)
router.get('/universities', fetchUniversities)
router.get('/compare', compareDevelopers)
router.get('/achievements', requireAuth, fetchAchievements)
router.get('/achievements/:username', fetchAchievements)
router.get('/me', requireAuth, fetchMyRanking)
router.post('/sync', requireAuth, triggerRankingSync)

export default router

