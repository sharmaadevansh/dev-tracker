import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, ExternalLink, X } from 'lucide-react'
import Heatmap from '../components/Heatmap'

const STORAGE_KEY = 'devtrack_projects'

const STATUS_OPTIONS = ['Planned', 'In Progress', 'Completed', 'On Hold']
const PRIORITY_OPTIONS = ['Low', 'Medium', 'High']

const STATUS_COLOR = {
  Planned: 'text-chrome-dim border-hairline bg-void/40',
  'In Progress': 'text-signal-dim border-signal/20 bg-signal/5 glow-cyan',
  Completed: 'text-violet-dim border-violet/20 bg-violet/5 glow-violet',
  'On Hold': 'text-yellow-dim border-yellow/20 bg-yellow/5',
}

function loadProjects() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
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
  }
}

export default function Projects() {
  const [projects, setProjects] = useState(loadProjects)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [draft, setDraft] = useState(emptyProject())
  const [editingId, setEditingId] = useState(null)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
  }, [projects])

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
      setProjects((prev) => prev.map((p) => (p.id === editingId ? draft : p)))
    } else {
      setProjects((prev) => [...prev, draft])
    }
    setIsFormOpen(false)
  }

  const handleDelete = (id) => {
    setProjects((prev) => prev.filter((p) => p.id !== id))
  }

  const update = (key, value) => setDraft((d) => ({ ...d, [key]: value }))

  return (
    <div className="flex-1 px-12 py-10 max-w-7xl mx-auto w-full overflow-y-auto space-y-8 scrollbar-thin">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-widest text-signal font-mono mb-1">tracker</p>
          <h1 className="font-display text-2xl font-semibold text-chrome">Projects</h1>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 bg-gradient-to-r from-signal to-violet hover:opacity-90 transition-all text-void font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-full cursor-pointer hover:shadow-[0_0_12px_rgba(0,0,0,0.26)]"
        >
          <Plus size={14} />
          New project
        </button>
      </div>

      {/* Project updates heatmap */}
      {projects.length > 0 && (
        <div className="glass rounded-[36px] p-6 mb-6 bg-gunmetal/30 border-hairline flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h3 className="font-display font-semibold text-xs text-chrome">Project Commit Pipeline</h3>
            <p className="text-[10px] text-chrome-dim mt-0.5 font-mono">Traces codebase revisions and recent active runs</p>
          </div>
          <div className="flex shrink-0 items-center justify-center">
            <Heatmap rows={7} cols={4} lastActiveDayIndex={27} />
          </div>
        </div>
      )}

      {projects.length === 0 ? (
        <div className="glass rounded-[36px] p-8 text-center bg-gunmetal/30 border-hairline">
          <p className="text-chrome-dim text-sm">No projects tracked yet. Add your first one.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((p) => (
            <motion.div
              key={p.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-[36px] p-6 flex flex-col gap-3.5 cursor-pointer hover:border-signal hover:shadow-[0_0_15px_rgba(0,0,0,0.24)] transition-all duration-300 bg-gunmetal/30"
              onClick={() => openEdit(p)}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-display font-semibold text-chrome">{p.name}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete(p.id)
                  }}
                  className="text-chrome-dim hover:text-signal transition-colors shrink-0 cursor-pointer"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              {p.description && <p className="text-xs text-chrome-dim line-clamp-2 leading-relaxed">{p.description}</p>}

              <div className="flex items-center gap-2 flex-wrap mt-1.5">
                <span className={`text-[9px] uppercase tracking-wider border rounded-full px-2.5 py-0.5 font-bold ${STATUS_COLOR[p.status]}`}>
                  {p.status}
                </span>
                <span className="text-[9px] uppercase tracking-wider text-chrome-dim border border-hairline rounded-full px-2.5 py-0.5 font-mono">
                  {p.priority} priority
                </span>
              </div>

              {p.techStack && (
                <p className="text-[11px] font-mono text-chrome-dim mt-2">{p.techStack}</p>
              )}

              <div className="flex items-center gap-3 mt-3 pt-3 border-t border-hairline/40">
                {p.githubLink && (
                  <a
                    href={p.githubLink}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-xs text-chrome-dim hover:text-signal flex items-center gap-1 font-mono transition-colors"
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
                    className="text-xs text-chrome-dim hover:text-signal flex items-center gap-1 font-mono transition-colors"
                  >
                    Live <ExternalLink size={11} />
                  </a>
                )}
                {p.deadline && (
                  <span className="text-[11px] text-chrome-dim ml-auto font-mono">
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
                className="bg-steel border border-hairline rounded-full px-4 py-2 text-xs outline-none focus:border-signal"
              />
              <textarea
                value={draft.description}
                onChange={(e) => update('description', e.target.value)}
                placeholder="Short description"
                rows={2}
                className="bg-steel border border-hairline rounded-[20px] px-4 py-3 text-xs outline-none focus:border-signal resize-none leading-relaxed"
              />
              <input
                value={draft.techStack}
                onChange={(e) => update('techStack', e.target.value)}
                placeholder="Tech stack (comma separated)"
                className="bg-steel border border-hairline rounded-full px-4 py-2 text-xs font-mono outline-none focus:border-signal"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  value={draft.githubLink}
                  onChange={(e) => update('githubLink', e.target.value)}
                  placeholder="GitHub link"
                  className="bg-steel border border-hairline rounded-full px-4 py-2 text-xs outline-none focus:border-signal"
                />
                <input
                  value={draft.liveLink}
                  onChange={(e) => update('liveLink', e.target.value)}
                  placeholder="Live link"
                  className="bg-steel border border-hairline rounded-full px-4 py-2 text-xs outline-none focus:border-signal"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] uppercase tracking-widest text-chrome-dim font-bold font-mono">Start date</label>
                  <input
                    type="date"
                    value={draft.startDate}
                    onChange={(e) => update('startDate', e.target.value)}
                    className="bg-steel border border-hairline rounded-full px-4 py-2 text-xs outline-none focus:border-signal text-chrome-dim"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] uppercase tracking-widest text-chrome-dim font-bold font-mono">Deadline</label>
                  <input
                    type="date"
                    value={draft.deadline}
                    onChange={(e) => update('deadline', e.target.value)}
                    className="bg-steel border border-hairline rounded-full px-4 py-2 text-xs outline-none focus:border-signal text-chrome-dim"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] uppercase tracking-widest text-chrome-dim font-bold font-mono">Status</label>
                  <select
                    value={draft.status}
                    onChange={(e) => update('status', e.target.value)}
                    className="bg-steel border border-hairline rounded-full px-4 py-2 text-xs outline-none focus:border-signal text-chrome-dim"
                  >
                    {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] uppercase tracking-widest text-chrome-dim font-bold font-mono">Priority</label>
                  <select
                    value={draft.priority}
                    onChange={(e) => update('priority', e.target.value)}
                    className="bg-steel border border-hairline rounded-full px-4 py-2 text-xs outline-none focus:border-signal text-chrome-dim"
                  >
                    {PRIORITY_OPTIONS.map((p) => <option key={p}>{p}</option>)}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="mt-2 bg-gradient-to-r from-signal to-violet hover:opacity-90 transition-all text-void font-bold text-xs uppercase tracking-wider py-3.5 rounded-full cursor-pointer hover:shadow-[0_0_12px_rgba(0,0,0,0.26)]"
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
