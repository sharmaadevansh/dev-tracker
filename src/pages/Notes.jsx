import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, Pin, Trash2, BookOpen, Edit2, Eye, FolderPlus, Tag } from 'lucide-react'

const STORAGE_KEY = 'devtrack_notes'

function loadNotes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return [
    {
      id: 'default-1',
      title: 'Graph Algorithms Cheatsheet',
      content: `# Graph Algorithms

A quick index of essential graph algorithms for DSA rounds:

## 1. Breadth-First Search (BFS)
- **Time Complexity**: \`O(V + E)\`
- **Space Complexity**: \`O(V)\`
- **Use Case**: Shortest path in unweighted graphs.

## 2. Dijkstra's Algorithm
- **Time Complexity**: \`O((V + E) log V)\` using priority queues.
- **Space Complexity**: \`O(V)\`
- **Constraint**: Cannot handle negative edge weights.

> Note: For negative weights, use Bellman-Ford \`O(VE)\`.`,
      folder: 'DSA',
      tags: 'graphs, cheatsheet, algorithms',
      pinned: true,
      updatedAt: new Date().toISOString()
    },
    {
      id: 'default-2',
      title: 'System Design: Scaling Cache Layers',
      content: `# Scaling Caches

Design details for caching:

## Eviction Policies
1. **LRU**: Least Recently Used
2. **LFU**: Least Frequently Used
3. **FIFO**: First In First Out

## Write Strategies
- **Cache-Aside**: Application queries cache first. If cache miss, queries DB, updates cache, and returns.
- **Write-Through**: Updates written to cache and DB simultaneously.`,
      folder: 'System Design',
      tags: 'caching, performance, backend',
      pinned: false,
      updatedAt: new Date().toISOString()
    }
  ]
}

function parseMarkdown(text) {
  if (!text) return ''
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  // Headers
  html = html.replace(/^### (.*$)/gim, '<h4 class="font-display font-semibold text-sm text-chrome mt-3 mb-1">$1</h4>')
  html = html.replace(/^## (.*$)/gim, '<h3 class="font-display font-semibold text-base text-chrome mt-4 mb-1.5">$1</h3>')
  html = html.replace(/^# (.*$)/gim, '<h2 class="font-display font-bold text-lg text-signal mt-5 mb-2">$1</h2>')

  // Bold
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="text-chrome font-semibold">$1</strong>')

  // Italic
  html = html.replace(/\*(.*?)\*/g, '<em class="text-chrome-dim">$1</em>')

  // Code blocks
  html = html.replace(/```([\s\S]*?)```/gm, '<pre class="bg-void border border-hairline rounded-lg p-3 font-mono text-xs text-chrome overflow-x-auto my-2">$1</pre>')

  // Inline code
  html = html.replace(/`(.*?)`/g, '<code class="bg-void px-1.5 py-0.5 rounded text-signal font-mono text-[11px]">$1</code>')

  // Lists
  html = html.replace(/^\s*-\s*(.*$)/gim, '<li class="ml-4 list-disc text-chrome-dim">$1</li>')

  // Blockquotes
  html = html.replace(/^\s*>\s*(.*$)/gim, '<blockquote class="border-l-2 border-signal pl-3 text-chrome-dim italic my-2">$1</blockquote>')

  // Newlines
  html = html.replace(/\n/g, '<br />')

  return html
}

const emptyNote = () => ({
  id: crypto.randomUUID(),
  title: 'Untitled Note',
  content: '',
  folder: 'General',
  tags: '',
  pinned: false,
  updatedAt: new Date().toISOString()
})

export default function Notes() {
  const [notes, setNotes] = useState(loadNotes)
  const [activeId, setActiveId] = useState(null)
  const [search, setSearch] = useState('')
  const [folderFilter, setFolderFilter] = useState('all')
  const [viewMode, setViewMode] = useState('split') // 'edit', 'preview', 'split'
  const [newFolderInput, setNewFolderInput] = useState('')
  const [showNewFolderModal, setShowNewFolderModal] = useState(false)

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes))
  }, [notes])

  // Select first note on load if none active
  useEffect(() => {
    if (notes.length > 0 && !activeId) {
      setActiveId(notes[0].id)
    }
  }, [notes, activeId])

  const activeNote = useMemo(() => {
    return notes.find((n) => n.id === activeId) || null
  }, [notes, activeId])

  // Get unique folders
  const folders = useMemo(() => {
    const defaultFolders = ['General', 'DSA', 'System Design', 'Web Dev']
    const existing = notes.map((n) => n.folder).filter(Boolean)
    return [...new Set([...defaultFolders, ...existing])]
  }, [notes])

  // Create new note
  const handleCreateNote = () => {
    const note = emptyNote()
    setNotes((prev) => [note, ...prev])
    setActiveId(note.id)
  }

  // Update active note details
  const updateActiveNote = (key, value) => {
    setNotes((prev) =>
      prev.map((n) =>
        n.id === activeId ? { ...n, [key]: value, updatedAt: new Date().toISOString() } : n
      )
    )
  }

  // Delete note
  const handleDeleteNote = (id, e) => {
    e.stopPropagation()
    setNotes((prev) => prev.filter((n) => n.id !== id))
    if (activeId === id) {
      setActiveId(notes.length > 1 ? notes.find((n) => n.id !== id).id : null)
    }
  }

  // Add folder
  const handleAddFolder = () => {
    if (newFolderInput.trim() && !folders.includes(newFolderInput.trim())) {
      updateActiveNote('folder', newFolderInput.trim())
      setNewFolderInput('')
      setShowNewFolderModal(false)
    }
  }

  // Filter notes
  const filteredNotes = useMemo(() => {
    return notes
      .filter((n) => {
        const matchesSearch =
          n.title.toLowerCase().includes(search.toLowerCase()) ||
          n.content.toLowerCase().includes(search.toLowerCase()) ||
          n.tags.toLowerCase().includes(search.toLowerCase())
        const matchesFolder = folderFilter === 'all' || n.folder === folderFilter
        return matchesSearch && matchesFolder
      })
      .sort((a, b) => {
        if (a.pinned && !b.pinned) return -1
        if (!a.pinned && b.pinned) return 1
        return new Date(b.updatedAt) - new Date(a.updatedAt)
      })
  }, [notes, search, folderFilter])

  return (
    <div className="flex-1 flex bg-void h-full overflow-hidden">
      {/* Note List Sidebar */}
      <aside className="w-72 border-r border-hairline bg-gunmetal/40 flex flex-col h-full shrink-0">
        <div className="p-4 border-b border-hairline flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="font-display font-semibold text-chrome text-[15px]">Notes</span>
            <button
              onClick={handleCreateNote}
              className="w-7 h-7 bg-signal hover:bg-signal-dim rounded-full flex items-center justify-center text-white transition-colors cursor-pointer"
            >
              <Plus size={15} />
            </button>
          </div>

          {/* Search */}
          <div className="flex items-center gap-2 bg-steel/80 border border-hairline rounded-full px-4 py-1.5">
            <Search size={14} className="text-chrome-dim" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notes, tags..."
              className="bg-transparent outline-none text-xs flex-1 text-chrome"
            />
          </div>

          {/* Folder Filter */}
          <select
            value={folderFilter}
            onChange={(e) => setFolderFilter(e.target.value)}
            className="bg-steel/80 border border-hairline rounded-full px-4 py-1.5 text-xs text-chrome outline-none"
          >
            <option value="all">All folders</option>
            {folders.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>

        {/* Scrollable Note Cards */}
        <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1.5 scrollbar-thin">
          {filteredNotes.map((n) => (
            <div
              key={n.id}
              onClick={() => setActiveId(n.id)}
              className={`p-3 rounded-lg border cursor-pointer relative group transition-colors ${
                n.id === activeId
                  ? 'bg-steel border-signal-dim text-chrome'
                  : 'bg-transparent border-transparent hover:bg-steel/40 text-chrome-dim'
              }`}
            >
              <div className="flex items-start justify-between gap-1.5">
                <span className="text-xs font-semibold font-display truncate max-w-[80%]">
                  {n.title || 'Untitled Note'}
                </span>
                <div className="flex items-center gap-1.5 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                  {n.pinned && <Pin size={11} className="text-signal" />}
                  <button
                    onClick={(e) => handleDeleteNote(n.id, e)}
                    className="text-chrome-dim hover:text-signal opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>
              <p className="text-[10px] text-chrome-dim truncate mt-1">
                {n.content ? n.content.replace(/[#*`>]/g, '') : 'Empty note'}
              </p>
              <div className="flex items-center justify-between mt-2 text-[9px] font-mono">
                <span className="text-signal">{n.folder}</span>
                <span>{new Date(n.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}

          {filteredNotes.length === 0 && (
            <p className="text-xs text-chrome-dim text-center py-8">No notes matches filter.</p>
          )}
        </div>
      </aside>

      {/* Editor & Preview Workspace */}
      {activeNote ? (
        <main className="flex-1 flex flex-col h-full bg-void">
          {/* Editor Header controls */}
          <div className="p-4 border-b border-hairline flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              {/* Pin option */}
              <button
                onClick={() => updateActiveNote('pinned', !activeNote.pinned)}
                className={`p-1.5 border rounded-full transition-colors cursor-pointer ${
                  activeNote.pinned
                    ? 'border-signal bg-signal/5 text-signal'
                    : 'border-hairline text-chrome-dim hover:text-chrome'
                }`}
              >
                <Pin size={13} />
              </button>

              {/* Folder Selector */}
              <select
                value={activeNote.folder}
                onChange={(e) => updateActiveNote('folder', e.target.value)}
                className="bg-gunmetal border border-hairline rounded-full px-4 py-1.5 text-xs text-chrome outline-none font-mono"
              >
                {folders.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>

              <button
                onClick={() => setShowNewFolderModal(true)}
                className="text-chrome-dim hover:text-signal text-xs flex items-center gap-1 font-mono transition-colors cursor-pointer"
              >
                <FolderPlus size={13} /> new folder
              </button>
            </div>

            {/* View selectors */}
            <div className="flex items-center border border-hairline rounded-full p-0.5 bg-gunmetal">
              <button
                onClick={() => setViewMode('edit')}
                className={`px-2 py-1 rounded text-xs font-mono flex items-center gap-1 transition-colors ${
                  viewMode === 'edit' ? 'bg-steel text-chrome' : 'text-chrome-dim hover:text-chrome'
                }`}
              >
                <Edit2 size={11} /> Write
              </button>
              <button
                onClick={() => setViewMode('preview')}
                className={`px-2 py-1 rounded text-xs font-mono flex items-center gap-1 transition-colors ${
                  viewMode === 'preview' ? 'bg-steel text-chrome' : 'text-chrome-dim hover:text-chrome'
                }`}
              >
                <Eye size={11} /> Preview
              </button>
              <button
                onClick={() => setViewMode('split')}
                className={`px-2 py-1 rounded text-xs font-mono flex items-center gap-1 transition-colors ${
                  viewMode === 'split' ? 'bg-steel text-chrome' : 'text-chrome-dim hover:text-chrome'
                }`}
              >
                <BookOpen size={11} /> Split
              </button>
            </div>
          </div>

          {/* Title & Tags headers */}
          <div className="px-6 py-4 border-b border-hairline/50 flex flex-col gap-2 shrink-0">
            <input
              value={activeNote.title}
              onChange={(e) => updateActiveNote('title', e.target.value)}
              placeholder="Title your note..."
              className="bg-transparent border-none outline-none font-display font-semibold text-lg text-chrome placeholder-chrome-dim"
            />
            <div className="flex items-center gap-2 text-xs text-chrome-dim">
              <Tag size={12} className="text-signal shrink-0" />
              <input
                value={activeNote.tags}
                onChange={(e) => updateActiveNote('tags', e.target.value)}
                placeholder="tags (comma separated, e.g. dfs, recursion)"
                className="bg-transparent border-none outline-none flex-1 font-mono text-[11px] text-chrome-dim placeholder-chrome-dim/40"
              />
            </div>
          </div>

          {/* Editor Grid */}
          <div className="flex-1 flex overflow-hidden">
            {/* Markdown Textarea */}
            {(viewMode === 'edit' || viewMode === 'split') && (
              <textarea
                value={activeNote.content}
                onChange={(e) => updateActiveNote('content', e.target.value)}
                placeholder="# Type your markdown here..."
                className={`flex-1 p-6 bg-transparent text-chrome font-mono text-xs border-none outline-none resize-none overflow-y-auto leading-relaxed scrollbar-thin ${
                  viewMode === 'split' ? 'border-r border-hairline/50' : ''
                }`}
              />
            )}

            {/* Markdown Preview Area */}
            {(viewMode === 'preview' || viewMode === 'split') && (
              <div
                className="flex-1 p-6 overflow-y-auto leading-relaxed text-chrome-dim text-sm select-text scrollbar-thin"
                dangerouslySetInnerHTML={{ __html: parseMarkdown(activeNote.content) }}
              />
            )}
          </div>
        </main>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-xs text-chrome-dim">No notes available. Create one to begin writing.</p>
        </div>
      )}

      {/* New Folder Modal */}
      <AnimatePresence>
        {showNewFolderModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
            onClick={() => setShowNewFolderModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="glass rounded-xl p-5 w-72 flex flex-col gap-3 bg-gunmetal"
            >
              <h3 className="font-display font-semibold text-chrome text-xs">Create Folder</h3>
              <input
                autoFocus
                value={newFolderInput}
                onChange={(e) => setNewFolderInput(e.target.value)}
                placeholder="Folder name (e.g. System Design)"
                className="bg-void border border-hairline rounded-lg px-3 py-2 text-xs text-chrome outline-none focus:border-signal"
              />
              <div className="flex gap-2 justify-end mt-2">
                <button
                  onClick={() => setShowNewFolderModal(false)}
                  className="px-3 py-1.5 rounded text-xs text-chrome-dim hover:text-chrome"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddFolder}
                  className="px-3 py-1.5 rounded bg-signal hover:bg-signal-dim text-white text-xs font-semibold"
                >
                  Create
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
