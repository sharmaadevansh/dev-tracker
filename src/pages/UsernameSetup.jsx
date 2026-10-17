import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Code2, GraduationCap, ArrowRight, Swords, ChefHat, Check, Zap, Eye, EyeOff } from 'lucide-react'
import { GithubIcon, LinkedinIcon } from '../components/BrandIcons'
import { useUserHandles } from '../context/UserContext'

const platforms = [
  {
    key: 'codeforces',
    label: 'Codeforces',
    tagline: 'Competitive ratings, contests, rank & problem solving stats',
    icon: Swords,
    placeholder: 'toutsit',
    color: 'text-violet',
    accentBorder: 'border-violet/40',
    activeGlow: 'shadow-[0_0_15px_rgba(153,194,255,0.2)]',
  },
  {
    key: 'codechef',
    label: 'CodeChef',
    tagline: 'Stars rating (1★-7★), division ranking & contest performance',
    icon: ChefHat,
    placeholder: 'toutsit',
    color: 'text-yellow',
    accentBorder: 'border-yellow/40',
    activeGlow: 'shadow-[0_0_15px_rgba(255,223,130,0.2)]',
  },
  {
    key: 'leetcode',
    label: 'LeetCode',
    tagline: 'Easy/Medium/Hard solved count, contest rating & acceptance rate',
    icon: Code2,
    placeholder: 'leetcode_user',
    color: 'text-yellow',
    accentBorder: 'border-yellow/40',
    activeGlow: 'shadow-[0_0_15px_rgba(255,223,130,0.2)]',
  },
  {
    key: 'github',
    label: 'GitHub',
    tagline: 'Public repositories, star count, language stack & contributions',
    icon: GithubIcon,
    placeholder: 'octocat',
    color: 'text-signal',
    accentBorder: 'border-signal/40',
    activeGlow: 'shadow-[0_0_15px_rgba(255,132,186,0.2)]',
  },
  {
    key: 'gfg',
    label: 'GeeksforGeeks',
    tagline: 'Institute rank, coding score, problem solving streaks',
    icon: GraduationCap,
    placeholder: 'gfg_user',
    color: 'text-green-600',
    accentBorder: 'border-green-500/40',
    activeGlow: 'shadow-[0_0_15px_rgba(74,222,128,0.2)]',
  },
  {
    key: 'linkedin',
    label: 'LinkedIn',
    tagline: 'Professional portfolio card and external profile link',
    icon: LinkedinIcon,
    placeholder: 'in/your-name',
    color: 'text-violet',
    accentBorder: 'border-violet/40',
    activeGlow: 'shadow-[0_0_15px_rgba(153,194,255,0.2)]',
  },
]

export default function UsernameSetup() {
  const { handles, activePlatforms, setHandles } = useUserHandles()
  const [formHandles, setFormHandles] = useState(handles)
  const [formPlatforms, setFormPlatforms] = useState(activePlatforms)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    setFormHandles(handles)
  }, [handles])

  useEffect(() => {
    setFormPlatforms(activePlatforms)
  }, [activePlatforms])

  const updateHandle = (key, value) => {
    setFormHandles((prev) => ({ ...prev, [key]: value }))
  }

  const togglePlatform = (key) => {
    setFormPlatforms((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleToggleAll = (enable) => {
    const next = {}
    platforms.forEach((p) => {
      next[p.key] = enable
    })
    setFormPlatforms(next)
  }

  const handleToggleCompetitive = () => {
    setFormPlatforms({
      codeforces: true,
      codechef: true,
      leetcode: true,
      github: true,
      gfg: false,
      linkedin: false,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    const result = await setHandles(formHandles, formPlatforms)
    setSaving(false)

    if (result && !result.ok) {
      setError(result.error)
      return
    }

    setSuccess('Platform settings and handles saved successfully!')
    setTimeout(() => {
      navigate('/dashboard/analytics')
    }, 800)
  }

  const activeCount = Object.values(formPlatforms).filter(Boolean).length

  return (
    <div className="h-full min-h-0 bg-void flex flex-col items-center justify-start px-4 py-8 rounded-[28px] border border-hairline/70 shadow-[0_20px_60px_rgba(35,28,23,0.08)] backdrop-blur-2xl overflow-y-auto scrollbar-thin">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-2xl space-y-6"
      >
        {/* Title and Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-semibold text-chrome flex items-center gap-2.5">
              Platform & Handle Manager
            </h1>
            <p className="text-xs text-chrome-dim mt-1 font-mono">
              Toggle specific platforms to turn their stats streams ON/OFF across the app.
            </p>
          </div>

          {/* Quick presets */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleToggleAll(true)}
              className="px-3 py-1.5 rounded-full text-[11px] font-mono bg-steel/60 hover:bg-steel border border-hairline text-chrome-dim hover:text-chrome transition-colors cursor-pointer"
            >
              All ON
            </button>
            <button
              type="button"
              onClick={handleToggleCompetitive}
              className="px-3 py-1.5 rounded-full text-[11px] font-mono bg-steel/60 hover:bg-steel border border-hairline text-signal-dim hover:text-signal transition-colors cursor-pointer flex items-center gap-1"
            >
              <Zap size={10} /> Competitive
            </button>
            <button
              type="button"
              onClick={() => handleToggleAll(false)}
              className="px-3 py-1.5 rounded-full text-[11px] font-mono bg-steel/60 hover:bg-steel border border-hairline text-chrome-dim/60 hover:text-chrome transition-colors cursor-pointer"
            >
              All OFF
            </button>
          </div>
        </div>

        {/* Platform Cards Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-3.5">
            {platforms.map(({ key, label, tagline, icon: Icon, placeholder, color, accentBorder, activeGlow }) => {
              const isActive = !!formPlatforms[key]
              return (
                <div
                  key={key}
                  className={`glass rounded-[24px] p-5 border transition-all duration-300 flex flex-col gap-3 ${
                    isActive
                      ? `bg-gunmetal/40 ${accentBorder} ${activeGlow}`
                      : 'bg-void/40 border-hairline/40 opacity-70 hover:opacity-90'
                  }`}
                >
                  {/* Top Bar: Icon, Name, and Toggle Switch */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all ${
                          isActive
                            ? `bg-steel/80 ${color} ${accentBorder}`
                            : 'bg-steel/30 text-chrome-dim/50 border-hairline/30'
                        }`}
                      >
                        <Icon size={18} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-display font-bold text-sm text-chrome">{label}</span>
                          <span
                            className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded-full font-semibold ${
                              isActive
                                ? 'bg-green-500/10 text-green-600 border border-green-500/30'
                                : 'bg-steel/50 text-chrome-dim/60 border border-hairline/30'
                            }`}
                          >
                            {isActive ? 'Active' : 'Disabled'}
                          </span>
                        </div>
                        <p className="text-[10px] text-chrome-dim/80 font-mono mt-0.5">{tagline}</p>
                      </div>
                    </div>

                    {/* Toggle Button */}
                    <button
                      type="button"
                      onClick={() => togglePlatform(key)}
                      title={`Toggle ${label} ${isActive ? 'OFF' : 'ON'}`}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        isActive ? 'bg-signal' : 'bg-steel/80'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                          isActive ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Handle Input Field (shown when active) */}
                  {isActive ? (
                    <div className="pt-2 border-t border-hairline/30 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <label className="text-[10px] uppercase font-mono tracking-wider text-chrome-dim shrink-0">
                        Profile Handle:
                      </label>
                      <div className="relative flex-1">
                        <input
                          value={formHandles[key] || ''}
                          onChange={(e) => updateHandle(key, e.target.value)}
                          placeholder={placeholder}
                          className="w-full bg-steel/70 border border-hairline rounded-full px-4 py-2 text-xs font-mono text-chrome outline-none focus:border-signal transition-colors"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="pt-1.5 border-t border-hairline/20 flex items-center justify-between text-[10px] font-mono text-chrome-dim/60">
                      <span>Stats stream deactivated for this platform.</span>
                      <button
                        type="button"
                        onClick={() => togglePlatform(key)}
                        className="text-signal-dim hover:underline cursor-pointer"
                      >
                        Enable
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Footer Action Bar */}
          <div className="glass rounded-[24px] p-4 bg-gunmetal/30 border border-hairline flex items-center justify-between mt-6">
            <span className="text-xs text-chrome-dim font-mono">
              <span className="text-signal font-bold">{activeCount}</span> of {platforms.length} platforms active
            </span>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 bg-gradient-to-r from-signal to-violet hover:opacity-90 transition-all text-void font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-full cursor-pointer disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Apply & View Analytics'}
              <ArrowRight size={14} />
            </button>
          </div>

          {error && <p className="text-xs text-signal font-mono bg-signal/10 p-3 rounded-2xl border border-signal/20">{error}</p>}
          {success && <p className="text-xs text-green-600 font-mono bg-green-500/10 p-3 rounded-2xl border border-green-500/20">{success}</p>}
        </form>
      </motion.div>
    </div>
  )
}
