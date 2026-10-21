import { useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  Trophy,
  GraduationCap,
  RefreshCw,
  Search,
  ExternalLink,
  Code2,
  Swords,
  Sparkles,
  CheckCircle2,
} from 'lucide-react'
import { GithubIcon } from '../components/BrandIcons'
import { fetchLeaderboard, fetchMyRanking, triggerRankingSync } from '../services/api/backend'
import { useUserHandles } from '../context/UserContext'
import { useAuth } from '../context/AuthContext'
import { InlineSpinner } from '../components/Loader'

export default function Leaderboard() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const { university } = useUserHandles()

  const [leagueType, setLeagueType] = useState('global') // 'global' | 'university'
  const [selectedPlatform, setSelectedPlatform] = useState('all') // 'all' | 'leetcode' | 'codeforces' | 'github'
  const [selectedUniversity, setSelectedUniversity] = useState(university || '')
  const [searchQuery, setSearchQuery] = useState('')

  const { data: myRank } = useQuery({
    queryKey: ['my-ranking'],
    queryFn: fetchMyRanking,
    staleTime: 60 * 1000,
  })

  const { data: leaderboard, isLoading: leaderboardLoading } = useQuery({
    queryKey: ['leaderboard', leagueType, selectedUniversity, selectedPlatform],
    queryFn: () =>
      fetchLeaderboard({
        type: leagueType,
        university: leagueType === 'university' ? (selectedUniversity || university) : '',
        platform: selectedPlatform,
        limit: 50,
      }),
    staleTime: 60 * 1000,
  })

  const syncMutation = useMutation({
    mutationFn: triggerRankingSync,
    onSuccess: () => {
      queryClient.invalidateQueries(['my-ranking'])
      queryClient.invalidateQueries(['leaderboard'])
    },
  })

  const entries = (leaderboard?.entries || []).filter((e) =>
    searchQuery ? e.username?.toLowerCase().includes(searchQuery.toLowerCase()) : true
  )

  const uniOptions = leaderboard?.availableUniversities || []

  return (
    <div className="flex-1 px-4 sm:px-8 md:px-12 py-6 sm:py-8 max-w-7xl mx-auto w-full overflow-y-auto space-y-6 scrollbar-thin">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-bold text-chrome">Leaderboard & League Rankings</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-sans font-semibold uppercase tracking-wider bg-signal/15 text-signal-dim dark:text-signal border border-signal/30">
              LIVE
            </span>
          </div>
          <p className="text-sm text-chrome-dim font-sans mt-1">
            Global composite DevScore rankings & local university leaderboards
          </p>
        </div>

        <button
          onClick={() => syncMutation.mutate()}
          disabled={syncMutation.isPending}
          className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-sans font-semibold bg-steel hover:bg-steel/70 text-chrome border border-hairline transition-all cursor-pointer self-start sm:self-auto hover:border-signal/40"
        >
          <RefreshCw size={13} className={syncMutation.isPending ? 'animate-spin text-signal-dim' : ''} />
          {syncMutation.isPending ? 'Syncing...' : 'Sync My Score'}
        </button>
      </div>

      {/* User's Personal Standing Banner */}
      <div className="glass rounded-[32px] p-5 sm:p-6 bg-gradient-to-r from-gunmetal via-gunmetal to-signal/5 border-hairline flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 text-center md:text-left">
          <div className="w-14 h-14 rounded-full bg-signal/15 border-2 border-signal/40 flex items-center justify-center text-signal font-display font-black text-xl shadow-md">
            <Trophy size={22} />
          </div>
          <div>
            <div className="flex items-center gap-1.5 justify-center md:justify-start">
              <span className="text-[11px] uppercase font-sans tracking-wider font-medium text-chrome-dim">
                Your Current Standing ({user?.username})
              </span>
              {user?.isVerified && (
                <CheckCircle2 size={13} className="text-signal shrink-0" title="Verified Developer" />
              )}
            </div>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 sm:gap-3 mt-2">
              <div className="badge-base badge-gold">
                <Trophy size={13} className="text-yellow" />
                <span className="badge-label">Global</span>
                <span className="badge-value">{myRank?.globalRank ? `#${myRank.globalRank}` : 'Unranked'}</span>
              </div>
              <div className="badge-base badge-violet">
                <GraduationCap size={13} className="text-violet" />
                <span className="badge-label">University</span>
                <span className="badge-value">{myRank?.universityRank ? `#${myRank.universityRank}` : 'Unranked'}</span>
              </div>
              <div className="badge-base badge-signal">
                <Sparkles size={13} className="text-signal-dim dark:text-signal" />
                <span className="badge-label">DevScore</span>
                <span className="badge-value">{myRank?.devScore ?? 0}</span>
              </div>
            </div>
          </div>
        </div>

        <Link
          to={`/u/${user?.username}`}
          className="px-4 py-2 rounded-full text-xs font-semibold bg-gradient-to-r from-signal to-violet text-void uppercase tracking-wider hover:opacity-90 transition-all shadow-sm flex items-center gap-1.5"
        >
          View Public Profile
          <ExternalLink size={13} />
        </Link>
      </div>

      {/* League & Platform Filter Controls */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* League Switcher Pills */}
        <div className="flex items-center p-1 bg-steel rounded-full border border-hairline self-start">
          <button
            onClick={() => setLeagueType('global')}
            className={`px-4 py-1.5 rounded-full text-xs font-sans font-semibold transition-all cursor-pointer ${
              leagueType === 'global'
                ? 'bg-gunmetal text-chrome shadow-sm border border-hairline'
                : 'text-chrome-dim hover:text-chrome'
            }`}
          >
            Global Top 100
          </button>
          <button
            onClick={() => setLeagueType('university')}
            className={`px-4 py-1.5 rounded-full text-xs font-sans font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              leagueType === 'university'
                ? 'bg-gunmetal text-chrome shadow-sm border border-hairline'
                : 'text-chrome-dim hover:text-chrome'
            }`}
          >
            <GraduationCap size={13} />
            University League
          </button>
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-3">
          {/* University Selector (if university league) */}
          {leagueType === 'university' && (
            <select
              value={selectedUniversity}
              onChange={(e) => setSelectedUniversity(e.target.value)}
              className="text-xs font-sans py-1.5 px-4 bg-gunmetal border border-hairline rounded-full outline-none text-chrome"
            >
              <option value="">All Universities</option>
              {uniOptions.map((uni) => (
                <option key={uni} value={uni}>
                  {uni}
                </option>
              ))}
            </select>
          )}

          {/* Platform Filter */}
          <select
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value)}
            className="text-xs font-sans py-1.5 px-4 bg-gunmetal border border-hairline rounded-full outline-none text-chrome"
          >
            <option value="all">All Platforms (Composite DevScore)</option>
            <option value="leetcode">LeetCode Standing</option>
            <option value="codeforces">Codeforces Standing</option>
            <option value="github">GitHub Standing</option>
            <option value="codechef">CodeChef Standing</option>
            <option value="gfg">GFG Standing</option>
          </select>

          {/* Quick Search */}
          <div className="relative">
            <Search size={13} className="absolute left-3.5 top-2.5 text-chrome-dim" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search aspirant..."
              className="text-xs font-sans pl-9 pr-4 py-1.5 bg-gunmetal border border-hairline rounded-full outline-none text-chrome w-40 sm:w-48"
            />
          </div>
        </div>
      </div>

      {/* Leaderboard Table / Cards */}
      <div className="glass rounded-[32px] overflow-hidden bg-gunmetal/40 border-hairline shadow-sm">
        {leaderboardLoading ? (
          <div className="p-12 text-center">
            <InlineSpinner label="Calculating verified ranks across university nodes..." />
          </div>
        ) : entries.length === 0 ? (
          <div className="p-12 text-center text-chrome-dim text-sm font-sans">
            No candidates ranked yet in this division.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-sans">
              <thead>
                <tr className="border-b border-hairline bg-void/50 backdrop-blur-md text-chrome-dim uppercase text-[11px] font-sans font-semibold tracking-wider select-none sticky top-0 z-10">
                  <th className="py-3.5 px-6">Rank</th>
                  <th className="py-3.5 px-6">Candidate</th>
                  <th className="py-3.5 px-6">University / College</th>
                  <th className="py-3.5 px-6 text-center">DevScore</th>
                  <th className="py-3.5 px-6 text-center">Solved</th>
                  <th className="py-3.5 px-6 text-center">Platform Highlights</th>
                  <th className="py-3.5 px-6 text-right">Portfolio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {entries.map((candidate, idx) => {
                  const rankNum = leagueType === 'university'
                    ? (candidate.universityRank || idx + 1)
                    : (candidate.globalRank || idx + 1)

                  return (
                    <motion.tr
                      key={candidate._id || candidate.username || idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, delay: Math.min(idx * 0.03, 0.35) }}
                      className={`hover:bg-steel/40 transition-colors ${
                        rankNum === 1 ? 'bg-yellow/5' : ''
                      }`}
                    >
                      {/* Rank Number */}
                      <td className="py-4 px-6 font-bold tabular-nums">
                        <span
                          className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-display font-bold tabular-nums ${
                            rankNum === 1
                              ? 'bg-yellow/20 text-yellow-dim border border-yellow/40 font-black shadow-[0_0_12px_rgba(255,213,61,0.3)]'
                              : rankNum === 2
                              ? 'bg-slate-300/30 text-slate-800 dark:text-slate-200 border border-slate-400/40 font-bold'
                              : rankNum === 3
                              ? 'bg-amber-600/20 text-amber-700 dark:text-amber-300 border border-amber-600/40 font-bold'
                              : 'text-chrome-dim'
                          }`}
                        >
                          {rankNum}
                        </span>
                      </td>

                      {/* Username */}
                      <td className="py-4 px-6">
                        {(() => {
                          const candidateUsername = candidate.userId?.username || candidate.username
                          const candidateUniversity = candidate.userId?.university || candidate.university
                          const isCandidateVerified = !!(candidate.userId?.isVerified || candidate.isVerified)
                          return (
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-signal/15 border border-signal/30 flex items-center justify-center font-bold text-signal-dim dark:text-signal font-display uppercase">
                                {candidateUsername?.slice(0, 2)}
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-semibold text-chrome font-mono text-xs">
                                  @{candidateUsername}
                                </span>
                                {isCandidateVerified && (
                                  <CheckCircle2 size={13} className="text-signal shrink-0" title="Verified Developer" />
                                )}
                              </div>
                            </div>
                          )
                        })()}
                      </td>

                      {/* University */}
                      <td className="py-4 px-6 text-chrome-dim font-sans">
                        {(() => {
                          const candidateUniversity = candidate.userId?.university || candidate.university
                          return candidateUniversity ? (
                            <span className="flex items-center gap-1.5 font-medium text-chrome">
                              <GraduationCap size={13} className="text-violet shrink-0" />
                              {candidateUniversity}
                            </span>
                          ) : (
                            <span className="italic text-chrome-dim/60">Independent</span>
                          )
                        })()}
                      </td>

                      {/* DevScore */}
                      <td className="py-4 px-6 text-center">
                        <span className="px-3 py-1 rounded-full text-xs font-bold font-display tabular-nums bg-signal/15 text-signal-dim border border-signal/30">
                          {candidate.devScore || 0}
                        </span>
                      </td>

                      {/* Total Solved */}
                      <td className="py-4 px-6 text-center font-bold font-display tabular-nums text-chrome">
                        {candidate.totalSolvedAll || 0}
                      </td>

                      {/* Platform Highlights */}
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-3 text-xs font-sans text-chrome-dim">
                          {candidate.leetcode?.solved > 0 && (
                            <span className="flex items-center gap-1 text-yellow-dim font-semibold tabular-nums">
                              <Code2 size={12} /> {candidate.leetcode.solved}
                            </span>
                          )}
                          {candidate.codeforces?.rating > 0 && (
                            <span className="flex items-center gap-1 text-violet-dim font-semibold tabular-nums">
                              <Swords size={12} /> {candidate.codeforces.rating}
                            </span>
                          )}
                          {candidate.github?.repos > 0 && (
                            <span className="flex items-center gap-1 text-signal-dim font-semibold tabular-nums">
                              <GithubIcon size={12} /> {candidate.github.repos}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Public Profile Link */}
                      <td className="py-4 px-6 text-right">
                        <Link
                          to={`/u/${candidate.userId?.username || candidate.username}`}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold font-sans bg-steel hover:bg-steel/70 text-chrome border border-hairline transition-all"
                        >
                          View <ExternalLink size={11} />
                        </Link>
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
