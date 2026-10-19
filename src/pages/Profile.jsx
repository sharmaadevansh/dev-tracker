import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Shield, Eye, EyeOff, User, CheckCircle, Award, ArrowUpRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useUserHandles } from '../context/UserContext'
import UniversitySelect from '../components/UniversitySelect'
import { fetchAchievements } from '../services/api/backend'

export default function Profile() {
  const { user, updateCredentials } = useAuth()
  const { university, handles, activePlatforms, setHandles } = useUserHandles()
  const [username, setUsername] = useState(user?.username || '')
  const [profileUni, setProfileUni] = useState(university || user?.university || '')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const { data: achievementsData } = useQuery({
    queryKey: ['my-achievements', username],
    queryFn: () => fetchAchievements(username),
    enabled: !!username,
  })

  const handleUpdate = async (e) => {
    e.preventDefault()
    if (password && password !== confirmPassword) {
      setError('Passwords do not match.')
      setMessage('')
      return
    }
    const result = await updateCredentials(username, password || undefined)
    if (!result.ok) {
      setError(result.error)
      setMessage('')
      return
    }

    if (profileUni !== university) {
      await setHandles(handles, activePlatforms, profileUni)
    }

    setPassword('')
    setConfirmPassword('')
    setError('')
    setMessage('Profile settings updated successfully.')
    setTimeout(() => setMessage(''), 4000)
  }

  const getPasswordStrength = () => {
    if (!password) return { label: 'Empty', color: 'text-chrome-dim' }
    if (password.length < 6) return { label: 'Short', color: 'text-yellow-600 font-medium' }
    const hasNumbers = /\d/.test(password)
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password)
    if (hasNumbers && hasSpecial) return { label: 'Strong', color: 'text-green-600 font-medium' }
    return { label: 'Medium', color: 'text-yellow-600 font-medium' }
  }

  const strength = getPasswordStrength()

  return (
    <div className="flex-1 w-full h-full overflow-y-auto scrollbar-thin bg-void py-8 px-4 sm:px-8">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="pb-6 border-b border-hairline">
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-chrome">
            Profile Settings
          </h1>
          <p className="text-xs sm:text-sm text-chrome-dim mt-1">
            Manage your account identity, credentials, and institutional affiliation.
          </p>
        </div>

        {/* Credentials Form */}
        <div className="glass p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-hairline">
            <div className="w-8 h-8 rounded-lg bg-steel flex items-center justify-center text-chrome shrink-0">
              <Shield size={16} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-chrome">Account Details</h2>
              <p className="text-xs text-chrome-dim">Update your username, affiliation, and login credentials</p>
            </div>
          </div>

          <form onSubmit={handleUpdate} className="space-y-4">
            {/* Username */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-chrome-dim">
                Username
              </label>
              <div className="flex items-center bg-steel/60 hover:bg-steel border border-hairline focus-within:border-chrome-dim rounded-lg px-3 py-2 transition-colors">
                <User size={14} className="text-chrome-dim mr-2 shrink-0" />
                <input
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-transparent border-none text-xs text-chrome outline-none"
                  placeholder="Username"
                />
              </div>
            </div>

            {/* University */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-chrome-dim">
                University or institution
              </label>
              <UniversitySelect
                value={profileUni}
                onChange={setProfileUni}
                placeholder="Search 800+ Indian universities by college, city, or state..."
              />
            </div>

            {/* New Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-chrome-dim">
                New password
              </label>
              <div className="flex items-center bg-steel/60 hover:bg-steel border border-hairline focus-within:border-chrome-dim rounded-lg px-3 py-2 transition-colors">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent border-none text-xs text-chrome outline-none"
                  placeholder="Leave blank to keep current password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-chrome-dim hover:text-chrome ml-2 cursor-pointer"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>

              {password && (
                <div className="flex items-center gap-2 mt-1 px-1">
                  <span className="text-[11px] text-chrome-dim">Strength:</span>
                  <span className={`text-[11px] ${strength.color}`}>{strength.label}</span>
                </div>
              )}
            </div>

            {/* Confirm New Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-chrome-dim">
                Confirm new password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-steel/60 hover:bg-steel border border-hairline focus:border-chrome-dim rounded-lg px-3 py-2 text-xs text-chrome outline-none transition-colors"
                placeholder="Confirm password"
              />
            </div>

            {error && (
              <p className="text-xs text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg p-2.5">
                {error}
              </p>
            )}

            {message && (
              <p className="text-xs text-green-600 bg-green-500/10 border border-green-500/20 rounded-lg p-2.5 flex items-center gap-1.5">
                <CheckCircle size={14} />
                {message}
              </p>
            )}

            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg bg-chrome text-void hover:opacity-90 font-medium text-xs transition-opacity cursor-pointer mt-2"
            >
              Save changes
            </button>
          </form>
        </div>

        {/* Public Profile Link Card */}
        <div className="glass p-5 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-chrome">Public Developer Profile</h3>
            <p className="text-xs text-chrome-dim mt-0.5">devtrack.ai/u/{username}</p>
          </div>
          <Link
            to={`/u/${username}`}
            target="_blank"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-steel hover:bg-steel/80 border border-hairline text-xs text-chrome font-medium transition-colors"
          >
            <span>View profile</span>
            <ArrowUpRight size={13} />
          </Link>
        </div>

        {/* Unlocked Badges Showcase */}
        {achievementsData && (
          <div className="glass p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-chrome flex items-center gap-1.5">
                  <Award size={15} className="text-yellow-600" />
                  <span>Unlocked Badges</span>
                </h3>
                <p className="text-xs text-chrome-dim mt-0.5">
                  {achievementsData.unlockedCount} of {achievementsData.total} achieved ({achievementsData.completionPercentage}%)
                </p>
              </div>
              <div className="w-20 bg-steel rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-chrome h-full rounded-full transition-all duration-300"
                  style={{ width: `${achievementsData.completionPercentage}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {achievementsData.achievements?.map((ach) => (
                <div
                  key={ach.id}
                  className={`p-3 rounded-lg border transition-colors ${
                    ach.unlocked
                      ? 'bg-gunmetal border-hairline'
                      : 'bg-void/40 border-hairline/40 opacity-40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm">
                      {ach.id === 'first_steps' && '🚀'}
                      {ach.id === 'century_solver' && '🎯'}
                      {ach.id === 'code_ninja' && '⚡'}
                      {ach.id === 'grandmaster' && '👑'}
                      {ach.id === 'contest_veteran' && '🏆'}
                      {ach.id === 'open_sourcerer' && '🐙'}
                      {ach.id === 'campus_top5' && '🏫'}
                      {ach.id === 'global_elite' && '🔥'}
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-medium ${
                      ach.unlocked ? 'bg-signal/15 text-signal-dim dark:text-signal' : 'bg-steel text-chrome-dim'
                    }`}>
                      {ach.unlocked ? ach.tier : 'Locked'}
                    </span>
                  </div>
                  <h4 className="text-xs font-medium text-chrome leading-snug">
                    {ach.title}
                  </h4>
                  <p className="text-[11px] text-chrome-dim mt-0.5 line-clamp-2 leading-relaxed">
                    {ach.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
