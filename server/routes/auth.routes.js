import { Router } from 'express'
import { login, register, getCurrentUser, updateCredentials } from '../controllers/auth.controller.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.post('/login', login)
router.post('/register', register)
router.get('/me', requireAuth, getCurrentUser)
router.put('/credentials', requireAuth, updateCredentials)

export default router
