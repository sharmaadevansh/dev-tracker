import { useState, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Settings, LogOut, Terminal, Briefcase,
  BarChart3, GraduationCap, BookOpen, FileText, CheckSquare, Search,
  ChevronLeft, ChevronRight
} from 'lucide-react'
import { GithubIcon } from './BrandIcons'
import { useAuth } from '../context/AuthContext'
import GlobalSearch from './GlobalSearch'

const navItems = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { to: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/dashboard/repos', label: 'Repositories', icon: GithubIcon },
  { to: '/dashboard/projects', label: 'Projects', icon: Briefcase },
  { to: '/dashboard/learning', label: 'Learning', icon: GraduationCap },
  { to: '/dashboard/goals', label: 'Daily Goals', icon: CheckSquare },
  { to: '/dashboard/notes', label: 'Notes', icon: BookOpen },
  { to: '/dashboard/resume', label: 'Resume', icon: FileText },
  { to: '/setup', label: 'Handles', icon: Settings },
]

export default function Sidebar() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [searchOpen, setSearchOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('sidebar_collapsed') === 'true'
  })

  // Listen for Ctrl+K globally
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    localStorage.setItem('sidebar_collapsed', isCollapsed)
  }, [isCollapsed])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <>
      <aside className={`shrink-0 h-screen sticky top-0 border-r border-hairline bg-gunmetal flex flex-col justify-between overflow-y-auto transition-all duration-300 ease-in-out select-none ${
        isCollapsed ? 'w-16' : 'w-60'
      }`}>
        <div className="flex flex-col">
          {/* Header & Toggle */}
          <div className={`px-4 py-5 flex items-center justify-between border-b border-hairline ${isCollapsed ? 'flex-col gap-4' : ''}`}>
            <div className="flex items-center gap-2">
              <Terminal size={18} className="text-signal led-pulse shrink-0" strokeWidth={2} />
              {!isCollapsed && (
                <span className="font-display font-bold tracking-tight text-chrome">
                  DevTrack<span className="text-signal">.AI</span>
                </span>
              )}
            </div>
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              className="p-1 text-chrome-dim hover:text-signal rounded-full hover:bg-steel/50 cursor-pointer transition-colors"
            >
              {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>
          </div>

          {/* Search Trigger Button */}
          <div className="px-3 pt-4 pb-2">
            {isCollapsed ? (
              <button
                onClick={() => setSearchOpen(true)}
                title="Search index (Ctrl+K)"
                className="w-10 h-10 flex items-center justify-center bg-steel/50 border border-hairline hover:border-signal/50 rounded-full text-chrome-dim hover:text-signal transition-all duration-200 cursor-pointer mx-auto"
              >
                <Search size={14} />
              </button>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-steel/50 border border-hairline hover:border-signal/30 rounded-full text-xs text-chrome-dim hover:text-chrome transition-all duration-200 cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Search size={13} className="text-chrome-dim" />
                  Search index...
                </span>
                <kbd className="font-mono text-[9px] bg-void/50 border border-hairline/80 px-2.5 py-0.5 rounded-full leading-none shrink-0 text-chrome-dim/80">
                  Ctrl K
                </kbd>
              </button>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="px-3 py-2 flex flex-col gap-0.5">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/dashboard'}
                title={isCollapsed ? label : ''}
                className={({ isActive }) =>
                  `flex items-center rounded-full transition-all duration-200 ${
                    isCollapsed ? 'justify-center w-10 h-10 mx-auto' : 'px-3 py-2.5 gap-3 text-xs'
                  } ${
                    isActive
                      ? 'bg-steel text-chrome border border-hairline glow-cyan'
                      : 'text-chrome-dim hover:text-chrome hover:bg-steel/50'
                  }`
                }
              >
                <Icon size={14} strokeWidth={1.75} className="shrink-0 text-signal/90" />
                {!isCollapsed && <span className="truncate">{label}</span>}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Footer actions */}
        <div className="px-3 py-4 border-t border-hairline shrink-0">
          {isCollapsed ? (
            <button
              onClick={handleLogout}
              title="Sign out"
              className="w-10 h-10 flex items-center justify-center rounded-full text-chrome-dim hover:text-signal hover:bg-steel/50 transition-colors cursor-pointer mx-auto"
            >
              <LogOut size={14} strokeWidth={1.75} />
            </button>
          ) : (
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-full text-xs text-chrome-dim hover:text-signal hover:bg-steel/50 transition-colors cursor-pointer"
            >
              <LogOut size={14} strokeWidth={1.75} className="shrink-0" />
              <span>Sign out</span>
            </button>
          )}
        </div>
      </aside>

      {/* Global Command Menu Search Overlay */}
      <GlobalSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}
