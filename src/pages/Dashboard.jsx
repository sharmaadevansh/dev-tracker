import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Mail, Code2, ExternalLink, User, Swords, Sparkles } from 'lucide-react'
import { GithubIcon, LinkedinIcon } from '../components/BrandIcons'
import { useUserHandles } from '../context/UserContext'
import { fetchGithubAll } from '../services/api/github'
import { fetchLeetcodeAll } from '../services/api/leetcode'
import { fetchCodeforcesAll } from '../services/api/codeforces'
import { fetchCodechefProfile } from '../services/api/codechef'
import { buildLinkedinProfileUrl } from '../services/api/linkedin'
import { CardSkeleton, InlineSpinner } from '../components/Loader'

export default function Dashboard() {
  const { handles } = useUserHandles()

  // Queries to fetch profile states and populate quick stats inside circles
  const github = useQuery({
    queryKey: ['github', handles.github],
    queryFn: () => fetchGithubAll(handles.github),
    enabled: !!handles.github,
    staleTime: 5 * 60 * 1000,
  })

  const leetcode = useQuery({
    queryKey: ['leetcode', handles.leetcode],
    queryFn: () => fetchLeetcodeAll(handles.leetcode),
    enabled: !!handles.leetcode,
    staleTime: 5 * 60 * 1000,
  })

  const codeforces = useQuery({
    queryKey: ['codeforces', handles.codeforces],
    queryFn: () => fetchCodeforcesAll(handles.codeforces),
    enabled: !!handles.codeforces,
    staleTime: 5 * 60 * 1000,
  })

  const codechef = useQuery({
    queryKey: ['codechef', handles.codechef],
    queryFn: () => fetchCodechefProfile(handles.codechef),
    enabled: !!handles.codechef,
    staleTime: 5 * 60 * 1000,
  })

  const githubUrl = handles.github ? `https://github.com/${handles.github}` : '#'
  const leetcodeUrl = handles.leetcode ? `https://leetcode.com/${handles.leetcode}` : '#'
  const cfUrl = handles.codeforces ? `https://codeforces.com/profile/${handles.codeforces}` : '#'
  const linkedinUrl = buildLinkedinProfileUrl(handles.linkedin)
  const gmailUrl = 'mailto:sharm.devtrack@gmail.com' // default client mailto

  const isSyncing = github.isFetching || leetcode.isFetching || codeforces.isFetching || codechef.isFetching

  return (
    <div className="flex-1 px-12 py-10 max-w-7xl mx-auto w-full overflow-y-auto space-y-8 scrollbar-thin flex flex-col justify-between h-full relative">
      
      {/* Header segment */}
      <div className="flex items-center justify-between z-10">
        <div>
          <h1 className="font-display text-2xl font-semibold text-chrome">Overview Hub</h1>
        </div>
        {isSyncing && <InlineSpinner label="Syncing platform nodes" />}
      </div>

      {/* Floating Constellation Canvas */}
      <div className="flex-1 min-h-[460px] flex items-center justify-center relative select-none z-10 overflow-hidden my-4 py-8">
        
        {/* Animated Connecting Constellation SVG Lines (Desktop view only) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none hidden md:block">
          <motion.line
            x1="50%" y1="50%" x2="22%" y2="28%"
            stroke="var(--color-signal)" strokeWidth="1.5" strokeDasharray="5,5"
            animate={{ strokeDashoffset: [0, -10] }}
            transition={{ repeat: Infinity, ease: "linear", duration: 2 }}
            className="opacity-45"
          />
          <motion.line
            x1="50%" y1="50%" x2="78%" y2="28%"
            stroke="var(--color-violet)" strokeWidth="1.5" strokeDasharray="5,5"
            animate={{ strokeDashoffset: [0, 10] }}
            transition={{ repeat: Infinity, ease: "linear", duration: 2 }}
            className="opacity-45"
          />
          <motion.line
            x1="50%" y1="50%" x2="18%" y2="72%"
            stroke="var(--color-yellow)" strokeWidth="1.5" strokeDasharray="5,5"
            animate={{ strokeDashoffset: [0, -10] }}
            transition={{ repeat: Infinity, ease: "linear", duration: 2.5 }}
            className="opacity-45"
          />
          <motion.line
            x1="50%" y1="50%" x2="82%" y2="72%"
            stroke="var(--color-signal)" strokeWidth="1.5" strokeDasharray="5,5"
            animate={{ strokeDashoffset: [0, 10] }}
            transition={{ repeat: Infinity, ease: "linear", duration: 2.5 }}
            className="opacity-45"
          />
          <motion.line
            x1="50%" y1="50%" x2="50%" y2="12%"
            stroke="var(--color-violet)" strokeWidth="1.5" strokeDasharray="5,5"
            animate={{ strokeDashoffset: [0, -10] }}
            transition={{ repeat: Infinity, ease: "linear", duration: 1.5 }}
            className="opacity-45"
          />
        </svg>

        {/* Central Core Developer Node */}
        <motion.div
          animate={{ y: [0, -6, 0], scale: [1, 1.02, 1] }}
          transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
          className="w-36 h-36 rounded-full glass border-2 border-signal/80 flex flex-col items-center justify-center p-4 text-center shadow-[0_0_30px_rgba(0,0,0,0.44)] relative z-20"
        >
          <div className="w-10 h-10 rounded-full bg-signal/15 border border-signal/30 flex items-center justify-center text-signal mb-1.5 glow-cyan">
            <User size={18} />
          </div>
          <span className="font-display font-bold text-xs text-chrome leading-tight">Devansh Sharma</span>
          <span className="text-[8px] font-mono uppercase tracking-widest text-chrome-dim/60 mt-1">core_hub</span>
        </motion.div>

        {/* Constellation Nodes (Responsive positioning) */}
        
        {/* Node 1: LeetCode (Top Center) */}
        <motion.a
          href={leetcodeUrl}
          target="_blank"
          rel="noreferrer"
          animate={{ y: [0, -12, 0], x: [0, 4, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut', delay: 0.2 }}
          className="absolute md:top-[8%] md:left-[45%] w-24 h-24 rounded-full glass border border-yellow/40 hover:border-yellow shadow-[0_0_18px_rgba(0,0,0,0.3)] hover:shadow-[0_0_30px_rgba(0,0,0,0.44)] transition-all duration-300 flex flex-col items-center justify-center p-3 text-center cursor-pointer group z-10"
        >
          <Code2 size={20} className="text-yellow group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-bold text-chrome font-mono mt-1">LeetCode</span>
          <span className="text-[8px] text-chrome-dim font-mono leading-none mt-0.5">
            {leetcode.isLoading ? '...' : `${leetcode.data?.solved?.totalSolved || 0} Solved`}
          </span>
          <ExternalLink size={8} className="text-chrome-dim/40 absolute bottom-2 group-hover:text-yellow transition-colors" />
        </motion.a>

        {/* Node 2: GitHub (Top Left) */}
        <motion.a
          href={githubUrl}
          target="_blank"
          rel="noreferrer"
          animate={{ y: [0, -14, 0], x: [0, -6, 0] }}
          transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut', delay: 0.5 }}
          className="absolute md:top-[20%] md:left-[15%] w-26 h-26 rounded-full glass border border-signal/40 hover:border-signal shadow-[0_0_18px_rgba(0,0,0,0.3)] hover:shadow-[0_0_30px_rgba(0,0,0,0.44)] transition-all duration-300 flex flex-col items-center justify-center p-3 text-center cursor-pointer group z-10"
        >
          <GithubIcon size={22} className="text-signal group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-bold text-chrome font-mono mt-1">GitHub</span>
          <span className="text-[8px] text-chrome-dim font-mono leading-none mt-0.5">
            {github.isLoading ? '...' : `${github.data?.profile?.publicRepos || 0} Repos`}
          </span>
          <ExternalLink size={8} className="text-chrome-dim/40 absolute bottom-2.5 group-hover:text-signal transition-colors" />
        </motion.a>

        {/* Node 3: LinkedIn (Top Right) */}
        <motion.a
          href={linkedinUrl}
          target="_blank"
          rel="noreferrer"
          animate={{ y: [0, -10, 0], x: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut', delay: 0.8 }}
          className="absolute md:top-[20%] md:right-[15%] w-24 h-24 rounded-full glass border border-violet/40 hover:border-violet shadow-[0_0_18px_rgba(0,0,0,0.3)] hover:shadow-[0_0_30px_rgba(0,0,0,0.44)] transition-all duration-300 flex flex-col items-center justify-center p-3 text-center cursor-pointer group z-10"
        >
          <LinkedinIcon size={20} className="text-violet group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-bold text-chrome font-mono mt-1">LinkedIn</span>
          <span className="text-[8px] text-chrome-dim font-mono leading-none mt-0.5">View Profile</span>
          <ExternalLink size={8} className="text-chrome-dim/40 absolute bottom-2 group-hover:text-violet transition-colors" />
        </motion.a>

        {/* Node 4: Codeforces (Bottom Left) */}
        <motion.a
          href={cfUrl}
          target="_blank"
          rel="noreferrer"
          animate={{ y: [0, -15, 0], x: [0, -5, 0] }}
          transition={{ repeat: Infinity, duration: 5.5, ease: 'easeInOut', delay: 1.1 }}
          className="absolute md:bottom-[15%] md:left-[12%] w-24 h-24 rounded-full glass border border-violet/40 hover:border-violet shadow-[0_0_18px_rgba(0,0,0,0.3)] hover:shadow-[0_0_30px_rgba(0,0,0,0.44)] transition-all duration-300 flex flex-col items-center justify-center p-3 text-center cursor-pointer group z-10"
        >
          <Swords size={20} className="text-violet group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-bold text-chrome font-mono mt-1">Codeforces</span>
          <span className="text-[8px] text-chrome-dim font-mono leading-none mt-0.5">
            {codeforces.isLoading ? '...' : `${codeforces.data?.profile?.rating || 'Unrated'} Rating`}
          </span>
          <ExternalLink size={8} className="text-chrome-dim/40 absolute bottom-2 group-hover:text-violet transition-colors" />
        </motion.a>

        {/* Node 5: Gmail/Email (Bottom Right) */}
        <motion.a
          href={gmailUrl}
          className="absolute md:bottom-[15%] md:right-[10%] w-24 h-24 rounded-full glass border border-signal/40 hover:border-signal shadow-[0_0_18px_rgba(0,0,0,0.3)] hover:shadow-[0_0_30px_rgba(0,0,0,0.44)] transition-all duration-300 flex flex-col items-center justify-center p-3 text-center cursor-pointer group z-10"
          animate={{ y: [0, -11, 0], x: [0, 5, 0] }}
          transition={{ repeat: Infinity, duration: 4.5, ease: 'easeInOut', delay: 1.4 }}
        >
          <Mail size={20} className="text-signal group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-bold text-chrome font-mono mt-1">Gmail</span>
          <span className="text-[8px] text-chrome-dim font-mono leading-none mt-0.5">Get in touch</span>
          <ExternalLink size={8} className="text-chrome-dim/40 absolute bottom-2 group-hover:text-signal transition-colors" />
        </motion.a>

      </div>

      {/* Floating hints footer */}
      <div className="glass rounded-full px-6 py-3.5 flex items-center justify-between text-xs text-chrome-dim font-mono w-full bg-gunmetal/20 border-hairline mt-auto z-10">
        <span className="flex items-center gap-1.5 text-signal-dim font-semibold">
          <Sparkles size={13} className="text-signal led-pulse" />
          constellation_online
        </span>
        <span className="hidden sm:inline">Click any orbiting circle node to launch external portfolio target</span>
      </div>

    </div>
  )
}
