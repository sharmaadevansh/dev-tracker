import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { isDbConnected } from '../config/db.js'

const TOKEN_SECRET = process.env.TOKEN_SECRET || 'devtrack-local-development-secret-key-2026'

export function signJwtToken(user) {
  const payload = {
    id: user._id ? user._id.toString() : user.id,
    username: user.username,
    role: user.role || 'user',
  }
  return jwt.sign(payload, TOKEN_SECRET, { expiresIn: process.env.TOKEN_EXPIRES_IN || '7d' })
}

export async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication token is missing or malformed.' })
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, TOKEN_SECRET)

    if (isDbConnected()) {
      const user = await User.findById(decoded.id)
      if (!user) {
        return res.status(401).json({ error: 'User account no longer exists.' })
      }
      if (user.isSuspended) {
        return res.status(403).json({ error: 'Account has been suspended. Please contact administrator.' })
      }
      req.user = user
    } else {
      req.user = {
        _id: decoded.id,
        id: decoded.id,
        username: decoded.username,
        role: decoded.role || 'user',
      }
    }

    return next()
  } catch {
    return res.status(401).json({ error: 'Session expired or token invalid. Please log in again.' })
  }
}

export function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied: Administrator privileges required.' })
  }
  next()
}

export default requireAuth
