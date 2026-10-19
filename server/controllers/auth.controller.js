import bcrypt from 'bcryptjs'
import User from '../models/User.js'
import { signJwtToken } from '../middleware/auth.js'
import { isDbConnected } from '../config/db.js'

// In-memory fallback user store when MongoDB is not connected
const fallbackUsers = new Map()

export function getFallbackUsersCount() {
  return fallbackUsers.size
}

export async function login(req, res, next) {
  try {
    const { username = '', password = '' } = req.body
    const cleanUser = typeof username === 'string' ? username.trim().toLowerCase() : ''
    const cleanPass = typeof password === 'string' ? password.trim() : ''

    if (!cleanUser || !cleanPass) {
      return res.status(400).json({ ok: false, error: 'Username and password are required.' })
    }

    if (isDbConnected()) {
      const user = await User.findOne({ username: cleanUser })
      if (!user) {
        return res.status(401).json({ ok: false, error: 'Invalid username or password.' })
      }

      const isMatch = await user.comparePassword(cleanPass)
      if (!isMatch) {
        return res.status(401).json({ ok: false, error: 'Invalid username or password.' })
      }

      const token = signJwtToken(user)
      return res.json({
        ok: true,
        user: { username: user.username, email: user.email, role: user.role, isPremium: user.isPremium },
        token,
      })
    }

    // Fallback if DB is temporarily offline
    const fallbackUser = fallbackUsers.get(cleanUser)
    if (fallbackUser) {
      const isMatch = await bcrypt.compare(cleanPass, fallbackUser.passwordHash)
      if (isMatch) {
        return res.json({
          ok: true,
          user: {
            username: fallbackUser.username,
            email: fallbackUser.email || '',
            university: fallbackUser.university || '',
            role: fallbackUser.role || 'user',
            isPremium: !!fallbackUser.isPremium,
          },
          token: signJwtToken(fallbackUser),
        })
      }
    }

    return res.status(401).json({ ok: false, error: 'Invalid username or password.' })
  } catch (err) {
    next(err)
  }
}

export async function register(req, res, next) {
  try {
    const { username = '', password = '', email = '', university = '' } = req.body
    const cleanUser = typeof username === 'string' ? username.trim().toLowerCase() : ''
    const cleanPass = typeof password === 'string' ? password.trim() : ''

    if (!cleanUser || cleanUser.length < 3) {
      return res.status(400).json({ error: 'Username must be at least 3 characters.' })
    }
    if (!cleanPass || cleanPass.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' })
    }

    if (!isDbConnected()) {
      // In-memory resilient registration fallback
      if (fallbackUsers.has(cleanUser)) {
        return res.status(409).json({ error: 'Username is already taken.' })
      }

      const hashedPassword = await bcrypt.hash(cleanPass, 10)
      const newFallbackUser = {
        id: `local-${cleanUser}-${Date.now()}`,
        username: cleanUser,
        passwordHash: hashedPassword,
        email: typeof email === 'string' ? email.trim() : '',
        university: typeof university === 'string' ? university.trim() : '',
        role: 'user',
        isPremium: false,
      }
      fallbackUsers.set(cleanUser, newFallbackUser)

      const token = signJwtToken(newFallbackUser)
      return res.status(201).json({
        ok: true,
        user: {
          username: newFallbackUser.username,
          email: newFallbackUser.email,
          university: newFallbackUser.university,
        },
        token,
      })
    }

    const existing = await User.findOne({ username: cleanUser })
    if (existing) {
      return res.status(409).json({ error: 'Username is already taken.' })
    }

    const newUser = await User.create({
      username: cleanUser,
      password: cleanPass,
      email: typeof email === 'string' ? email.trim() : '',
      university: typeof university === 'string' ? university.trim() : '',
    })

    const token = signJwtToken(newUser)
    res.status(201).json({
      ok: true,
      user: { username: newUser.username, email: newUser.email, university: newUser.university },
      token,
    })
  } catch (err) {
    next(err)
  }
}

export async function getCurrentUser(req, res) {
  res.json({
    username: req.user.username,
    email: req.user.email || '',
    university: req.user.university || '',
    role: req.user.role || 'user',
    isPremium: !!req.user.isPremium,
  })
}

export async function updateCredentials(req, res, next) {
  try {
    const { username = '', password = '', university = null } = req.body
    const cleanUser = typeof username === 'string' ? username.trim().toLowerCase() : ''
    const cleanPass = typeof password === 'string' ? password.trim() : ''

    if (isDbConnected() && req.user._id) {
      const user = await User.findById(req.user._id)
      if (!user) return res.status(404).json({ error: 'User not found.' })

      if (cleanUser) user.username = cleanUser
      if (cleanPass) user.password = cleanPass // Pre-save hook will hash it
      if (university !== null) user.university = typeof university === 'string' ? university.trim() : user.university
      await user.save()

      const token = signJwtToken(user)
      return res.json({
        user: { username: user.username, university: user.university },
        token,
      })
    }

    res.json({
      user: { username: cleanUser || req.user.username, university: university || req.user.university || '' },
      token: signJwtToken({ id: 'fallback-id', username: cleanUser || req.user.username }),
    })
  } catch (err) {
    next(err)
  }
}
