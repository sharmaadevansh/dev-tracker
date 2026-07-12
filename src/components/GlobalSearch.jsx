import { useState, useEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, FolderGit2, FileCode, CheckSquare, Terminal, Keyboard } from 'lucide-react'
import { useUserHandles } from '../context/UserContext'

const TOPICS = [
  { id: 'js', name: 'JavaScript', category: 'Learning Topic', path: '/dashboard/learning' },
  { id: 'react', name: 'React', category: 'Learning Topic', path: '/dashboard/learning' },
  { id: 'node', name: 'Node.js', category: 'Learning Topic', path: '/dashboard/learning' },
  { id: 'express', name: 'Express', category: 'Learning Topic', path: '/dashboard/learning' },
  { id: 'mongodb', name: 'MongoDB', category: 'Learning Topic', path: '/dashboard/learning' },
  { id: 'system-design', name: 'System Design', category: 'Learning Topic', path: '/dashboard/learning' },
  { id: 'os', name: 'Operating Systems', category: 'Learning Topic', path: '/dashboard/learning' },
  { id: 'dbms', name: 'DBMS', category: 'Learning Topic', path: '/dashboard/learning' },
  { id: 'networks', name: 'Computer Networks', category: 'Learning Topic', path: '/dashboard/learning' },
  { id: 'oop', name: 'OOP', category: 'Learning Topic', path: '/dashboard/learning' }
]

export default function GlobalSearch({ isOpen, onClose }) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const queryClient = useQueryClient()
  const { handles } = useUserHandles()
  const navigate = useNavigate()
  const inputRef = useRef(null)

  // Listen for keyboard events to toggle and navigate
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
      setQuery('')
      setSelectedIndex(0)
    }
  }, [isOpen])

  // Fetch search items
  const searchItems = useMemo(() => {
    // 1. Load Projects from localStorage
    let projects = []
    try {
      const raw = localStorage.getItem('devtrack_projects')
      if (raw) projects = JSON.parse(raw)
    } catch {}

    // 2. Load Notes from localStorage
    let notes = []
    try {
      const raw = localStorage.getItem('devtrack_notes')
      if (raw) notes = JSON.parse(raw)
    } catch {}

    // 3. Load Repos from React Query cache
    const githubRepos = queryClient.getQueryData(['github-repos', handles.github]) || []

    return [
      ...githubRepos.map((r) => ({
        id: `repo-${r.name}`,
        name: r.name,
        category: 'GitHub Repository',
        desc: r.description || 'No description',
        path: '/dashboard/repos',
        icon: FolderGit2,
      })),
      ...projects.map((p) => ({
        id: `project-${p.id}`,
        name: p.name,
        category: 'Tracker Project',
        desc: p.description || p.techStack || 'No description',
        path: '/dashboard/projects',
        icon: FileCode,
      })),
      ...notes.map((n) => ({
        id: `note-${n.id}`,
        name: n.title,
        category: 'Developer Note',
        desc: n.tags || 'General note',
        path: '/dashboard/notes',
        icon: Terminal,
      })),
      ...TOPICS.map((t) => ({
        id: `topic-${t.id}`,
        name: t.name,
        category: 'Learning Topic',
        desc: `Revise and study ${t.name}`,
        path: t.path,
        icon: CheckSquare,
      })),
    ]
  }, [queryClient, handles.github, isOpen])

  // Filter items by search query
  const filtered = useMemo(() => {
    if (!query.trim()) return searchItems.slice(0, 8)
    const q = query.toLowerCase()
    return searchItems.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.desc.toLowerCase().includes(q)
    ).slice(0, 8)
  }, [searchItems, query])

  // Handle select navigation
  const handleSelect = (item) => {
    navigate(item.path)
    onClose()
  }

  // Handle Key navigation inside modal
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filtered.length))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % Math.max(1, filtered.length))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (filtered[selectedIndex]) {
        handleSelect(filtered[selectedIndex])
      }
    } else if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 z-50 flex items-start justify-center pt-[15vh] px-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg glass rounded-xl overflow-hidden border border-hairline bg-gunmetal shadow-2xl"
          >
            {/* Search Input */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-hairline">
              <Search size={18} className="text-chrome-dim shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setSelectedIndex(0)
                }}
                onKeyDown={handleKeyDown}
                placeholder="Search repositories, projects, notes, learning..."
                className="bg-transparent text-sm text-chrome placeholder-chrome-dim outline-none flex-1 border-none"
              />
              <span className="text-[10px] bg-steel text-chrome-dim px-2 py-0.5 rounded font-mono border border-hairline/80 flex items-center gap-1 shrink-0">
                <Keyboard size={10} /> ESC
              </span>
            </div>

            {/* List Results */}
            <div className="max-h-[320px] overflow-y-auto p-2 flex flex-col gap-1 scrollbar-thin">
              {filtered.map((item, index) => {
                const Icon = item.icon
                const isSelected = index === selectedIndex
                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-steel border border-signal-dim/35 text-chrome'
                        : 'bg-transparent border border-transparent text-chrome-dim'
                    }`}
                  >
                    <div className={`p-1.5 rounded-md border shrink-0 ${
                      isSelected ? 'bg-signal/10 border-signal/30 text-signal' : 'bg-void border-hairline text-chrome-dim'
                    }`}>
                      <Icon size={14} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold truncate">{item.name}</span>
                        <span className={`text-[9px] font-mono uppercase tracking-wider font-semibold border px-1.5 py-0.5 rounded ${
                          isSelected ? 'border-signal-dim/30 text-signal bg-signal/5' : 'border-hairline text-chrome-dim/80 bg-void/50'
                        }`}>
                          {item.category}
                        </span>
                      </div>
                      <p className="text-[10px] text-chrome-dim truncate mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                );
              })}

              {filtered.length === 0 && (
                <div className="py-8 text-center text-xs text-chrome-dim font-mono">
                  No records match your query. Try searching for files, tags, or topics.
                </div>
              )}
            </div>

            {/* Footer tips */}
            <div className="px-4 py-2 bg-void/50 border-t border-hairline flex items-center justify-between text-[9px] text-chrome-dim font-mono">
              <span>Use ↑ ↓ keys to navigate, ↵ to select</span>
              <span>Global indexer active</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
