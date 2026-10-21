import { Router } from 'express'
import {
  getAdminStats,
  getAdminUsers,
  createAdminUser,
  updateAdminUser,
  toggleUserVerification,
  toggleUserSuspension,
  deleteUserCascade,
  getAdminContent,
  deleteAdminContent,
} from '../controllers/admin.controller.js'
import { requireAuth, requireAdmin } from '../middleware/auth.js'

const router = Router()

// All admin routes strictly require valid authentication and role === 'admin'
router.use(requireAuth, requireAdmin)

// Stats
router.get('/stats', getAdminStats)

// User Management (CRUD)
router.get('/users', getAdminUsers)
router.post('/users', createAdminUser)
router.put('/users/:id', updateAdminUser)
router.patch('/users/:id/verify', toggleUserVerification)
router.patch('/users/:id/suspend', toggleUserSuspension)
router.delete('/users/:id', deleteUserCascade)

// Content Moderation
router.get('/content', getAdminContent)
router.delete('/content/:type/:id', deleteAdminContent)

export default router
