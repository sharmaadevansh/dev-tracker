import { useState, useEffect } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import {
  Code2, Search, LogOut, User, Sun, Moon, Menu, X,
  LayoutDashboard, Trophy, Activity, GitFork, FolderKanban,
  CheckSquare, FileText, FileSpreadsheet, Sliders, ChevronDown
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import GlobalSearch from './GlobalSearch'
import ProfileDropdown from './ProfileDropdown'

const navItems = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { to: '/dashboard/leaderboard', label: 'Leaderboard', icon: Trophy },
  { to: '/dashboard/analytics', label: 'Analytics', icon: Activity },
  { to: '/dashboard/repos', label: 'Repositories', icon: GitFork },
  { to: '/dashboard/projects', label: 'Projects', icon: FolderKanban },
  { to: '/dashboard/goals', label: 'Daily Goals', icon: CheckSquare },
  { to: '/dashboard/notes', label: 'Notes', icon: FileText },
  { to: '/dashboard/resume', label: 'Resume', icon: FileSpreadsheet },
  { to: '/setup', label: 'Handles', icon: Sliders },
  { to: '/dashboard/profile', label: 'Profile', icon: User },
]

export default function Navbar() {
  const { logout, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchOpen, setSearchOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [isDark, setIsDark] = useState(() => {
    try {
      const saved = localStorage.getItem('devtrack_theme')
      if (saved) return saved === 'dark'
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    } catch {
      return false
    }
  })

  // Close mobile drawer and profile menu on route navigation
  useEffect(() => {
    setMobileMenuOpen(false)
    setProfileOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const root = document.documentElement
    if (isDark) {
      root.setAttribute('data-theme', 'dark')
      root.classList.add('dark')
      localStorage.setItem('devtrack_theme', 'dark')
    } else {
      root.removeAttribute('data-theme')
      root.classList.remove('dark')
      localStorage.setItem('devtrack_theme', 'light')
    }
  }, [isDark])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      } else if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [mobileMenuOpen])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <>
      {/* Premium Horizontal Header Navbar with strong blur and gradient highlights */}
      <header className="w-full bg-gunmetal/85 backdrop-blur-xl px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between shrink-0 select-none z-40 sticky top-0 shadow-sm border-b border-hairline/60">
        
        {/* Left: Classic Circular Brand Logo */}
        <div 
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2.5 cursor-pointer hover:opacity-95 transition-opacity shrink-0"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-signal/20 to-violet/20 border border-signal/40 flex items-center justify-center glow-cyan hover:scale-105 transition-transform duration-300">
            <Code2 size={16} className="text-signal" strokeWidth={2.2} />
          </div>
          <span className="font-display font-bold tracking-tight text-chrome text-base sm:text-lg">
            DevTrack<span className="text-signal font-extrabold">.AI</span>
          </span>
        </div>

        {/* Center: Horizontally Aligned Pill-Shaped Links (Desktop: >= 1024px) */}
        <nav className="hidden lg:flex items-center justify-center rounded-full p-1 gap-0.5 xl:gap-1 bg-gunmetal/90 border border-hairline/80 shadow-xs mx-2">
          {navItems.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/dashboard'}
              className={({ isActive }) =>
                `px-2.5 xl:px-3 py-1 rounded-full text-[11px] xl:text-xs font-medium transition-all duration-150 flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-signal/15 text-chrome border border-signal/40 shadow-xs font-semibold'
                    : 'text-chrome-dim hover:text-chrome hover:bg-steel/60'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-signal led-pulse shrink-0" />}
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Quick Search Pill with shortcut badge (Desktop) */}
          <button
            onClick={() => setSearchOpen(true)}
            aria-label="Search command palette"
            title="Search index (Ctrl+K)"
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-steel/70 hover:bg-steel border border-hairline hover:border-signal/40 text-xs text-chrome-dim hover:text-chrome transition-all cursor-pointer group"
          >
            <Search size={13} className="group-hover:text-signal transition-colors" />
            <span className="text-[11px] font-sans font-medium">Search</span>
            <kbd className="text-[10px] font-sans font-semibold px-1.5 py-0.5 rounded bg-gunmetal/90 border border-hairline text-chrome-dim/80">Ctrl K</kbd>
          </button>

          {/* Quick Search Icon (Mobile) */}
          <button
            onClick={() => setSearchOpen(true)}
            aria-label="Search command palette"
            title="Search index (Ctrl+K)"
            className="sm:hidden w-8 h-8 flex items-center justify-center bg-steel/80 border border-hairline hover:border-signal/50 rounded-full text-chrome-dim hover:text-chrome transition-all cursor-pointer"
          >
            <Search size={14} />
          </button>

          {/* Theme Switcher Toggle */}
          <button
            onClick={() => setIsDark(!isDark)}
            aria-label="Toggle color theme"
            title={isDark ? 'Switch to Light Theme' : 'Switch to Cyber Dark Theme'}
            className="w-8 h-8 flex items-center justify-center bg-steel/80 border border-hairline hover:border-signal/50 rounded-full text-chrome-dim hover:text-chrome transition-all cursor-pointer hover:scale-105 active:scale-95"
          >
            {isDark ? <Sun size={14} className="text-yellow" /> : <Moon size={14} className="text-chrome" />}
          </button>

          {/* User Profile Pill Avatar & Feature Dropdown */}
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              aria-label="Profile and features menu"
              aria-expanded={profileOpen}
              title="Rank, Public Profile, and Dashboard Features"
              className={`flex items-center gap-1.5 sm:gap-2 pl-1 pr-2 sm:pr-2.5 py-1 rounded-full transition-all cursor-pointer ${
                profileOpen
                  ? 'bg-steel border border-signal/60 shadow-xs ring-2 ring-signal/20'
                  : 'bg-steel/70 hover:bg-steel border border-hairline hover:border-signal/40 text-chrome'
              }`}
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-signal/30 to-violet/30 border border-signal/40 flex items-center justify-center text-[10px] font-bold text-chrome font-sans">
                {user?.username ? user.username[0].toUpperCase() : 'U'}
              </div>
              <span className="text-xs font-sans font-medium text-chrome hidden md:inline truncate max-w-[85px]">
                @{user?.username || 'dev'}
              </span>
              <ChevronDown
                size={12}
                className={`text-chrome-dim transition-transform duration-200 hidden sm:inline ${
                  profileOpen ? 'rotate-180 text-signal-dim' : ''
                }`}
              />
            </button>

            <ProfileDropdown isOpen={profileOpen} onClose={() => setProfileOpen(false)} />
          </div>

          {/* Sign Out (Desktop) */}
          <button
            onClick={handleLogout}
            aria-label="Log out"
            title="Sign out"
            className="hidden sm:flex w-8 h-8 items-center justify-center bg-steel/80 border border-hairline hover:border-red-500/50 hover:text-red-400 rounded-full text-chrome-dim transition-all cursor-pointer hover:scale-105 active:scale-95"
          >
            <LogOut size={14} strokeWidth={2} />
          </button>

          {/* Mobile Hamburger Menu Toggle Button (< 1024px) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
            className="lg:hidden w-8 h-8 flex items-center justify-center bg-steel/80 border border-hairline hover:border-signal/50 rounded-full text-chrome transition-all cursor-pointer"
          >
            {mobileMenuOpen ? <X size={15} /> : <Menu size={15} />}
          </button>
        </div>
      </header>
      
      {/* Subtle hairline line */}
      <div className="h-[1px] w-full bg-hairline shrink-0" />

      {/* Subnav row shown on small screens (scrolls horizontally for instant access) */}
      <nav className="lg:hidden flex items-center justify-start bg-gunmetal/90 backdrop-blur-md border-b border-hairline px-4 py-2 overflow-x-auto scrollbar-none gap-1 shrink-0 select-none">
        {navItems.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/dashboard'}
            className={({ isActive }) =>
              `px-3 py-1.5 rounded-full text-xs font-medium shrink-0 transition-all duration-150 ${
                isActive
                  ? 'bg-signal/20 text-chrome border border-signal/40 font-semibold'
                  : 'text-chrome-dim hover:text-chrome hover:bg-steel/50'
              }`
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Mobile Menu Animated Modal Drawer Dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden fixed inset-0 top-[57px] bg-black/40 backdrop-blur-sm z-30"
            />

            {/* Menu Drawer */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden fixed top-[58px] left-0 right-0 bg-gunmetal border-b border-hairline shadow-2xl z-40 p-4 max-h-[calc(100dvh-70px)] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-hairline">
                <div
                  onClick={() => {
                    setMobileMenuOpen(false)
                    setProfileOpen(true)
                  }}
                  className="flex items-center gap-2 cursor-pointer p-1 -m-1 rounded-xl hover:bg-steel/60 transition-colors"
                  title="View Rank, Share Profile & Features"
                >
                  <div className="w-7 h-7 rounded-full bg-steel flex items-center justify-center text-xs font-sans text-chrome font-bold border border-hairline">
                    {user?.username ? user.username[0].toUpperCase() : 'U'}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-chrome font-sans flex items-center gap-1">
                      <span>@{user?.username || 'developer'}</span>
                      <ChevronDown size={11} className="text-chrome-dim" />
                    </div>
                    <div className="text-[10px] text-signal-dim font-sans font-medium">Rank, Share & Features</div>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-400 px-2.5 py-1 rounded-md bg-red-500/10 border border-red-500/20 font-medium cursor-pointer"
                >
                  <LogOut size={12} />
                  <span>Sign out</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {navItems.map(({ to, label, icon: Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={to === '/dashboard'}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-signal/20 text-chrome border border-signal/40 font-semibold shadow-xs'
                          : 'text-chrome-dim hover:text-chrome hover:bg-steel/60 border border-transparent'
                      }`
                    }
                  >
                    <Icon size={15} className="shrink-0 text-signal-dim" />
                    <span className="truncate">{label}</span>
                  </NavLink>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Global Command Menu Search Overlay */}
      <GlobalSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}
