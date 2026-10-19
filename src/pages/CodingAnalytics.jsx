import { useState, useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'
import {
  Award,
  ShieldAlert,
  Star,
  Activity,
  CheckCircle2,
  GitBranch,
  Code2,
  Database,
  ExternalLink,
  Swords,
  ChefHat,
  GraduationCap,
  TrendingUp,
  Sliders,
  Sparkles,
  HelpCircle,
  Plus,
  Check,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { GithubIcon } from '../components/BrandIcons'
import { useUserHandles } from '../context/UserContext'
import { useAuth } from '../context/AuthContext'
import { fetchGithubAll } from '../services/api/github'
import { fetchLeetcodeAll } from '../services/api/leetcode'
import { fetchGfgProfile } from '../services/api/gfg'
import { fetchCodeforcesAll, getCodeforcesRankColor } from '../services/api/codeforces'
import { fetchCodechefProfile } from '../services/api/codechef'
import { fetchRecommendedProblems } from '../services/api/backend'
import { getScopedItem, setScopedItem } from '../utils/storage'
import StatCard from '../components/StatCard'
import { CardSkeleton, InlineSpinner } from '../components/Loader'
import Heatmap from '../components/Heatmap'

const PIE_COLORS = ['#8c63ff', '#ffd53d', '#b8f22f'] // Violet (Easy), Yellow (Medium), Signal Lime (Hard)
const CHART_COLORS = ['#8c63ff', '#b8f22f', '#ffd53d', '#8c63ff', '#0d1117']

export default function CodingAnalytics() {
  const { handles, activePlatforms, togglePlatform } = useUserHandles()
  const [selectedTab, setSelectedTab] = useState('all') // 'all' | 'codeforces' | 'codechef' | 'leetcode' | 'github' | 'gfg'
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const username = user?.username || ''
  const [expandedHints, setExpandedHints] = useState({})
  const [addedGoals, setAddedGoals] = useState({})

  const aiWorkout = useQuery({
    queryKey: ['ai-recommended-problems', username, handles.leetcode, handles.codeforces],
    queryFn: () => fetchRecommendedProblems(username),
    staleTime: 30 * 60 * 1000,
  })

  const handleAddProblemToGoal = (problem) => {
    const currentGoals = getScopedItem('goals', username, [])
    const newGoal = {
      id: crypto.randomUUID(),
      text: `Solve ${problem.title} (${problem.platform} - ${problem.topic})`,
      category: 'Coding',
      completed: false,
      createdAt: new Date().toISOString(),
    }
    const updated = [newGoal, ...currentGoals]
    setScopedItem('goals', username, updated)
    queryClient.setQueryData(['backend-goals', username], updated)
    setAddedGoals((prev) => ({ ...prev, [problem.id]: true }))
  }

  const toggleHint = (id) => {
    setExpandedHints((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  // Platform queries - only enabled if platform is toggled ON and handle is provided
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

  const gfg = useQuery({
    queryKey: ['gfg', handles.gfg],
    queryFn: () => fetchGfgProfile(handles.gfg),
    enabled: !!activePlatforms.gfg && !!handles.gfg,
    staleTime: 5 * 60 * 1000,
  })

  const isSyncing =
    github.isFetching || leetcode.isFetching || codeforces.isFetching || codechef.isFetching || gfg.isFetching

  // --- LeetCode Computations ---
  const lcSolved = leetcode.data?.solved?.totalSolved || 0
  const lcEasy = leetcode.data?.solved?.easySolved || 0
  const lcMedium = leetcode.data?.solved?.mediumSolved || 0
  const lcHard = leetcode.data?.solved?.hardSolved || 0
  const lcActiveDays = leetcode.data?.calendar?.activeDays || 0
  const lcAcceptRate = leetcode.data?.solved?.acceptanceRate || '64.2'
  const lcContestRating = Math.round(leetcode.data?.contest?.rating || 0)

  const leetcodeDifficultyData = leetcode.data?.solved
    ? [
        { name: 'Easy', value: lcEasy },
        { name: 'Medium', value: lcMedium },
        { name: 'Hard', value: lcHard },
      ]
    : []

  // --- GitHub Computations ---
  const ghReposCount = github.data?.profile?.publicRepos || 0
  const ghFollowers = github.data?.profile?.followers || 0
  const ghStars = github.data?.totalStars || 0
  const ghLanguages = github.data?.languages?.slice(0, 5) || []
  const ghRecentRepos = github.data?.repos?.slice(0, 4) || []

  // --- Codeforces Computations ---
  const cfProfile = codeforces.data?.profile
  const cfRating = cfProfile?.rating || 0
  const cfMaxRating = cfProfile?.maxRating || cfRating
  const cfRank = cfProfile?.rank || 'Unrated'
  const cfMaxRank = cfProfile?.maxRank || cfRank
  const cfRankColor = getCodeforcesRankColor(cfRank)
  const cfRatingHistory = useMemo(() => {
    return (codeforces.data?.ratingHistory || []).slice(-15).map((item) => ({
      name: item.date,
      rating: item.newRating,
      contest: item.contestName,
      rank: item.rank,
    }))
  }, [codeforces.data?.ratingHistory])

  // --- CodeChef Computations ---
  const ccData = codechef.data
  const ccRating = ccData?.rating || 0
  const ccHighestRating = ccData?.highestRating || ccRating
  const ccStars = ccData?.stars || (ccRating ? '1★' : 'Unrated')
  const ccDivision = ccData?.division || 'Unrated'
  const ccGlobalRank = ccData?.globalRank || 'Unranked'
  const ccCountryRank = ccData?.countryRank || 'Unranked'

  // Star tier calculation
  const nextStarTarget = useMemo(() => {
    if (ccRating < 1400) return { stars: '2★', rating: 1400, percent: Math.min(100, Math.round((ccRating / 1400) * 100)) }
    if (ccRating < 1600) return { stars: '3★', rating: 1600, percent: Math.min(100, Math.round(((ccRating - 1400) / 200) * 100)) }
    if (ccRating < 1800) return { stars: '4★', rating: 1800, percent: Math.min(100, Math.round(((ccRating - 1600) / 200) * 100)) }
    if (ccRating < 2000) return { stars: '5★', rating: 2000, percent: Math.min(100, Math.round(((ccRating - 1800) / 200) * 100)) }
    if (ccRating < 2200) return { stars: '6★', rating: 2200, percent: Math.min(100, Math.round(((ccRating - 2000) / 200) * 100)) }
    if (ccRating < 2500) return { stars: '7★', rating: 2500, percent: Math.min(100, Math.round(((ccRating - 2200) / 300) * 100)) }
    return { stars: '7★ Elite', rating: 2500, percent: 100 }
  }, [ccRating])

  // --- GFG Computations ---
  const gfgData = gfg.data

  const platformDefs = [
    { key: 'codeforces', label: 'Codeforces', icon: Swords, color: 'text-violet', border: 'border-violet/40', count: cfRating ? `${cfRating} Rtg` : 'CF' },
    { key: 'codechef', label: 'CodeChef', icon: ChefHat, color: 'text-yellow', border: 'border-yellow/40', count: ccRating ? `${ccRating} Rtg` : 'CC' },
    { key: 'leetcode', label: 'LeetCode', icon: Code2, color: 'text-yellow', border: 'border-yellow/40', count: lcSolved ? `${lcSolved} Solved` : 'LC' },
    { key: 'github', label: 'GitHub', icon: GithubIcon, color: 'text-signal', border: 'border-signal/40', count: ghReposCount ? `${ghReposCount} Repos` : 'GH' },
    { key: 'gfg', label: 'GeeksforGeeks', icon: GraduationCap, color: 'text-green-600', border: 'border-green-500/40', count: gfgData?.codingScore ? `${gfgData.codingScore} pts` : 'GFG' },
  ]

  const activeCount = Object.values(activePlatforms).filter(Boolean).length

  return (
    <div className="flex-1 px-4 sm:px-8 md:px-12 py-6 sm:py-8 max-w-7xl mx-auto w-full overflow-y-auto space-y-6 sm:space-y-8 scrollbar-thin">
      {/* Header section with toggle and filter controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-chrome flex items-center gap-2">
            Coding Analytics & Stats
          </h1>
          <p className="text-sm text-chrome-dim font-sans mt-1">
            Live multi-platform analytics. Use the toggles below to turn specific platforms on/off.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {(codeforces.data?.isFallback || codechef.data?.isFallback || leetcode.data?.isFallback || gfg.data?.isFallback) && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-yellow/10 border border-yellow/30 text-[11px] font-sans font-medium text-yellow-dim">
              <ShieldAlert size={13} className="text-yellow" />
              <span className="hidden sm:inline">Platform scraper in fallback mode</span>
            </div>
          )}
          {isSyncing && <InlineSpinner label="Streaming metrics" />}
          <Link
            to="/setup"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-sans font-medium bg-steel/70 hover:bg-steel border border-hairline text-chrome-dim hover:text-chrome transition-colors"
          >
            <Sliders size={13} />
            Manage Handles
          </Link>
        </div>
      </div>

      {/* PLATFORM QUICK TOGGLE & FILTER BAR */}
      <div className="glass p-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setSelectedTab('all')}
            className={`px-3 py-1.5 rounded-md text-xs font-sans font-medium transition-colors cursor-pointer ${
              selectedTab === 'all'
                ? 'bg-chrome text-void font-semibold'
                : 'bg-steel/60 text-chrome-dim hover:text-chrome'
            }`}
          >
            All Active ({activeCount})
          </button>

          <div className="h-4 w-px bg-hairline mx-1 hidden sm:block" />

          {platformDefs.map(({ key, label, icon: Icon, color, count }) => {
            const isActive = !!activePlatforms[key]
            const isTabSelected = selectedTab === key

            return (
              <div
                key={key}
                className={`flex items-center rounded-md border transition-colors text-xs font-sans font-medium ${
                  isActive
                    ? isTabSelected
                      ? 'bg-steel border-chrome-dim text-chrome'
                      : 'bg-steel/50 border-hairline text-chrome-dim hover:text-chrome'
                    : 'bg-void/40 border-hairline/30 text-chrome-dim/40 opacity-60'
                }`}
              >
                {/* Click to filter tab */}
                <button
                  onClick={() => {
                    if (!isActive) togglePlatform(key)
                    setSelectedTab(key)
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 cursor-pointer"
                >
                  <Icon size={13} className={isActive ? color : 'text-chrome-dim/40'} />
                  <span>{label}</span>
                  {isActive && <span className="text-[11px] font-sans opacity-70">({count})</span>}
                </button>

                {/* Quick Toggle switch inside badge */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    togglePlatform(key)
                  }}
                  title={isActive ? `Turn OFF ${label}` : `Turn ON ${label}`}
                  className={`px-2.5 py-1.5 rounded-r-full border-l border-hairline/30 hover:bg-white/5 transition-colors cursor-pointer text-[11px] font-semibold font-sans flex items-center gap-1 ${
                    isActive ? 'text-signal-dim dark:text-signal' : 'text-chrome-dim/40'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-signal led-pulse' : 'bg-chrome-dim/40'}`} />
                  {isActive ? 'ON' : 'OFF'}
                </button>
              </div>
            )
          })}
        </div>

        <span className="text-xs font-sans text-chrome-dim/70 hidden lg:inline">
          Click platform to filter • Click ON/OFF to toggle stats
        </span>
      </div>

      {/* ZERO ACTIVE PLATFORMS NOTICE */}
      {activeCount === 0 && (
        <div className="glass rounded-[36px] p-10 max-w-md mx-auto text-center border border-hairline bg-gunmetal/50 my-10">
          <ShieldAlert size={44} className="text-signal mx-auto mb-4 animate-pulse" />
          <h3 className="font-display font-semibold text-chrome text-lg">All Platforms Deactivated</h3>
          <p className="text-chrome-dim text-sm mt-2 leading-relaxed font-sans">
            You have toggled all platforms off. Activate specific platforms above to turn on their live metrics.
          </p>
          <div className="flex flex-wrap justify-center gap-2 mt-5">
            <button
              onClick={() => togglePlatform('codeforces')}
              className="px-3 py-1.5 rounded-full text-xs font-sans font-medium bg-violet/20 border border-violet/40 text-violet hover:bg-violet/30 cursor-pointer"
            >
              + Codeforces
            </button>
            <button
              onClick={() => togglePlatform('codechef')}
              className="px-3 py-1.5 rounded-full text-xs font-sans font-medium bg-yellow/20 border border-yellow/40 text-yellow hover:bg-yellow/30 cursor-pointer"
            >
              + CodeChef
            </button>
            <button
              onClick={() => togglePlatform('leetcode')}
              className="px-3 py-1.5 rounded-full text-xs font-sans font-medium bg-yellow/20 border border-yellow/40 text-yellow hover:bg-yellow/30 cursor-pointer"
            >
              + LeetCode
            </button>
            <button
              onClick={() => togglePlatform('github')}
              className="px-3 py-1.5 rounded-full text-xs font-sans font-medium bg-signal/20 border border-signal/40 text-signal hover:bg-signal/30 cursor-pointer"
            >
              + GitHub
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* AI DAILY WORKOUT & ALGORITHM BLINDSPOT RECOMMENDER                         */}
      {/* ========================================================================= */}
      {selectedTab === 'all' && aiWorkout.data && (
        <section className="glass p-5 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-hairline">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-steel flex items-center justify-center text-chrome">
                <Sparkles size={16} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-chrome text-sm sm:text-base">AI Daily Workout & Blindspot Recommender</h3>
                  <span className="text-[11px] font-sans font-medium px-2 py-0.5 rounded-full bg-steel text-chrome-dim border border-hairline">
                    Smart Targeting
                  </span>
                </div>
                <p className="text-xs text-chrome-dim font-sans mt-0.5">
                  Focus: <span className="text-chrome font-medium">{aiWorkout.data.focusArea}</span> • Tier: <span className="text-chrome font-medium">{aiWorkout.data.difficultyTier}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-sans font-medium text-chrome bg-steel px-2.5 py-1 rounded-md border border-hairline">
                {aiWorkout.data.streakBonus}
              </span>
              <button
                onClick={() => aiWorkout.refetch()}
                title="Refresh daily targets"
                className="w-7 h-7 flex items-center justify-center rounded-md bg-steel border border-hairline text-chrome-dim hover:text-chrome cursor-pointer transition-colors"
              >
                <Sliders size={13} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {aiWorkout.data.recommendations?.map((prob) => {
              const isHintOpen = !!expandedHints[prob.id]
              const isAdded = !!addedGoals[prob.id]

              return (
                <div
                  key={prob.id}
                  className="p-4 rounded-xl bg-steel/40 border border-hairline hover:border-chrome/20 transition-colors flex flex-col justify-between gap-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-sans font-medium px-2 py-0.5 rounded-md bg-steel text-chrome border border-hairline">
                        {prob.platform}
                      </span>
                      <span className="text-[11px] font-sans px-2 py-0.5 rounded-md bg-steel text-chrome font-medium border border-hairline">
                        {prob.difficulty}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-chrome line-clamp-1">{prob.title}</h4>
                      <p className="text-xs font-sans text-chrome-dim mt-0.5">{prob.topic}</p>
                    </div>

                    <p className="text-xs text-chrome-dim leading-relaxed font-sans line-clamp-2">
                      {prob.rationale}
                    </p>

                    {isHintOpen && (
                      <div className="p-2.5 rounded-xl bg-yellow/10 border border-yellow/20 text-xs text-chrome-dim leading-relaxed font-sans">
                        <span className="font-bold text-chrome mr-1">💡 Hint:</span>
                        {prob.hint}
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-hairline/40 flex items-center justify-between gap-2">
                    <button
                      onClick={() => toggleHint(prob.id)}
                      className="text-xs font-sans font-medium text-chrome-dim hover:text-chrome flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <HelpCircle size={11} />
                      <span>{isHintOpen ? 'Hide Hint' : 'Hint'}</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleAddProblemToGoal(prob)}
                        disabled={isAdded}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-sans font-semibold transition-all cursor-pointer ${
                          isAdded
                            ? 'bg-green-500/20 text-green-600 border border-green-500/30'
                            : 'bg-steel hover:bg-steel/80 text-chrome border border-hairline'
                        }`}
                      >
                        {isAdded ? (
                          <>
                            <Check size={10} />
                            <span>In Goals</span>
                          </>
                        ) : (
                          <>
                            <Plus size={10} />
                            <span>Add Goal</span>
                          </>
                        )}
                      </button>

                      <a
                        href={prob.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-sans font-semibold text-void bg-signal hover:opacity-95 shadow-xs transition-opacity"
                      >
                        <span>Solve</span>
                        <ExternalLink size={9} />
                      </a>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 1. CODEFORCES ANALYSIS SECTOR                                             */}
      {/* ========================================================================= */}
      {activePlatforms.codeforces && (selectedTab === 'all' || selectedTab === 'codeforces') && (
        <section className="space-y-6 pt-4 border-t border-hairline/45">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-steel flex items-center justify-center text-chrome shrink-0">
                <Swords size={16} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold text-base text-chrome leading-none">Codeforces Analytics</h2>
                  <span
                    className={`text-[11px] font-sans font-medium px-2 py-0.5 rounded-full border ${cfRankColor.bg} ${cfRankColor.text} ${cfRankColor.border}`}
                  >
                    {cfRank}
                  </span>
                </div>
                <span className="text-xs text-chrome-dim font-sans font-medium leading-none mt-1 inline-block">
                  @{handles.codeforces || username || 'handle'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={`https://codeforces.com/profile/${handles.codeforces || username || 'handle'}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-sans font-medium text-chrome-dim hover:text-violet bg-steel/60 hover:bg-steel border border-hairline transition-colors"
              >
                <span>Profile</span>
                <ExternalLink size={11} />
              </a>
              <button
                onClick={() => togglePlatform('codeforces')}
                className="text-xs font-sans font-medium text-chrome-dim hover:text-signal px-2 py-1 cursor-pointer"
                title="Deactivate Codeforces"
              >
                Hide
              </button>
            </div>
          </div>

          {/* Codeforces Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard
              icon={Award}
              label="Current Rating"
              value={cfRating || 0}
              loading={codeforces.isLoading}
              accent
            />
            <StatCard
              icon={Star}
              label="Peak Rating"
              value={cfMaxRating || 0}
              loading={codeforces.isLoading}
            />
            <StatCard
              icon={CheckCircle2}
              label="Estimated Solved"
              value={codeforces.data?.solvedCount || 0}
              loading={codeforces.isLoading}
            />
            <StatCard
              icon={TrendingUp}
              label="Contests Participated"
              value={codeforces.data?.ratingHistory?.length || 0}
              loading={codeforces.isLoading}
            />
          </div>

          {/* Deep dive: Rating Progression Chart & Contest Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Rating Progression Line Chart */}
            <div className="glass rounded-[32px] p-6 bg-gunmetal/30 border-hairline md:col-span-2 flex flex-col justify-between">
              <div>
                <h3 className="font-display font-semibold text-sm text-chrome flex items-center gap-2">
                  <TrendingUp size={14} className="text-violet" />
                  Contest Rating Progression
                </h3>
                <p className="text-xs text-chrome-dim mt-0.5 font-sans">
                  Rating history timeline across recent competitive rounds
                </p>
              </div>

              <div className="h-56 w-full mt-4">
                {codeforces.isLoading ? (
                  <CardSkeleton />
                ) : cfRatingHistory.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={cfRatingHistory} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                      <XAxis dataKey="name" stroke="#888888" fontSize={10} tickLine={false} />
                      <YAxis stroke="#888888" fontSize={10} domain={['dataMin - 100', 'dataMax + 100']} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1b2030',
                          border: '1px solid #4a5568',
                          borderRadius: '12px',
                          fontSize: '11px',
                          color: '#fff',
                        }}
                        formatter={(val, name, props) => [
                          `${val} Rating (Rank: ${props.payload.rank || 'N/A'})`,
                          props.payload.contest || 'Contest',
                        ]}
                      />
                      <Line
                        type="monotone"
                        dataKey="rating"
                        stroke="#8c63ff"
                        strokeWidth={2.5}
                        dot={{ r: 3.5, fill: '#8c63ff' }}
                        activeDot={{ r: 6, fill: '#b8f22f' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-xs text-chrome-dim font-sans">
                    No contest history recorded yet.
                  </div>
                )}
              </div>
            </div>

            {/* Rank Tier Card */}
            <div className="glass rounded-[32px] p-6 bg-gunmetal/30 border-hairline flex flex-col justify-between">
              <div>
                <h3 className="font-display font-semibold text-sm text-chrome">
                  Rank Standing & Details
                </h3>
                <p className="text-xs text-chrome-dim mt-0.5 font-sans">Codeforces division tier categorization</p>
              </div>

              <div className="my-auto py-4 space-y-4">
                <div className="p-4 rounded-2xl bg-steel/40 border border-hairline flex flex-col items-center text-center">
                  <span className="text-[11px] font-sans font-medium text-chrome-dim uppercase tracking-wider">Current Division Title</span>
                  <span className={`text-base font-display font-bold capitalize mt-1 ${cfRankColor.text}`}>
                    {cfRank}
                  </span>
                  <span className="text-xs font-sans font-medium text-chrome mt-0.5">{cfRating} rating points</span>
                </div>

                <div className="space-y-2 text-xs font-sans text-chrome-dim">
                  <div className="flex justify-between py-1 border-b border-hairline/30">
                    <span>Highest Rank:</span>
                    <span className="text-chrome font-semibold capitalize">{cfMaxRank}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-hairline/30">
                    <span>Peak Milestone:</span>
                    <span className="text-chrome font-semibold">{cfMaxRating} pts</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>Community Contribution:</span>
                    <span className="text-chrome font-semibold">{cfProfile?.contribution || 0}</span>
                  </div>
                </div>
              </div>

              <span className="text-xs font-sans text-chrome-dim/60 text-center">
                Updates dynamically from the Codeforces official API
              </span>
            </div>
          </div>

          {/* Codeforces Submissions Heatmap */}
          <div className="glass rounded-[32px] p-6 bg-gunmetal/30 border-hairline flex flex-col justify-between">
            <div>
              <h3 className="font-display font-semibold text-sm text-chrome flex items-center gap-2">
                <Swords size={14} className="text-violet animate-pulse" />
                Codeforces Activity Heatmap
              </h3>
              <p className="text-xs text-chrome-dim mt-0.5 font-sans">
                Real submission trace across rounds and practice sessions
              </p>
            </div>
            <div className="flex-1 mt-4 flex items-center justify-center">
              {codeforces.isLoading ? (
                <CardSkeleton />
              ) : (
                <Heatmap
                  rows={7}
                  cols={16}
                  data={codeforces.data?.submissionDates}
                  colorScheme="violet"
                  label="submissions"
                />
              )}
            </div>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 2. CODECHEF ANALYSIS SECTOR                                               */}
      {/* ========================================================================= */}
      {activePlatforms.codechef && (selectedTab === 'all' || selectedTab === 'codechef') && (
        <section className="space-y-6 pt-4 border-t border-hairline/45">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-steel flex items-center justify-center text-chrome shrink-0">
                <ChefHat size={16} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold text-base text-chrome leading-none">CodeChef Analytics</h2>
                  <span className="text-[11px] font-sans font-medium px-2 py-0.5 rounded-full bg-steel text-chrome border border-hairline flex items-center gap-1">
                    <Star size={10} fill="currentColor" /> {ccStars} Coder
                  </span>
                  <span className="text-[11px] font-sans font-medium px-2 py-0.5 rounded-full bg-steel text-chrome-dim border border-hairline">
                    {ccDivision}
                  </span>
                </div>
                <span className="text-xs text-chrome-dim font-sans font-medium leading-none mt-1 inline-block">
                  @{handles.codechef || username || 'handle'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={`https://www.codechef.com/users/${handles.codechef || username || 'handle'}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-sans font-medium text-chrome-dim hover:text-yellow bg-steel/60 hover:bg-steel border border-hairline transition-colors"
              >
                <span>Profile</span>
                <ExternalLink size={11} />
              </a>
              <button
                onClick={() => togglePlatform('codechef')}
                className="text-xs font-sans font-medium text-chrome-dim hover:text-signal px-2 py-1 cursor-pointer"
                title="Deactivate CodeChef"
              >
                Hide
              </button>
            </div>
          </div>

          {/* CodeChef Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard
              icon={Award}
              label="Current Rating"
              value={ccRating || 0}
              loading={codechef.isLoading}
              accent
            />
            <StatCard
              icon={Star}
              label="Highest Rating"
              value={ccHighestRating || 0}
              loading={codechef.isLoading}
            />
            <StatCard
              icon={Activity}
              label="Global Rank"
              value={ccGlobalRank}
              loading={codechef.isLoading}
            />
            <StatCard
              icon={CheckCircle2}
              label="Country Rank"
              value={ccCountryRank}
              loading={codechef.isLoading}
            />
          </div>

          {/* Deep dive: Tier Progress & Rating Band */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass rounded-[32px] p-6 bg-gunmetal/30 border-hairline md:col-span-2 flex flex-col justify-between">
              <div>
                <h3 className="font-display font-semibold text-sm text-chrome flex items-center gap-2">
                  <Star size={14} className="text-yellow" />
                  Rating Tier & Milestone Target
                </h3>
                <p className="text-xs text-chrome-dim mt-0.5 font-sans">
                  Path to next Star badge qualification ({nextStarTarget.stars})
                </p>
              </div>

              <div className="my-6 space-y-4">
                <div className="flex items-center justify-between text-xs font-sans">
                  <span className="text-chrome font-bold flex items-center gap-1.5">
                    Current: <span className="text-yellow">{ccRating}</span> ({ccStars})
                  </span>
                  <span className="text-chrome-dim">Target: {nextStarTarget.rating} pts</span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-steel/80 h-3 rounded-full overflow-hidden p-0.5 border border-hairline/40">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${nextStarTarget.percent}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="h-full rounded-full bg-chrome"
                  />
                </div>

                <div className="flex justify-between text-xs font-sans text-chrome-dim/70">
                  <span>1★ (0-1399)</span>
                  <span>3★ (1600+)</span>
                  <span>5★ (2000+)</span>
                  <span>7★ (2500+)</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-steel/30 border border-hairline/40 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-sans text-chrome-dim">
                  <Sparkles size={14} className="text-yellow led-pulse" />
                  <span>Eligible Division: <strong className="text-chrome">{ccDivision}</strong></span>
                </div>
                <span className="text-xs font-sans text-chrome-dim/60">
                  Live data via backend scraper
                </span>
              </div>
            </div>

            <div className="glass rounded-[32px] p-6 bg-gunmetal/30 border-hairline flex flex-col justify-between">
              <div>
                <h3 className="font-display font-semibold text-sm text-chrome">
                  CodeChef Star Levels
                </h3>
                <p className="text-xs text-chrome-dim mt-0.5 font-sans">Official rating brackets</p>
              </div>

              <div className="space-y-2.5 my-auto py-3 text-xs font-sans">
                {[
                  { star: '7★', rtg: '2500+', color: 'text-red-400' },
                  { star: '6★', rtg: '2200 - 2499', color: 'text-orange-400' },
                  { star: '5★', rtg: '2000 - 2199', color: 'text-yellow-400' },
                  { star: '4★', rtg: '1800 - 1999', color: 'text-purple-400' },
                  { star: '3★', rtg: '1600 - 1799', color: 'text-blue-400' },
                  { star: '2★', rtg: '1400 - 1599', color: 'text-green-400' },
                  { star: '1★', rtg: '0 - 1399', color: 'text-chrome-dim' },
                ].map((item) => (
                  <div
                    key={item.star}
                    className={`flex items-center justify-between px-3 py-1.5 rounded-xl border ${
                      ccStars === item.star
                        ? 'bg-yellow/10 border-yellow/40 font-bold'
                        : 'bg-steel/20 border-hairline/20 text-chrome-dim/70'
                    }`}
                  >
                    <span className={item.color}>{item.star}</span>
                    <span>{item.rtg}</span>
                    {ccStars === item.star && <span className="text-[11px] font-bold text-yellow">YOU</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 3. LEETCODE ANALYSIS SECTOR                                               */}
      {/* ========================================================================= */}
      {activePlatforms.leetcode && (selectedTab === 'all' || selectedTab === 'leetcode') && (
        <section className="space-y-6 pt-4 border-t border-hairline/45">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-yellow/10 border border-yellow/40 flex items-center justify-center text-yellow shrink-0">
                <Code2 size={18} />
              </div>
              <div>
                <h2 className="font-display font-bold text-lg text-chrome leading-none">LeetCode Analytics</h2>
                <span className="text-xs text-chrome-dim font-sans font-medium leading-none mt-1 inline-block">
                  @{handles.leetcode || 'leetcode_user'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={`https://leetcode.com/${handles.leetcode || ''}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-sans font-medium text-chrome-dim hover:text-yellow bg-steel/60 hover:bg-steel border border-hairline transition-colors"
              >
                <span>Profile</span>
                <ExternalLink size={11} />
              </a>
              <button
                onClick={() => togglePlatform('leetcode')}
                className="text-xs font-sans font-medium text-chrome-dim hover:text-signal px-2 py-1 cursor-pointer"
                title="Deactivate LeetCode"
              >
                Hide
              </button>
            </div>
          </div>

          {/* LC Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard icon={Award} label="LeetCode Solved" value={lcSolved} loading={leetcode.isLoading} accent />
            <StatCard icon={Activity} label="Active Days" value={lcActiveDays} loading={leetcode.isLoading} />
            <StatCard icon={Star} label="Contest Rating" value={lcContestRating || 0} loading={leetcode.isLoading} />
            <StatCard icon={CheckCircle2} label="Acceptance Rate" value={lcAcceptRate} suffix="%" loading={leetcode.isLoading} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* LC Difficulty Pie Chart */}
            <div className="glass rounded-[32px] p-6 bg-gunmetal/30 border-hairline md:col-span-1 flex flex-col justify-between">
              <div>
                <h3 className="font-display font-semibold text-sm text-chrome">
                  Difficulty Share
                </h3>
                <p className="text-xs text-chrome-dim mt-0.5 font-sans">LeetCode solved distribution</p>
              </div>
              <div className="h-44 flex items-center justify-center mt-3">
                {leetcode.isLoading ? (
                  <CardSkeleton />
                ) : leetcodeDifficultyData.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={leetcodeDifficultyData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={40}
                        outerRadius={65}
                        paddingAngle={3}
                      >
                        {leetcodeDifficultyData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: '#1b2030',
                          border: '1px solid #4a5568',
                          borderRadius: 8,
                          fontSize: 11,
                          color: '#fff',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <span className="text-xs text-chrome-dim font-sans">No data found.</span>
                )}
              </div>
              <div className="flex justify-around text-xs font-sans mt-3 pt-3 border-t border-hairline/40">
                <span className="flex items-center gap-1.5 text-violet-dim">
                  <span className="w-2.5 h-2.5 rounded-full bg-violet" /> Easy ({lcEasy})
                </span>
                <span className="flex items-center gap-1.5 text-yellow-dim">
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow" /> Med ({lcMedium})
                </span>
                <span className="flex items-center gap-1.5 text-signal-dim">
                  <span className="w-2.5 h-2.5 rounded-full bg-signal" /> Hard ({lcHard})
                </span>
              </div>
            </div>

            {/* LC Submission Heatmap */}
            <div className="glass rounded-[32px] p-6 bg-gunmetal/30 border-hairline md:col-span-2 flex flex-col justify-between">
              <div>
                <h3 className="font-display font-semibold text-sm text-chrome">
                  Submission Heatmap
                </h3>
                <p className="text-xs text-chrome-dim mt-0.5 font-sans">
                  Recent LeetCode submittals calendar trace (last 12 weeks)
                </p>
              </div>
              <div className="flex-1 mt-4 flex items-center justify-center">
                {leetcode.isLoading ? (
                  <CardSkeleton />
                ) : (
                  <Heatmap
                    rows={7}
                    cols={16}
                    data={leetcode.data?.calendar?.raw}
                    colorScheme="yellow"
                    label="problems solved"
                  />
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 4. GITHUB ANALYSIS SECTOR                                                 */}
      {/* ========================================================================= */}
      {activePlatforms.github && (selectedTab === 'all' || selectedTab === 'github') && (
        <section className="space-y-6 pt-6 border-t border-hairline/45">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-signal/10 border border-signal/40 flex items-center justify-center text-signal shrink-0">
                <GithubIcon size={18} />
              </div>
              <div>
                <h2 className="font-display font-bold text-lg text-chrome leading-none">GitHub Portfolio Analysis</h2>
                <span className="text-xs text-chrome-dim font-sans font-medium leading-none mt-1 inline-block">
                  @{handles.github || 'octocat'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={`https://github.com/${handles.github || ''}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-sans font-medium text-chrome-dim hover:text-signal bg-steel/60 hover:bg-steel border border-hairline transition-colors"
              >
                <span>Profile</span>
                <ExternalLink size={11} />
              </a>
              <button
                onClick={() => togglePlatform('github')}
                className="text-xs font-sans font-medium text-chrome-dim hover:text-signal px-2 py-1 cursor-pointer"
                title="Deactivate GitHub"
              >
                Hide
              </button>
            </div>
          </div>

          {/* GitHub Stats Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard icon={GitBranch} label="Public Repositories" value={ghReposCount} loading={github.isLoading} accent />
            <StatCard icon={Star} label="Total Stars Received" value={ghStars} loading={github.isLoading} />
            <StatCard icon={Database} label="Codebases Tracked" value={ghReposCount} loading={github.isLoading} />
            <StatCard icon={Activity} label="Followers Index" value={ghFollowers} loading={github.isLoading} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* GitHub Language breakdown */}
            <div className="glass rounded-[32px] p-6 bg-gunmetal/30 border-hairline md:col-span-1 flex flex-col justify-between">
              <div>
                <h3 className="font-display font-semibold text-sm text-chrome">
                  Language Stack
                </h3>
                <p className="text-xs text-chrome-dim mt-0.5 font-sans">Aggregate language weights across repositories</p>
              </div>
              <div className="h-44 flex items-center justify-center mt-3">
                {github.isLoading ? (
                  <CardSkeleton />
                ) : ghLanguages.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={ghLanguages}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={40}
                        outerRadius={65}
                        paddingAngle={3}
                      >
                        {ghLanguages.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: '#1b2030',
                          border: '1px solid #4a5568',
                          borderRadius: 8,
                          fontSize: 11,
                          color: '#fff',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <span className="text-xs text-chrome-dim font-sans">No data found.</span>
                )}
              </div>
              <div className="flex flex-col gap-1.5 px-2 mt-3 pt-3 border-t border-hairline/40">
                <div className="flex flex-wrap gap-2 justify-center">
                  {ghLanguages.slice(0, 3).map((lang, index) => (
                    <span key={lang.name} className="flex items-center gap-1 text-xs font-sans text-chrome-dim">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                      />
                      {lang.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* GitHub Repo List Card */}
            <div className="glass rounded-[32px] p-6 bg-gunmetal/30 border-hairline md:col-span-2 flex flex-col justify-between">
              <div>
                <h3 className="font-display font-semibold text-sm text-chrome">
                  Featured Repositories
                </h3>
                <p className="text-xs text-chrome-dim mt-0.5 font-sans">Latest codebases and active repos</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                {github.isLoading ? (
                  Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
                ) : ghRecentRepos.length ? (
                  ghRecentRepos.map((r) => (
                    <a
                      key={r.name}
                      href={r.htmlUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-steel/60 border border-hairline rounded-[20px] p-3 hover:border-signal-dim transition-all flex flex-col justify-between group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-chrome truncate group-hover:text-signal transition-colors">
                          {r.name}
                        </span>
                        <ExternalLink size={10} className="text-chrome-dim group-hover:text-signal transition-colors shrink-0" />
                      </div>
                      <p className="text-xs text-chrome-dim/80 line-clamp-2 mt-1 leading-relaxed font-sans">
                        {r.description || 'No description provided.'}
                      </p>
                      <div className="flex items-center gap-3 text-xs font-sans text-chrome-dim/60 mt-2.5 pt-2 border-t border-hairline/20">
                        <span>★ {r.stars}</span>
                        <span>🍴 {r.forks}</span>
                        {r.language && <span className="ml-auto font-bold text-signal-dim">{r.language}</span>}
                      </div>
                    </a>
                  ))
                ) : (
                  <span className="text-xs text-chrome-dim font-sans">No public repositories found.</span>
                )}
              </div>
            </div>
          </div>

          {/* GitHub Commit/Contribution Heatmap */}
          <div className="glass rounded-[32px] p-6 bg-gunmetal/30 border-hairline flex flex-col justify-between h-[260px]">
            <div>
              <h3 className="font-display font-semibold text-sm text-chrome flex items-center gap-2">
                <GitBranch size={14} className="text-signal animate-pulse" />
                GitHub Contribution Grid
              </h3>
              <p className="text-xs text-chrome-dim mt-0.5 font-sans">
                Commit timeline tracing profile contributions (last 16 weeks)
              </p>
            </div>
            <div className="flex-1 mt-4 flex items-center justify-center">
              {github.isLoading ? (
                <CardSkeleton />
              ) : (
                <Heatmap
                  rows={7}
                  cols={16}
                  data={github.data?.contributions}
                  colorScheme="green"
                  label="contributions"
                />
              )}
            </div>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 5. GEEKSFORGEEKS ANALYSIS SECTOR                                          */}
      {/* ========================================================================= */}
      {activePlatforms.gfg && (selectedTab === 'all' || selectedTab === 'gfg') && (
        <section className="space-y-6 pt-6 border-t border-hairline/45">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-green-500/15 border border-green-500/40 flex items-center justify-center text-green-600 shrink-0">
                <GraduationCap size={18} />
              </div>
              <div>
                <h2 className="font-display font-bold text-lg text-chrome leading-none">GeeksforGeeks Analytics</h2>
                <span className="text-xs text-chrome-dim font-sans font-medium leading-none mt-1 inline-block">
                  @{handles.gfg || 'gfg_user'}
                </span>
              </div>
            </div>

            <button
              onClick={() => togglePlatform('gfg')}
              className="text-xs font-sans font-medium text-chrome-dim hover:text-signal px-2 py-1 cursor-pointer"
              title="Deactivate GFG"
            >
              Hide
            </button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard
              icon={Award}
              label="Coding Score"
              value={gfgData?.codingScore || 0}
              loading={gfg.isLoading}
              accent
            />
            <StatCard
              icon={CheckCircle2}
              label="Problems Solved"
              value={gfgData?.totalProblemsSolved || 0}
              loading={gfg.isLoading}
            />
            <StatCard
              icon={Activity}
              label="Current Streak"
              value={`${gfgData?.currentStreak || 0} days`}
              loading={gfg.isLoading}
            />
            <StatCard
              icon={Star}
              label="Institute Rank"
              value={gfgData?.instituteRank || 'Unranked'}
              loading={gfg.isLoading}
            />
          </div>
        </section>
      )}
    </div>
  )
}
