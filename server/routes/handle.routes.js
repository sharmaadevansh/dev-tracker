import { Router } from 'express'
import { getHandles, updateHandles } from '../controllers/handle.controller.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.get('/', requireAuth, getHandles)
router.put('/', requireAuth, updateHandles)

export default router
