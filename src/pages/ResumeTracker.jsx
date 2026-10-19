import { useState, useEffect, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  Upload, FileText, AlertTriangle, ChevronRight, Award, Trash2,
  Loader2, Sparkles, Printer, Copy, Check, Wrench
} from 'lucide-react'
import {
  fetchCollection, createCollectionItem, deleteCollectionItem, optimizeResumeBullet
} from '../services/api/backend'
import { useAuth } from '../context/AuthContext'
import { getScopedItem, setScopedItem } from '../utils/storage'
import ResumePdfModal from '../components/ResumePdfModal'

const RESUMES_STORAGE_KEY = 'resumes'

const KEYWORDS_BY_ROLE = {
  'Frontend Engineer': {
    target: ['React', 'TypeScript', 'TailwindCSS', 'JavaScript', 'HTML5', 'CSS3', 'Next.js', 'Redux', 'Vite', 'Webpack'],
    matched: ['React', 'JavaScript', 'HTML5', 'Vite', 'CSS3'],
    missing: ['TypeScript', 'TailwindCSS', 'Next.js', 'Redux', 'Webpack'],
  },
  'Backend Engineer': {
    target: ['Node.js', 'Express', 'MongoDB', 'Redis', 'REST APIs', 'SQL', 'Docker', 'Kubernetes', 'gRPC', 'System Design', 'CI/CD'],
    matched: ['Node.js', 'Express', 'MongoDB', 'REST APIs', 'SQL'],
    missing: ['Docker', 'Kubernetes', 'Redis', 'gRPC', 'System Design', 'CI/CD'],
  },
  'Full Stack Engineer': {
    target: ['React', 'Node.js', 'Express', 'MongoDB', 'TypeScript', 'SQL', 'Docker', 'TailwindCSS', 'Git', 'System Design'],
    matched: ['React', 'Node.js', 'Express', 'MongoDB', 'Git'],
    missing: ['TypeScript', 'Docker', 'TailwindCSS', 'System Design', 'SQL'],
  }
}

const DEFAULT_RESUMES = []

export default function ResumeTracker() {
  const queryClient = useQueryClient()
  const [activeId, setActiveId] = useState(null)
  const [dragActive, setDragActive] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [activeTab, setActiveTab] = useState('scanner') // 'scanner' | 'optimizer'
  const [pdfModalOpen, setPdfModalOpen] = useState(false)
  
  const { user } = useAuth()
  const username = user?.username || ''

  // Form fields for upload
  const [versionLabel, setVersionLabel] = useState('')
  const [targetRole, setTargetRole] = useState('Frontend Engineer')
  const [selectedFile, setSelectedFile] = useState(null)

  // AI Bullet Optimizer State
  const [bulletInput, setBulletInput] = useState('Worked on backend authentication and database queries using Node.js and MongoDB.')
  const [bulletRole, setBulletRole] = useState('Backend Engineer')
  const [bulletKeywords, setBulletKeywords] = useState('Node.js, Express, MongoDB, JWT, microservices, p99 latency')
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [bulletResult, setBulletResult] = useState(null)
  const [copiedIdx, setCopiedIdx] = useState(null)

  const { data: remoteResumes } = useQuery({
    queryKey: ['backend-resumes', username],
    queryFn: () => fetchCollection('resumes'),
    initialData: () => getScopedItem(RESUMES_STORAGE_KEY, username, DEFAULT_RESUMES),
  })

  const { data: userProjects } = useQuery({
    queryKey: ['backend-projects', username],
    queryFn: () => fetchCollection('projects'),
    initialData: () => getScopedItem('projects', username, []),
  })

  const resumes = useMemo(() => remoteResumes || [], [remoteResumes])

  const syncResumesCache = (nextResumes) => {
    queryClient.setQueryData(['backend-resumes', username], nextResumes)
    setScopedItem(RESUMES_STORAGE_KEY, username, nextResumes)
  }

  const createMutation = useMutation({
    mutationFn: (resume) => createCollectionItem('resumes', resume),
    onSuccess: (resume) => syncResumesCache([resume, ...resumes.filter((r) => r.id !== resume.id)]),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteCollectionItem('resumes', id),
    onSuccess: (_, id) => syncResumesCache(resumes.filter((r) => r.id !== id)),
  })

  const firstResumeId = resumes[0]?.id

  useEffect(() => {
    if (firstResumeId && !activeId) {
      setActiveId(firstResumeId)
    }
  }, [firstResumeId, activeId])

  const activeResume = resumes.find((r) => r.id === activeId) || null

  const handleOptimizeBullet = async (e) => {
    e?.preventDefault()
    if (!bulletInput.trim()) return
    setIsOptimizing(true)
    try {
      const res = await optimizeResumeBullet({
        bullet: bulletInput.trim(),
        role: bulletRole,
        targetKeywords: bulletKeywords
      })
      setBulletResult(res)
    } catch (err) {
      console.error('Bullet optimization error:', err)
    } finally {
      setIsOptimizing(false)
    }
  }

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text)
    setCopiedIdx(idx)
    setTimeout(() => setCopiedIdx(null), 2000)
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleFileSelect = (file) => {
    if (!file) return
    setSelectedFile(file)
    if (!versionLabel) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' ')
      setVersionLabel(`v1.${resumes.length + 1}.0 - ${cleanName}`)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0])
    }
  }

  const handleUploadSubmit = async (e) => {
    e.preventDefault()
    if (!selectedFile) return

    setIsAnalyzing(true)

    let docText = ''
    try {
      if (typeof selectedFile.text === 'function') {
        docText = await selectedFile.text()
      } else {
        const buffer = await selectedFile.arrayBuffer()
        const bytes = new Uint8Array(buffer)
        let extracted = ''
        for (let i = 0; i < bytes.length; i++) {
          const b = bytes[i]
          if ((b >= 32 && b <= 126) || b === 10 || b === 13) {
            extracted += String.fromCharCode(b)
          } else if (extracted.length > 0 && extracted[extracted.length - 1] !== ' ') {
            extracted += ' '
          }
        }
        docText = extracted
      }
    } catch {
      docText = selectedFile.name
    }

    const lowerText = docText.toLowerCase()
    const roleConfig = KEYWORDS_BY_ROLE[targetRole] || KEYWORDS_BY_ROLE['Frontend Engineer']
    const targetKeywords = roleConfig.target

    const matched = []
    const missing = []

    targetKeywords.forEach((kw) => {
      const regex = new RegExp(`\\b${kw.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'i')
      if (regex.test(lowerText) || lowerText.includes(kw.toLowerCase())) {
        matched.push(kw)
      } else {
        missing.push(kw)
      }
    })

    // Calculate score based on actual keyword density & presence
    const matchRatio = targetKeywords.length > 0 ? matched.length / targetKeywords.length : 0.75
    const score = Math.round(50 + matchRatio * 45) // Scaled 50 to 95 based on actual matches

    const issues = []
    if (missing.length > 0) {
      issues.push(`Incorporate missing high-demand skills: ${missing.slice(0, 3).join(', ')}.`)
    }
    if (!lowerText.includes('github') && !lowerText.includes('git')) {
      issues.push('Add active GitHub profile link in the header for engineering verification.')
    }
    if (!lowerText.includes('linkedin')) {
      issues.push('Format contact section to explicitly feature your LinkedIn URL.')
    }
    if (!/\b(engineered|optimized|architected|deployed|reduced|scaled)\b/i.test(lowerText)) {
      issues.push('Start bullet points with strong action verbs (engineered, optimized, scaled).')
    }
    if (issues.length === 0) {
      issues.push('Resume displays strong ATS alignment with role specifications.')
    }

    const finalTag = versionLabel.trim() || `v1.${resumes.length + 1}.0 - ${selectedFile.name.replace(/\.[^/.]+$/, '')}`

    const newResume = {
      id: crypto.randomUUID(),
      fileName: selectedFile.name,
      versionLabel: finalTag,
      fileSize: `${Math.max(1, Math.round(selectedFile.size / 1024))} KB`,
      targetRole,
      atsScore: score,
      uploadedAt: new Date().toISOString(),
      matchedKeywords: matched.length > 0 ? matched : ['Core Fundamentals'],
      missingKeywords: missing,
      issues,
    }

    createMutation.mutate(newResume)
    setActiveId(newResume.id)
    setSelectedFile(null)
    setVersionLabel('')
    setIsAnalyzing(false)
  }

  const handleDelete = (id, e) => {
    e.stopPropagation()
    deleteMutation.mutate(id)
    if (activeId === id) {
      setActiveId(resumes.length > 1 ? resumes.find((r) => r.id !== id)?.id : null)
    }
  }

  return (
    <div className="flex-1 px-4 sm:px-8 lg:px-12 py-6 sm:py-8 max-w-7xl mx-auto w-full overflow-y-auto space-y-6 scrollbar-thin">
      
      {/* Top Header & Mode Switcher Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-hairline">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-chrome">Resume Tracker & Career Engine</h1>
            <span className="text-[11px] font-sans font-medium px-2 py-0.5 rounded-full bg-steel text-chrome-dim border border-hairline">
              AI Powered
            </span>
          </div>
          <p className="text-xs sm:text-sm text-chrome-dim mt-1 font-sans">
            ATS Scanner • Google XYZ Bullet Optimizer • Verified Developer PDF Resume Exporter
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Tab Switcher */}
          <div className="flex items-center bg-steel p-1 rounded-lg border border-hairline">
            <button
              onClick={() => setActiveTab('scanner')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                activeTab === 'scanner'
                  ? 'bg-gunmetal text-chrome shadow-xs'
                  : 'text-chrome-dim hover:text-chrome'
              }`}
            >
              ATS Scanner
            </button>
            <button
              onClick={() => setActiveTab('optimizer')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                activeTab === 'optimizer'
                  ? 'bg-gunmetal text-chrome shadow-xs'
                  : 'text-chrome-dim hover:text-chrome'
              }`}
            >
              <Sparkles size={12} className={activeTab === 'optimizer' ? 'text-signal-dim dark:text-signal' : 'text-chrome-dim'} />
              <span>AI Bullet Optimizer</span>
            </button>
          </div>

          {/* Export PDF Resume Button */}
          <button
            onClick={() => setPdfModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold text-void bg-signal hover:opacity-95 shadow-md transition-all cursor-pointer"
          >
            <Printer size={13} />
            <span>Export Verified Resume (PDF)</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: ATS DOCUMENT SCANNER                                                */}
      {/* ========================================================================= */}
      {activeTab === 'scanner' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Side: Drag-and-Drop and Version List */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            
            {/* Upload Box */}
            <div className="glass rounded-[32px] p-6 bg-gunmetal/30 border-hairline">
              <h3 className="font-display font-semibold text-chrome text-xs mb-3">Upload Version</h3>
              <form onSubmit={handleUploadSubmit} className="flex flex-col gap-3">
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl p-5 text-center transition-all relative flex flex-col items-center justify-center min-h-[140px] cursor-pointer ${
                    dragActive
                      ? 'border-signal bg-signal/10 scale-[1.02]'
                      : selectedFile
                      ? 'border-signal/50 bg-signal/5'
                      : 'border-hairline hover:border-chrome/40 hover:bg-steel/10'
                  }`}
                >
                  <input
                    type="file"
                    accept=".pdf,.docx,.doc,.txt"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Upload size={24} className={selectedFile ? 'text-signal mb-2 led-pulse' : 'text-chrome-dim mb-2'} />
                  {selectedFile ? (
                    <div>
                      <p className="text-xs text-chrome font-bold truncate max-w-[200px]">{selectedFile.name}</p>
                      <p className="text-xs text-signal-dim font-sans mt-0.5">{Math.max(1, Math.round(selectedFile.size / 1024))} KB • File Selected</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs text-chrome font-semibold">Drag & drop any resume PDF here</p>
                      <p className="text-xs text-chrome-dim mt-1 font-sans">or click to browse local files</p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs text-chrome-dim font-medium font-sans">Version tag (Optional)</label>
                  <input
                    value={versionLabel}
                    onChange={(e) => setVersionLabel(e.target.value)}
                    placeholder={selectedFile ? `v1.${resumes.length + 1}.0 - ${selectedFile.name.replace(/\.[^/.]+$/, '')}` : 'v1.2.0 - Added dynamic projects'}
                    className="bg-steel/60 hover:bg-steel border border-hairline focus:border-chrome-dim rounded-lg px-3 py-2 text-xs text-chrome outline-none font-sans transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs text-chrome-dim font-medium font-sans">Target Role</label>
                  <select
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="bg-steel/60 hover:bg-steel border border-hairline focus:border-chrome-dim rounded-lg px-3 py-2 text-xs text-chrome outline-none font-sans transition-colors"
                  >
                    <option>Frontend Engineer</option>
                    <option>Backend Engineer</option>
                    <option>Full Stack Engineer</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={!selectedFile || isAnalyzing}
                  className="mt-2 flex items-center justify-center gap-2 bg-chrome text-void hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity font-medium text-xs py-2.5 rounded-lg cursor-pointer"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 size={15} className="animate-spin text-void" />
                      <span>Extracting & Scoring ATS Tokens...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={15} className="text-void" />
                      <span>Compile & Score Resume</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Versions List */}
            <div className="glass rounded-[32px] p-6 bg-gunmetal/30 border-hairline flex-1 flex flex-col min-h-[220px]">
              <h3 className="font-display font-semibold text-chrome text-xs mb-3">Version History ({resumes.length})</h3>
              <div className="flex-1 overflow-y-auto flex flex-col gap-2 pr-1 scrollbar-thin">
                {resumes.map((r) => (
                  <div
                    key={r.id}
                    onClick={() => setActiveId(r.id)}
                    className={`p-3.5 rounded-[20px] border cursor-pointer flex items-center justify-between transition-colors ${
                      r.id === activeId
                        ? 'bg-steel border-signal-dim/50'
                        : 'bg-transparent border-hairline hover:bg-steel/30'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FileText size={15} className={r.id === activeId ? 'text-signal-dim' : 'text-chrome-dim'} />
                      <div className="min-w-0">
                        <p className="text-xs text-chrome font-medium truncate max-w-[130px]">{r.versionLabel}</p>
                        <p className="text-[11px] text-chrome-dim font-sans">{r.targetRole}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-xs font-display font-bold tabular-nums px-2 py-0.5 rounded ${
                        r.atsScore >= 80 ? 'text-green-600 bg-green-500/10' : r.atsScore >= 70 ? 'text-yellow-600 bg-yellow-500/10' : 'text-signal-dim bg-signal/10'
                      }`}>
                        {r.atsScore}
                      </span>
                      <button
                        onClick={(e) => handleDelete(r.id, e)}
                        className="text-chrome-dim hover:text-red-500 transition-colors cursor-pointer"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
                {resumes.length === 0 && (
                  <p className="text-xs text-chrome-dim text-center py-6 font-sans">No resumes uploaded yet.</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Side: ATS Score Assessment */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {activeResume ? (
              <motion.div
                key={activeResume.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="glass rounded-[32px] p-6 bg-gunmetal/30 border-hairline flex flex-col gap-6"
              >
                
                {/* Top Score Banner */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-6 border-b border-hairline/50">
                  <div className="flex-1 text-center sm:text-left">
                    <h2 className="font-display font-semibold text-chrome text-lg">{activeResume.versionLabel}</h2>
                    <p className="text-xs text-chrome-dim font-sans mt-1">File: {activeResume.fileName} ({activeResume.fileSize})</p>
                    <p className="text-xs text-chrome-dim font-sans">Targeting: {activeResume.targetRole} // Uploaded {new Date(activeResume.uploadedAt).toLocaleDateString()}</p>
                  </div>
                  
                  {/* Circular Score Visualizer */}
                  <div className="w-24 h-24 relative flex items-center justify-center shrink-0">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="48"
                        cy="48"
                        r="40"
                        stroke="var(--color-steel)"
                        strokeWidth="6"
                        fill="transparent"
                      />
                      <circle
                        cx="48"
                        cy="48"
                        r="40"
                        stroke="var(--color-signal)"
                        strokeWidth="6"
                        fill="transparent"
                        strokeDasharray={251.2}
                        strokeDashoffset={251.2 - (251.2 * activeResume.atsScore) / 100}
                        className="transition-all duration-1000"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center font-sans">
                      <span className="text-chrome font-semibold text-xl leading-none tabular-nums">{activeResume.atsScore}</span>
                      <span className="text-chrome-dim text-[11px] font-sans font-medium mt-0.5">ATS Score</span>
                    </div>
                  </div>
                </div>

                {/* Assessment details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Keyword Analysis */}
                  <div className="flex flex-col gap-4">
                    <div>
                      <h4 className="text-xs font-sans text-chrome font-semibold flex items-center gap-1.5">
                        <Award size={13} className="text-signal-dim" />
                        Keyword Coverage
                      </h4>
                      <p className="text-xs text-chrome-dim mt-0.5 font-sans">Analysis of job requirement keywords found in resume</p>
                    </div>

                    <div className="flex flex-col gap-3">
                      {/* Found keywords */}
                      <div>
                        <p className="text-[11px] text-chrome-dim font-sans font-medium mb-1.5 text-green-600">Found ({activeResume.matchedKeywords.length})</p>
                        <div className="flex flex-wrap gap-1.5">
                          {activeResume.matchedKeywords.map((k) => (
                            <span key={k} className="text-xs font-sans bg-green-500/10 text-green-600 px-2 py-0.5 rounded border border-green-500/20">
                              {k}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Missing keywords */}
                      <div>
                        <p className="text-[11px] text-chrome-dim font-sans font-medium mb-1.5 text-signal-dim">Missing ({activeResume.missingKeywords.length})</p>
                        <div className="flex flex-wrap gap-1.5">
                          {activeResume.missingKeywords.map((k) => (
                            <span key={k} className="text-xs font-sans bg-signal/15 text-signal-dim px-2 py-0.5 rounded border border-signal-dim/20">
                              {k}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ATS Formatting & Improvements */}
                  <div className="flex flex-col gap-4">
                    <div>
                      <h4 className="text-xs uppercase font-sans tracking-wider text-chrome font-bold flex items-center gap-1.5">
                        <AlertTriangle size={13} className="text-signal-dim" />
                        IMPROVEMENT ACTIONS
                      </h4>
                      <p className="text-xs text-chrome-dim mt-0.5 font-sans">Actionable feedback for optimizing parsing accuracy</p>
                    </div>

                    <div className="flex flex-col gap-2">
                      {activeResume.issues.map((issue, idx) => (
                        <div key={idx} className="flex gap-2 text-xs leading-relaxed text-chrome-dim font-sans">
                          <ChevronRight size={13} className="text-signal-dim shrink-0 mt-1" />
                          <span>{issue}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </motion.div>
            ) : (
              <div className="glass rounded-[32px] p-8 sm:p-12 text-center bg-gunmetal/30 border-hairline flex flex-col items-center justify-center space-y-6">
                <div className="w-16 h-16 rounded-full bg-signal/15 border border-signal/30 flex items-center justify-center text-signal shadow-lg">
                  <Sparkles size={28} />
                </div>
                <div className="space-y-1.5 max-w-md">
                  <h3 className="font-display text-lg font-bold text-chrome">ATS Readiness & Career Engine</h3>
                  <p className="text-xs text-chrome-dim font-sans leading-relaxed">
                    Upload your resume to receive instantaneous ATS token scoring, role-specific keyword density metrics, and automated structural recommendations.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-lg text-left">
                  <div className="p-4 rounded-2xl bg-steel/50 border border-hairline">
                    <p className="text-xs font-bold text-chrome font-display">1. Upload</p>
                    <p className="text-xs text-chrome-dim font-sans mt-1">PDF or Word resume drag & drop</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-steel/50 border border-hairline">
                    <p className="text-xs font-bold text-chrome font-display">2. Match</p>
                    <p className="text-xs text-chrome-dim font-sans mt-1">Target role keyword alignment score</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-steel/50 border border-hairline">
                    <p className="text-xs font-bold text-chrome font-display">3. Optimize</p>
                    <p className="text-xs text-chrome-dim font-sans mt-1">Google XYZ bullet reformulation</p>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: AI RESUME BULLET OPTIMIZER (GOOGLE XYZ FORMULA)                     */}
      {/* ========================================================================= */}
      {activeTab === 'optimizer' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Input Box */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="glass rounded-[32px] p-6 bg-gunmetal/30 border-hairline flex flex-col gap-4">
              <div>
                <h3 className="font-display font-bold text-chrome text-sm flex items-center gap-2">
                  <Wrench size={15} className="text-signal-dim" />
                  <span>Resume Bullet Input</span>
                </h3>
                <p className="text-[11px] text-chrome-dim mt-0.5">
                  Paste any bullet point. The engine applies Google’s formula: <em>"Accomplished [X] measured by [Y] by doing [Z]"</em>.
                </p>
              </div>

              {/* Sample Templates */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] text-chrome-dim uppercase tracking-wider font-medium font-sans">Sample Templates</label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: 'Backend Auth', text: 'Worked on backend user authentication and session management using Node.js and JWT.' },
                    { label: 'Frontend UI', text: 'Built dashboard UI components and charting widgets using React and TailwindCSS.' },
                    { label: 'Database Optimization', text: 'Optimized slow MongoDB queries and created compound database indexes.' },
                    { label: 'Microservices Scale', text: 'Designed Redis caching layer to handle high traffic and API requests.' }
                  ].map((tpl) => (
                    <button
                      key={tpl.label}
                      type="button"
                      onClick={() => setBulletInput(tpl.text)}
                      className="text-xs font-sans font-medium px-3 py-1 rounded-full bg-steel hover:bg-steel/80 text-chrome border border-hairline transition-colors cursor-pointer"
                    >
                      {tpl.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-chrome-dim font-medium font-sans">Current bullet text</label>
                <textarea
                  rows={4}
                  value={bulletInput}
                  onChange={(e) => setBulletInput(e.target.value)}
                  placeholder="e.g., Created REST API endpoints using Express and handled database models..."
                  className="w-full bg-steel/60 hover:bg-steel border border-hairline focus:border-chrome-dim rounded-lg p-3 text-xs text-chrome outline-none resize-none font-sans leading-relaxed transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-chrome-dim font-medium font-sans">Target role</label>
                  <select
                    value={bulletRole}
                    onChange={(e) => setBulletRole(e.target.value)}
                    className="bg-steel/60 hover:bg-steel border border-hairline focus:border-chrome-dim rounded-lg px-3 py-2 text-xs text-chrome outline-none font-sans transition-colors"
                  >
                    <option>Backend Engineer</option>
                    <option>Frontend Engineer</option>
                    <option>Full Stack Engineer</option>
                    <option>DevOps / Platform Engineer</option>
                    <option>AI / Machine Learning Engineer</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs text-chrome-dim font-medium font-sans">Target keywords</label>
                  <input
                    value={bulletKeywords}
                    onChange={(e) => setBulletKeywords(e.target.value)}
                    placeholder="e.g., Docker, Redis, p99 latency"
                    className="bg-steel/60 hover:bg-steel border border-hairline focus:border-chrome-dim rounded-lg px-3 py-2 text-xs text-chrome outline-none font-sans transition-colors"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleOptimizeBullet}
                disabled={!bulletInput.trim() || isOptimizing}
                className="mt-2 flex items-center justify-center gap-2 bg-chrome text-void hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity font-medium text-xs py-2.5 rounded-lg cursor-pointer"
              >
                {isOptimizing ? (
                  <>
                    <Loader2 size={15} className="animate-spin text-void" />
                    <span>Rewriting with Gemini AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={15} className="text-void" />
                    <span>Generate 3 High-Impact Variations</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Column: AI Generated Variations & Feedback */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {bulletResult ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-[32px] p-6 bg-gunmetal/30 border-hairline flex flex-col gap-5"
              >
                <div className="flex items-center justify-between pb-3 border-b border-hairline/60">
                  <div>
                    <span className="text-[11px] font-sans font-medium text-chrome-dim uppercase tracking-wider">Predicted Conversion Rate</span>
                    <h4 className="font-display font-bold text-chrome text-base flex items-center gap-2">
                      <span>ATS Impact Score:</span>
                      <span className="text-signal-dim font-display text-lg font-extrabold tabular-nums">{bulletResult.impactScore} / 100</span>
                    </h4>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-signal/20 text-signal-dim text-xs font-sans font-semibold border border-signal/40">
                    Google XYZ Format
                  </span>
                </div>

                {/* 3 Variations */}
                <div className="flex flex-col gap-3">
                  {bulletResult.variations?.map((variant, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-steel/60 border border-hairline hover:border-signal/50 transition-all flex flex-col gap-2 relative group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-semibold font-sans uppercase tracking-wider text-chrome-dim">
                            Variation {idx + 1}: {variant.type}
                          </span>
                          <span className="text-[11px] font-sans px-2.5 py-0.5 rounded-full bg-violet/15 text-violet border border-violet/30 font-semibold">
                            {variant.badge}
                          </span>
                        </div>
                        <button
                          onClick={() => handleCopy(variant.text, idx)}
                          className="flex items-center gap-1 text-xs font-sans font-medium px-2.5 py-1 rounded-md bg-gunmetal border border-hairline hover:border-signal text-chrome transition-colors cursor-pointer"
                        >
                          {copiedIdx === idx ? (
                            <>
                              <Check size={11} className="text-green-600" />
                              <span className="text-green-600 font-bold">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy size={11} className="text-chrome-dim" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>

                      <p className="text-xs text-chrome leading-relaxed font-sans pr-2">
                        • {variant.text}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Power Verbs & Recruiter Critique */}
                <div className="pt-3 border-t border-hairline/60 flex flex-col gap-3">
                  <div>
                    <span className="text-[11px] font-sans text-chrome-dim uppercase font-bold tracking-wider">Power Action Verbs Deployed</span>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {bulletResult.powerVerbs?.map((verb) => (
                        <span key={verb} className="text-xs font-sans px-2.5 py-0.5 rounded-md bg-signal/15 text-signal-dim font-semibold border border-signal/30">
                          {verb}
                        </span>
                      ))}
                    </div>
                  </div>

                  {bulletResult.critique && (
                    <div className="p-3 rounded-xl bg-violet/5 border border-violet/20 text-xs text-chrome-dim leading-relaxed font-sans">
                      <span className="font-bold text-chrome mr-1">💡 Recruiter Critique:</span>
                      {bulletResult.critique}
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <div className="glass rounded-[32px] p-10 text-center bg-gunmetal/30 border-hairline flex flex-col items-center justify-center min-h-[350px]">
                <Sparkles size={36} className="text-signal-dim mb-3 animate-pulse" />
                <h4 className="font-display font-semibold text-chrome text-base">AI Bullet Point Enhancer</h4>
                <p className="text-xs text-chrome-dim max-w-md mt-1.5 leading-relaxed">
                  Enter your draft bullet point and select your target role to generate 3 recruiter-ready variations using quantifiable metrics and action-oriented frameworks.
                </p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* Printable Verified Developer Resume Modal */}
      <ResumePdfModal
        isOpen={pdfModalOpen}
        onClose={() => setPdfModalOpen(false)}
        projects={userProjects || []}
      />

    </div>
  )
}

