import Goal from '../models/Goal.js'
import { isDbConnected } from '../config/db.js'

export async function getGoals(req, res, next) {
  try {
    if (!isDbConnected() || !req.user._id) return res.json([])
    const goals = await Goal.find({ userId: req.user._id }).sort({ createdAt: -1 })
    res.json(goals)
  } catch (err) {
    next(err)
  }
}

export async function createGoal(req, res, next) {
  try {
    const { text, category, completed } = req.body
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Goal description text is required.' })
    }

    if (!isDbConnected() || !req.user._id) {
      return res.status(503).json({ error: 'Database service unavailable.' })
    }

    const goal = await Goal.create({
      userId: req.user._id,
      text: text.trim(),
      category: category || 'Coding',
      completed: !!completed,
    })

    res.status(201).json(goal)
  } catch (err) {
    next(err)
  }
}

export async function updateGoal(req, res, next) {
  try {
    const { id } = req.params
    if (!isDbConnected() || !req.user._id) {
      return res.status(503).json({ error: 'Database service unavailable.' })
    }

    const goal = await Goal.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      { ...req.body },
      { new: true, runValidators: true }
    )

    if (!goal) {
      return res.status(404).json({ error: 'Goal record not found.' })
    }

    res.json(goal)
  } catch (err) {
    next(err)
  }
}

export async function deleteGoal(req, res, next) {
  try {
    const { id } = req.params
    if (!isDbConnected() || !req.user._id) {
      return res.status(503).json({ error: 'Database service unavailable.' })
    }

    const result = await Goal.findOneAndDelete({ _id: id, userId: req.user._id })
    if (!result) {
      return res.status(404).json({ error: 'Goal record not found.' })
    }

    res.status(204).end()
  } catch (err) {
    next(err)
  }
}
