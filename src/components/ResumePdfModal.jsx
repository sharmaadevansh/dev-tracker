import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { Printer, X, ShieldCheck } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useUserHandles } from '../context/UserContext'
import { fetchMyRanking } from '../services/api/backend'

export default function ResumePdfModal({ isOpen, onClose, projects = [] }) {
  const { user } = useAuth()
  const { handles } = useUserHandles()

  const { data: myRank } = useQuery({
    queryKey: ['my-ranking', user?.username],
    queryFn: fetchMyRanking,
    enabled: !!isOpen,
    staleTime: 60 * 1000,
  })

  const devScore = myRank?.devScore ?? 0
  const globalRank = myRank?.globalRank ? `#${myRank.globalRank}` : 'Unranked'
  const lcSolved = myRank?.leetcode?.solved ?? 0
  const lcRating = myRank?.leetcode?.rating ? `Rating: ${myRank.leetcode.rating}` : 'Unrated'
  const cfRating = myRank?.codeforces?.rating ? `${myRank.codeforces.rating}` : 'Unrated'
  const cfRank = myRank?.codeforces?.rank || 'Unrated'
  const ghRepos = myRank?.github?.repos ?? 0
  const ghStars = myRank?.github?.stars ?? 0

  const name = user?.username ? user.username.toUpperCase() : 'PORTFOLIO DEVELOPER'
  const email = user?.email || 'developer@example.com'
  const jobTitle = 'Software Engineer | Full Stack & Systems'
  const phone = user?.phone || ''
  const location = 'Remote / Open to Relocation'
  const university = user?.university || 'Accredited University / Technical Institute'
  const degree = 'B.Tech / B.S. in Computer Science & Engineering'
  const summary = 'Software Engineer with experience in developing responsive fullstack web applications, scalable backend microservices, and efficient data pipelines. Strong foundation in data structures, algorithms, and modular software architecture.'
  const skills = {
    languages: 'TypeScript, JavaScript, Python, C++, SQL, HTML5, CSS3',
    frameworks: 'React, Node.js, Express, Next.js, TailwindCSS, Vite',
    infrastructure: 'MongoDB, PostgreSQL, Redis, Docker, Git, REST APIs, GraphQL',
    coreCompetencies: 'Data Structures & Algorithms, System Design, Microservices, CI/CD'
  }

  const [showStats, setShowStats] = useState(true)
  const [themeStyle, setThemeStyle] = useState('modern') // 'modern' | 'classic'

  if (!isOpen) return null

  const handlePrint = () => {
    window.print()
  }

  const cleanProjects = projects.length > 0 ? projects.slice(0, 3) : [
    {
      name: 'Full Stack Web Platform',
      techStack: 'React, Node.js, Express, MongoDB, TailwindCSS, Vite',
      description: 'Production web application featuring authentication, state synchronization, and RESTful service design.',
      githubLink: handles.github ? `https://github.com/${handles.github}` : ''
    }
  ]

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-5xl bg-gunmetal border border-hairline/80 rounded-[32px] shadow-2xl flex flex-col max-h-[95vh] overflow-hidden"
        >
          {/* Header Controls Bar (Hidden during Print) */}
          <div className="no-print flex flex-wrap items-center justify-between gap-3 px-6 py-4 bg-steel/50 border-b border-hairline shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-signal/20 border border-signal/40 flex items-center justify-center">
                <ShieldCheck size={16} className="text-signal-dim" />
              </div>
              <div>
                <h3 className="font-display font-bold text-chrome text-sm">Verified Developer PDF Resume</h3>
                <p className="text-[11px] text-chrome-dim font-sans">ATS-Optimized A4 Export Engine with Verified DevTrack Stats</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowStats(!showStats)}
                className={`px-3 py-1.5 rounded-full text-xs font-sans font-medium border transition-colors cursor-pointer ${
                  showStats ? 'bg-signal/20 text-signal-dim border-signal/40 font-semibold' : 'bg-steel text-chrome-dim border-hairline'
                }`}
              >
                {showStats ? '✓ Verified Stats Included' : '+ Include Stats'}
              </button>

              <button
                onClick={() => setThemeStyle(themeStyle === 'modern' ? 'classic' : 'modern')}
                className="px-3 py-1.5 rounded-full text-xs font-sans font-medium bg-steel text-chrome border border-hairline hover:border-chrome/30"
              >
                Style: {themeStyle === 'modern' ? 'Modern Tech' : 'Academic Classic'}
              </button>

              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold text-void bg-signal hover:opacity-95 shadow-md transition-all cursor-pointer font-sans"
              >
                <Printer size={13} />
                <span>Print / Save PDF</span>
              </button>

              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-steel text-chrome-dim hover:text-chrome border border-hairline cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Printable Resume Sheet Canvas */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center bg-void/50">
            <div
              id="printable-resume"
              className="w-full max-w-[800px] bg-white text-[#111827] shadow-xl p-8 sm:p-10 font-sans border border-gray-200 rounded-lg text-xs leading-relaxed"
              style={{ minHeight: '1050px' }}
            >
              {/* Name & Contact Header */}
              <div className="border-b-2 border-gray-800 pb-4 mb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 uppercase">
                      {name}
                    </h1>
                    <p className="text-sm font-semibold text-gray-700 mt-0.5 tracking-wide">
                      {jobTitle}
                    </p>
                  </div>
                  {showStats && (
                    <div className="hidden sm:flex flex-col items-end">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-lime-100 text-lime-900 font-sans text-[11px] font-bold border border-lime-300">
                        <ShieldCheck size={11} className="text-lime-700" /> DevTrack Verified Developer
                      </span>
                      <span className="text-[11px] font-sans text-gray-500 mt-0.5">ID: DT-{user?.username || 'DEV'}-2026</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-[11px] text-gray-600 font-sans">
                  <span>{email}</span>
                  {phone && (
                    <>
                      <span>•</span>
                      <span>{phone}</span>
                    </>
                  )}
                  <span>•</span>
                  <span>{location}</span>
                  {handles.github && (
                    <>
                      <span>•</span>
                      <a href={`https://github.com/${handles.github}`} target="_blank" rel="noreferrer" className="text-blue-700 font-medium hover:underline">
                        github.com/{handles.github}
                      </a>
                    </>
                  )}
                  {handles.linkedin && (
                    <>
                      <span>•</span>
                      <a href={`https://linkedin.com/in/${handles.linkedin}`} target="_blank" rel="noreferrer" className="text-blue-700 font-medium hover:underline">
                        linkedin.com/in/{handles.linkedin}
                      </a>
                    </>
                  )}
                </div>
              </div>

              {/* Verified Competitive & Open-Source Metrics */}
              {showStats && (
                <div className="mb-4 bg-gray-50 border border-gray-200 rounded-md p-3">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-gray-500 font-sans mb-1.5 flex items-center justify-between">
                    <span>Verified Competitive Programming & Open Source Metrics</span>
                    <span className="text-lime-700 font-semibold">DevTrack.AI Certified</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                    <div className="bg-white p-2 rounded border border-gray-200">
                      <div className="text-base font-extrabold text-gray-900 font-display tabular-nums">{devScore}</div>
                      <div className="text-[11px] text-gray-500 uppercase font-semibold font-sans">DevScore ({globalRank})</div>
                    </div>
                    <div className="bg-white p-2 rounded border border-gray-200">
                      <div className="text-base font-extrabold text-yellow-600 font-display tabular-nums">{lcSolved} Solved</div>
                      <div className="text-[11px] text-gray-500 uppercase font-semibold font-sans">LeetCode ({lcRating})</div>
                    </div>
                    <div className="bg-white p-2 rounded border border-gray-200">
                      <div className="text-base font-extrabold text-purple-700 font-display tabular-nums">{cfRating}</div>
                      <div className="text-[11px] text-gray-500 uppercase font-semibold font-sans">Codeforces ({cfRank})</div>
                    </div>
                    <div className="bg-white p-2 rounded border border-gray-200">
                      <div className="text-base font-extrabold text-green-700 font-display tabular-nums">{ghRepos} Repos</div>
                      <div className="text-[11px] text-gray-500 uppercase font-semibold font-sans">GitHub ({ghStars} Stars)</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Professional Summary */}
              <div className="mb-4">
                <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900 border-b border-gray-300 pb-1 mb-1.5 font-sans">
                  Professional Summary
                </h2>
                <p className="text-gray-700 text-[11px] leading-relaxed font-sans">
                  {summary}
                </p>
              </div>

              {/* Technical Skills */}
              <div className="mb-4">
                <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900 border-b border-gray-300 pb-1 mb-2 font-sans">
                  Technical Skills
                </h2>
                <div className="space-y-1 text-[11px] font-sans">
                  <div>
                    <span className="font-bold text-gray-900">Languages: </span>
                    <span className="text-gray-700">{skills.languages}</span>
                  </div>
                  <div>
                    <span className="font-bold text-gray-900">Frameworks & Libraries: </span>
                    <span className="text-gray-700">{skills.frameworks}</span>
                  </div>
                  <div>
                    <span className="font-bold text-gray-900">Cloud & Infrastructure: </span>
                    <span className="text-gray-700">{skills.infrastructure}</span>
                  </div>
                  <div>
                    <span className="font-bold text-gray-900">Core Concepts: </span>
                    <span className="text-gray-700">{skills.coreCompetencies}</span>
                  </div>
                </div>
              </div>

              {/* Featured Engineering Projects */}
              <div className="mb-4">
                <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900 border-b border-gray-300 pb-1 mb-2.5 font-sans">
                  Featured Software Engineering Projects
                </h2>
                <div className="space-y-3">
                  {cleanProjects.map((p, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between items-baseline">
                        <span className="font-bold text-[12px] text-gray-900 font-sans">
                          {p.name}
                        </span>
                        {p.githubLink && (
                          <span className="text-[11px] font-sans text-blue-700 font-medium">
                            {p.githubLink.replace('https://', '')}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] font-sans text-gray-600 font-medium">
                        Tech Stack: {p.techStack}
                      </div>
                      <p className="text-[11px] text-gray-700 leading-relaxed pl-2 border-l-2 border-gray-300 font-sans">
                        {p.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Education */}
              <div className="mb-4">
                <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900 border-b border-gray-300 pb-1 mb-1.5 font-sans">
                  Education
                </h2>
                <div className="flex justify-between items-baseline text-[11px] font-sans">
                  <div>
                    <span className="font-bold text-gray-900">{university}</span>
                    <div className="text-gray-700">{degree}</div>
                  </div>
                  <span className="font-sans text-gray-500 text-[11px]">Expected 2026</span>
                </div>
              </div>

              {/* Verification Footer */}
              <div className="pt-3 mt-4 border-t border-gray-200 flex justify-between items-center text-[11px] font-sans text-gray-400">
                <span>Verified via DevTrack.AI Platform Profile</span>
                <span className="font-sans">Authenticity URL: devtrack.ai/u/{user?.username || 'devansh'}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
