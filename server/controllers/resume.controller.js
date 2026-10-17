import Resume from '../models/Resume.js'
import { isDbConnected } from '../config/db.js'

export async function getResumes(req, res, next) {
  try {
    if (!isDbConnected() || !req.user._id) return res.json([])
    const resumes = await Resume.find({ userId: req.user._id }).sort({ uploadedAt: -1 })
    res.json(resumes)
  } catch (err) {
    next(err)
  }
}

export async function createResume(req, res, next) {
  try {
    const { fileName, versionLabel, fileSize, targetRole, atsScore, matchedKeywords, missingKeywords, issues } = req.body
    if (!fileName || !fileName.trim()) {
      return res.status(400).json({ error: 'Resume file name is required.' })
    }

    if (!isDbConnected() || !req.user._id) {
      return res.status(503).json({ error: 'Database service unavailable.' })
    }

    const resume = await Resume.create({
      userId: req.user._id,
      fileName: fileName.trim(),
      versionLabel: versionLabel || '',
      fileSize: fileSize || '',
      targetRole: targetRole || 'Full Stack Engineer',
      atsScore: typeof atsScore === 'number' ? atsScore : 70,
      matchedKeywords: Array.isArray(matchedKeywords) ? matchedKeywords : [],
      missingKeywords: Array.isArray(missingKeywords) ? missingKeywords : [],
      issues: Array.isArray(issues) ? issues : [],
      uploadedAt: new Date(),
    })

    res.status(201).json(resume)
  } catch (err) {
    next(err)
  }
}

export async function updateResume(req, res, next) {
  try {
    const { id } = req.params
    if (!isDbConnected() || !req.user._id) {
      return res.status(503).json({ error: 'Database service unavailable.' })
    }

    const resume = await Resume.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      { ...req.body },
      { new: true, runValidators: true }
    )

    if (!resume) {
      return res.status(404).json({ error: 'Resume record not found.' })
    }

    res.json(resume)
  } catch (err) {
    next(err)
  }
}

export async function deleteResume(req, res, next) {
  try {
    const { id } = req.params
    if (!isDbConnected() || !req.user._id) {
      return res.status(503).json({ error: 'Database service unavailable.' })
    }

    const result = await Resume.findOneAndDelete({ _id: id, userId: req.user._id })
    if (!result) {
      return res.status(404).json({ error: 'Resume record not found.' })
    }

    res.status(204).end()
  } catch (err) {
    next(err)
  }
}
