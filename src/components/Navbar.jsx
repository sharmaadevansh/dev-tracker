import { useState, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Terminal, Search, LogOut, User } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import GlobalSearch from './GlobalSearch'

const navItems = [
  { to: '/dashboard', label: 'Overview' },
  { to: '/dashboard/analytics', label: 'Analytics' },
  { to: '/dashboard/repos', label: 'Repositories' },
  { to: '/dashboard/projects', label: 'Projects' },
  { to: '/dashboard/goals', label: 'Daily Goals' },
  { to: '/dashboard/notes', label: 'Notes' },
  { to: '/dashboard/resume', label: 'Resume' },
  { to: '/setup', label: 'Handles' },
  { to: '/dashboard/profile', label: 'Profile' },
]

export default function Navbar() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <>
      {/* Premium Horizontal Header Navbar with strong blur and gradient highlights */}
      <header className="w-full bg-gunmetal/60 backdrop-blur-xl px-8 py-3.5 grid grid-cols-[1fr_auto_1fr] items-center shrink-0 select-none z-40 sticky top-0 shadow-lg border-b border-hairline/50">
        
        {/* Left: Classic Circular Brand Logo */}
        <div 
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2.5 cursor-pointer hover:opacity-95 transition-opacity justify-self-start"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-signal/20 to-violet/20 border border-signal/40 flex items-center justify-center glow-cyan hover:scale-105 transition-transform duration-300">
            <Terminal size={14} className="text-signal led-pulse animate-pulse" strokeWidth={2.5} />
          </div>
          <span style={{ fontFamily: 'Forum, serif' }} className="font-bold tracking-tight text-chrome text-base sm:text-lg">
            DevTrack<span className="text-signal font-extrabold">.AI</span>
          </span>
        </div>

        {/* Center: Horizontally Aligned Pill-Shaped Links with glass contrast */}
        <nav className="hidden lg:flex items-center justify-center glass rounded-full px-2 py-1 gap-0.5 bg-void/35 border-hairline/80 shadow-inner justify-self-center">
          {navItems.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/dashboard'}
              style={{ fontFamily: 'Forum, serif' }}
              className={({ isActive }) =>
                `px-3.5 py-1.5 rounded-full text-sm font-bold transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-signal/20 to-violet/20 text-chrome border border-signal/30 shadow-[0_2px_10px_rgba(0,0,0,0.28)] scale-105'
                    : 'text-chrome-dim hover:text-chrome hover:bg-steel/30'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Right Actions: circular elements */}
        <div className="flex items-center gap-2.5 justify-self-end">
          {/* Quick Search */}
          <button
            onClick={() => setSearchOpen(true)}
            title="Search index (Ctrl+K)"
            className="w-8 h-8 flex items-center justify-center bg-steel/80 border border-hairline hover:border-signal/50 rounded-full text-chrome-dim hover:text-signal hover:shadow-[0_0_10px_rgba(0,0,0,0.32)] transition-all cursor-pointer"
          >
            <Search size={14} />
          </button>

          {/* User Profile Direct Link */}
          <button
            onClick={() => navigate('/dashboard/profile')}
            title="Profile Credentials Settings"
            className="w-8 h-8 flex items-center justify-center bg-steel/80 border border-hairline hover:border-violet/50 rounded-full text-chrome-dim hover:text-violet hover:shadow-[0_0_10px_rgba(0,0,0,0.28)] transition-all cursor-pointer"
          >
            <User size={14} />
          </button>

          {/* Sign Out */}
          <button
            onClick={handleLogout}
            title="Sign out"
            className="w-8 h-8 flex items-center justify-center bg-steel/80 border border-hairline hover:border-signal hover:bg-steel/50 rounded-full text-chrome-dim hover:text-signal transition-all cursor-pointer"
          >
            <LogOut size={14} strokeWidth={2} />
          </button>
        </div>
      </header>
      
      {/* Decorative under-navbar gradient line for a classic premium accent */}
      <div className="h-[2px] w-full bg-gradient-to-r from-signal via-violet to-yellow opacity-85 shrink-0" />

      {/* Subnav row shown on small screens (scrolls horizontally) */}
      <nav className="lg:hidden flex items-center justify-center bg-gunmetal border-b border-hairline px-4 py-2.5 overflow-x-auto scrollbar-none gap-1 shrink-0 select-none">
        {navItems.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/dashboard'}
            style={{ fontFamily: 'Forum, serif' }}
            className={({ isActive }) =>
              `px-3.5 py-1.5 rounded-full text-sm font-bold shrink-0 transition-all duration-200 ${
                isActive
                  ? 'bg-steel text-chrome border border-hairline'
                  : 'text-chrome-dim hover:text-chrome'
              }`
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Global Command Menu Search Overlay */}
      <GlobalSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}
