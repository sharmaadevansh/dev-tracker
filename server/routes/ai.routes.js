import { Router } from 'express'
import { optimizeBullet, recommendDailyProblems } from '../controllers/ai.controller.js'

const router = Router()

router.post('/optimize-bullet', optimizeBullet)
router.get('/recommend-problems', recommendDailyProblems)

export default router
