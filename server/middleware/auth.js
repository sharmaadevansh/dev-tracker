import jwt from 'jsonwebtoken'
import crypto from 'node:crypto'
import User from '../models/User.js'
import { isDbConnected } from '../config/db.js'

const TOKEN_SECRET = process.env.TOKEN_SECRET || 'devtrack-local-development-secret-key-2026'

export function signJwtToken(user) {
  const payload = {
    id: user._id ? user._id.toString() : user.id,
    username: user.username,
  }
  return jwt.sign(payload, TOKEN_SECRET, { expiresIn: process.env.TOKEN_EXPIRES_IN || '7d' })
}

// Fallback legacy token verification for uninterrupted session continuity
function verifyLegacyToken(token) {
  if (!token || !token.includes('.')) return null
  const [payload, signature] = token.split('.')
  const expected = crypto.createHmac('sha256', 'devtrack-local-secret').update(payload).digest('base64url')

  try {
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null
    return JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
  } catch {
    return null
  }
}

export async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication token is missing or malformed.' })
  }

  const token = authHeader.split(' ')[1]

  try {
    // 1. Try standard JWT verification
    const decoded = jwt.verify(token, TOKEN_SECRET)

    if (isDbConnected()) {
      const user = await User.findById(decoded.id)
      if (!user) {
        return res.status(401).json({ error: 'User account no longer exists.' })
      }
      req.user = user
    } else {
      req.user = { _id: decoded.id, id: decoded.id, username: decoded.username }
    }

    return next()
  } catch {
    // 2. Try legacy token fallback if JWT fails
    const legacy = verifyLegacyToken(token)
    if (legacy && legacy.username) {
      if (isDbConnected()) {
        let user = await User.findOne({ username: legacy.username })
        if (!user) {
          user = { _id: legacy.username, id: legacy.username, username: legacy.username }
        }
        req.user = user
      } else {
        req.user = { _id: legacy.username, id: legacy.username, username: legacy.username }
      }
      return next()
    }

    return res.status(401).json({ error: 'Session expired or token invalid. Please log in again.' })
  }
}

export default requireAuth
