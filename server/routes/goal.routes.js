import { Router } from 'express'
import {
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal,
} from '../controllers/goal.controller.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.use(requireAuth)

router.get('/', getGoals)
router.post('/', createGoal)
router.put('/:id', updateGoal)
router.delete('/:id', deleteGoal)

export default router
