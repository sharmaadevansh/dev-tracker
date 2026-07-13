import { useState } from 'react'
import { motion } from 'framer-motion'
import { Shield, Eye, EyeOff, Key, UserCheck, CheckCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Profile() {
  const { user, updateCredentials } = useAuth()
  const [username, setUsername] = useState(user.username)
  const [password, setPassword] = useState(user.password)
  const [confirmPassword, setConfirmPassword] = useState(user.password)
  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleUpdate = (e) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      setMessage('')
      return
    }
    const result = updateCredentials(username, password)
    if (!result.ok) {
      setError(result.error)
      setMessage('')
      return
    }
    setError('')
    setMessage('Profile credentials updated and secured successfully!')
    setTimeout(() => setMessage(''), 4000)
  }

  // Basic password security strength checker
  const getPasswordStrength = () => {
    if (!password) return { label: 'Empty', color: 'text-chrome-dim' }
    if (password.length < 6) return { label: 'Weak (Short)', color: 'text-signal-dim font-bold' }
    const hasNumbers = /\d/.test(password)
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password)
    if (hasNumbers && hasSpecial) return { label: 'Extremely Secure', color: 'text-green-600 font-bold' }
    return { label: 'Medium', color: 'text-yellow-dim font-bold' }
  }

  const strength = getPasswordStrength()

  return (
    <div className="flex-1 px-12 py-10 max-w-7xl mx-auto w-full overflow-y-auto space-y-8 scrollbar-thin flex flex-col h-full">
      <div>
        <h1 className="font-display text-2xl font-semibold text-chrome">Client Profile</h1>
      </div>

      <div className="max-w-xl mx-auto mt-6 w-full">
        <div className="glass rounded-[36px] p-8 bg-gunmetal/30 border-hairline relative overflow-hidden flex flex-col gap-6">
          <div className="flex items-center gap-3 pb-4 border-b border-hairline">
            <div className="w-10 h-10 rounded-full bg-signal/10 border border-signal/40 flex items-center justify-center text-signal shrink-0">
              <Shield size={20} className="led-pulse" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-chrome text-sm">Security credentials manager</h3>
              <p className="text-[10px] text-chrome-dim/85 font-mono">Updates immediately synchronize decryption keys for Auth Gateway</p>
            </div>
          </div>

          <form onSubmit={handleUpdate} className="flex flex-col gap-5">
            {/* Username field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-widest text-chrome-dim font-bold font-mono flex items-center gap-1.5">
                <UserCheck size={12} className="text-signal-dim shrink-0" /> Username
              </label>
              <input
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-steel/60 border border-hairline rounded-full px-5 py-3 text-xs outline-none focus:border-signal font-mono text-chrome"
                placeholder="devansh"
              />
            </div>

            {/* Password field */}
            <div className="flex flex-col gap-1.5 relative">
              <label className="text-[10px] uppercase tracking-widest text-chrome-dim font-bold font-mono flex items-center gap-1.5">
                <Key size={12} className="text-signal-dim shrink-0" /> Password key
              </label>
              <div className="relative">
                <input
                  required
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-steel/60 border border-hairline rounded-full px-5 py-3 text-xs outline-none focus:border-signal font-mono w-full pr-12 text-chrome"
                  placeholder="••••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3 text-chrome-dim hover:text-chrome cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Password strength visualization */}
              <div className="flex items-center gap-2 mt-1 px-1">
                <span className="text-[9px] text-chrome-dim font-mono font-bold">Strength Assessment:</span>
                <span className={`text-[9px] font-mono ${strength.color}`}>{strength.label}</span>
              </div>
            </div>

            {/* Confirm Password field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-widest text-chrome-dim font-bold font-mono flex items-center gap-1.5">
                <Key size={12} className="text-signal-dim shrink-0" /> Confirm Password key
              </label>
              <input
                required
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-steel/60 border border-hairline rounded-full px-5 py-3 text-xs outline-none focus:border-signal font-mono w-full text-chrome"
                placeholder="Confirm password"
              />
            </div>

            {error && (
              <p className="text-xs text-signal font-mono bg-signal/5 border border-signal-dim/30 rounded-[20px] p-3 mt-1">
                ERROR: {error}
              </p>
            )}

            {message && (
              <p className="text-xs text-green-600 font-mono bg-green-500/5 border border-green-500/20 rounded-[20px] p-3 flex items-center gap-1.5 mt-1">
                <CheckCircle size={14} className="text-green-600" />
                {message}
              </p>
            )}

            <button
              type="submit"
              className="mt-3 flex items-center justify-center gap-2 bg-gradient-to-r from-signal to-violet hover:opacity-90 text-void font-bold text-xs uppercase tracking-wider py-3.5 px-5 rounded-full cursor-pointer transition-all duration-200 hover:shadow-[0_0_15px_rgba(0,0,0,0.28)] active:scale-[0.98]"
            >
              Lock & Secure Credentials
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
