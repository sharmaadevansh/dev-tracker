import Project from '../models/Project.js'
import Goal from '../models/Goal.js'
import Note from '../models/Note.js'
import Resume from '../models/Resume.js'
import LearningTopic from '../models/LearningTopic.js'
import User from '../models/User.js'
import { isDbConnected } from '../config/db.js'

export async function getDashboardSummary(req, res, next) {
  try {
    if (!isDbConnected() || !req.user._id) {
      return res.json({
        linkedPlatforms: 4,
        projects: { total: 0, completed: 0, active: 0 },
        goals: { total: 0, completed: 0, completionRate: 0 },
        notes: { total: 0, pinned: 0 },
        resumes: { total: 0, bestScore: 0 },
        learning: { topics: 0, completionRate: 0 },
      })
    }

    const userId = req.user._id

    const [user, projects, goals, notes, resumes, learning] = await Promise.all([
      User.findById(userId),
      Project.find({ userId }),
      Goal.find({ userId }),
      Note.find({ userId }),
      Resume.find({ userId }),
      LearningTopic.find({ userId }),
    ])

    const completedProjects = projects.filter((p) => p.status === 'Completed').length
    const completedGoals = goals.filter((g) => g.completed).length

    const handlesObj = user?.handles?.toObject?.() || user?.handles || {}
    const linkedPlatforms = Object.values(handlesObj).filter((v) => typeof v === 'string' && v.trim().length > 0).length

    const learningSubtopics = learning.flatMap((topic) => topic.subtopics || [])
    const learningDone = learningSubtopics.filter((item) => item.completed).length

    res.json({
      linkedPlatforms,
      projects: {
        total: projects.length,
        completed: completedProjects,
        active: projects.length - completedProjects,
      },
      goals: {
        total: goals.length,
        completed: completedGoals,
        completionRate: goals.length ? Math.round((completedGoals / goals.length) * 100) : 0,
      },
      notes: {
        total: notes.length,
        pinned: notes.filter((n) => n.pinned).length,
      },
      resumes: {
        total: resumes.length,
        bestScore: resumes.reduce((best, r) => Math.max(best, r.atsScore || 0), 0),
      },
      learning: {
        topics: learning.length,
        completionRate: learningSubtopics.length ? Math.round((learningDone / learningSubtopics.length) * 100) : 0,
      },
    })
  } catch (err) {
    next(err)
  }
}
