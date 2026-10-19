import { useState, useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, Circle, Trash2, Calendar, Target, Flame, Plus, CheckSquare } from 'lucide-react'
import Heatmap from '../components/Heatmap'
import { useAuth } from '../context/AuthContext'
import { getScopedItem, setScopedItem } from '../utils/storage'
import {
  createCollectionItem,
  deleteCollectionItem,
  fetchCollection,
  updateCollectionItem,
} from '../services/api/backend'

const GOALS_STORAGE_KEY = 'goals'

const CATEGORY_COLORS = {
  Coding: 'border-signal/20 text-signal-dim bg-signal/5 glow-cyan',
  Projects: 'border-violet/20 text-violet-dim bg-violet/5 glow-violet',
  Revision: 'border-yellow/20 text-yellow-dim bg-yellow/5',
  Other: 'border-hairline text-chrome-dim bg-steel/20',
}

const DEFAULT_GOALS = []

export default function DailyGoals() {
  const { user } = useAuth()
  const username = user?.username || ''
  const queryClient = useQueryClient()
  const [newGoalText, setNewGoalText] = useState('')
  const [newGoalCategory, setNewGoalCategory] = useState('Coding')

  const { data: remoteGoals } = useQuery({
    queryKey: ['backend-goals', username],
    queryFn: () => fetchCollection('goals'),
    initialData: () => getScopedItem(GOALS_STORAGE_KEY, username, DEFAULT_GOALS),
  })

  const goals = useMemo(() => remoteGoals || [], [remoteGoals])

  const syncGoalsCache = (nextGoals) => {
    queryClient.setQueryData(['backend-goals', username], nextGoals)
    setScopedItem(GOALS_STORAGE_KEY, username, nextGoals)
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
      createdAt: new Date().toISOString(),
    }

    syncGoalsCache([...goals, goal])
    createMutation.mutate(goal)
    setNewGoalText('')
  }

  const toggleGoal = (id) => {
    const nextGoals = goals.map((g) => {
      if (g.id === id) {
        const nextCompleted = !g.completed
        return {
          ...g,
          completed: nextCompleted,
          completedAt: nextCompleted ? new Date().toISOString() : null,
        }
      }
      return g
    })
    syncGoalsCache(nextGoals)
    const nextGoal = nextGoals.find((g) => g.id === id)
    if (nextGoal) updateMutation.mutate(nextGoal)
  }

  const handleDelete = (id) => {
    syncGoalsCache(goals.filter((g) => g.id !== id))
    deleteMutation.mutate(id)
  }

  // Dynamic calculated streak from consecutive active days with completed goals
  const calculatedStreak = useMemo(() => {
    const completedDays = new Set()
    goals.forEach((g) => {
      if (g.completed) {
        const d = (g.completedAt || g.createdAt || '').slice(0, 10)
        if (d) completedDays.add(d)
      }
    })

    if (completedDays.size === 0) return 0

    const today = new Date()
    const todayStr = today.toISOString().slice(0, 10)
    const yesterday = new Date(today)
    yesterday.setDate(today.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().slice(0, 10)

    let checkDate = new Date(today)
    if (!completedDays.has(todayStr)) {
      if (completedDays.has(yesterdayStr)) {
        checkDate = yesterday
      } else {
        return 0
      }
    }

    let count = 0
    while (true) {
      const curStr = checkDate.toISOString().slice(0, 10)
      if (completedDays.has(curStr)) {
        count++
        checkDate.setDate(checkDate.getDate() - 1)
      } else {
        break
      }
    }
    return count
  }, [goals])

  // Real goals activity map for Heatmap component
  const goalsHeatmapData = useMemo(() => {
    const map = {}
    goals.forEach((g) => {
      const d = (g.completedAt || g.createdAt || '').slice(0, 10) || new Date().toISOString().slice(0, 10)
      map[d] = (map[d] || 0) + (g.completed ? 2 : 1)
    })
    return map
  }, [goals])

  const total = goals.length
  const completedCount = goals.filter((g) => g.completed).length
  const completionRate = total > 0 ? Math.round((completedCount / total) * 100) : 0

  const getRatingInfo = (rate) => {
    if (total === 0) return { status: 'STANDBY READY', color: 'text-chrome-dim border-hairline bg-steel/30', text: 'No sprint goals logged today. Add targets above to initiate velocity tracking.' }
    if (rate >= 80) return { status: 'OPTIMAL VELOCITY', color: 'text-signal-dim border-signal/20 bg-signal/5 glow-cyan', text: 'Flawless execution cycle. Maintain output rhythm.' }
    if (rate >= 40) return { status: 'MODERATE MOMENTUM', color: 'text-violet-dim border-violet/20 bg-violet/5 glow-violet', text: 'Steady task pacing. Push to conclude pending items.' }
    return { status: 'CRITICAL LATENCY', color: 'text-yellow-dim border-yellow/20 bg-yellow/5', text: 'Sprint velocity falling behind. Clear bottleneck goals.' }
  }

  const ratingText = getRatingInfo(completionRate)

  return (
    <div className="flex-1 px-4 sm:px-8 md:px-12 py-6 sm:py-8 max-w-7xl mx-auto w-full overflow-y-auto space-y-6 scrollbar-thin">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-hairline pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-chrome tracking-tight">
            Daily Goals
          </h1>
          <p className="text-chrome-dim text-xs sm:text-sm mt-1">
            Track daily coding milestones and habit consistency
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 border border-hairline px-3 py-1 rounded-md bg-steel text-xs text-chrome font-medium">
            <Target size={13} className="text-chrome-dim" />
            <span>{completedCount} of {total} completed</span>
          </div>
          <div className="flex items-center gap-1.5 border border-hairline px-3 py-1 rounded-md bg-steel text-xs text-chrome font-medium">
            <Flame size={13} className="text-chrome-dim" />
            <span>{calculatedStreak}d streak</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Goal Form & Checklists */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Add Goal Input Field */}
          <form onSubmit={handleAddGoal} className="glass p-2 sm:p-2.5 flex flex-col sm:flex-row items-center gap-2">
            <input
              type="text"
              placeholder="Deploy authentication middleware, solve 2 heap questions..."
              value={newGoalText}
              onChange={(e) => setNewGoalText(e.target.value)}
              className="flex-1 bg-transparent px-4 py-2 text-xs text-chrome placeholder-chrome-dim/50 outline-none w-full"
            />
            
            <div className="flex items-center gap-2 w-full sm:w-auto px-2 pb-2 sm:pb-0">
              <select
                value={newGoalCategory}
                onChange={(e) => setNewGoalCategory(e.target.value)}
                className="bg-steel/60 hover:bg-steel border border-hairline text-chrome text-xs rounded-lg px-2.5 py-1.5 outline-none cursor-pointer transition-colors"
              >
                <option value="Coding">Coding</option>
                <option value="Projects">Projects</option>
                <option value="Revision">Revision</option>
                <option value="Other">Other</option>
              </select>

              <button
                type="submit"
                className="flex items-center gap-1.5 bg-chrome text-void hover:opacity-90 transition-opacity font-medium text-xs px-3.5 py-1.5 rounded-lg cursor-pointer shrink-0 ml-auto sm:ml-0"
              >
                <Plus size={13} />
                Add
              </button>
            </div>
          </form>

          {/* Goal List */}
          <div className="space-y-3">
            {goals.length === 0 ? (
              <div className="glass p-8 text-center flex flex-col items-center justify-center space-y-2">
                <CheckSquare size={24} className="text-chrome-dim/40 mb-1" />
                <p className="text-chrome text-sm font-semibold">No Goals Set For Today</p>
                <p className="text-chrome-dim text-xs max-w-sm mt-0.5">Use the quick add bar above to lock in your coding, project, or revision targets for the day.</p>
              </div>
            ) : (
              <AnimatePresence>
                {goals.map((goal) => {
                  const catClass = CATEGORY_COLORS[goal.category] || CATEGORY_COLORS.Other
                  return (
                    <motion.div
                      key={goal.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      layout
                      className={`group glass p-3.5 flex items-center justify-between gap-4 transition-colors hover:border-chrome/20 ${
                        goal.completed ? 'opacity-70' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <button
                          onClick={() => toggleGoal(goal.id)}
                          className="shrink-0 text-chrome-dim hover:text-chrome transition-colors cursor-pointer"
                        >
                          {goal.completed ? (
                            <CheckCircle2 size={16} className="text-chrome" />
                          ) : (
                            <Circle size={16} className="text-chrome-dim/40 hover:text-chrome" />
                          )}
                        </button>

                        <span
                          className={`text-xs text-chrome truncate cursor-pointer select-none ${
                            goal.completed ? 'line-through text-chrome-dim' : ''
                          }`}
                          onClick={() => toggleGoal(goal.id)}
                        >
                          {goal.text}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className={`text-[11px] font-medium border px-2 py-0.5 rounded-md ${catClass}`}>
                          {goal.category}
                        </span>

                        <button
                          onClick={() => handleDelete(goal.id)}
                          className="opacity-0 group-hover:opacity-100 text-chrome-dim hover:text-red-400 transition-opacity p-1 cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            )}
          </div>
        </div>

        {/* Right Side: Score Metric panels */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          
          {/* Progress Widget */}
          <div className="glass p-5 flex flex-col gap-4">
            <h3 className="font-semibold text-chrome text-xs">Performance Gauge</h3>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 relative flex items-center justify-center shrink-0">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="32" cy="32" r="26" stroke="var(--color-steel)" strokeWidth="4.5" fill="transparent" />
                  <circle
                    cx="32"
                    cy="32"
                    r="26"
                    stroke="var(--color-chrome)"
                    strokeWidth="4.5"
                    fill="transparent"
                    strokeDasharray={163.36}
                    strokeDashoffset={163.36 - (163.36 * completionRate) / 100}
                    className="transition-all duration-700"
                  />
                </svg>
                <span className="absolute font-semibold text-xs tabular-nums text-chrome">{completionRate}%</span>
              </div>
              <div className="min-w-0">
                <span className={`text-[11px] font-medium border rounded-md px-2 py-0.5 ${ratingText.color}`}>
                  {ratingText.status}
                </span>
                <p className="text-xs text-chrome-dim mt-1.5 leading-relaxed">{ratingText.text}</p>
              </div>
            </div>

            <div className="border-t border-hairline pt-3 flex justify-between items-center text-xs">
              <span className="text-chrome-dim flex items-center gap-1">
                <Flame size={14} className="text-chrome-dim" /> Current Streak
              </span>
              <span className="font-semibold tabular-nums text-chrome">{calculatedStreak} Days</span>
            </div>
          </div>

          {/* Weekly review heatmap */}
          <div className="glass p-5 flex-1 flex flex-col justify-between min-h-[200px]">
            <div>
              <h3 className="font-semibold text-chrome text-xs flex items-center gap-1.5">
                <Calendar size={13} className="text-chrome-dim" />
                Goals Heatmap
              </h3>
              <p className="text-xs text-chrome-dim mt-0.5">Daily consistency record</p>
            </div>
            
            <div className="flex-1 mt-4 flex items-center justify-center">
              <Heatmap rows={7} cols={4} data={goalsHeatmapData} colorScheme="signal" label="goals" />
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
