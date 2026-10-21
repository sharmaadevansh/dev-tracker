import User from '../models/User.js'
import Project from '../models/Project.js'
import Note from '../models/Note.js'
import Goal from '../models/Goal.js'
import Resume from '../models/Resume.js'
import Ranking from '../models/Ranking.js'
import LearningTopic from '../models/LearningTopic.js'
import { isDbConnected } from '../config/db.js'

// ==========================================
// 1. STATS & OVERVIEW
// ==========================================
export async function getAdminStats(req, res, next) {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({ error: 'Database service unavailable.' })
    }

    const [totalUsers, verifiedUsers, suspendedUsers, totalProjects, totalNotes, totalResumes] =
      await Promise.all([
        User.countDocuments(),
        User.countDocuments({ isVerified: true }),
        User.countDocuments({ isSuspended: true }),
        Project.countDocuments(),
        Note.countDocuments(),
        Resume.countDocuments(),
      ])

    const universities = await User.aggregate([
      { $match: { university: { $exists: true, $ne: '' } } },
      { $group: { _id: '$university', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ])

    res.json({
      totalUsers,
      verifiedUsers,
      suspendedUsers,
      totalProjects,
      totalNotes,
      totalResumes,
      topUniversities: universities.map((u) => ({ university: u._id, count: u.count })),
    })
  } catch (err) {
    next(err)
  }
}

// ==========================================
// 2. USERS MANAGEMENT (CRUD)
// ==========================================
export async function getAdminUsers(req, res, next) {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({ error: 'Database service unavailable.' })
    }

    const { search = '' } = req.query
    const filter = {}

    if (search && typeof search === 'string' && search.trim()) {
      const regex = new RegExp(search.trim(), 'i')
      filter.$or = [{ username: regex }, { email: regex }, { university: regex }]
    }

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .lean()

    const userIds = users.map((u) => u._id)

    // Parallel fetch counts and rankings
    const [projectCounts, rankings] = await Promise.all([
      Project.aggregate([
        { $match: { userId: { $in: userIds } } },
        { $group: { _id: '$userId', count: { $sum: 1 } } },
      ]),
      Ranking.find({ userId: { $in: userIds } }).select('userId devScore globalRank').lean(),
    ])

    const projectCountMap = new Map(projectCounts.map((p) => [p._id.toString(), p.count]))
    const rankingMap = new Map(rankings.map((r) => [r.userId.toString(), r]))

    const enrichedUsers = users.map((u) => {
      const idStr = u._id.toString()
      const r = rankingMap.get(idStr)
      return {
        ...u,
        id: idStr,
        projectsCount: projectCountMap.get(idStr) || 0,
        devScore: r?.devScore ?? 0,
        globalRank: r?.globalRank ?? null,
      }
    })

    res.json(enrichedUsers)
  } catch (err) {
    next(err)
  }
}

export async function createAdminUser(req, res, next) {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({ error: 'Database service unavailable.' })
    }

    const {
      username = '',
      password = '',
      email = '',
      university = '',
      role = 'user',
      isVerified = false,
    } = req.body

    const cleanUser = typeof username === 'string' ? username.trim().toLowerCase() : ''
    const cleanPass = typeof password === 'string' ? password.trim() : ''

    if (!cleanUser || cleanUser.length < 3) {
      return res.status(400).json({ error: 'Username must be at least 3 characters.' })
    }
    if (!cleanPass || cleanPass.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' })
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
      role: role === 'admin' ? 'admin' : 'user',
      isVerified: !!isVerified,
      isSuspended: false,
    })

    res.status(201).json({
      id: newUser._id.toString(),
      username: newUser.username,
      email: newUser.email,
      university: newUser.university,
      role: newUser.role,
      isVerified: newUser.isVerified,
      isSuspended: newUser.isSuspended,
      createdAt: newUser.createdAt,
    })
  } catch (err) {
    next(err)
  }
}

export async function updateAdminUser(req, res, next) {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({ error: 'Database service unavailable.' })
    }

    const { id } = req.params
    const user = await User.findById(id)
    if (!user) {
      return res.status(404).json({ error: 'User not found.' })
    }

    const {
      username,
      email,
      university,
      role,
      isVerified,
      isSuspended,
      password,
      handles,
    } = req.body

    if (username && typeof username === 'string' && username.trim().toLowerCase() !== user.username) {
      const cleanNewUser = username.trim().toLowerCase()
      const conflict = await User.findOne({ username: cleanNewUser })
      if (conflict) {
        return res.status(409).json({ error: 'Username is already in use by another account.' })
      }
      user.username = cleanNewUser
    }

    if (email !== undefined) user.email = typeof email === 'string' ? email.trim() : ''
    if (university !== undefined) user.university = typeof university === 'string' ? university.trim() : ''
    if (role && ['user', 'admin'].includes(role)) user.role = role
    if (isVerified !== undefined) user.isVerified = !!isVerified
    if (isSuspended !== undefined) {
      // Prevent admin from suspending their own active session
      if (user._id.toString() === req.user._id.toString() && isSuspended) {
        return res.status(400).json({ error: 'You cannot suspend your own admin account.' })
      }
      user.isSuspended = !!isSuspended
    }
    if (password && typeof password === 'string' && password.trim().length >= 6) {
      user.password = password.trim() // Pre-save hook hashes this
    }
    if (handles && typeof handles === 'object') {
      user.handles = { ...user.handles, ...handles }
    }

    await user.save()

    res.json({
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      university: user.university,
      role: user.role,
      isVerified: user.isVerified,
      isSuspended: user.isSuspended,
      handles: user.handles,
      updatedAt: user.updatedAt,
    })
  } catch (err) {
    next(err)
  }
}

export async function toggleUserVerification(req, res, next) {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({ error: 'Database service unavailable.' })
    }

    const { id } = req.params
    const user = await User.findById(id)
    if (!user) {
      return res.status(404).json({ error: 'User not found.' })
    }

    user.isVerified = !user.isVerified
    await user.save()

    res.json({
      id: user._id.toString(),
      username: user.username,
      isVerified: user.isVerified,
    })
  } catch (err) {
    next(err)
  }
}

export async function toggleUserSuspension(req, res, next) {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({ error: 'Database service unavailable.' })
    }

    const { id } = req.params
    const user = await User.findById(id)
    if (!user) {
      return res.status(404).json({ error: 'User not found.' })
    }

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ error: 'You cannot suspend your own admin account.' })
    }

    user.isSuspended = !user.isSuspended
    await user.save()

    res.json({
      id: user._id.toString(),
      username: user.username,
      isSuspended: user.isSuspended,
    })
  } catch (err) {
    next(err)
  }
}

export async function deleteUserCascade(req, res, next) {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({ error: 'Database service unavailable.' })
    }

    const { id } = req.params
    const user = await User.findById(id)
    if (!user) {
      return res.status(404).json({ error: 'User not found.' })
    }

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ error: 'You cannot delete your own admin account.' })
    }

    // Cascade delete all child documents
    await Promise.all([
      User.findByIdAndDelete(id),
      Project.deleteMany({ userId: id }),
      Note.deleteMany({ userId: id }),
      Goal.deleteMany({ userId: id }),
      Resume.deleteMany({ userId: id }),
      Ranking.deleteMany({ userId: id }),
      LearningTopic.deleteMany({ userId: id }),
    ])

    res.status(200).json({
      ok: true,
      message: `User '${user.username}' and all associated records permanently removed.`,
    })
  } catch (err) {
    next(err)
  }
}

// ==========================================
// 3. CONTENT MODERATION
// ==========================================
export async function getAdminContent(req, res, next) {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({ error: 'Database service unavailable.' })
    }

    const { type = 'projects' } = req.query

    if (type === 'projects') {
      const projects = await Project.find()
        .populate('userId', 'username email isVerified')
        .sort({ createdAt: -1 })
        .limit(100)
        .lean()
      return res.json(projects)
    }

    if (type === 'notes') {
      const notes = await Note.find()
        .populate('userId', 'username email isVerified')
        .sort({ updatedAt: -1 })
        .limit(100)
        .lean()
      return res.json(notes)
    }

    if (type === 'resumes') {
      const resumes = await Resume.find()
        .populate('userId', 'username email isVerified')
        .sort({ uploadedAt: -1 })
        .limit(100)
        .lean()
      return res.json(resumes)
    }

    return res.status(400).json({ error: `Unknown content type: ${type}` })
  } catch (err) {
    next(err)
  }
}

export async function deleteAdminContent(req, res, next) {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({ error: 'Database service unavailable.' })
    }

    const { type, id } = req.params

    let result = null
    if (type === 'projects') {
      result = await Project.findByIdAndDelete(id)
    } else if (type === 'notes') {
      result = await Note.findByIdAndDelete(id)
    } else if (type === 'resumes') {
      result = await Resume.findByIdAndDelete(id)
    } else if (type === 'goals') {
      result = await Goal.findByIdAndDelete(id)
    } else {
      return res.status(400).json({ error: `Unsupported content type '${type}'.` })
    }

    if (!result) {
      return res.status(404).json({ error: 'Item not found or already deleted.' })
    }

    res.status(200).json({ ok: true, message: `${type} item successfully purged.` })
  } catch (err) {
    next(err)
  }
}
