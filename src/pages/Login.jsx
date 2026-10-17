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

const RANDOM_LOG_TEMPLATES = [
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
  'SYSTEM: compiling sector analytics_engine...',
  'GITHUB: resolved 25 active repositories.',
  'LEETCODE: GraphQL query resolved successfully (latency 86ms).',
  'CODEFORCES: submission stream listening on active sockets.',
  'SECURITY: decrypting client passkey hash signature... OK',
  'DATABASE: connection established with localized indexedDB.',
  'ATS: scanning resume corpus for keyword matches...',
  'SYS_DESIGN: scaled cache cluster check - status optimal.',
  'SERVER: active worker threads: 256/256.',
  'PORT: 5173 initialized and listening for traffic.',
  'CORE: syncing dashboard navigation components...',
  'PIPELINE: daily goal routine compilation running...',
  'COMPILER: modules loaded: AuthContext, UserContext, StatCard.',
  'CACHING: memory buffers purged successfully.',
  'SECURITY: SSL handshake complete on secure client gateways.',
]

const defaultColors = ['#b8f22f', '#ff4a4a', '#ff9d00', '#0084ff', '#8c63ff', '#ff00b8', '#00d5ff', '#b8f22f', '#ff9d00', '#8c63ff']
const hoverColors = ['#ff4a4a', '#ff9d00', '#0084ff', '#8c63ff', '#ff00b8', '#00d5ff', '#b8f22f', '#ff4a4a', '#8c63ff', '#00d5ff']

function ColorfulLetter({ char, index }) {
  const [hovered, setHovered] = useState(false)
  
  const handleMouseEnter = () => {
    setHovered(true)
  }
  
  const handleMouseLeave = () => {
    setHovered(false)
  }

  return (
    <span
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ 
        color: hovered ? defaultColors[index % defaultColors.length] : '#0d1117',
        fontFamily: hovered ? "'Caveat', cursive" : "var(--font-display)",
        transition: 'color 0.2s ease, font-family 0.1s ease',
        display: 'inline-block',
        transform: hovered ? 'scale(1.15) rotate(-5deg)' : 'scale(1) rotate(0deg)'
      }}
      className="cursor-pointer font-extrabold px-[1px] transition-transform duration-200"
    >
      {char}
    </span>
  )
}

export default function Login() {
  const [showForm, setShowForm] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [booting, setBooting] = useState(false)
  const [runningLogs, setRunningLogs] = useState([])

  const { login } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    // Fill the screen with initial log entries immediately
    let initial = []
    for (let i = 0; i < 24; i++) {
      initial.push(RANDOM_LOG_TEMPLATES[i % RANDOM_LOG_TEMPLATES.length])
    }
    setRunningLogs(initial)

    // Continuously append a new random log line every 400ms
    const interval = setInterval(() => {
      setRunningLogs((prev) => {
        const nextLog = RANDOM_LOG_TEMPLATES[Math.floor(Math.random() * RANDOM_LOG_TEMPLATES.length)]
        return [...prev.slice(-26), nextLog] // Keep only the latest 26 log lines to fit clean viewport
      })
    }, 400)

    return () => clearInterval(interval)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setBooting(true)
    const result = await login(username, password)
    if (!result.ok) {
      setBooting(false)
      setError(result.error)
      return
    }
    setTimeout(() => navigate('/setup'), 1200)
  }

  return (
    <div 
      className="h-full min-h-0 flex flex-col relative overflow-hidden rounded-[40px] border border-hairline/70 shadow-[0_20px_60px_rgba(35,28,23,0.08)] backdrop-blur-2xl"
      style={{ background: 'radial-gradient(circle at center, #ffffff 0%, #ecf9ce 100%)' }}
    >
      {/* Visual background accents */}
      <div className="absolute inset-0 scanline pointer-events-none z-20" />
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-signal/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-violet/15 blur-3xl pointer-events-none" />

      {/* Full-screen terminal background stream (GLOBAL BACKGROUND) - ONLY RENDERS WHEN FORM IS SHOWN */}
      {showForm && (
        <div 
          className="absolute inset-0 p-8 sm:p-12 font-mono text-xs overflow-hidden select-none z-0 flex flex-col justify-end"
          style={{
            backgroundImage: 'linear-gradient(0deg, rgba(255,255,255,0.7) 50%, rgba(186,255,43,0.06) 50%)',
            backgroundSize: '100% 4px'
          }}
        >
          {/* Dual-column logs floating on left and right sides of the background */}
          <div className="flex-1 overflow-hidden flex justify-between items-stretch gap-8 opacity-80 my-2 select-none">
            {/* Left Column (Even indexes, aligned left) */}
            <div className="w-1/2 sm:w-1/3 flex flex-col justify-end gap-1.5 pr-2">
              {runningLogs.map((log, index) => (
                index % 2 === 0 && (
                  <div 
                    key={index} 
                    style={{ fontFamily: "'Caveat', cursive" }}
                    className="leading-none text-[#2b4c03]/75 font-bold text-[19px] whitespace-nowrap truncate text-left"
                  >
                    <span className="text-[#4c8402] font-black mr-1.5">&gt;</span> {log}
                  </div>
                )
              ))}
            </div>

            {/* Right Column (Odd indexes, aligned right) */}
            <div className="w-1/2 sm:w-1/3 flex flex-col justify-end gap-1.5 pl-2 text-right">
              {runningLogs.map((log, index) => (
                index % 2 !== 0 && (
                  <div 
                    key={index} 
                    style={{ fontFamily: "'Caveat', cursive" }}
                    className="leading-none text-[#2b4c03]/75 font-bold text-[19px] whitespace-nowrap truncate text-right"
                  >
                    {log} <span className="text-[#4c8402] font-black ml-1.5">&lt;</span>
                  </div>
                )
              ))}
            </div>
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {!showForm ? (
          <motion.div
            key="full-splash"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex-1 w-full h-full flex flex-col items-center justify-center text-center p-6 relative z-10 select-none"
          >
            <div className="text-6xl sm:text-7xl md:text-8xl font-black font-display tracking-tight mb-4 select-none leading-none">
              {'DevTracker'.split('').map((char, index) => (
                <ColorfulLetter key={index} char={char} index={index} />
              ))}
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="mt-12 w-14 h-14 rounded-full bg-gradient-to-r from-signal to-violet hover:scale-110 flex items-center justify-center text-chrome cursor-pointer transition-all duration-300 shadow-[0_15px_30px_rgba(140,99,255,0.15)]"
            >
              <ArrowRight size={20} />
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="centered-portal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="flex-1 w-full h-full flex items-center justify-center p-6 relative z-10 min-h-0"
          >

            {/* Centered Login Card Box */}
            <div 
              className="w-full max-w-sm rounded-[32px] p-8 sm:p-10 relative bg-white/90 border border-[#baff2b]/30 shadow-[0_20px_50px_rgba(30,50,10,0.06)] backdrop-blur-xl z-10 flex flex-col"
              style={{
                boxShadow: '0 0 30px rgba(186, 255, 43, 0.08)'
              }}
            >
              {/* Logo */}
              <div className="flex items-center gap-2 mb-6 justify-center">
                <Terminal size={18} className="text-[#4c8402]" />
                <span className="font-display font-extrabold text-lg tracking-tight text-chrome">
                  {'DevTracker'.split('').map((char, index) => (
                    <ColorfulLetter key={index} char={char} index={index} />
                  ))}
                </span>
              </div>

              <div className="text-center mb-8">
                <h2 className="font-display text-2xl font-bold text-[#0d1117] tracking-tight uppercase font-mono">
                  Console Sign In
                </h2>
                <p className="text-[10px] text-chrome-dim/70 font-mono mt-1.5 flex items-center justify-center gap-1.5 tracking-wider font-semibold">
                  <Shield size={12} className="text-[#4c8402]" /> DECRYPTION AUTH REQUIRED
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
                      <label className="text-[10px] uppercase tracking-widest text-chrome-dim/60 font-bold font-mono">
                        Client Username
                      </label>
                      <input
                        autoFocus
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="bg-[#f4f7f0]/70 border border-[#baff2b]/30 rounded-2xl px-5 py-3 text-xs font-mono outline-none text-[#0d1117] focus:border-[#4c8402] focus:ring-1 focus:ring-[#4c8402]/30 transition-all duration-200"
                        placeholder="devansh"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] uppercase tracking-widest text-chrome-dim/60 font-bold font-mono">
                        Client Passkey
                      </label>
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="bg-[#f4f7f0]/70 border border-[#baff2b]/30 rounded-2xl px-5 py-3 text-xs font-mono outline-none text-[#0d1117] focus:border-[#4c8402] focus:ring-1 focus:ring-[#4c8402]/30 transition-all duration-200"
                        placeholder="••••••••••"
                      />
                    </div>

                    {error && (
                      <motion.p
                        initial={{ opacity: 0, y: -2 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs text-red-600 font-mono bg-red-500/5 border border-red-500/10 rounded-xl p-3 text-center"
                      >
                        ACCESS_DENIED: {error}
                      </motion.p>
                    )}

                    <button
                      type="submit"
                      className="mt-3 flex items-center justify-center gap-2 bg-gradient-to-r from-[#baff2b] to-[#8c63ff] hover:opacity-95 text-[#0d1117] font-bold text-xs uppercase tracking-wider py-3.5 px-5 rounded-2xl cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-[0_8px_20px_rgba(140,99,255,0.18)]"
                    >
                      Decrypt & Authorize
                      <ArrowRight size={15} />
                    </button>
                  </motion.form>
                ) : (
                  <motion.div
                    key="boot"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="font-mono text-xs text-chrome-dim flex flex-col gap-2.5 py-6"
                  >
                    <div className="flex items-center gap-2 justify-center">
                      <span className="w-2.5 h-2.5 rounded-full bg-signal animate-ping" />
                      <p className="text-signal font-bold uppercase tracking-wider">✓ session handshake active</p>
                    </div>
                    <p className="text-chrome-dim/60 text-center">INITIALIZING SYSTEM SHIELDS...</p>
                    <p className="text-chrome-dim/60 text-center">SYNCING PLATFORM WRAPPER CACHES...</p>
                    <p className="text-chrome-dim/60 text-center flex items-center justify-center gap-1.5">
                      MOUNTING MAIN PANEL ROUTERS <span className="cursor-blink">_</span>
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
