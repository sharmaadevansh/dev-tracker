import Note from '../models/Note.js'
import { isDbConnected } from '../config/db.js'

export async function getNotes(req, res, next) {
  try {
    if (!isDbConnected() || !req.user._id) return res.json([])
    const notes = await Note.find({ userId: req.user._id }).sort({ pinned: -1, updatedAt: -1 })
    res.json(notes)
  } catch (err) {
    next(err)
  }
}

export async function createNote(req, res, next) {
  try {
    const { title, content, folder, tags, pinned } = req.body
    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Note title is required.' })
    }

    if (!isDbConnected() || !req.user._id) {
      return res.status(503).json({ error: 'Database service unavailable.' })
    }

    const note = await Note.create({
      userId: req.user._id,
      title: title.trim(),
      content: content || '',
      folder: folder ? folder.trim() : 'General',
      tags: tags ? tags.trim() : '',
      pinned: !!pinned,
    })

    res.status(201).json(note)
  } catch (err) {
    next(err)
  }
}

export async function updateNote(req, res, next) {
  try {
    const { id } = req.params
    if (!isDbConnected() || !req.user._id) {
      return res.status(503).json({ error: 'Database service unavailable.' })
    }

    const note = await Note.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      { ...req.body },
      { new: true, runValidators: true }
    )

    if (!note) {
      return res.status(404).json({ error: 'Note record not found.' })
    }

    res.json(note)
  } catch (err) {
    next(err)
  }
}

export async function deleteNote(req, res, next) {
  try {
    const { id } = req.params
    if (!isDbConnected() || !req.user._id) {
      return res.status(503).json({ error: 'Database service unavailable.' })
    }

    const result = await Note.findOneAndDelete({ _id: id, userId: req.user._id })
    if (!result) {
      return res.status(404).json({ error: 'Note record not found.' })
    }

    res.status(204).end()
  } catch (err) {
    next(err)
  }
}
