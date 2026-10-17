import LearningTopic from '../models/LearningTopic.js'
import { isDbConnected } from '../config/db.js'

export async function getLearning(req, res, next) {
  try {
    if (!isDbConnected() || !req.user._id) return res.json([])
    const topics = await LearningTopic.find({ userId: req.user._id })
    res.json(topics)
  } catch (err) {
    next(err)
  }
}

export async function updateLearning(req, res, next) {
  try {
    const list = req.body
    if (!Array.isArray(list)) {
      return res.status(400).json({ error: 'Learning payload must be an array of topics.' })
    }

    if (!isDbConnected() || !req.user._id) {
      return res.status(503).json({ error: 'Database service unavailable.' })
    }

    // Upsert or replace each topic for this user
    const bulkOps = list.map((item) => ({
      updateOne: {
        filter: { userId: req.user._id, topicId: item.id || item.topicId },
        update: {
          $set: {
            userId: req.user._id,
            topicId: item.id || item.topicId,
            name: item.name,
            notes: item.notes || '',
            targetDate: item.targetDate || '',
            subtopics: Array.isArray(item.subtopics) ? item.subtopics : [],
          },
        },
        upsert: true,
      },
    }))

    if (bulkOps.length > 0) {
      await LearningTopic.bulkWrite(bulkOps)
    }

    const updated = await LearningTopic.find({ userId: req.user._id })
    res.json(updated)
  } catch (err) {
    next(err)
  }
}
