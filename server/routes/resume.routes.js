import { Router } from 'express'
import {
  getResumes,
  createResume,
  updateResume,
  deleteResume,
} from '../controllers/resume.controller.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.use(requireAuth)

router.get('/', getResumes)
router.post('/', createResume)
router.put('/:id', updateResume)
router.delete('/:id', deleteResume)

export default router
