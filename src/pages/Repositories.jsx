import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { Search, Star, GitFork, ExternalLink, Calendar, Database, GitCommit, FileText, X } from 'lucide-react'
import { useUserHandles } from '../context/UserContext'
import { fetchGithubRepos } from '../services/api/github'
import { CardSkeleton } from '../components/Loader'

// Custom lightweight markdown parser for README preview
function parseReadme(text) {
  if (!text) return ''
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  // Headers
  html = html.replace(/^### (.*$)/gim, '<h4 class="font-display font-semibold text-sm text-chrome mt-3 mb-1">$1</h4>')
  html = html.replace(/^## (.*$)/gim, '<h3 class="font-display font-semibold text-base text-chrome mt-4 mb-1.5">$1</h3>')
  html = html.replace(/^# (.*$)/gim, '<h2 class="font-display font-bold text-lg text-signal mt-5 mb-2">$1</h2>')

  // Bold & Italic
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="text-chrome font-semibold">$1</strong>')
  html = html.replace(/\*(.*?)\*/g, '<em class="text-chrome-dim">$1</em>')

  // Code blocks & Inline code
  html = html.replace(/```([\s\S]*?)```/gm, '<pre class="bg-void border border-hairline rounded-lg p-3 font-mono text-xs text-chrome overflow-x-auto my-2">$1</pre>')
  html = html.replace(/`(.*?)`/g, '<code class="bg-void px-1.5 py-0.5 rounded text-signal font-mono text-[11px]">$1</code>')

  // Lists
  html = html.replace(/^\s*-\s*(.*$)/gim, '<li class="ml-4 list-disc text-chrome-dim">$1</li>')

  // Newlines
  html = html.replace(/\n/g, '<br />')

  return html
}

export default function Repositories() {
  const { handles } = useUserHandles()
  const [query, setQuery] = useState('')
  const [langFilter, setLangFilter] = useState('all')
  const [activeRepo, setActiveRepo] = useState(null) // Holds selected repo object

  // Fetch repositories list
  const { data: repos, isLoading, isError } = useQuery({
    queryKey: ['github-repos', handles.github],
    queryFn: () => fetchGithubRepos(handles.github),
    enabled: !!handles.github,
    staleTime: 5 * 60 * 1000,
  })

  // Fetch active repo's latest commit details
  const commitQuery = useQuery({
    queryKey: ['github-repo-commits', handles.github, activeRepo?.name],
    queryFn: async () => {
      const { data } = await axios.get(`https://api.github.com/repos/${handles.github}/${activeRepo.name}/commits`, {
        params: { per_page: 1 }
      })
      if (data && data.length > 0) {
        return {
          message: data[0].commit.message,
          author: data[0].commit.author.name,
          date: new Date(data[0].commit.author.date).toLocaleDateString(),
        }
      }
      return null
    },
    enabled: !!activeRepo && !!handles.github,
    staleTime: 10 * 60 * 1000,
    retry: false,
  })

  // Fetch active repo's README content
  const readmeQuery = useQuery({
    queryKey: ['github-repo-readme', handles.github, activeRepo?.name],
    queryFn: async () => {
      try {
        const res = await axios.get(`https://raw.githubusercontent.com/${handles.github}/${activeRepo.name}/main/README.md`)
        return res.data
      } catch {
        try {
          const res = await axios.get(`https://raw.githubusercontent.com/${handles.github}/${activeRepo.name}/master/README.md`)
          return res.data
        } catch {
          return `### ${activeRepo.name}\nNo README.md documentation file was found on the repository root directory.`
        }
      }
    },
    enabled: !!activeRepo && !!handles.github,
    staleTime: 10 * 60 * 1000,
    retry: false,
  })

  const languages = useMemo(() => {
    if (!repos) return []
    return [...new Set(repos.map((r) => r.language).filter(Boolean))]
  }, [repos])

  const filtered = useMemo(() => {
    if (!repos) return []
    return repos.filter((r) => {
      const matchesQuery = r.name.toLowerCase().includes(query.toLowerCase())
      const matchesLang = langFilter === 'all' || r.language === langFilter
      return matchesQuery && matchesLang
    })
  }, [repos, query, langFilter])

  if (!handles.github) {
    return (
      <div className="flex-1 px-8 py-8 flex items-center justify-center">
        <div className="glass rounded-[36px] p-8 max-w-sm text-center border border-hairline bg-gunmetal/30">
          <p className="text-sm text-chrome-dim">Link a GitHub username on the Handles page to explore repositories.</p>
        </div>
      </div>
    )
  }

  // Format Repository Size
  const formatSize = (kb) => {
    if (kb >= 1024) return `${(kb / 1024).toFixed(2)} MB`
    return `${kb} KB`
  }

  return (
    <div className="flex-1 px-12 py-10 max-w-7xl mx-auto w-full overflow-y-auto space-y-8 scrollbar-thin">
      <div className="mb-6">
        <p className="text-[11px] uppercase tracking-widest text-signal font-mono mb-1">github // file_index</p>
        <h1 className="font-display text-2xl font-semibold text-chrome">Repository Explorer</h1>
      </div>

      {/* Filter and Search controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex items-center gap-2 bg-steel/80 border border-hairline rounded-full px-4 py-2 flex-1">
          <Search size={15} className="text-chrome-dim" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search repositories..."
            className="bg-transparent outline-none text-sm flex-1 text-chrome"
          />
        </div>
        <select
          value={langFilter}
          onChange={(e) => setLangFilter(e.target.value)}
          className="bg-steel/80 border border-hairline rounded-full px-4 py-2 text-sm text-chrome outline-none"
        >
          <option value="all">All languages</option>
          {languages.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
      </div>

      {isError && (
        <p className="text-sm text-signal font-mono">Couldn't load repositories for this username.</p>
      )}

      {/* Repo Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((r) => (
            <div
              key={r.name}
              onClick={() => setActiveRepo(r)}
              className="glass rounded-[36px] p-6 hover:border-signal-dim transition-colors flex flex-col justify-between gap-3.5 cursor-pointer bg-gunmetal/30 group"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm text-chrome truncate group-hover:text-signal transition-colors">{r.name}</span>
                  <span className="text-[10px] text-chrome-dim font-mono">{formatSize(r.size)}</span>
                </div>
                {r.description && (
                  <p className="text-xs text-chrome-dim line-clamp-2 mt-1">{r.description}</p>
                )}
              </div>
              <div className="flex items-center justify-between text-xs text-chrome-dim font-mono mt-1 border-t border-hairline/30 pt-2">
                <div className="flex items-center gap-3">
                  {r.language && <span>{r.language}</span>}
                  <span className="flex items-center gap-1"><Star size={11} />{r.stars}</span>
                  <span className="flex items-center gap-1"><GitFork size={11} />{r.forks}</span>
                </div>
                <span className="text-[10px] text-chrome-dim/70">updated {new Date(r.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="text-sm text-chrome-dim col-span-2 text-center py-10">No repositories match your search.</p>
          )}
        </div>
      )}

      {/* Slide-out detail drawer overlay */}
      {activeRepo && (
        <div
          className="fixed inset-0 bg-black/70 z-50 flex justify-end"
          onClick={() => setActiveRepo(null)}
        >
          {/* Modal Card */}
          <div
            className="w-full max-w-2xl bg-gunmetal border-l border-hairline h-full flex flex-col justify-between p-6 select-text overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header controls */}
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-hairline mb-4">
                <div className="min-w-0">
                  <h2 className="font-display font-semibold text-lg text-chrome truncate">{activeRepo.name}</h2>
                  <p className="text-xs text-chrome-dim font-mono mt-0.5">Size: {formatSize(activeRepo.size)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={activeRepo.htmlUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 bg-steel hover:bg-steel/80 text-chrome hover:text-signal rounded-lg transition-colors"
                  >
                    <ExternalLink size={14} />
                  </a>
                  <button
                    onClick={() => setActiveRepo(null)}
                    className="p-2 text-chrome-dim hover:text-chrome"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Stats Metadata rows */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 text-xs text-chrome font-mono">
                <div className="bg-void/50 border border-hairline rounded-lg p-2.5 flex items-center gap-2">
                  <Database size={13} className="text-signal" />
                  <div>
                    <p className="text-[9px] text-chrome-dim leading-none">SIZE</p>
                    <p className="font-bold mt-1">{formatSize(activeRepo.size)}</p>
                  </div>
                </div>
                <div className="bg-void/50 border border-hairline rounded-lg p-2.5 flex items-center gap-2">
                  <Star size={13} className="text-signal" />
                  <div>
                    <p className="text-[9px] text-chrome-dim leading-none">STARS</p>
                    <p className="font-bold mt-1">{activeRepo.stars}</p>
                  </div>
                </div>
                <div className="bg-void/50 border border-hairline rounded-lg p-2.5 flex items-center gap-2">
                  <GitFork size={13} className="text-signal" />
                  <div>
                    <p className="text-[9px] text-chrome-dim leading-none">FORKS</p>
                    <p className="font-bold mt-1">{activeRepo.forks}</p>
                  </div>
                </div>
                <div className="bg-void/50 border border-hairline rounded-lg p-2.5 flex items-center gap-2">
                  <Calendar size={13} className="text-signal" />
                  <div>
                    <p className="text-[9px] text-chrome-dim leading-none">UPDATED</p>
                    <p className="font-bold mt-1 truncate">{new Date(activeRepo.updatedAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {/* Latest Commit widget */}
              <div className="bg-void/40 border border-hairline rounded-xl p-4 mb-6">
                <h4 className="text-[10px] uppercase font-mono tracking-widest text-chrome-dim font-bold flex items-center gap-1.5 mb-2.5">
                  <GitCommit size={14} className="text-signal" />
                  Latest Commit
                </h4>
                {commitQuery.isLoading ? (
                  <div className="h-10 w-full bg-steel/30 animate-pulse rounded" />
                ) : commitQuery.data ? (
                  <div className="font-mono text-xs text-chrome-dim flex flex-col gap-1 leading-relaxed">
                    <p className="text-chrome font-semibold">"{commitQuery.data.message}"</p>
                    <p className="text-[10px] mt-1">Author: {commitQuery.data.author} // Committed on {commitQuery.data.date}</p>
                  </div>
                ) : (
                  <p className="text-xs text-chrome-dim font-mono">No commit history found.</p>
                )}
              </div>

              {/* README previewer */}
              <div className="border border-hairline rounded-xl bg-void/20 p-4">
                <h4 className="text-[10px] uppercase font-mono tracking-widest text-chrome-dim font-bold flex items-center gap-1.5 mb-3">
                  <FileText size={13} className="text-signal" />
                  README.md Preview
                </h4>
                <div className="max-h-[300px] overflow-y-auto pr-1 scrollbar-thin select-text text-sm leading-relaxed text-chrome-dim">
                  {readmeQuery.isLoading ? (
                    <div className="flex flex-col gap-2">
                      <div className="h-4 w-3/4 bg-steel/40 animate-pulse rounded" />
                      <div className="h-3 w-full bg-steel/30 animate-pulse rounded" />
                      <div className="h-3 w-5/6 bg-steel/30 animate-pulse rounded" />
                    </div>
                  ) : (
                    <div
                      className="markdown-body"
                      dangerouslySetInnerHTML={{ __html: parseReadme(readmeQuery.data) }}
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-hairline/50 text-[10px] text-chrome-dim font-mono text-center shrink-0">
              API queries completed dynamically
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
