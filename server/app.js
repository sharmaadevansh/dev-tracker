import express from 'express'
import cors from 'cors'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import errorHandler from './middleware/error.js'
import {
  securityHeaders,
  sanitizeInput,
  apiLimiter,
  authLimiter,
  viralLimiter,
} from './middleware/security.js'

import authRoutes from './routes/auth.routes.js'
import handleRoutes from './routes/handle.routes.js'
import projectRoutes from './routes/project.routes.js'
import noteRoutes from './routes/note.routes.js'
import goalRoutes from './routes/goal.routes.js'
import resumeRoutes from './routes/resume.routes.js'
import learningRoutes from './routes/learning.routes.js'
import summaryRoutes from './routes/summary.routes.js'
import { getCommunityStats } from './controllers/summary.controller.js'
import proxyRoutes from './routes/proxy.routes.js'
import rankingRoutes from './routes/ranking.routes.js'
import viralRoutes from './routes/viral.routes.js'
import aiRoutes from './routes/ai.routes.js'
import adminRoutes from './routes/admin.routes.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

// Core Security & Middleware Pipeline
app.use(securityHeaders)
app.use(cors())
app.use(express.json({ limit: '2mb' }))
app.use(sanitizeInput)

// Protection Rate Limiters
app.use('/api/auth/login', authLimiter)
app.use('/api/auth/register', authLimiter)
app.use('/api/roast', viralLimiter)
app.use('/api', apiLimiter)


// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    service: 'devtrack-backend',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  })
})

// Community Developer Telemetry
app.get('/api/community-stats', getCommunityStats)

// API Routers
app.use('/api/auth', authRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/handles', handleRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/notes', noteRoutes)
app.use('/api/goals', goalRoutes)
app.use('/api/resumes', resumeRoutes)
app.use('/api/learning', learningRoutes)
app.use('/api/dashboard-summary', summaryRoutes)
app.use('/api/ranking', rankingRoutes)
app.use('/api/proxy', proxyRoutes)
app.use('/api', viralRoutes)
app.use('/api/ai', aiRoutes)

// Production static file serving for React SPA
const distPath = path.join(__dirname, '..', 'dist')
app.use(express.static(distPath))
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api')) {
    const indexPath = path.join(distPath, 'index.html')
    return res.sendFile(indexPath, (err) => {
      if (err) {
        res.status(500).send('Frontend build not found. Please ensure "npm run build" ran before starting.')
      }
    })
  }
  next()
})

// Centralized error handling
app.use(errorHandler)

export default app
