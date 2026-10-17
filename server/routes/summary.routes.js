import { Router } from 'express'
import { getDashboardSummary } from '../controllers/summary.controller.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.get('/', requireAuth, getDashboardSummary)

export default router
