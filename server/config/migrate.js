import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import User from '../models/User.js'
import Project from '../models/Project.js'
import Note from '../models/Note.js'
import Goal from '../models/Goal.js'
import Resume from '../models/Resume.js'
import LearningTopic from '../models/LearningTopic.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const legacyDbPath = path.join(__dirname, '..', 'data', 'db.json')

export async function migrateFromLegacyJson() {
  try {
    const userCount = await User.countDocuments()
    if (userCount > 0) {
      // Already populated, skip migration
      return
    }

    let raw
    try {
      raw = await fs.readFile(legacyDbPath, 'utf8')
    } catch {
      // No legacy file found
      return
    }

    const legacyDb = JSON.parse(raw)
    console.log('[Migration] Migrating data from legacy server/data/db.json into MongoDB...')

    // 1. Create User
    const legacyUser = legacyDb.user || { username: 'devansh', password: 'devtrack2026' }
    const user = await User.create({
      username: legacyUser.username || 'devansh',
      password: legacyUser.password || 'devtrack2026', // Will be hashed via pre-save hook
      handles: legacyDb.handles || {},
      activePlatforms: legacyDb.activePlatforms || {},
    })

    const userId = user._id
    console.log(`[Migration] User '${user.username}' created with ID: ${userId}`)

    // 2. Migrate Projects
    if (Array.isArray(legacyDb.projects) && legacyDb.projects.length > 0) {
      const projectsToInsert = legacyDb.projects.map((p) => ({
        userId,
        name: p.name || 'Untitled Project',
        description: p.description || '',
        status: p.status || 'Planned',
        priority: p.priority || 'Medium',
        techStack: p.techStack || '',
        githubLink: p.githubLink || '',
        liveLink: p.liveLink || '',
        startDate: p.startDate || '',
        deadline: p.deadline || '',
        createdAt: p.createdAt ? new Date(p.createdAt) : new Date(),
        updatedAt: p.updatedAt ? new Date(p.updatedAt) : new Date(),
      }))
      await Project.insertMany(projectsToInsert)
      console.log(`[Migration] Migrated ${projectsToInsert.length} projects.`)
    }

    // 3. Migrate Notes
    if (Array.isArray(legacyDb.notes) && legacyDb.notes.length > 0) {
      const notesToInsert = legacyDb.notes.map((n) => ({
        userId,
        title: n.title || 'Untitled Note',
        content: n.content || '',
        folder: n.folder || 'General',
        tags: n.tags || '',
        pinned: !!n.pinned,
        createdAt: n.createdAt ? new Date(n.createdAt) : new Date(),
        updatedAt: n.updatedAt ? new Date(n.updatedAt) : new Date(),
      }))
      await Note.insertMany(notesToInsert)
      console.log(`[Migration] Migrated ${notesToInsert.length} notes.`)
    }

    // 4. Migrate Goals
    if (Array.isArray(legacyDb.goals) && legacyDb.goals.length > 0) {
      const goalsToInsert = legacyDb.goals.map((g) => ({
        userId,
        text: g.text || 'Goal',
        category: g.category || 'Coding',
        completed: !!g.completed,
        createdAt: g.createdAt ? new Date(g.createdAt) : new Date(),
      }))
      await Goal.insertMany(goalsToInsert)
      console.log(`[Migration] Migrated ${goalsToInsert.length} goals.`)
    }

    // 5. Migrate Resumes
    if (Array.isArray(legacyDb.resumes) && legacyDb.resumes.length > 0) {
      const resumesToInsert = legacyDb.resumes.map((r) => ({
        userId,
        fileName: r.fileName || 'Resume.pdf',
        versionLabel: r.versionLabel || '',
        fileSize: r.fileSize || '',
        targetRole: r.targetRole || 'Full Stack Engineer',
        atsScore: r.atsScore || 75,
        matchedKeywords: r.matchedKeywords || [],
        missingKeywords: r.missingKeywords || [],
        issues: r.issues || [],
        uploadedAt: r.uploadedAt ? new Date(r.uploadedAt) : new Date(),
      }))
      await Resume.insertMany(resumesToInsert)
      console.log(`[Migration] Migrated ${resumesToInsert.length} resumes.`)
    }

    // 6. Migrate Learning
    if (Array.isArray(legacyDb.learning) && legacyDb.learning.length > 0) {
      const learningToInsert = legacyDb.learning.map((l) => ({
        userId,
        topicId: l.id || l.topicId,
        name: l.name,
        notes: l.notes || '',
        targetDate: l.targetDate || '',
        subtopics: l.subtopics || [],
      }))
      await LearningTopic.insertMany(learningToInsert)
      console.log(`[Migration] Migrated ${learningToInsert.length} learning topics.`)
    }

    console.log('[Migration] Database migration completed successfully!')
  } catch (err) {
    console.error('[Migration] Migration error:', err.message)
  }
}

export default migrateFromLegacyJson
