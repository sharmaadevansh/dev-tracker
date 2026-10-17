import { Router } from 'express'
import { getLearning, updateLearning } from '../controllers/learning.controller.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.use(requireAuth)

router.get('/', getLearning)
router.put('/', updateLearning)

export default router
