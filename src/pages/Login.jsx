import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Shield, Sparkles, Code2, Trophy } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Login({ defaultMode = 'login' }) {
  const [authMode, setAuthMode] = useState(defaultMode)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [booting, setBooting] = useState(false)

  const { login, register } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    setAuthMode(defaultMode)
  }, [defaultMode])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (authMode === 'signup') {
      if (password !== confirmPassword) {
        setError('Passwords do not match.')
        return
      }
      setBooting(true)
      const result = await register(username, password, email)
      if (!result.ok) {
        setBooting(false)
        setError(result.error)
        return
      }
    } else {
      setBooting(true)
      const result = await login(username, password)
      if (!result.ok) {
        setBooting(false)
        setError(result.error)
        return
      }
    }

    if (authMode === 'signup') {
      setTimeout(() => navigate('/setup'), 700)
    } else {
      setTimeout(() => navigate('/dashboard'), 500)
    }
  }

  return (
    <div className="h-full min-h-0 flex flex-col relative overflow-hidden rounded-[28px] sm:rounded-[36px] border border-hairline/70 shadow-[0_20px_60px_rgba(35,28,23,0.08)] backdrop-blur-2xl bg-void">
      {/* Visual background ambient lighting */}
      <div className="absolute inset-0 scanline pointer-events-none z-0" />
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-signal/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-violet/15 blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="flex-1 w-full h-full flex flex-col lg:flex-row items-center justify-center p-6 sm:p-10 lg:p-14 gap-8 lg:gap-16 relative z-10 overflow-y-auto scrollbar-thin">
        
        {/* Left Column: Professional SaaS Headline & Value Proposition (Desktop) */}
        <div className="hidden lg:flex flex-col flex-1 max-w-lg space-y-6 select-none">
          <div className="inline-flex items-center gap-2 badge-base badge-signal self-start">
            <Sparkles size={13} className="text-signal-dim" />
            <span className="badge-label">DevTrack Engine</span>
            <span className="badge-value">v2.4.0</span>
          </div>

          <div className="space-y-3">
            <h1 className="font-display text-4xl xl:text-5xl font-extrabold text-chrome tracking-tight leading-[1.15]">
              Unified Developer Intelligence Hub
            </h1>
            <p className="text-sm text-chrome-dim font-sans leading-relaxed">
              Real-time competitive programming ratings, GitHub repository metrics, multi-university rankings, and verified engineering credentials in one workspace.
            </p>
          </div>

          {/* Value points */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3 text-xs font-sans text-chrome">
              <div className="w-7 h-7 rounded-lg bg-yellow/15 border border-yellow/30 flex items-center justify-center text-yellow shrink-0">
                <Code2 size={14} />
              </div>
              <span className="font-medium">Direct synchronization with LeetCode, Codeforces, CodeChef & GFG</span>
            </div>

            <div className="flex items-center gap-3 text-xs font-sans text-chrome">
              <div className="w-7 h-7 rounded-lg bg-signal/15 border border-signal/30 flex items-center justify-center text-signal-dim shrink-0">
                <Trophy size={14} />
              </div>
              <span className="font-medium">Weighted DevScore calculation with verified global and campus ranking</span>
            </div>

            <div className="flex items-center gap-3 text-xs font-sans text-chrome">
              <div className="w-7 h-7 rounded-lg bg-violet/15 border border-violet/30 flex items-center justify-center text-violet shrink-0">
                <Shield size={14} />
              </div>
              <span className="font-medium">ATS-optimized resume PDF export & automated GitHub profile badges</span>
            </div>
          </div>
        </div>

        {/* Right Column: Centered Developer Auth Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="w-full max-w-sm rounded-[32px] p-8 sm:p-10 relative bg-gunmetal/95 border border-hairline/80 shadow-[0_20px_50px_rgba(0,0,0,0.06)] backdrop-blur-xl z-10 flex flex-col shrink-0"
        >
          {/* Logo */}
          <div className="flex items-center gap-2.5 mb-6 justify-center">
            <div className="w-8 h-8 rounded-full bg-signal/20 border border-signal/40 flex items-center justify-center text-signal-dim">
              <Code2 size={16} strokeWidth={2.5} />
            </div>
            <span className="font-display font-extrabold text-xl tracking-tight text-chrome">
              DevTrack<span className="text-signal-dim">.AI</span>
            </span>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center justify-center p-1 bg-steel rounded-2xl mb-6 border border-hairline">
            <button
              type="button"
              onClick={() => { setAuthMode('login'); setError('') }}
              className={`flex-1 py-2 text-xs font-sans font-semibold rounded-xl transition-all cursor-pointer ${
                authMode === 'login'
                  ? 'bg-gunmetal text-chrome shadow-xs'
                  : 'text-chrome-dim hover:text-chrome'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode('signup'); setError('') }}
              className={`flex-1 py-2 text-xs font-sans font-semibold rounded-xl transition-all cursor-pointer ${
                authMode === 'signup'
                  ? 'bg-gunmetal text-chrome shadow-xs'
                  : 'text-chrome-dim hover:text-chrome'
              }`}
            >
              Create Account
            </button>
          </div>

          <div className="text-center mb-6">
            <h2 className="font-display text-2xl font-bold text-chrome tracking-tight uppercase">
              {authMode === 'signup' ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p className="text-xs text-chrome-dim font-sans mt-1.5 font-medium">
              {authMode === 'signup' ? 'Set up your verified developer profile' : 'Enter your credentials to access your dashboard'}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {!booting ? (
              <motion.form
                key={authMode}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleSubmit}
                className="flex flex-col gap-4"
              >
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] uppercase tracking-wider text-chrome-dim/75 font-semibold font-sans">
                    Username
                  </label>
                  <input
                    autoFocus
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-steel/60 border border-hairline rounded-xl px-4 py-2.5 text-xs font-sans outline-none text-chrome focus:border-signal focus:ring-2 focus:ring-signal/20 transition-all duration-200"
                    placeholder={authMode === 'signup' ? 'e.g. dev_coder' : 'your_username'}
                  />
                </div>

                {authMode === 'signup' && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] uppercase tracking-wider text-chrome-dim/75 font-semibold font-sans">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-steel/60 border border-hairline rounded-xl px-4 py-2.5 text-xs font-sans outline-none text-chrome focus:border-signal focus:ring-2 focus:ring-signal/20 transition-all duration-200"
                      placeholder="coder@example.com"
                    />
                  </div>
                )}

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] uppercase tracking-wider text-chrome-dim/75 font-semibold font-sans">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-steel/60 border border-hairline rounded-xl px-4 py-2.5 text-xs font-sans outline-none text-chrome focus:border-signal focus:ring-2 focus:ring-signal/20 transition-all duration-200"
                    placeholder={authMode === 'signup' ? 'Min 6 characters' : '••••••••••'}
                  />
                </div>

                {authMode === 'signup' && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] uppercase tracking-wider text-chrome-dim/75 font-semibold font-sans">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-steel/60 border border-hairline rounded-xl px-4 py-2.5 text-xs font-sans outline-none text-chrome focus:border-signal focus:ring-2 focus:ring-signal/20 transition-all duration-200"
                      placeholder="Repeat password"
                    />
                  </div>
                )}

                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -2 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-red-600 font-sans bg-red-500/10 border border-red-500/20 rounded-xl p-2.5 text-center font-medium"
                  >
                    {error}
                  </motion.p>
                )}

                <button
                  type="submit"
                  className="mt-2 flex items-center justify-center gap-2 bg-gradient-to-r from-signal to-violet hover:opacity-95 text-void font-bold text-xs uppercase tracking-wider py-3.5 px-5 rounded-xl cursor-pointer transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] shadow-[0_8px_20px_rgba(140,99,255,0.18)] font-sans"
                >
                  {authMode === 'signup' ? 'Create Account' : 'Sign In'}
                  <ArrowRight size={15} />
                </button>

                <div className="text-center mt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode(authMode === 'login' ? 'signup' : 'login')
                      setError('')
                    }}
                    className="text-xs font-sans text-chrome-dim hover:text-signal-dim transition-colors cursor-pointer underline decoration-dotted"
                  >
                    {authMode === 'login'
                      ? 'New developer? Create an account here'
                      : 'Already registered? Sign in here'}
                  </button>
                </div>
              </motion.form>
            ) : (
              <motion.div
                key="boot"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-sans text-xs text-chrome-dim flex flex-col items-center justify-center gap-2.5 py-10 text-center"
              >
                <div className="w-8 h-8 rounded-full border-2 border-signal border-t-transparent animate-spin mb-1" />
                <p className="text-chrome font-bold uppercase tracking-wider text-xs font-sans">
                  {authMode === 'signup' ? 'Account Created' : 'Signing In'}
                </p>
                <p className="text-chrome-dim text-xs font-sans">Preparing your developer workspace...</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}
