import { useState, useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, ExternalLink, X } from 'lucide-react'
import Heatmap from '../components/Heatmap'
import { useAuth } from '../context/AuthContext'
import { getScopedItem, setScopedItem } from '../utils/storage'
import {
  createCollectionItem,
  deleteCollectionItem,
  fetchCollection,
  updateCollectionItem,
} from '../services/api/backend'

const PROJECTS_STORAGE_KEY = 'projects'

const STATUS_OPTIONS = ['Planned', 'In Progress', 'Completed', 'On Hold']
const PRIORITY_OPTIONS = ['Low', 'Medium', 'High']

const STATUS_COLOR = {
  Planned: 'text-chrome-dim border-hairline bg-void/40',
  'In Progress': 'text-signal-dim border-signal/20 bg-signal/5 glow-cyan',
  Completed: 'text-violet-dim border-violet/20 bg-violet/5 glow-violet',
  'On Hold': 'text-yellow-dim border-yellow/20 bg-yellow/5',
}

function emptyProject() {
  return {
    id: crypto.randomUUID(),
    name: '',
    description: '',
    status: 'Planned',
    techStack: '',
    githubLink: '',
    liveLink: '',
    startDate: '',
    deadline: '',
    priority: 'Medium',
    updatedAt: new Date().toISOString(),
  }
}

export default function Projects() {
  const { user } = useAuth()
  const username = user?.username || ''
  const queryClient = useQueryClient()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [draft, setDraft] = useState(emptyProject())
  const [editingId, setEditingId] = useState(null)

  const { data: remoteProjects, isLoading, isError } = useQuery({
    queryKey: ['backend-projects', username],
    queryFn: () => fetchCollection('projects'),
    initialData: () => getScopedItem(PROJECTS_STORAGE_KEY, username, []),
  })

  const projects = useMemo(() => remoteProjects || [], [remoteProjects])

  const syncProjectsCache = (nextProjects) => {
    queryClient.setQueryData(['backend-projects', username], nextProjects)
    setScopedItem(PROJECTS_STORAGE_KEY, username, nextProjects)
  }

  const createMutation = useMutation({
    mutationFn: (project) => createCollectionItem('projects', project),
    onSuccess: (project) => syncProjectsCache([project, ...projects]),
  })

  const updateMutation = useMutation({
    mutationFn: (project) => updateCollectionItem('projects', project.id, project),
    onSuccess: (project) => syncProjectsCache(projects.map((p) => (p.id === project.id ? project : p))),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteCollectionItem('projects', id),
    onSuccess: (_, id) => syncProjectsCache(projects.filter((p) => p.id !== id)),
  })

  const openNew = () => {
    setDraft(emptyProject())
    setEditingId(null)
    setIsFormOpen(true)
  }

  const openEdit = (project) => {
    setDraft(project)
    setEditingId(project.id)
    setIsFormOpen(true)
  }

  const handleSave = (e) => {
    e.preventDefault()
    if (!draft.name.trim()) return
    if (editingId) {
      updateMutation.mutate(draft)
    } else {
      createMutation.mutate(draft)
    }
    setIsFormOpen(false)
  }

  const handleDelete = (id) => {
    deleteMutation.mutate(id)
  }

  const update = (key, value) => setDraft((d) => ({ ...d, [key]: value, updatedAt: new Date().toISOString() }))

  const projectActivityData = useMemo(() => {
    const map = {}
    projects.forEach((p) => {
      const d = (p.updatedAt || p.startDate || p.deadline || '').slice(0, 10) || new Date().toISOString().slice(0, 10)
      map[d] = (map[d] || 0) + 1
    })
    return map
  }, [projects])

  return (
    <div className="flex-1 px-4 sm:px-8 md:px-12 py-6 sm:py-8 max-w-7xl mx-auto w-full overflow-y-auto space-y-6 scrollbar-thin">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-chrome">Projects</h1>
          {isError && <p className="text-xs text-signal font-sans mt-1">Backend sync unavailable. Showing local cache.</p>}
          {isLoading && <p className="text-xs text-chrome-dim font-sans mt-1">Loading projects from backend...</p>}
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 bg-chrome text-void hover:opacity-90 font-medium text-xs px-3.5 py-2 rounded-lg transition-opacity cursor-pointer"
        >
          <Plus size={14} />
          New project
        </button>
      </div>

      {/* Project updates heatmap */}
      {projects.length > 0 && (
        <div className="glass p-5 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h3 className="font-semibold text-sm text-chrome">Project Commit Pipeline</h3>
            <p className="text-xs text-chrome-dim mt-0.5 font-sans">Traces codebase revisions and recent active runs</p>
          </div>
          <div className="flex shrink-0 items-center justify-center">
            <Heatmap rows={7} cols={4} data={projectActivityData} colorScheme="violet" label="updates" />
          </div>
        </div>
      )}

      {projects.length === 0 ? (
        <div className="glass p-10 text-center flex flex-col items-center justify-center space-y-4 my-6">
          <div className="w-12 h-12 rounded-lg bg-steel flex items-center justify-center text-chrome">
            <Plus size={20} />
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold text-chrome text-base">No Projects Tracked Yet</h3>
            <p className="text-xs text-chrome-dim font-sans max-w-sm leading-relaxed">
              Document your full-stack applications, repositories, tech stacks, and live deployments to build a recruiter-ready portfolio.
            </p>
          </div>
          <button
            onClick={() => {
              setDraft(emptyProject())
              setEditingId(null)
              setIsFormOpen(true)
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-chrome text-void font-medium text-xs font-sans hover:opacity-90 cursor-pointer transition-opacity"
          >
            <Plus size={14} />
            Track first project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((p) => (
            <motion.div
              key={p.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass p-5 flex flex-col justify-between gap-3.5 cursor-pointer hover:border-chrome/20 transition-colors"
              onClick={() => openEdit(p)}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="font-semibold text-chrome text-sm sm:text-base">{p.name}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(p.id)
                    }}
                    className="text-chrome-dim hover:text-red-400 transition-colors shrink-0 cursor-pointer p-1"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                {p.description && <p className="text-xs text-chrome-dim line-clamp-2 leading-relaxed mt-1 font-sans">{p.description}</p>}

                <div className="flex items-center gap-2 flex-wrap mt-2.5">
                  <span className={`text-[11px] border rounded-md px-2 py-0.5 font-medium font-sans ${STATUS_COLOR[p.status]}`}>
                    {p.status}
                  </span>
                  <span className="text-[11px] text-chrome-dim border border-hairline rounded-md px-2 py-0.5 font-sans font-medium">
                    {p.priority} priority
                  </span>
                </div>

                {p.techStack && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {p.techStack.split(',').filter(Boolean).map((tech) => (
                      <span
                        key={tech.trim()}
                        className="text-[10px] font-sans font-medium px-2 py-0.5 rounded-md bg-steel/70 text-chrome border border-hairline/60"
                      >
                        {tech.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 mt-3 pt-3 border-t border-hairline/40">
                {p.githubLink && (
                  <a
                    href={p.githubLink}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-xs text-chrome-dim hover:text-signal flex items-center gap-1 font-sans font-medium transition-colors"
                  >
                    Repo <ExternalLink size={11} />
                  </a>
                )}
                {p.liveLink && (
                  <a
                    href={p.liveLink}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-xs text-chrome-dim hover:text-signal flex items-center gap-1 font-sans font-medium transition-colors"
                  >
                    Live <ExternalLink size={11} />
                  </a>
                )}
                {p.deadline && (
                  <span className="text-xs text-chrome-dim ml-auto font-sans">
                    due {p.deadline}
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* New/Edit Modal form */}
      <AnimatePresence>
        {isFormOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4"
            onClick={() => setIsFormOpen(false)}
          >
            <motion.form
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={(e) => e.stopPropagation()}
              onSubmit={handleSave}
              className="glass rounded-[28px] p-6 w-full max-w-md flex flex-col gap-3 max-h-[85vh] overflow-y-auto bg-gunmetal"
            >
              <div className="flex items-center justify-between mb-1 pb-2 border-b border-hairline">
                <h2 className="font-display font-semibold text-chrome">
                  {editingId ? 'Edit project' : 'New project'}
                </h2>
                <button type="button" onClick={() => setIsFormOpen(false)} className="text-chrome-dim hover:text-chrome">
                  <X size={18} />
                </button>
              </div>

              <input
                autoFocus
                required
                value={draft.name}
                onChange={(e) => update('name', e.target.value)}
                placeholder="Project name"
                className="bg-steel border border-hairline rounded-full px-4 py-2 text-xs outline-none focus:border-signal font-sans"
              />
              <textarea
                value={draft.description}
                onChange={(e) => update('description', e.target.value)}
                placeholder="Short description"
                rows={2}
                className="bg-steel border border-hairline rounded-[20px] px-4 py-3 text-xs outline-none focus:border-signal resize-none leading-relaxed font-sans"
              />
              <input
                value={draft.techStack}
                onChange={(e) => update('techStack', e.target.value)}
                placeholder="Tech stack (comma separated)"
                className="bg-steel border border-hairline rounded-full px-4 py-2 text-xs font-sans outline-none focus:border-signal"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  value={draft.githubLink}
                  onChange={(e) => update('githubLink', e.target.value)}
                  placeholder="GitHub link"
                  className="bg-steel/60 hover:bg-steel border border-hairline focus:border-chrome-dim rounded-lg px-3 py-2 text-xs outline-none transition-colors"
                />
                <input
                  value={draft.liveLink}
                  onChange={(e) => update('liveLink', e.target.value)}
                  placeholder="Live link"
                  className="bg-steel/60 hover:bg-steel border border-hairline focus:border-chrome-dim rounded-lg px-3 py-2 text-xs outline-none transition-colors"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-chrome-dim">Start date</label>
                  <input
                    type="date"
                    value={draft.startDate}
                    onChange={(e) => update('startDate', e.target.value)}
                    className="bg-steel/60 hover:bg-steel border border-hairline focus:border-chrome-dim rounded-lg px-3 py-2 text-xs outline-none text-chrome transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-chrome-dim">Deadline</label>
                  <input
                    type="date"
                    value={draft.deadline}
                    onChange={(e) => update('deadline', e.target.value)}
                    className="bg-steel/60 hover:bg-steel border border-hairline focus:border-chrome-dim rounded-lg px-3 py-2 text-xs outline-none text-chrome transition-colors"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-chrome-dim">Status</label>
                  <select
                    value={draft.status}
                    onChange={(e) => update('status', e.target.value)}
                    className="bg-steel/60 hover:bg-steel border border-hairline focus:border-chrome-dim rounded-lg px-3 py-2 text-xs outline-none text-chrome transition-colors"
                  >
                    {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-chrome-dim">Priority</label>
                  <select
                    value={draft.priority}
                    onChange={(e) => update('priority', e.target.value)}
                    className="bg-steel/60 hover:bg-steel border border-hairline focus:border-chrome-dim rounded-lg px-3 py-2 text-xs outline-none text-chrome transition-colors"
                  >
                    {PRIORITY_OPTIONS.map((p) => <option key={p}>{p}</option>)}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="mt-2 bg-chrome text-void hover:opacity-90 transition-opacity font-medium text-xs py-2.5 rounded-lg cursor-pointer"
              >
                {editingId ? 'Save changes' : 'Add project'}
              </button>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
