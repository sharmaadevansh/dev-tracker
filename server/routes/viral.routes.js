import { Router } from 'express'
import {
  getPublicProfile,
  generateBadgeSvg,
  generateAiRoast,
} from '../controllers/viral.controller.js'

const router = Router()

// Public profile endpoint
router.get('/profile/:username', getPublicProfile)

// Dynamic GitHub Markdown SVG card endpoint
router.get('/badge/:username', generateBadgeSvg)
router.get('/badge/:username.svg', generateBadgeSvg)

// AI Roast endpoint
router.get('/roast/:username', generateAiRoast)
router.post('/roast/:username', generateAiRoast)

export default router
