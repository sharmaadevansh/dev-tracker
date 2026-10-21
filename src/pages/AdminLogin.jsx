import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShieldAlert, Lock, ArrowRight, Eye, EyeOff, AlertTriangle, ArrowLeft } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function AdminLogin() {
  const navigate = useNavigate()
  const { login, logout } = useAuth()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleAdminSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!username.trim() || !password.trim()) {
      setError('Administrative credentials cannot be blank.')
      return
    }

    setLoading(true)
    try {
      const res = await login(username.trim(), password.trim())
      if (!res.ok) {
        setError(res.error || 'Authentication rejected.')
        setLoading(false)
        return
      }

      if (res.user?.role !== 'admin') {
        logout()
        setError('Access Denied: This account does not possess administrative privileges.')
        setLoading(false)
        return
      }

      navigate('/admin')
    } catch {
      setError('Fatal authentication service failure.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-void selection:bg-signal selection:text-void font-sans">
      {/* Background Grid & Ambient Glow */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293715_1px,transparent_1px),linear-gradient(to_bottom,#1f293715_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
      <div className="absolute w-[500px] h-[500px] rounded-full bg-signal/10 blur-[130px] pointer-events-none -top-32 -right-32" />
      <div className="absolute w-[450px] h-[450px] rounded-full bg-violet/10 blur-[140px] pointer-events-none -bottom-32 -left-32" />

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="w-full max-w-md relative z-10"
      >
        <div className="glass rounded-3xl p-8 border border-signal/25 bg-gunmetal/60 shadow-2xl backdrop-blur-xl relative overflow-hidden">
          {/* Top Decorative Terminal Bar */}
          <div className="flex items-center justify-between pb-5 mb-5 border-b border-hairline/60">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-signal/15 border border-signal/30 flex items-center justify-center text-signal">
                <ShieldAlert size={17} />
              </div>
              <div>
                <span className="font-mono text-[10px] tracking-widest text-signal uppercase font-bold">
                  Restricted Gateway
                </span>
                <h1 className="text-sm font-semibold text-chrome">DevTrack Admin Console</h1>
              </div>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="text-chrome-dim hover:text-chrome text-xs flex items-center gap-1 transition-colors cursor-pointer"
              title="Return to user portal"
            >
              <ArrowLeft size={13} />
              <span>Public</span>
            </button>
          </div>

          <p className="text-xs text-chrome-dim mb-6 leading-relaxed">
            Authorization requires cryptographic administrative credentials. Access logs and operations are monitored and recorded.
          </p>

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-3.5 mb-5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-start gap-2.5 leading-relaxed"
            >
              <AlertTriangle size={15} className="shrink-0 mt-0.5 text-red-400" />
              <span>{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleAdminSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-chrome-dim mb-1.5 font-medium">
                Admin Username
              </label>
              <input
                type="text"
                autoCapitalize="none"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. admin"
                className="w-full px-3.5 py-2.5 rounded-xl bg-void/80 border border-hairline focus:border-signal outline-none text-chrome text-sm font-mono transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-chrome-dim mb-1.5 font-medium">
                Admin Key / Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-void/80 border border-hairline focus:border-signal outline-none text-chrome text-sm font-mono transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-chrome-dim hover:text-chrome transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-signal hover:opacity-95 text-void font-semibold text-xs tracking-wide uppercase transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-signal/20 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-void border-t-transparent rounded-full animate-spin" />
                  <span>Verifying Privileges...</span>
                </>
              ) : (
                <>
                  <Lock size={13} />
                  <span>Authenticate Session</span>
                  <ArrowRight size={13} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-hairline/40 text-center">
            <span className="font-mono text-[10px] text-chrome-dim/60">
              DevTrack.AI • System Tier-0 Security Matrix
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
