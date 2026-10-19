import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Mail, Code2, ExternalLink, User, Swords, ChefHat } from 'lucide-react'
import { GithubIcon, LinkedinIcon } from '../components/BrandIcons'
import { useUserHandles } from '../context/UserContext'
import { useAuth } from '../context/AuthContext'
import { fetchGithubAll } from '../services/api/github'
import { fetchLeetcodeAll } from '../services/api/leetcode'
import { fetchCodeforcesAll } from '../services/api/codeforces'
import { fetchCodechefProfile } from '../services/api/codechef'
import { buildLinkedinProfileUrl } from '../services/api/linkedin'
import { InlineSpinner } from '../components/Loader'

export default function Dashboard() {
  const { user } = useAuth()
  const { handles, activePlatforms } = useUserHandles()

  // Queries to fetch profile states and populate quick stats inside circles
  const github = useQuery({
    queryKey: ['github', handles.github],
    queryFn: () => fetchGithubAll(handles.github),
    enabled: !!activePlatforms.github && !!handles.github,
    staleTime: 5 * 60 * 1000,
  })

  const leetcode = useQuery({
    queryKey: ['leetcode', handles.leetcode],
    queryFn: () => fetchLeetcodeAll(handles.leetcode),
    enabled: !!activePlatforms.leetcode && !!handles.leetcode,
    staleTime: 5 * 60 * 1000,
  })

  const codeforces = useQuery({
    queryKey: ['codeforces', handles.codeforces],
    queryFn: () => fetchCodeforcesAll(handles.codeforces),
    enabled: !!activePlatforms.codeforces && !!handles.codeforces,
    staleTime: 5 * 60 * 1000,
  })

  const codechef = useQuery({
    queryKey: ['codechef', handles.codechef],
    queryFn: () => fetchCodechefProfile(handles.codechef),
    enabled: !!activePlatforms.codechef && !!handles.codechef,
    staleTime: 5 * 60 * 1000,
  })

  const githubUrl = handles.github ? `https://github.com/${handles.github}` : '#'
  const leetcodeUrl = handles.leetcode ? `https://leetcode.com/${handles.leetcode}` : '#'
  const cfUrl = handles.codeforces ? `https://codeforces.com/profile/${handles.codeforces}` : '#'
  const ccUrl = handles.codechef ? `https://www.codechef.com/users/${handles.codechef}` : '#'
  const linkedinUrl = buildLinkedinProfileUrl(handles.linkedin)
  const gmailUrl = user?.email ? `mailto:${user.email}` : '#'

  const isSyncing =
    (activePlatforms.github && github.isFetching) ||
    (activePlatforms.leetcode && leetcode.isFetching) ||
    (activePlatforms.codeforces && codeforces.isFetching) ||
    (activePlatforms.codechef && codechef.isFetching)

  return (
    <div className="flex-1 px-4 sm:px-8 md:px-12 py-6 sm:py-8 max-w-7xl mx-auto w-full overflow-y-auto space-y-6 scrollbar-thin flex flex-col justify-between h-full relative">
      {/* Live Syncing Indicator */}
      {isSyncing && (
        <div className="absolute top-4 right-6 z-20">
          <InlineSpinner label="Syncing" />
        </div>
      )}

      {/* Floating Constellation Canvas */}
      <div className="flex-1 min-h-[460px] sm:min-h-[500px] flex items-center justify-center relative select-none z-10 overflow-hidden my-4 py-8">
        {/* Animated Connecting Constellation SVG Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none hidden md:block">
          {activePlatforms.leetcode && (
            <motion.line
              x1="50%"
              y1="50%"
              x2="50%"
              y2="12%"
              stroke="var(--color-yellow)"
              strokeWidth="1.5"
              strokeDasharray="5,5"
              animate={{ strokeDashoffset: [0, -10] }}
              transition={{ repeat: Infinity, ease: 'linear', duration: 2 }}
              className="opacity-45"
            />
          )}
          {activePlatforms.github && (
            <motion.line
              x1="50%"
              y1="50%"
              x2="18%"
              y2="24%"
              stroke="var(--color-signal)"
              strokeWidth="1.5"
              strokeDasharray="5,5"
              animate={{ strokeDashoffset: [0, -10] }}
              transition={{ repeat: Infinity, ease: 'linear', duration: 2.2 }}
              className="opacity-45"
            />
          )}
          {activePlatforms.linkedin && (
            <motion.line
              x1="50%"
              y1="50%"
              x2="82%"
              y2="24%"
              stroke="var(--color-violet)"
              strokeWidth="1.5"
              strokeDasharray="5,5"
              animate={{ strokeDashoffset: [0, 10] }}
              transition={{ repeat: Infinity, ease: 'linear', duration: 2 }}
              className="opacity-45"
            />
          )}
          {activePlatforms.codeforces && (
            <motion.line
              x1="50%"
              y1="50%"
              x2="16%"
              y2="75%"
              stroke="var(--color-violet)"
              strokeWidth="1.5"
              strokeDasharray="5,5"
              animate={{ strokeDashoffset: [0, -10] }}
              transition={{ repeat: Infinity, ease: 'linear', duration: 2.5 }}
              className="opacity-45"
            />
          )}
          {activePlatforms.codechef && (
            <motion.line
              x1="50%"
              y1="50%"
              x2="50%"
              y2="88%"
              stroke="var(--color-yellow)"
              strokeWidth="1.5"
              strokeDasharray="5,5"
              animate={{ strokeDashoffset: [0, 10] }}
              transition={{ repeat: Infinity, ease: 'linear', duration: 2 }}
              className="opacity-45"
            />
          )}
          <motion.line
            x1="50%"
            y1="50%"
            x2="84%"
            y2="75%"
            stroke="var(--color-signal)"
            strokeWidth="1.5"
            strokeDasharray="5,5"
            animate={{ strokeDashoffset: [0, 10] }}
            transition={{ repeat: Infinity, ease: 'linear', duration: 2.5 }}
            className="opacity-45"
          />
        </svg>

        {/* Animated Sonar Radar Rings around Central Node */}
        <div className="absolute w-44 h-44 rounded-full border-2 border-signal/40 animate-radar pointer-events-none" />
        <div className="absolute w-44 h-44 rounded-full border-2 border-violet/40 animate-radar pointer-events-none" style={{ animationDelay: '1.25s' }} />

        {/* Central Core Developer Node */}
        <motion.div
          animate={{ y: [0, -6, 0], scale: [1, 1.02, 1] }}
          transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
          whileHover={{ scale: 1.08 }}
          className="w-32 h-32 sm:w-36 sm:h-36 rounded-full glass border-2 border-signal/80 flex flex-col items-center justify-center p-3 sm:p-4 text-center shadow-[0_0_35px_rgba(184,242,47,0.25)] relative z-20 cursor-pointer glow-electric"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-signal/20 border border-signal/40 flex items-center justify-center text-signal-dim dark:text-signal mb-1.5 glow-cyan">
            <User size={18} />
          </div>
          <span className="font-display font-bold text-xs sm:text-sm text-chrome leading-tight">DevTrack Hub</span>
        </motion.div>

        {/* Node 1: LeetCode (Top Center) */}
        {activePlatforms.leetcode && (
          <motion.a
            href={leetcodeUrl}
            target="_blank"
            rel="noreferrer"
            animate={{ y: [0, -10, 0], x: [0, 3, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut', delay: 0.2 }}
            className="absolute top-[3%] left-[calc(50%-44px)] md:top-[8%] md:left-[45%] w-22 h-22 sm:w-24 sm:h-24 rounded-full glass border border-yellow/40 hover:border-yellow shadow-[0_0_18px_rgba(255,213,61,0.15)] hover:shadow-[0_0_30px_rgba(255,213,61,0.3)] transition-all duration-300 flex flex-col items-center justify-center p-2.5 text-center cursor-pointer group z-10"
          >
            <Code2 size={18} className="text-yellow group-hover:scale-110 transition-transform" />
            <span className="text-[11px] sm:text-xs font-semibold font-display text-chrome mt-1 leading-none">LeetCode</span>
            <span className="text-[10px] sm:text-[11px] text-chrome-dim font-sans font-medium leading-none mt-1">
              {leetcode.isLoading ? '...' : `${leetcode.data?.solved?.totalSolved || 0} Solved`}
            </span>
            <ExternalLink size={8} className="text-chrome-dim/40 absolute bottom-2 group-hover:text-yellow transition-colors" />
          </motion.a>
        )}

        {/* Node 2: GitHub (Top Left) */}
        {activePlatforms.github && (
          <motion.a
            href={githubUrl}
            target="_blank"
            rel="noreferrer"
            animate={{ y: [0, -12, 0], x: [0, -4, 0] }}
            transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut', delay: 0.5 }}
            className="absolute top-[16%] left-[4%] sm:left-[8%] md:top-[16%] md:left-[12%] w-22 h-22 sm:w-26 sm:h-26 rounded-full glass border border-signal/40 hover:border-signal shadow-[0_0_18px_rgba(184,242,47,0.15)] hover:shadow-[0_0_30px_rgba(184,242,47,0.3)] transition-all duration-300 flex flex-col items-center justify-center p-2.5 text-center cursor-pointer group z-10"
          >
            <GithubIcon size={20} className="text-signal-dim dark:text-signal group-hover:scale-110 transition-transform" />
            <span className="text-[11px] sm:text-xs font-semibold font-display text-chrome mt-1 leading-none">GitHub</span>
            <span className="text-[10px] sm:text-[11px] text-chrome-dim font-sans font-medium leading-none mt-1">
              {github.isLoading ? '...' : `${github.data?.profile?.publicRepos || 0} Repos`}
            </span>
            <ExternalLink size={8} className="text-chrome-dim/40 absolute bottom-2 sm:bottom-2.5 group-hover:text-signal transition-colors" />
          </motion.a>
        )}

        {/* Node 3: LinkedIn (Top Right) */}
        {activePlatforms.linkedin && (
          <motion.a
            href={linkedinUrl}
            target="_blank"
            rel="noreferrer"
            animate={{ y: [0, -9, 0], x: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut', delay: 0.8 }}
            className="absolute top-[16%] right-[4%] sm:right-[8%] md:top-[16%] md:right-[12%] w-22 h-22 sm:w-24 sm:h-24 rounded-full glass border border-violet/40 hover:border-violet shadow-[0_0_18px_rgba(140,99,255,0.15)] hover:shadow-[0_0_30px_rgba(140,99,255,0.3)] transition-all duration-300 flex flex-col items-center justify-center p-2.5 text-center cursor-pointer group z-10"
          >
            <LinkedinIcon size={18} className="text-violet group-hover:scale-110 transition-transform" />
            <span className="text-[11px] sm:text-xs font-semibold font-display text-chrome mt-1 leading-none">LinkedIn</span>
            <span className="text-[10px] sm:text-[11px] text-chrome-dim font-sans font-medium leading-none mt-1">Profile</span>
            <ExternalLink size={8} className="text-chrome-dim/40 absolute bottom-2 group-hover:text-violet transition-colors" />
          </motion.a>
        )}

        {/* Node 4: Codeforces (Bottom Left) */}
        {activePlatforms.codeforces && (
          <motion.a
            href={cfUrl}
            target="_blank"
            rel="noreferrer"
            animate={{ y: [0, -12, 0], x: [0, -4, 0] }}
            transition={{ repeat: Infinity, duration: 5.5, ease: 'easeInOut', delay: 1.1 }}
            className="absolute bottom-[16%] left-[4%] sm:left-[8%] md:bottom-[12%] md:left-[10%] w-22 h-22 sm:w-24 sm:h-24 rounded-full glass border border-violet/40 hover:border-violet shadow-[0_0_18px_rgba(140,99,255,0.15)] hover:shadow-[0_0_30px_rgba(140,99,255,0.3)] transition-all duration-300 flex flex-col items-center justify-center p-2.5 text-center cursor-pointer group z-10"
          >
            <Swords size={18} className="text-violet group-hover:scale-110 transition-transform" />
            <span className="text-[11px] sm:text-xs font-semibold font-display text-chrome mt-1 leading-none">Codeforces</span>
            <span className="text-[10px] sm:text-[11px] text-chrome-dim font-sans font-medium leading-none mt-1">
              {codeforces.isLoading ? '...' : (codeforces.data?.profile?.rating ? `${codeforces.data.profile.rating} Rtg` : 'Unrated')}
            </span>
            <ExternalLink size={8} className="text-chrome-dim/40 absolute bottom-2 group-hover:text-violet transition-colors" />
          </motion.a>
        )}

        {/* Node 5: CodeChef (Bottom Center) */}
        {activePlatforms.codechef && (
          <motion.a
            href={ccUrl}
            target="_blank"
            rel="noreferrer"
            animate={{ y: [0, -8, 0], x: [0, 2, 0] }}
            transition={{ repeat: Infinity, duration: 4.8, ease: 'easeInOut', delay: 0.9 }}
            className="absolute bottom-[3%] left-[calc(50%-44px)] md:bottom-[4%] md:left-[45%] w-22 h-22 sm:w-24 sm:h-24 rounded-full glass border border-yellow/40 hover:border-yellow shadow-[0_0_18px_rgba(255,213,61,0.15)] hover:shadow-[0_0_30px_rgba(255,213,61,0.3)] transition-all duration-300 flex flex-col items-center justify-center p-2.5 text-center cursor-pointer group z-10"
          >
            <ChefHat size={18} className="text-yellow group-hover:scale-110 transition-transform" />
            <span className="text-[11px] sm:text-xs font-semibold font-display text-chrome mt-1 leading-none">CodeChef</span>
            <span className="text-[10px] sm:text-[11px] text-chrome-dim font-sans font-medium leading-none mt-1">
              {codechef.isLoading ? '...' : (codechef.data?.rating ? `${codechef.data.stars || 'Unrated'} (${codechef.data.rating})` : 'Unrated')}
            </span>
            <ExternalLink size={8} className="text-chrome-dim/40 absolute bottom-2 group-hover:text-yellow transition-colors" />
          </motion.a>
        )}

        {/* Node 6: Gmail/Email (Bottom Right) */}
        <motion.a
          href={gmailUrl}
          className="absolute bottom-[16%] right-[4%] sm:right-[8%] md:bottom-[12%] md:right-[10%] w-22 h-22 sm:w-24 sm:h-24 rounded-full glass border border-signal/40 hover:border-signal shadow-[0_0_18px_rgba(184,242,47,0.15)] hover:shadow-[0_0_30px_rgba(184,242,47,0.3)] transition-all duration-300 flex flex-col items-center justify-center p-2.5 text-center cursor-pointer group z-10"
          animate={{ y: [0, -10, 0], x: [0, 4, 0] }}
          transition={{ repeat: Infinity, duration: 4.5, ease: 'easeInOut', delay: 1.4 }}
        >
          <Mail size={18} className="text-signal-dim dark:text-signal group-hover:scale-110 transition-transform" />
          <span className="text-[11px] sm:text-xs font-semibold font-display text-chrome mt-1 leading-none">Email</span>
          <span className="text-[10px] sm:text-[11px] text-chrome-dim font-sans font-medium leading-none mt-1">Get in touch</span>
          <ExternalLink size={8} className="text-chrome-dim/40 absolute bottom-2 group-hover:text-signal transition-colors" />
        </motion.a>
      </div>

      {/* Platform interaction hint */}
      <div className="glass rounded-full px-6 py-3 flex items-center justify-center text-xs text-chrome-dim/75 font-sans w-full bg-gunmetal/20 border-hairline mt-auto z-10">
        <span>Click any platform node to launch profile</span>
      </div>
    </div>
  )
}
