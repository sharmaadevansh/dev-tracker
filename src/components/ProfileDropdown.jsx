import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import {
  Trophy, GraduationCap, Sparkles, Copy, Check,
  User, Sliders, LogOut, X, ArrowUpRight
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useUserHandles } from '../context/UserContext'
import { fetchMyRanking } from '../services/api/backend'

export default function ProfileDropdown({ isOpen, onClose }) {
  const { user, logout } = useAuth()
  const { university } = useUserHandles()
  const navigate = useNavigate()
  const dropdownRef = useRef(null)
  const [copied, setCopied] = useState(false)

  const myRank = useQuery({
    queryKey: ['my-ranking'],
    queryFn: fetchMyRanking,
    enabled: isOpen,
    staleTime: 60 * 1000,
  })

  const publicProfileUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/u/${user?.username || 'dev'}`
    : ''

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        onClose()
      }
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(publicProfileUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleSignOut = () => {
    onClose()
    logout()
    navigate('/login')
  }

  const handleNavigate = (path) => {
    onClose()
    navigate(path)
  }

  const userInitial = user?.username ? user.username[0].toUpperCase() : 'U'
  const displayUni = university || myRank.data?.university || 'Campus league'

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={dropdownRef}
          initial={{ opacity: 0, y: -6, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.98 }}
          transition={{ duration: 0.15 }}
          className="absolute right-0 top-full mt-2 w-80 max-w-[calc(100vw-24px)] rounded-xl bg-gunmetal border border-hairline shadow-lg text-chrome z-50 overflow-hidden flex flex-col p-4 gap-3.5"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-hairline">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-steel border border-hairline flex items-center justify-center text-xs font-semibold text-chrome shrink-0">
                {userInitial}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-chrome truncate">
                  @{user?.username || 'developer'}
                </div>
                <div className="text-[11px] text-chrome-dim truncate">
                  {user?.email || displayUni}
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              aria-label="Close"
              className="w-6 h-6 rounded-md hover:bg-steel flex items-center justify-center text-chrome-dim hover:text-chrome transition-colors cursor-pointer shrink-0"
            >
              <X size={13} />
            </button>
          </div>

          {/* Standings Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2 rounded-lg bg-steel/60 text-center">
              <div className="flex items-center justify-center gap-1 text-[10px] text-chrome-dim">
                <Trophy size={10} />
                <span>Global</span>
              </div>
              <div className="text-xs font-semibold text-chrome mt-0.5">
                {myRank.data?.globalRank ? `#${myRank.data.globalRank}` : '—'}
              </div>
            </div>

            <div className="p-2 rounded-lg bg-steel/60 text-center">
              <div className="flex items-center justify-center gap-1 text-[10px] text-chrome-dim">
                <GraduationCap size={10} />
                <span>Campus</span>
              </div>
              <div className="text-xs font-semibold text-chrome mt-0.5">
                {myRank.data?.universityRank ? `#${myRank.data.universityRank}` : '—'}
              </div>
            </div>

            <div className="p-2 rounded-lg bg-steel/60 text-center">
              <div className="flex items-center justify-center gap-1 text-[10px] text-chrome-dim">
                <Sparkles size={10} />
                <span>Score</span>
              </div>
              <div className="text-xs font-semibold text-chrome mt-0.5">
                {myRank.data?.devScore ?? 0}
              </div>
            </div>
          </div>

          {/* Public Link Bar */}
          <div className="flex items-center justify-between gap-2 p-2 bg-steel/50 border border-hairline rounded-lg">
            <span className="text-[11px] text-chrome-dim truncate flex-1 select-all font-sans">
              /u/{user?.username || 'dev'}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={handleCopy}
                className="px-2 py-1 rounded text-[11px] bg-chrome text-void hover:opacity-90 font-medium transition-opacity cursor-pointer flex items-center gap-1"
              >
                {copied ? <Check size={11} /> : <Copy size={11} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
              <a
                href={`/u/${user?.username || 'dev'}`}
                target="_blank"
                rel="noreferrer"
                className="p-1 rounded text-chrome-dim hover:text-chrome transition-colors"
                title="View public profile"
              >
                <ArrowUpRight size={13} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="pt-2 border-t border-hairline flex items-center justify-between text-xs">
            <button
              onClick={() => handleNavigate('/setup')}
              className="flex items-center gap-1.5 text-chrome-dim hover:text-chrome py-1 transition-colors cursor-pointer"
            >
              <Sliders size={12} />
              <span>Handles</span>
            </button>

            <button
              onClick={() => handleNavigate('/dashboard/profile')}
              className="flex items-center gap-1.5 text-chrome-dim hover:text-chrome py-1 transition-colors cursor-pointer"
            >
              <User size={12} />
              <span>Settings</span>
            </button>

            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 text-red-500 hover:text-red-600 py-1 transition-colors cursor-pointer"
            >
              <LogOut size={12} />
              <span>Sign out</span>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
