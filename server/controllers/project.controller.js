import Project from '../models/Project.js'
import { isDbConnected } from '../config/db.js'

export async function getProjects(req, res, next) {
  try {
    if (!isDbConnected() || !req.user._id) return res.json([])
    const projects = await Project.find({ userId: req.user._id }).sort({ createdAt: -1 })
    res.json(projects)
  } catch (err) {
    next(err)
  }
}

export async function createProject(req, res, next) {
  try {
    const { name, description, status, priority, techStack, githubLink, liveLink, startDate, deadline } = req.body
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Project name is required.' })
    }

    if (!isDbConnected() || !req.user._id) {
      return res.status(503).json({ error: 'Database service unavailable.' })
    }

    const project = await Project.create({
      userId: req.user._id,
      name: name.trim(),
      description: description ? description.trim() : '',
      status: status || 'Planned',
      priority: priority || 'Medium',
      techStack: techStack ? techStack.trim() : '',
      githubLink: githubLink ? githubLink.trim() : '',
      liveLink: liveLink ? liveLink.trim() : '',
      startDate: startDate || '',
      deadline: deadline || '',
    })

    res.status(201).json(project)
  } catch (err) {
    next(err)
  }
}

export async function updateProject(req, res, next) {
  try {
    const { id } = req.params
    if (!isDbConnected() || !req.user._id) {
      return res.status(503).json({ error: 'Database service unavailable.' })
    }

    const project = await Project.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      { ...req.body },
      { new: true, runValidators: true }
    )

    if (!project) {
      return res.status(404).json({ error: 'Project record not found.' })
    }

    res.json(project)
  } catch (err) {
    next(err)
  }
}

export async function deleteProject(req, res, next) {
  try {
    const { id } = req.params
    if (!isDbConnected() || !req.user._id) {
      return res.status(503).json({ error: 'Database service unavailable.' })
    }

    const result = await Project.findOneAndDelete({ _id: id, userId: req.user._id })
    if (!result) {
      return res.status(404).json({ error: 'Project record not found.' })
    }

    res.status(204).end()
  } catch (err) {
    next(err)
  }
}
