import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Terminal, ArrowRight, Shield, RefreshCw } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const SIMULATED_LOGS = [
  'INITIALIZING SYSTEM DEPLOYMENT...',
  'ESTABLISHING ENCRYPTED SESSION KEYS...',
  'CONNECTING TO GITHUB API v3... SUCCESS',
  'ESTABLISHING LEETCODE GRAPHQL SOCKET... SUCCESS',
  'SYNCING CODEFORCES SUBMISSION STREAM... SUCCESS',
  'RESOLVING CODECHEF COMPETITIVE RATING... SUCCESS',
  'FETCHING GFG INSTITUTE POSITION... SUCCESS',
  'IMPORTING USER PROFILE CONTEXT... DONE',
  'COMPILE RUN COMPLETED. ALL PIPELINES ACTIVE.',
  'AWAITING DECRYPT ACCESS SIGNATURE FROM CLIENT...',
]

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [booting, setBooting] = useState(false)
  const [logs, setLogs] = useState([])
  const [logIndex, setLogIndex] = useState(0)

  const { login } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (logIndex < SIMULATED_LOGS.length) {
      const timer = setTimeout(() => {
        setLogs((prev) => [...prev, SIMULATED_LOGS[logIndex]])
        setLogIndex((i) => i + 1)
      }, 600)
      return () => clearTimeout(timer)
    } else {
      const timer = setTimeout(() => {
        setLogs([])
        setLogIndex(0)
      }, 7000)
      return () => clearTimeout(timer)
    }
  }, [logIndex])

  const handleSubmit = (e) => {
    e.preventDefault()
    const result = login(username, password)
    if (!result.ok) {
      setError(result.error)
      return
    }
    setError('')
    setBooting(true)
    setTimeout(() => navigate('/setup'), 1200)
  }

  return (
    <div className="h-full min-h-0 bg-void flex flex-col md:flex-row relative overflow-hidden rounded-[28px] border border-hairline/70 shadow-[0_20px_60px_rgba(35,28,23,0.08)] backdrop-blur-2xl">
      {/* Visual background accents */}
      <div className="absolute inset-0 scanline pointer-events-none z-20" />
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-signal/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-violet/10 blur-3xl pointer-events-none" />

      {/* Left side: Premium Console / Animated System Terminal */}
      <div className="hidden md:flex md:w-1/2 bg-gunmetal border-r border-hairline relative flex-col justify-between p-12 overflow-hidden select-none">
        {/* Subtle grid background */}
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#00f2fe_1px,transparent_1px),linear-gradient(to_bottom,#9d4edd_1px,transparent_1px)] bg-[size:16px_28px]" />
        
        <div className="relative z-10 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-signal/10 border border-signal/40 flex items-center justify-center glow-cyan">
            <Terminal size={16} className="text-signal" />
          </div>
          <span className="font-display font-bold text-xl tracking-tight text-chrome font-mono">
            DevTrack<span className="text-signal">.AI</span>
          </span>
        </div>

        {/* Console Box */}
        <div className="relative z-10 my-auto glass rounded-[28px] border border-hairline p-6 font-mono text-[11px] text-chrome-dim h-[320px] flex flex-col justify-between bg-void/60 shadow-[0_0_22px_rgba(0,0,0,0.3)]">
          <div className="flex items-center justify-between border-b border-hairline pb-3 mb-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-violet/30 border border-violet/70 led-pulse" />
              <span className="text-chrome font-semibold font-display">system_core_pipeline.sh</span>
            </div>
            <span className="text-[10px] text-signal font-semibold flex items-center gap-1">
              <RefreshCw size={10} className="animate-spin" /> PIPELINE_OK
            </span>
          </div>

          <div className="flex-1 overflow-y-auto flex flex-col gap-1 pr-2 scrollbar-thin">
            <AnimatePresence>
              {logs.map((log, index) => (
                <motion.div
                  key={`${log}-${index}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="leading-relaxed"
                >
                  <span className="text-violet font-semibold mr-1.5">&gt;</span> {log}
                </motion.div>
              ))}
            </AnimatePresence>
            {logIndex < SIMULATED_LOGS.length && (
              <p className="text-chrome/70 flex items-center gap-1 mt-1">
                compiling next routine <span className="cursor-blink">_</span>
              </p>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-hairline flex justify-between text-[10px] text-chrome-dim/50">
            <span>LOC_THREADS: 256/256</span>
            <span>PORT: 5173 // HOST</span>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 text-[10px] font-mono text-chrome-dim/40 uppercase tracking-wider font-semibold">
          SECURE CREDENTIAL GATEWAY // PROD_ENVIRONMENT_SECURED
        </div>
      </div>

      {/* Right side: Login Panel */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm glass rounded-[28px] p-8 relative bg-gunmetal/80 border border-hairline shadow-[0_0_28px_rgba(0,0,0,0.34)]"
        >
          {/* Logo show on mobile */}
          <div className="md:hidden flex items-center gap-2 mb-6 justify-center">
            <Terminal size={20} className="text-signal" />
            <span className="font-display font-bold text-xl tracking-tight text-chrome">
              DevTrack<span className="text-signal">.AI</span>
            </span>
          </div>

          <div className="text-center md:text-left mb-8">
            <h2 className="font-display text-2xl font-bold text-chrome tracking-tight uppercase font-mono">
              Console Sign In
            </h2>
            <p className="text-[10px] text-chrome-dim font-mono mt-1.5 flex items-center justify-center md:justify-start gap-1.5 tracking-wider font-semibold">
              <Shield size={12} className="text-signal" /> DECRYPTION AUTH REQUIRED
            </p>
          </div>

          <AnimatePresence mode="wait">
            {!booting ? (
              <motion.form
                key="form"
                exit={{ opacity: 0, y: -10 }}
                onSubmit={handleSubmit}
                className="flex flex-col gap-5"
              >
                <div className="flex flex-col gap-2">
                  <label className="text-[9px] uppercase tracking-widest text-chrome-dim font-bold font-mono">
                    Client Username
                  </label>
                  <input
                    autoFocus
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="bg-void/60 border border-hairline rounded-full px-5 py-3 text-xs font-mono outline-none text-chrome focus:border-signal focus:ring-1 focus:ring-signal/30 transition-all duration-200"
                    placeholder="devansh"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[9px] uppercase tracking-widest text-chrome-dim font-bold font-mono">
                    Client Passkey
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-void/60 border border-hairline rounded-full px-5 py-3 text-xs font-mono outline-none text-chrome focus:border-signal focus:ring-1 focus:ring-signal/30 transition-all duration-200"
                    placeholder="••••••••••"
                  />
                </div>

                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -2 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-signal font-mono bg-signal/5 border border-signal-dim/30 rounded-[20px] p-3"
                  >
                    ACCESS_DENIED: {error}
                  </motion.p>
                )}

                <button
                  type="submit"
                  className="mt-3 flex items-center justify-center gap-2 bg-gradient-to-r from-signal to-violet hover:opacity-90 text-void font-bold text-xs uppercase tracking-wider py-3.5 px-5 rounded-full cursor-pointer transition-all duration-200 hover:shadow-[0_0_15px_rgba(0,0,0,0.28)] active:scale-[0.98]"
                >
                  Decrypt & Authorize
                  <ArrowRight size={15} />
                </button>

                <div className="text-[10px] text-chrome-dim/40 font-mono text-center mt-3 bg-void/40 py-2.5 px-3 rounded-full border border-hairline/60">
                  credentials: <span className="text-chrome font-bold">devansh</span> / <span className="text-chrome font-bold">devtrack2026</span>
                </div>
              </motion.form>
            ) : (
              <motion.div
                key="boot"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-mono text-xs text-chrome-dim flex flex-col gap-2.5 py-6"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-signal animate-ping" />
                  <p className="text-signal font-bold uppercase tracking-wider">✓ session handshake active</p>
                </div>
                <p className="text-chrome-dim/60 pl-4">INITIALIZING SYSTEM SHIELDS...</p>
                <p className="text-chrome-dim/60 pl-4">SYNCING PLATFORM WRAPPER CACHES...</p>
                <p className="text-chrome-dim/60 pl-4 flex items-center gap-1.5">
                  MOUNTING MAIN PANEL ROUTERS <span className="cursor-blink">_</span>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}
