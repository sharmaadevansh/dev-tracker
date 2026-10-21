import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Terminal,
  Trophy,
  GraduationCap,
  ExternalLink,
  Flame,
  Copy,
  Check,
  Share2,
  Code2,
  Swords,
  ChefHat,
  Database,
  ArrowRight,
  Award,
} from 'lucide-react'
import { GithubIcon, LinkedinIcon } from '../components/BrandIcons'
import { fetchPublicProfile, fetchAiRoast } from '../services/api/backend'
import { InlineSpinner } from '../components/Loader'

export default function PublicProfile() {
  const { username } = useParams()
  const [copiedBadge, setCopiedBadge] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
  const [showRoast, setShowRoast] = useState(false)

  const { data: profile, isLoading, isError } = useQuery({
    queryKey: ['public-profile', username],
    queryFn: () => fetchPublicProfile(username),
    staleTime: 5 * 60 * 1000,
  })

  const { data: roastData, isLoading: roastLoading, refetch: getRoast } = useQuery({
    queryKey: ['ai-roast', username],
    queryFn: () => fetchAiRoast(username),
    enabled: false,
  })

  const handleTriggerRoast = () => {
    setShowRoast(true)
    getRoast()
  }

  const badgeMarkdown = `[![DevTrack Stats](${window.location.origin}/api/badge/${username})](${window.location.href})`

  const copyBadge = () => {
    navigator.clipboard.writeText(badgeMarkdown)
    setCopiedBadge(true)
    setTimeout(() => setCopiedBadge(false), 2000)
  }

  const copyProfileLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  const shareToTwitter = () => {
    const rankText = profile?.ranking?.globalRank ? `#${profile.ranking.globalRank}` : 'Unranked'
    const scoreText = profile?.ranking?.devScore ?? 0
    const text = encodeURIComponent(
      `Check out my verified developer portfolio & rank on DevTrack.AI! 🚀\nGlobal Rank: ${rankText} | DevScore: ${scoreText}\n`
    )
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(window.location.href)}`, '_blank')
  }

  const shareToLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`, '_blank')
  }

  if (isLoading) {
    return (
      <div className="h-full min-h-0 flex flex-col items-center justify-center p-8 text-center bg-void rounded-[40px]">
        <InlineSpinner label="Decrypting public developer profile..." />
      </div>
    )
  }

  if (isError || !profile) {
    return (
      <div className="h-full min-h-0 flex flex-col items-center justify-center p-8 text-center bg-void rounded-[40px] space-y-4">
        <div className="w-16 h-16 rounded-full bg-signal/15 border border-signal/30 flex items-center justify-center text-signal">
          <Terminal size={28} />
        </div>
        <h2 className="text-xl font-bold font-display text-chrome">Developer Profile Not Found</h2>
        <p className="text-sm text-chrome-dim max-w-sm">
          No aspirant with username <code className="text-signal-dim font-bold font-mono">@{username}</code> exists yet.
        </p>
        <Link
          to={`/signup?claim=${username}`}
          className="px-6 py-2.5 rounded-full bg-gradient-to-r from-signal to-violet text-void font-bold text-xs uppercase tracking-wider"
        >
          Claim @{username} on DevTrack
        </Link>
      </div>
    )
  }

  const rank = profile.ranking || {}

  return (
    <div className="h-full min-h-0 flex flex-col relative overflow-y-auto rounded-[28px] sm:rounded-[36px] border border-hairline/70 shadow-2xl bg-void scrollbar-thin">
      {/* Floating Viral Call to Action Top Banner */}
      <header className="w-full bg-gunmetal/80 backdrop-blur-xl px-4 sm:px-6 py-3 border-b border-hairline flex items-center justify-between sticky top-0 z-40 select-none">
        <Link to="/" className="flex items-center gap-2 text-chrome hover:opacity-90">
          <div className="w-7 h-7 rounded-full bg-signal/20 border border-signal/40 flex items-center justify-center text-signal-dim">
            <Terminal size={14} />
          </div>
          <span className="font-display font-extrabold text-sm tracking-tight text-chrome">
            DevTrack<span className="text-signal-dim">.AI</span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={copyProfileLink}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-sans font-medium bg-steel hover:bg-steel/70 text-chrome border border-hairline transition-all"
          >
            {copiedLink ? <Check size={12} className="text-signal-dim" /> : <Copy size={12} />}
            {copiedLink ? 'Copied' : 'Share Link'}
          </button>
          <Link
            to="/signup"
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-signal to-violet text-void uppercase tracking-wider shadow-sm hover:scale-105 transition-all"
          >
            Claim Your Profile
            <ArrowRight size={13} />
          </Link>
        </div>
      </header>

      {/* Main Public Profile Body */}
      <main className="max-w-5xl mx-auto w-full p-6 sm:p-10 space-y-8">
        {/* Header Hero Profile Card */}
        <div className="glass rounded-[36px] p-6 sm:p-8 bg-gunmetal/50 border-hairline flex flex-col md:flex-row items-center md:items-start justify-between gap-6 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left z-10">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-signal/20 via-violet/20 to-yellow/20 border-2 border-signal/50 flex items-center justify-center text-signal-dim shadow-lg text-2xl font-black font-display text-chrome">
              {profile.username?.slice(0, 2).toUpperCase()}
            </div>
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-chrome">
                  @{profile.username}
                </h1>
                {profile.isVerified ? (
                  <span className="badge-base badge-signal font-semibold uppercase tracking-wider text-[11px] flex items-center gap-1">
                    <Check size={12} className="text-signal" />
                    VERIFIED DEVELOPER
                  </span>
                ) : (
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-steel text-chrome-dim border border-hairline">
                    COMMUNITY MEMBER
                  </span>
                )}
              </div>

              {profile.university ? (
                <p className="text-xs sm:text-sm text-chrome-dim font-sans flex items-center justify-center sm:justify-start gap-1.5">
                  <GraduationCap size={15} className="text-violet shrink-0" />
                  <span className="font-semibold text-chrome">{profile.university}</span>
                </p>
              ) : (
                <p className="text-xs text-chrome-dim font-sans">Independent Developer</p>
              )}

              {/* Social links */}
              <div className="flex items-center justify-center sm:justify-start gap-2 pt-2">
                {profile.handles?.github && (
                  <a
                    href={`https://github.com/${profile.handles.github}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-full bg-steel hover:bg-steel/70 text-chrome border border-hairline transition-all"
                  >
                    <GithubIcon size={14} />
                  </a>
                )}
                {profile.handles?.linkedin && (
                  <a
                    href={`https://linkedin.com/in/${profile.handles.linkedin}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-full bg-steel hover:bg-steel/70 text-violet border border-hairline transition-all"
                  >
                    <LinkedinIcon size={14} />
                  </a>
                )}
                {profile.handles?.leetcode && (
                  <a
                    href={`https://leetcode.com/${profile.handles.leetcode}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-full bg-steel hover:bg-steel/70 text-yellow border border-hairline transition-all"
                  >
                    <Code2 size={14} />
                  </a>
                )}
                {profile.handles?.codeforces && (
                  <a
                    href={`https://codeforces.com/profile/${profile.handles.codeforces}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-full bg-steel hover:bg-steel/70 text-violet border border-hairline transition-all"
                  >
                    <Swords size={14} />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Social Share & Viral Roast Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 z-10">
            <button
              onClick={handleTriggerRoast}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold font-sans bg-yellow/15 text-yellow-dim border border-yellow/30 hover:scale-105 transition-all cursor-pointer shadow-sm shimmer-sweep"
            >
              <Flame size={14} className="text-yellow animate-flame" />
              AI Roast My Profile
            </button>
            <button
              onClick={copyBadge}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-sans font-medium bg-steel hover:bg-steel/70 text-chrome border border-hairline transition-all cursor-pointer"
            >
              {copiedBadge ? <Check size={13} className="text-signal-dim" /> : <Copy size={13} />}
              {copiedBadge ? 'Badge Copied' : 'Embed Badge'}
            </button>
            <button
              onClick={shareToTwitter}
              className="p-2 rounded-full bg-steel hover:bg-steel/70 text-chrome border border-hairline transition-all cursor-pointer"
              title="Share to X"
            >
              <Share2 size={14} />
            </button>
            <button
              onClick={shareToLinkedIn}
              className="p-2 rounded-full bg-steel hover:bg-steel/70 text-chrome border border-hairline transition-all cursor-pointer"
              title="Share to LinkedIn"
            >
              <LinkedinIcon size={14} />
            </button>
          </div>
        </div>

        {/* AI Roast Modal / Drawer */}
        <AnimatePresence>
          {showRoast && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="glass rounded-[32px] p-6 bg-red-500/5 border border-red-500/20 overflow-hidden relative glow-electric"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="flex items-center gap-2 font-display text-sm font-bold text-red-600">
                  <Flame size={16} className="text-red-500 animate-flame" /> AI DEV ROAST
                </span>
                {roastData?.burnRating && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-sans font-semibold uppercase tracking-wider bg-red-500/15 text-red-600 border border-red-500/20">
                    Burn Rating: {roastData.burnRating}
                  </span>
                )}
              </div>

              {roastLoading ? (
                <div className="py-4">
                  <InlineSpinner label="Senior Tech Lead is analyzing commit history & LeetCode phobias..." />
                </div>
              ) : (
                <div className="space-y-3 font-sans text-xs text-chrome leading-relaxed">
                  <p className="italic">"{roastData?.roast}"</p>
                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-xs font-sans font-bold text-red-500">
                      Archetype: {roastData?.archetype}
                    </span>
                    <button
                      onClick={shareToTwitter}
                      className="text-xs font-sans font-semibold text-chrome underline cursor-pointer hover:text-signal-dim"
                    >
                      Share this burn on X →
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Triple Rank Showcase (Global Rank, Local University Rank, DevScore) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-interactive rounded-[28px] p-5 bg-gunmetal/40 border-hairline flex flex-col justify-between">
            <span className="text-[11px] uppercase font-sans tracking-wider font-semibold text-chrome-dim">
              DevScore
            </span>
            <div className="my-2">
              <span className="text-3xl font-extrabold font-display tabular-nums text-signal-dim">
                {rank.devScore || 0}
              </span>
            </div>
            <span className="text-xs font-sans text-chrome-dim/60">Weighted Multi-Platform</span>
          </div>

          <div className="glass-interactive rounded-[28px] p-5 bg-gunmetal/40 border-hairline flex flex-col justify-between">
            <span className="text-[11px] uppercase font-sans tracking-wider font-semibold text-chrome-dim flex items-center gap-1">
              <Trophy size={11} className="text-yellow" /> Global Rank
            </span>
            <div className="my-2">
              <span className="text-3xl font-extrabold font-display tabular-nums text-yellow-dim">
                {rank.globalRank ? `#${rank.globalRank}` : 'Unranked'}
              </span>
            </div>
            <span className="text-xs font-sans text-chrome-dim/60">Worldwide Ranking</span>
          </div>

          <div className="glass-interactive rounded-[28px] p-5 bg-gunmetal/40 border-hairline flex flex-col justify-between">
            <span className="text-[11px] uppercase font-sans tracking-wider font-semibold text-chrome-dim flex items-center gap-1">
              <GraduationCap size={11} className="text-violet" /> University Rank
            </span>
            <div className="my-2">
              <span className="text-3xl font-extrabold font-display tabular-nums text-violet-dim">
                {rank.universityRank ? `#${rank.universityRank}` : 'Unranked'}
              </span>
            </div>
            <span className="text-xs font-sans text-chrome-dim/60 truncate">
              {profile.university || 'Local League'}
            </span>
          </div>

          <div className="glass-interactive rounded-[28px] p-5 bg-gunmetal/40 border-hairline flex flex-col justify-between">
            <span className="text-[11px] uppercase font-sans tracking-wider font-semibold text-chrome-dim">
              Total Solved
            </span>
            <div className="my-2">
              <span className="text-3xl font-extrabold font-display tabular-nums text-chrome">
                {rank.totalSolvedAll || 0}
              </span>
            </div>
            <span className="text-xs font-sans text-chrome-dim/60">LC + CF + GFG</span>
          </div>
        </div>

        {/* Platform Ranks Breakdown Grid */}
        <div className="space-y-4">
          <h3 className="font-display text-sm font-bold uppercase tracking-wider text-chrome-dim">
            Individual Platform Standing
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {/* LeetCode */}
            <div className="glass-interactive rounded-[24px] p-5 bg-gunmetal/30 border-hairline space-y-3">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 font-display text-sm font-bold text-chrome">
                  <Code2 size={16} className="text-yellow" /> LeetCode
                </span>
                <span className="text-xs font-sans font-semibold text-yellow-dim">
                  {rank.leetcode?.rank ? `Rank #${rank.leetcode.rank}` : 'Unranked'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs font-sans text-chrome-dim">
                <div>
                  Solved: <span className="text-chrome font-bold font-display tabular-nums">{rank.leetcode?.solved || 0}</span>
                </div>
                <div>
                  Contest: <span className="text-chrome font-bold font-display tabular-nums">{rank.leetcode?.rating || 0}</span>
                </div>
              </div>
            </div>

            {/* Codeforces */}
            <div className="glass-interactive rounded-[24px] p-5 bg-gunmetal/30 border-hairline space-y-3">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 font-display text-sm font-bold text-chrome">
                  <Swords size={16} className="text-violet" /> Codeforces
                </span>
                <span className="text-xs font-sans font-semibold text-violet-dim">
                  {rank.codeforces?.rank ? `Rank #${rank.codeforces.rank}` : 'Unranked'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs font-sans text-chrome-dim">
                <div>
                  Rating: <span className="text-chrome font-bold font-display tabular-nums">{rank.codeforces?.rating || 0}</span>
                </div>
                <div>
                  Max: <span className="text-chrome font-bold font-display tabular-nums">{rank.codeforces?.maxRating || 0}</span>
                </div>
              </div>
            </div>

            {/* GitHub */}
            <div className="glass-interactive rounded-[24px] p-5 bg-gunmetal/30 border-hairline space-y-3">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 font-display text-sm font-bold text-chrome">
                  <GithubIcon size={16} className="text-signal-dim" /> GitHub
                </span>
                <span className="text-xs font-sans font-semibold text-signal-dim">
                  {rank.github?.rank ? `Rank #${rank.github.rank}` : 'Unranked'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs font-sans text-chrome-dim">
                <div>
                  Repos: <span className="text-chrome font-bold font-display tabular-nums">{rank.github?.repos || 0}</span>
                </div>
                <div>
                  Stars: <span className="text-chrome font-bold font-display tabular-nums">{rank.github?.stars || 0}</span>
                </div>
              </div>
            </div>

            {/* CodeChef */}
            <div className="glass-interactive rounded-[24px] p-5 bg-gunmetal/30 border-hairline space-y-3">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 font-display text-sm font-bold text-chrome">
                  <ChefHat size={16} className="text-yellow" /> CodeChef
                </span>
                <span className="text-xs font-sans font-semibold text-yellow-dim">
                  {rank.codechef?.rank ? `Rank #${rank.codechef.rank}` : 'Unranked'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs font-sans text-chrome-dim">
                <div>
                  Stars: <span className="text-chrome font-bold font-display">{rank.codechef?.stars || 'Unrated'}</span>
                </div>
                <div>
                  Rating: <span className="text-chrome font-bold font-display tabular-nums">{rank.codechef?.rating || 0}</span>
                </div>
              </div>
            </div>

            {/* GeeksforGeeks */}
            <div className="glass-interactive rounded-[24px] p-5 bg-gunmetal/30 border-hairline space-y-3">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 font-display text-sm font-bold text-chrome">
                  <Database size={16} className="text-signal-dim" /> GFG
                </span>
                <span className="text-xs font-sans font-semibold text-signal-dim">
                  {rank.gfg?.rank ? `Rank #${rank.gfg.rank}` : 'Unranked'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs font-sans text-chrome-dim">
                <div>
                  Score: <span className="text-chrome font-bold font-display tabular-nums">{rank.gfg?.codingScore || 0}</span>
                </div>
                <div>
                  Solved: <span className="text-chrome font-bold font-display tabular-nums">{rank.gfg?.totalSolved || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Achievements & Milestones Showcase */}
        {profile.achievements && (
          <div className="glass rounded-[32px] p-6 bg-gunmetal/30 border-hairline space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-sm font-bold text-chrome flex items-center gap-2">
                  <Award size={16} className="text-yellow" /> Gamification & Badges
                </h3>
                <p className="text-xs text-chrome-dim font-sans mt-0.5">
                  Unlocked {profile.achievements.unlockedCount} of {profile.achievements.total} badges ({profile.achievements.completionPercentage}% complete)
                </p>
              </div>
              <div className="w-24 bg-steel rounded-full h-2 overflow-hidden">
                <div
                  className="bg-signal h-full rounded-full transition-all duration-500"
                  style={{ width: `${profile.achievements.completionPercentage}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {profile.achievements.achievements?.map((ach) => (
                <div
                  key={ach.id}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    ach.unlocked
                      ? 'bg-steel/50 border-signal/40 shadow-sm'
                      : 'bg-gunmetal/30 border-hairline/40 opacity-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg">
                      {ach.id === 'first_steps' && '🚀'}
                      {ach.id === 'century_solver' && '🎯'}
                      {ach.id === 'code_ninja' && '⚡'}
                      {ach.id === 'grandmaster' && '👑'}
                      {ach.id === 'contest_veteran' && '🏆'}
                      {ach.id === 'open_sourcerer' && '🐙'}
                      {ach.id === 'campus_top5' && '🏫'}
                      {ach.id === 'global_elite' && '🔥'}
                    </span>
                    <span className={ach.unlocked ? 'badge-base badge-signal font-semibold uppercase tracking-wider text-[11px]' : 'badge-base badge-neutral font-semibold uppercase tracking-wider text-[11px]'}>
                      {ach.unlocked ? ach.tier : 'Locked'}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-chrome font-sans leading-tight">
                    {ach.title}
                  </h4>
                  <p className="text-xs text-chrome-dim font-sans mt-1 line-clamp-2 leading-snug">
                    {ach.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Live GitHub Profile README Embed Card Preview */}
        <div className="glass rounded-[32px] p-6 bg-gunmetal/30 border-hairline space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-sm font-bold text-chrome">
              GitHub Profile README Dynamic Card
            </h3>
            <button
              onClick={copyBadge}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-sans font-medium bg-steel hover:bg-steel/70 text-chrome border border-hairline cursor-pointer"
            >
              {copiedBadge ? <Check size={12} className="text-signal-dim" /> : <Copy size={12} />}
              {copiedBadge ? 'Copied' : 'Copy Markdown'}
            </button>
          </div>
          <div className="flex justify-center p-3 overflow-x-auto">
            <img
              src={`/api/badge/${profile.username}`}
              alt={`${profile.username}'s DevTrack badge`}
              className="rounded-2xl max-w-full shadow-lg"
            />
          </div>
          <p className="text-xs font-sans text-chrome-dim text-center">
            Paste this Markdown in your GitHub profile <code className="bg-steel px-1 rounded font-mono">README.md</code> for live automated ranking updates.
          </p>
        </div>

        {/* Public Projects Showcase */}
        {profile.projects?.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-chrome-dim">
              Featured Software Projects
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.projects.map((proj) => (
                <div key={proj.id || proj._id} className="glass-interactive rounded-[24px] p-5 bg-gunmetal/40 border-hairline space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-display text-sm font-bold text-chrome">{proj.name}</span>
                    <span className="badge-base badge-neutral text-[11px] font-medium">
                      {proj.status}
                    </span>
                  </div>
                  <p className="text-xs text-chrome-dim font-sans leading-relaxed">{proj.description}</p>
                  {proj.techStack && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {proj.techStack.split(',').map((tech, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded-md bg-steel/70 text-chrome-dim text-[11px] font-mono border border-hairline/60">
                          {tech.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                  {proj.githubLink && (
                    <a
                      href={proj.githubLink}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-chrome hover:text-signal-dim font-sans font-medium pt-1"
                    >
                      <ExternalLink size={12} /> View Codebase
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
