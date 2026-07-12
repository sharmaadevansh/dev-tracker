import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts'
import { Award, ShieldAlert, BarChart3, Star, Activity, CheckCircle2, GitBranch, Code2, Database, ExternalLink } from 'lucide-react'
import { GithubIcon } from '../components/BrandIcons'
import { useUserHandles } from '../context/UserContext'
import { fetchGithubAll } from '../services/api/github'
import { fetchLeetcodeAll } from '../services/api/leetcode'
import { fetchGfgProfile } from '../services/api/gfg'
import { fetchCodeforcesAll } from '../services/api/codeforces'
import { fetchCodechefProfile } from '../services/api/codechef'
import StatCard from '../components/StatCard'
import { CardSkeleton, InlineSpinner } from '../components/Loader'
import Heatmap from '../components/Heatmap'

const PIE_COLORS = ['#99c2ff', '#ffdf82', '#ff84ba'] // Blue, Yellow, Pink
const CHART_COLORS = ['#ff84ba', '#99c2ff', '#ffdf82', '#ffefe3', '#272d3e']

export default function CodingAnalytics() {
  const { handles } = useUserHandles()

  // Fetch queries
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

  const isSyncing = github.isFetching || leetcode.isFetching

  // LeetCode calculations
  const lcSolved = leetcode.data?.solved?.totalSolved || 0
  const lcEasy = leetcode.data?.solved?.easySolved || 0
  const lcMedium = leetcode.data?.solved?.mediumSolved || 0
  const lcHard = leetcode.data?.solved?.hardSolved || 0
  const lcActiveDays = leetcode.data?.calendar?.activeDays || 0
  const lcAcceptRate = leetcode.data?.profile?.acceptanceRate || '0'
  const lcContestRating = Math.round(leetcode.data?.contest?.rating || 0)

  const leetcodeDifficultyData = leetcode.data?.solved
    ? [
        { name: 'Easy', value: lcEasy },
        { name: 'Medium', value: lcMedium },
        { name: 'Hard', value: lcHard },
      ]
    : []

  // GitHub calculations
  const ghReposCount = github.data?.profile?.publicRepos || 0
  const ghFollowers = github.data?.profile?.followers || 0
  const ghStars = github.data?.totalStars || 0
  const ghLanguages = github.data?.languages?.slice(0, 5) || []
  const ghRecentRepos = github.data?.recentRepos?.slice(0, 4) || []

  const noData = !handles.github && !handles.leetcode

  if (noData) {
    return (
      <div className="flex-1 px-12 py-10 flex items-center justify-center">
        <div className="glass rounded-[36px] p-8 max-w-md text-center border border-hairline bg-gunmetal/50">
          <ShieldAlert size={40} className="text-signal mx-auto mb-4" />
          <h3 className="font-display font-semibold text-chrome text-lg">No Handles Configured</h3>
          <p className="text-chrome-dim text-sm mt-2 leading-relaxed font-mono">
            Please map your GitHub and LeetCode accounts in Handles settings to view comprehensive analytics streams.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 px-12 py-10 max-w-7xl mx-auto w-full overflow-y-auto space-y-12 scrollbar-thin">
      
      {/* Header section */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-widest text-signal font-mono mb-1">analytics_engine // platform_metrics</p>
          <h1 className="font-display text-2xl font-semibold text-chrome">Platform Analytics</h1>
        </div>
        {isSyncing && <InlineSpinner label="Compiling analytics" />}
      </div>

      {/* ========================================== */}
      {/* 1. LEETCODE ANALYSIS SECTOR (FULL VIEW)    */}
      {/* ========================================== */}
      {handles.leetcode && (
        <section className="space-y-6 pt-4 border-t border-hairline/45">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-yellow/10 border border-yellow/40 flex items-center justify-center text-yellow shrink-0">
              <Code2 size={16} />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg text-chrome leading-none">LeetCode Analytics</h2>
              <span className="text-[10px] text-chrome-dim font-mono leading-none mt-1 inline-block">@{handles.leetcode}</span>
            </div>
          </div>

          {/* LC Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard icon={Award} label="LeetCode Solved" value={lcSolved} loading={leetcode.isLoading} accent />
            <StatCard icon={Activity} label="Active Days" value={lcActiveDays} loading={leetcode.isLoading} />
            <StatCard icon={Star} label="Contest Rating" value={lcContestRating || 'N/A'} loading={leetcode.isLoading} />
            <StatCard icon={CheckCircle2} label="Acceptance Rate" value={lcAcceptRate} suffix="%" loading={leetcode.isLoading} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* LC Difficulty Pie Chart */}
            <div className="glass rounded-[36px] p-6 bg-gunmetal/30 border-hairline md:col-span-1 flex flex-col justify-between">
              <div>
                <h3 className="font-display font-semibold text-xs text-chrome uppercase tracking-wider font-mono">Difficulty Share</h3>
                <p className="text-[9px] text-chrome-dim/60 font-mono mt-0.5">LeetCode solved distribution by category</p>
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
                      <Tooltip contentStyle={{ background: '#ffefe3', border: '1px solid #e8d0be', borderRadius: 8, fontSize: 11, color: '#231c17' }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <span className="text-xs text-chrome-dim font-mono">No data found.</span>
                )}
              </div>
              {/* Pie labels Index */}
              <div className="flex justify-around text-[10px] font-mono mt-3 pt-3 border-t border-hairline/40">
                <span className="flex items-center gap-1.5 text-violet-dim"><span className="w-2.5 h-2.5 rounded-full bg-violet" /> Easy ({lcEasy})</span>
                <span className="flex items-center gap-1.5 text-yellow-dim"><span className="w-2.5 h-2.5 rounded-full bg-yellow" /> Med ({lcMedium})</span>
                <span className="flex items-center gap-1.5 text-signal-dim"><span className="w-2.5 h-2.5 rounded-full bg-signal" /> Hard ({lcHard})</span>
              </div>
            </div>

            {/* LC Submission Heatmap */}
            <div className="glass rounded-[36px] p-6 bg-gunmetal/30 border-hairline md:col-span-2 flex flex-col justify-between">
              <div>
                <h3 className="font-display font-semibold text-xs text-chrome uppercase tracking-wider font-mono">Submission Heatmap</h3>
                <p className="text-[9px] text-chrome-dim/60 font-mono mt-0.5">Recent LeetCode submittals calendar trace (last 12 weeks)</p>
              </div>
              <div className="flex-1 mt-4 flex items-center justify-center">
                {leetcode.isLoading ? (
                  <CardSkeleton />
                ) : (
                  <Heatmap rows={7} cols={12} lastActiveDayIndex={83} />
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ========================================== */}
      {/* 2. GITHUB ANALYSIS SECTOR (FULL VIEW)      */}
      {/* ========================================== */}
      {handles.github && (
        <section className="space-y-6 pt-6 border-t border-hairline/45">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-signal/10 border border-signal/40 flex items-center justify-center text-signal shrink-0">
              <GithubIcon size={16} />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg text-chrome leading-none">GitHub Portfolio Analysis</h2>
              <span className="text-[10px] text-chrome-dim font-mono leading-none mt-1 inline-block">@{handles.github}</span>
            </div>
          </div>

          {/* GitHub Stats Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard icon={GitBranch} label="Public Repositories" value={ghReposCount} loading={github.isLoading} accent />
            <StatCard icon={Star} label="Total Stars Recd" value={ghStars} loading={github.isLoading} />
            <StatCard icon={Database} label="Codebases Hosted" value={ghReposCount} loading={github.isLoading} />
            <StatCard icon={Activity} label="Followers Index" value={ghFollowers} loading={github.isLoading} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* GitHub Language breakdown */}
            <div className="glass rounded-[36px] p-6 bg-gunmetal/30 border-hairline md:col-span-1 flex flex-col justify-between">
              <div>
                <h3 className="font-display font-semibold text-xs text-chrome uppercase tracking-wider font-mono">Language Stack</h3>
                <p className="text-[9px] text-chrome-dim/60 font-mono mt-0.5">Aggregate language weights inside source code repositories</p>
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
                      <Tooltip contentStyle={{ background: '#ffefe3', border: '1px solid #e8d0be', borderRadius: 8, fontSize: 11, color: '#231c17' }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <span className="text-xs text-chrome-dim font-mono">No data found.</span>
                )}
              </div>
              <div className="flex flex-col gap-1.5 px-2 mt-3 pt-3 border-t border-hairline/40">
                <div className="flex flex-wrap gap-2 justify-center">
                  {ghLanguages.slice(0, 3).map((lang, index) => (
                    <span key={lang.name} className="flex items-center gap-1 text-[10px] font-mono text-chrome-dim">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }} />
                      {lang.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* GitHub Repo List Card */}
            <div className="glass rounded-[36px] p-6 bg-gunmetal/30 border-hairline md:col-span-2 flex flex-col justify-between">
              <div>
                <h3 className="font-display font-semibold text-xs text-chrome uppercase tracking-wider font-mono">Featured Repositories</h3>
                <p className="text-[9px] text-chrome-dim/60 font-mono mt-0.5">Hover or select codebases to review stats</p>
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
                        <span className="text-xs font-bold text-chrome truncate group-hover:text-signal transition-colors">{r.name}</span>
                        <ExternalLink size={10} className="text-chrome-dim group-hover:text-signal transition-colors shrink-0" />
                      </div>
                      <p className="text-[10px] text-chrome-dim/80 line-clamp-2 mt-1 leading-relaxed">{r.description || 'No description provided.'}</p>
                      <div className="flex items-center gap-3 text-[9px] font-mono text-chrome-dim/60 mt-2.5 pt-2 border-t border-hairline/20">
                        <span>★ {r.stars}</span>
                        <span>🍴 {r.forks}</span>
                        {r.language && <span className="ml-auto font-bold text-signal-dim">{r.language}</span>}
                      </div>
                    </a>
                  ))
                ) : (
                  <span className="text-xs text-chrome-dim font-mono">No public repositories found.</span>
                )}
              </div>
            </div>
          </div>

          {/* GitHub Commit/Contribution Heatmap */}
          <div className="glass rounded-[36px] p-6 bg-gunmetal/30 border-hairline flex flex-col justify-between h-[260px]">
            <div>
              <h3 className="font-display font-semibold text-xs text-chrome uppercase tracking-wider font-mono flex items-center gap-2">
                <GitBranch size={14} className="text-signal animate-pulse" />
                GitHub Contribution Grid
              </h3>
              <p className="text-[9px] text-chrome-dim/60 font-mono mt-0.5">Commit timeline tracing profile contributions (last 16 weeks)</p>
            </div>
            <div className="flex-1 mt-4 flex items-center justify-center">
              {github.isLoading ? (
                <CardSkeleton />
              ) : (
                <Heatmap rows={7} cols={16} lastActiveDayIndex={111} />
              )}
            </div>
          </div>
        </section>
      )}

    </div>
  )
}
