import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Users, X, Trophy, ChevronRight, ArrowUpRight } from 'lucide-react'
import { fetchCommunityStats } from '../services/api/backend'

export default function FloatingUserBubble() {
  const [isOpen, setIsOpen] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  const { data: stats } = useQuery({
    queryKey: ['community-stats'],
    queryFn: fetchCommunityStats,
    staleTime: 10 * 1000,
    refetchInterval: 30 * 1000,
  })

  // Exact real count from MongoDB / auth store
  const userCount = typeof stats?.totalUsers === 'number' ? stats.totalUsers : null
  const displayCount = userCount !== null ? userCount.toLocaleString() : '...'

  if (isDismissed) {
    return (
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={() => setIsDismissed(false)}
        className="fixed bottom-5 right-5 z-40 p-2.5 rounded-full bg-gunmetal/90 border border-hairline/80 text-signal shadow-lg hover:border-signal/50 transition-all cursor-pointer group"
        title="Show total users counter"
      >
        <Users size={16} className="group-hover:scale-110 transition-transform" />
      </motion.button>
    )
  }

  return (
    <div className="fixed bottom-5 right-5 sm:bottom-7 sm:right-7 z-40 select-none">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ type: 'spring', damping: 24, stiffness: 300 }}
            className="mb-2.5 w-72 rounded-2xl glass bg-gunmetal/95 backdrop-blur-2xl border border-hairline/80 shadow-[0_20px_50px_rgba(0,0,0,0.6)] p-3.5 text-chrome overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-hairline/50 pb-2.5 mb-2.5">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-signal opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-signal"></span>
                </span>
                <span className="text-xs font-display font-bold uppercase tracking-wider text-chrome">
                  Community Metrics
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setIsDismissed(true)}
                  className="p-1 rounded-md text-chrome-dim hover:text-chrome hover:bg-steel transition-colors"
                  title="Minimize"
                >
                  <span className="text-xs block leading-none font-mono">_</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-md text-chrome-dim hover:text-chrome hover:bg-steel transition-colors"
                  title="Close popup"
                >
                  <X size={13} />
                </button>
              </div>
            </div>

            {/* Total Users Real Metric */}
            <div className="p-3 rounded-xl bg-void/70 border border-hairline/50 mb-3 flex items-center justify-between">
              <div>
                <span className="block text-[11px] font-sans text-chrome-dim">
                  Total Users on Platform
                </span>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="font-display font-bold text-xl text-chrome leading-none">
                    {displayCount}
                  </span>
                  <span className="text-[11px] font-mono text-signal">
                    registered
                  </span>
                </div>
              </div>
              <div className="w-9 h-9 rounded-xl bg-signal/15 border border-signal/30 flex items-center justify-center text-signal">
                <Users size={17} />
              </div>
            </div>

            {/* Link to Leaderboard */}
            <Link
              to="/dashboard/leaderboard"
              onClick={() => setIsOpen(false)}
              className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-signal/15 to-violet/15 hover:from-signal/25 hover:to-violet/25 border border-signal/25 text-chrome font-sans font-semibold text-xs flex items-center justify-between transition-all group"
            >
              <span className="flex items-center gap-1.5">
                <Trophy size={13} className="text-signal" />
                View Leaderboard
              </span>
              <ChevronRight
                size={13}
                className="text-signal group-hover:translate-x-0.5 transition-transform"
              />
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Levitating Pill / Bubble Trigger */}
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{
          repeat: Infinity,
          duration: 3.6,
          ease: 'easeInOut',
        }}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className="cursor-pointer"
      >
        <div className="glass rounded-full px-3.5 py-2 border border-hairline/80 bg-gunmetal/90 hover:border-signal/50 shadow-[0_10px_30px_rgba(0,0,0,0.45)] hover:shadow-[0_10px_30px_rgba(184,242,47,0.15)] transition-all flex items-center gap-2.5 backdrop-blur-xl">
          {/* Live pulsing radar dot */}
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-signal opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-signal"></span>
          </span>

          {/* User Icon & Genuine Total Count */}
          <div className="flex items-center gap-1.5">
            <Users size={14} className="text-signal" />
            <span className="font-display font-bold text-xs text-chrome tracking-wide">
              {displayCount}
            </span>
            <span className="text-[11px] font-sans text-chrome-dim">
              Total Users
            </span>
          </div>

          <ArrowUpRight
            size={12}
            className={`text-chrome-dim transition-transform duration-200 ${
              isOpen ? 'rotate-90 text-signal' : ''
            }`}
          />
        </div>
      </motion.div>
    </div>
  )
}
