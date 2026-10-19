import { useState, useEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, FolderGit2, FileCode, CheckSquare, FileText, Keyboard } from 'lucide-react'
import { useUserHandles } from '../context/UserContext'
import { useAuth } from '../context/AuthContext'
import { getScopedItem } from '../utils/storage'

export default function GlobalSearch({ isOpen, onClose }) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const username = user?.username || ''
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
    // 1. Load Projects from React Query's backend cache, with user-scoped storage fallback
    let projects = queryClient.getQueryData(['backend-projects', username]) || []
    if (!projects.length) {
      projects = getScopedItem('projects', username, [])
    }

    // 2. Load Notes from React Query's backend cache, with user-scoped storage fallback
    let notes = queryClient.getQueryData(['backend-notes', username]) || []
    if (!notes.length) {
      notes = getScopedItem('notes', username, [])
    }

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
        icon: FileText,
      })),
    ]
  }, [queryClient, handles.github, username])

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
            <div className="flex items-center gap-3 px-4 py-3 border-b border-hairline">
              <Search size={16} className="text-chrome-dim shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setSelectedIndex(0)
                }}
                onKeyDown={handleKeyDown}
                placeholder="Search repositories, projects, notes..."
                className="bg-transparent text-xs sm:text-sm text-chrome placeholder-chrome-dim outline-none flex-1 border-none"
              />
              <kbd className="text-[10px] bg-steel text-chrome-dim px-1.5 py-0.5 rounded border border-hairline">
                ESC
              </kbd>
            </div>

            {/* List Results */}
            <div className="max-h-[300px] overflow-y-auto p-1.5 flex flex-col gap-0.5 scrollbar-thin">
              {filtered.map((item, index) => {
                const Icon = item.icon
                const isSelected = index === selectedIndex
                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`flex items-start gap-2.5 p-2.5 rounded-lg cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-steel text-chrome'
                        : 'bg-transparent text-chrome-dim hover:text-chrome'
                    }`}
                  >
                    <div className="p-1 rounded-md bg-steel border border-hairline text-chrome-dim shrink-0 mt-0.5">
                      <Icon size={13} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-medium truncate">{item.name}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-steel text-chrome-dim border border-hairline">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-chrome-dim truncate mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                );
              })}

              {filtered.length === 0 && (
                <div className="py-8 text-center text-xs text-chrome-dim">
                  No records match your query.
                </div>
              )}
            </div>

            {/* Footer tips */}
            <div className="px-4 py-2 bg-void/50 border-t border-hairline flex items-center justify-between text-[11px] text-chrome-dim">
              <span>Use ↑ ↓ to navigate, ↵ to open</span>
              <span>DevTrack Search</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
