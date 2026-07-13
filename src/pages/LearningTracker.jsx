import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Save, CheckCircle2, Circle, ClipboardList, PenTool, X, Award } from 'lucide-react'

const STORAGE_KEY = 'devtrack_learning'

const DEFAULT_TOPICS = [
  {
    id: 'js',
    name: 'JavaScript',
    notes: 'Focus on closures, prototypes, event loops, and asynchronous JavaScript engines.',
    targetDate: '',
    subtopics: [
      { name: 'Closures, Lexical Scope & Hoisting', completed: false },
      { name: 'Prototype Chain & Object Oriented JS', completed: false },
      { name: 'Event Loop, Microtasks & Macrotasks', completed: false },
      { name: 'Promises, Async/Await & Custom Promises', completed: false },
      { name: 'ES6+ Features & Standard Web APIs', completed: false },
    ]
  },
  {
    id: 'react',
    name: 'React',
    notes: 'Master hooks, state modeling, React Query, and rendering lifecycles.',
    targetDate: '',
    subtopics: [
      { name: 'State, Props & Lifecycle hooks', completed: false },
      { name: 'Advanced Hooks (useCallback, useMemo, custom hooks)', completed: false },
      { name: 'Context API & Centralized State', completed: false },
      { name: 'React Query & Server Cache', completed: false },
      { name: 'Virtual DOM, Fiber Architecture & Reconciliation', completed: false },
    ]
  },
  {
    id: 'node',
    name: 'Node.js',
    notes: 'Deep-dive into event-driven design, buffers, streams, and worker threads.',
    targetDate: '',
    subtopics: [
      { name: 'Event Loop & EventEmitter pattern', completed: false },
      { name: 'Buffer & Stream Management', completed: false },
      { name: 'Cluster Module & Child Processes', completed: false },
      { name: 'File System (fs) & Path APIs', completed: false },
      { name: 'Security & Error handling practices', completed: false },
    ]
  },
  {
    id: 'express',
    name: 'Express',
    notes: 'Learn custom middlewares, routing patterns, and security modules.',
    targetDate: '',
    subtopics: [
      { name: 'Middleware Pipeline & Custom Middlewares', completed: false },
      { name: 'Router & Parameter Sanitization', completed: false },
      { name: 'Global Exception Handling & Logging', completed: false },
      { name: 'Security Headers (Helmet, CORS)', completed: false },
      { name: 'Rate Limiter & Speed Limiting', completed: false },
    ]
  },
  {
    id: 'mongodb',
    name: 'MongoDB',
    notes: 'Understand index compilation, aggregation frameworks, and replica sets.',
    targetDate: '',
    subtopics: [
      { name: 'BSON Data Modeling & Schema Design', completed: false },
      { name: 'Indexing (Single, Compound, TTL, Text)', completed: false },
      { name: 'Aggregation Pipeline stages', completed: false },
      { name: 'Transactions & ACID compatibility', completed: false },
      { name: 'Replica Sets & Sharding architecture', completed: false },
    ]
  },
  {
    id: 'system-design',
    name: 'System Design',
    notes: 'Practice scaling architectures, load balancers, caching layers, and database sharding.',
    targetDate: '',
    subtopics: [
      { name: 'Load Balancers & Reverse Proxies', completed: false },
      { name: 'Horizontal Scaling vs Vertical Scaling', completed: false },
      { name: 'Caching Strategies (Write-through, Cache-aside)', completed: false },
      { name: 'Database Partitioning, Replication & Sharding', completed: false },
      { name: 'Microservices & Message Queues (Kafka, RabbitMQ)', completed: false },
    ]
  },
  {
    id: 'os',
    name: 'Operating Systems',
    notes: 'Revise process management, scheduling, virtual memory, and deadlocks.',
    targetDate: '',
    subtopics: [
      { name: 'Process vs Thread & Context Switching', completed: false },
      { name: 'CPU Scheduling Algorithms (Round Robin, SRTF)', completed: false },
      { name: 'Virtual Memory, Paging & Segmentation', completed: false },
      { name: 'Deadlock Conditions & Avoidance (Banker\'s Algorithm)', completed: false },
      { name: 'Inter-Process Communication (IPC) & Semaphores', completed: false },
    ]
  },
  {
    id: 'dbms',
    name: 'DBMS',
    notes: 'Revise normalization rules, SQL locks, indexing structures, and transaction properties.',
    targetDate: '',
    subtopics: [
      { name: 'Entity-Relationship Diagrams & Mapping', completed: false },
      { name: 'SQL Normalization (1NF, 2NF, 3NF, BCNF)', completed: false },
      { name: 'ACID Properties & Transaction Isolation Levels', completed: false },
      { name: 'B-Trees & B+ Trees Indexing structures', completed: false },
      { name: 'Joins, Subqueries & Query Plan Optimizations', completed: false },
    ]
  },
  {
    id: 'networks',
    name: 'Computer Networks',
    notes: 'Study TCP/IP protocols, DNS lookups, TCP handshakes, and SSL/TLS structures.',
    targetDate: '',
    subtopics: [
      { name: 'OSI Model Layers & TCP/IP Protocol Stack', completed: false },
      { name: 'TCP 3-Way Handshake & Congestion Control', completed: false },
      { name: 'DNS resolution lookup steps', completed: false },
      { name: 'HTTP vs HTTPS & SSL/TLS Handshake layers', completed: false },
      { name: 'WebSockets vs HTTP Long Polling vs SSE', completed: false },
    ]
  },
  {
    id: 'oop',
    name: 'OOP',
    notes: 'Solidify object-oriented pillars, SOLID architecture design, and design patterns.',
    targetDate: '',
    subtopics: [
      { name: 'Four Pillars: Encapsulation, Inheritance, Polymorphism, Abstraction', completed: false },
      { name: 'SOLID Design Principles', completed: false },
      { name: 'Creational Patterns (Singleton, Factory, Builder)', completed: false },
      { name: 'Structural Patterns (Adapter, Decorator, Proxy)', completed: false },
      { name: 'Behavioral Patterns (Observer, Strategy, State)', completed: false },
    ]
  }
]

function loadLearningData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_TOPICS
    const parsed = JSON.parse(raw)
    return DEFAULT_TOPICS.map((def) => {
      const match = parsed.find((p) => p.id === def.id)
      if (!match) return def
      return {
        ...def,
        notes: match.notes !== undefined ? match.notes : def.notes,
        targetDate: match.targetDate || '',
        subtopics: def.subtopics.map((s) => {
          const subMatch = match.subtopics?.find((ms) => ms.name === s.name)
          return subMatch ? { ...s, completed: subMatch.completed } : s
        })
      }
    })
  } catch {
    return DEFAULT_TOPICS
  }
}

export default function LearningTracker() {
  const [topics, setTopics] = useState(loadLearningData)
  const [activeTopic, setActiveTopic] = useState(null)
  const [draftNotes, setDraftNotes] = useState('')
  const [draftDate, setDraftDate] = useState('')

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(topics))
  }, [topics])

  const calculateCompletion = (subtopics) => {
    if (!subtopics || !subtopics.length) return 0
    const done = subtopics.filter((s) => s.completed).length
    return Math.round((done / subtopics.length) * 100)
  }

  const toggleSubtopic = (topicId, subName) => {
    setTopics((prev) =>
      prev.map((t) => {
        if (t.id !== topicId) return t
        const updatedSubs = t.subtopics.map((s) =>
          s.name === subName ? { ...s, completed: !s.completed } : s
        )
        return {
          ...t,
          subtopics: updatedSubs
        }
      })
    )
  }

  const openDetails = (topic) => {
    setActiveTopic(topic)
    setDraftNotes(topic.notes)
    setDraftDate(topic.targetDate || '')
  }

  const saveDetails = () => {
    setTopics((prev) =>
      prev.map((t) =>
        t.id === activeTopic.id ? { ...t, notes: draftNotes, targetDate: draftDate } : t
      )
    )
    setActiveTopic(null)
  }

  const totalSubtopicsCount = topics.reduce((sum, t) => sum + t.subtopics.length, 0)
  const completedSubtopicsCount = topics.reduce(
    (sum, t) => sum + t.subtopics.filter((s) => s.completed).length,
    0
  )
  const overallProgress = Math.round((completedSubtopicsCount / totalSubtopicsCount) * 100)

  return (
    <div className="flex-1 px-12 py-10 max-w-7xl mx-auto w-full overflow-y-auto space-y-8 scrollbar-thin">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-chrome">Learning Tracker</h1>
        </div>
        
        {/* Global Progress Header Widget (Circular/Oval structure) */}
        <div className="glass rounded-[36px] p-4 flex items-center gap-5 bg-gunmetal/40 border-hairline min-w-[260px] justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full border border-signal-dim/30 bg-signal/5 flex items-center justify-center text-signal shrink-0">
              <Award size={18} />
            </div>
            <span className="text-[10px] text-chrome font-bold font-mono tracking-wider">OVERALL SYLLABUS</span>
          </div>

          <div className="w-12 h-12 relative flex items-center justify-center shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="24" cy="24" r="20" stroke="var(--color-steel)" strokeWidth="3.5" fill="transparent" />
              <circle
                cx="24"
                cy="24"
                r="20"
                stroke="var(--color-signal)"
                strokeWidth="3.5"
                fill="transparent"
                strokeDasharray={125.6}
                strokeDashoffset={125.6 - (125.6 * overallProgress) / 100}
                className="transition-all duration-700"
              />
            </svg>
            <span className="absolute font-mono text-[10px] font-bold text-chrome">{overallProgress}%</span>
          </div>
        </div>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
        {topics.map((t) => {
          const progress = calculateCompletion(t.subtopics)
          return (
            <motion.div
              key={t.id}
              layoutId={`card-${t.id}`}
              className="glass rounded-[36px] p-6 hover:border-signal-dim/60 transition-colors bg-gunmetal/30 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-display font-semibold text-chrome text-[15px]">{t.name}</h3>
                  
                  {/* Circular/Oval Progress Ring */}
                  <div className="w-10 h-10 relative flex items-center justify-center shrink-0">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="20" cy="20" r="16" stroke="var(--color-steel)" strokeWidth="3" fill="transparent" />
                      <circle
                        cx="20"
                        cy="20"
                        r="16"
                        stroke="var(--color-signal)"
                        strokeWidth="3"
                        fill="transparent"
                        strokeDasharray={100.48}
                        strokeDashoffset={100.48 - (100.48 * progress) / 100}
                        className="transition-all duration-500"
                      />
                    </svg>
                    <span className="absolute font-mono text-[9px] font-bold text-chrome">{progress}%</span>
                  </div>
                </div>

                {/* Subtopics Checklist Preview (Circular shapes) */}
                <div className="flex flex-col gap-2.5 my-4">
                  {t.subtopics.map((sub) => (
                    <button
                      key={sub.name}
                      onClick={() => toggleSubtopic(t.id, sub.name)}
                      className="flex items-start gap-2.5 text-left text-xs text-chrome-dim hover:text-chrome transition-colors"
                    >
                      <span className="shrink-0 mt-0.5 text-signal/80">
                        {sub.completed 
                          ? <CheckCircle2 size={15} className="text-signal-dim shrink-0" /> 
                          : <Circle size={15} className="text-chrome-dim/50 shrink-0" />}
                      </span>
                      <span className={sub.completed ? 'line-through opacity-45 truncate' : 'truncate'}>
                        {sub.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Study Heatmap Strip */}
              <div className="mt-4 pt-3.5 border-t border-hairline/40 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[9px] text-chrome-dim font-bold uppercase tracking-wider font-mono">Revision Logs</p>
                  <span className="text-[9px] text-chrome-dim/60 font-mono mt-0.5">
                    {t.targetDate ? `target: ${t.targetDate}` : 'no target set'}
                  </span>
                </div>
                <div className="flex gap-1 items-center shrink-0">
                  {Array.from({ length: 8 }).map((_, idx) => {
                    const isActive = idx === 7
                    const isMed = idx === 3 || idx === 5
                    return (
                      <div
                        key={idx}
                        title={isActive ? 'Last active session: Today' : 'Logs recorded'}
                        className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                          isActive 
                            ? 'bg-signal border border-signal ring-1 ring-signal/30 led-pulse scale-110 shadow-[0_0_8px_rgba(0,0,0,0.3)]' 
                            : isMed 
                              ? 'bg-signal/40 border border-signal/20' 
                              : 'bg-steel/30 border border-hairline/25'
                        }`}
                      />
                    )
                  })}
                </div>
              </div>

              <div className="mt-3 pt-3.5 border-t border-hairline/30 flex items-center justify-end">
                <button
                  onClick={() => openDetails(t)}
                  className="text-[10px] text-chrome-dim hover:text-signal transition-colors flex items-center gap-1 font-mono cursor-pointer"
                >
                  <PenTool size={11} /> notes & details
                </button>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Slide-out detail editor pane (Overlay Modal) */}
      <AnimatePresence>
        {activeTopic && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4"
            onClick={() => setActiveTopic(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="glass rounded-[28px] p-6 w-full max-w-md flex flex-col gap-4 bg-gunmetal"
            >
              <div className="flex items-center justify-between pb-2 border-b border-hairline">
                <h3 className="font-display font-semibold text-chrome flex items-center gap-2">
                  <ClipboardList size={16} className="text-signal" />
                  Edit {activeTopic.name} Details
                </h3>
                <button onClick={() => setActiveTopic(null)} className="text-chrome-dim hover:text-chrome">
                  <X size={18} />
                </button>
              </div>

              {/* Target Date */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-widest text-chrome-dim font-bold font-mono">Target Date</label>
                <input
                  type="date"
                  value={draftDate}
                  onChange={(e) => setDraftDate(e.target.value)}
                  className="bg-void border border-hairline rounded-full px-4 py-2 text-xs text-chrome outline-none focus:border-signal"
                />
              </div>

              {/* Subject Notes */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-widest text-chrome-dim font-bold font-mono">Personal Notes</label>
                <textarea
                  value={draftNotes}
                  onChange={(e) => setDraftNotes(e.target.value)}
                  placeholder="Insert links, concepts, or subtopics to check out..."
                  rows={4}
                  className="bg-void border border-hairline rounded-[20px] px-4 py-3 text-xs text-chrome outline-none focus:border-signal resize-none scrollbar-thin leading-relaxed"
                />
              </div>

              <button
                onClick={saveDetails}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-signal to-violet hover:opacity-90 text-void font-bold text-xs uppercase tracking-wider py-2.5 rounded-full transition-colors cursor-pointer"
              >
                <Save size={14} /> Save Target & Notes
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
