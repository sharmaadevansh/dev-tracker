import { useState, useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, Circle, Trash2, Calendar, Target, Flame, Plus } from 'lucide-react'
import Heatmap from '../components/Heatmap'
import {
  createCollectionItem,
  deleteCollectionItem,
  fetchCollection,
  updateCollectionItem,
} from '../services/api/backend'

const STORAGE_KEY = 'devtrack_goals'

const CATEGORY_COLORS = {
  Coding: 'border-signal/20 text-signal-dim bg-signal/5 glow-cyan',
  Projects: 'border-violet/20 text-violet-dim bg-violet/5 glow-violet',
  Revision: 'border-yellow/20 text-yellow-dim bg-yellow/5',
  Other: 'border-hairline text-chrome-dim bg-steel/20',
}

const DEFAULT_GOALS = [
  {
    id: 'goal-1',
    text: 'Solve 3 LeetCode Medium questions (Dynamic Programming)',
    category: 'Coding',
    completed: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'goal-2',
    text: 'Complete CRUD schema & tests in Project page',
    category: 'Projects',
    completed: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'goal-3',
    text: 'Revise Virtual Memory & Page Replacement algorithms',
    category: 'Revision',
    completed: false,
    createdAt: new Date().toISOString()
  }
]

function loadGoals() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : DEFAULT_GOALS
  } catch {
    return DEFAULT_GOALS
  }
}

export default function DailyGoals() {
  const queryClient = useQueryClient()
  const [newGoalText, setNewGoalText] = useState('')
  const [newGoalCategory, setNewGoalCategory] = useState('Coding')
  const [streak, setStreak] = useState(4)

  const { data: remoteGoals } = useQuery({
    queryKey: ['backend-goals'],
    queryFn: () => fetchCollection('goals'),
    initialData: loadGoals,
  })

  const goals = remoteGoals || []

  const syncGoalsCache = (nextGoals) => {
    queryClient.setQueryData(['backend-goals'], nextGoals)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextGoals))
  }

  const createMutation = useMutation({
    mutationFn: (goal) => createCollectionItem('goals', goal),
    onSuccess: (goal) => syncGoalsCache([goal, ...goals.filter((g) => g.id !== goal.id)]),
  })

  const updateMutation = useMutation({
    mutationFn: (goal) => updateCollectionItem('goals', goal.id, goal),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteCollectionItem('goals', id),
  })

  const handleAddGoal = (e) => {
    e.preventDefault()
    if (!newGoalText.trim()) return

    const goal = {
      id: crypto.randomUUID(),
      text: newGoalText.trim(),
      category: newGoalCategory,
      completed: false,
      createdAt: new Date().toISOString()
    }

    syncGoalsCache([...goals, goal])
    createMutation.mutate(goal)
    setNewGoalText('')
  }

  const toggleGoal = (id) => {
    const nextGoals = goals.map((g) => (g.id === id ? { ...g, completed: !g.completed } : g))
    syncGoalsCache(nextGoals)
    const nextGoal = nextGoals.find((g) => g.id === id)
    if (nextGoal) updateMutation.mutate(nextGoal)
  }

  const handleDelete = (id) => {
    syncGoalsCache(goals.filter((g) => g.id !== id))
    deleteMutation.mutate(id)
  }

  const totalCount = goals.length
  const completedCount = goals.filter((g) => g.completed).length
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  const ratingText = useMemo(() => {
    if (completionRate === 100) return { status: 'OPTIMAL', text: 'All targets secured! Excellent consistency.', color: 'text-green-500 border-green-500/20 bg-green-500/5' }
    if (completionRate >= 70) return { status: 'ON TRACK', text: 'Critical targets cleared.', color: 'text-yellow-dim border-yellow/20 bg-yellow/5' }
    if (completionRate > 0) return { status: 'WARNING', text: 'Incomplete tasks remain.', color: 'text-signal-dim border-signal/20 bg-signal/5' }
    return { status: 'STAGNANT', text: 'No targets completed yet.', color: 'text-chrome-dim border-hairline bg-steel/10' }
  }, [completionRate])

  return (
    <div className="flex-1 px-12 py-10 max-w-7xl mx-auto w-full overflow-y-auto space-y-8 scrollbar-thin">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-chrome">Daily Goals</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Columns: Todays Tasks */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Add Goal Form */}
          <div className="glass rounded-[36px] p-6 bg-gunmetal/30 border-hairline">
            <h3 className="font-display font-semibold text-chrome text-xs mb-3">Set New Objective</h3>
            <form onSubmit={handleAddGoal} className="flex gap-3">
              <input
                value={newGoalText}
                onChange={(e) => setNewGoalText(e.target.value)}
                placeholder="Ex. Refactor auth hook context..."
                required
                className="bg-void border border-hairline rounded-full px-4 py-2 text-xs flex-1 text-chrome outline-none focus:border-signal"
              />
              <select
                value={newGoalCategory}
                onChange={(e) => setNewGoalCategory(e.target.value)}
                className="bg-void border border-hairline rounded-full px-4 py-2 text-xs text-chrome outline-none focus:border-signal font-mono"
              >
                <option>Coding</option>
                <option>Projects</option>
                <option>Revision</option>
                <option>Other</option>
              </select>
              <button
                type="submit"
                className="bg-gradient-to-r from-signal to-violet hover:opacity-90 transition-all text-void font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-full flex items-center gap-1 shrink-0 cursor-pointer hover:shadow-[0_0_10px_rgba(0,0,0,0.26)]"
              >
                <Plus size={14} /> Add
              </button>
            </form>
          </div>

          {/* Goal List Box */}
          <div className="glass rounded-[36px] p-6 bg-gunmetal/30 border-hairline flex-1 flex flex-col min-h-[300px]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-display font-semibold text-chrome text-xs">Today's Focus Checklist</h3>
              <span className="text-[10px] text-chrome-dim font-mono">{completedCount}/{totalCount} Completed</span>
            </div>

            <div className="flex-1 flex flex-col gap-2.5">
              <AnimatePresence initial={false}>
                {goals.map((g) => (
                  <motion.div
                    key={g.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -15 }}
                    className="flex items-center justify-between p-3.5 rounded-[24px] border border-hairline/60 bg-void/35 hover:border-signal-dim/35 transition-all duration-300"
                  >
                    <button
                      onClick={() => toggleGoal(g.id)}
                      className="flex items-start gap-3 text-left flex-1 cursor-pointer"
                    >
                      <span className="shrink-0 mt-0.5 text-signal">
                        {g.completed 
                          ? <CheckCircle2 size={16} className="text-signal-dim shrink-0" /> 
                          : <Circle size={16} className="text-chrome-dim/60 shrink-0" />}
                      </span>
                      <div className="min-w-0">
                        <p className={`text-xs text-chrome font-medium ${g.completed ? 'line-through opacity-45' : ''}`}>
                          {g.text}
                        </p>
                        <span className={`inline-block border text-[8px] font-mono uppercase tracking-wider font-semibold rounded-full px-2.5 py-0.5 mt-1.5 ${CATEGORY_COLORS[g.category]}`}>
                          {g.category}
                        </span>
                      </div>
                    </button>
                    <button
                      onClick={() => handleDelete(g.id)}
                      className="text-chrome-dim hover:text-signal transition-colors ml-3 cursor-pointer shrink-0"
                    >
                      <Trash2 size={13} />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>

              {goals.length === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border border-dashed border-hairline rounded-[20px]">
                  <Target size={26} className="text-chrome-dim mb-2" />
                  <p className="text-xs text-chrome-dim">All clean! Create a goal above to initialize your pipeline.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Score Metric panels */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          
          {/* Progress Widget */}
          <div className="glass rounded-[36px] p-6 bg-gunmetal/30 border-hairline flex flex-col gap-5">
            <h3 className="font-display font-semibold text-chrome text-xs">Performance Gauge</h3>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 relative flex items-center justify-center shrink-0">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="32" cy="32" r="26" stroke="var(--color-steel)" strokeWidth="4.5" fill="transparent" />
                  <circle
                    cx="32"
                    cy="32"
                    r="26"
                    stroke="var(--color-signal)"
                    strokeWidth="4.5"
                    fill="transparent"
                    strokeDasharray={163.36}
                    strokeDashoffset={163.36 - (163.36 * completionRate) / 100}
                    className="transition-all duration-700"
                  />
                </svg>
                <span className="absolute font-mono font-bold text-xs text-chrome">{completionRate}%</span>
              </div>
              <div className="min-w-0">
                <span className={`text-[9px] font-bold font-mono border rounded-full px-2.5 py-0.5 ${ratingText.color}`}>
                  {ratingText.status}
                </span>
                <p className="text-[11px] text-chrome-dim mt-2 leading-relaxed font-mono">{ratingText.text}</p>
              </div>
            </div>

            <div className="border-t border-hairline/50 pt-3 mt-1 flex justify-between items-center text-xs">
              <span className="text-chrome-dim flex items-center gap-1">
                <Flame size={14} className="text-signal" /> Current Streak
              </span>
              <span className="font-mono font-bold text-chrome">{streak} Days</span>
            </div>
          </div>

          {/* Weekly review heatmap */}
          <div className="glass rounded-[36px] p-6 bg-gunmetal/30 border-hairline flex-1 flex flex-col justify-between min-h-[220px]">
            <div>
              <h3 className="font-display font-semibold text-chrome text-xs flex items-center gap-1.5">
                <Calendar size={13} className="text-signal" />
                Goals Heatmap
              </h3>
              <p className="text-[10px] text-chrome-dim mt-0.5">Review targets and check last active day</p>
            </div>
            
            <div className="flex-1 mt-4 flex items-center justify-center">
              <Heatmap rows={7} cols={4} lastActiveDayIndex={27} />
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
