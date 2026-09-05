import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, FileText, CheckCircle, AlertTriangle, ChevronRight, Award, Trash2, Loader2, Sparkles } from 'lucide-react'

const STORAGE_KEY = 'devtrack_resumes'

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

const DEFAULT_RESUMES = [
  {
    id: 'res-1',
    fileName: 'Devansh_Sharma_Backend_Resume.pdf',
    versionLabel: 'v1.1.0 - Node/Express Focused',
    fileSize: '342 KB',
    targetRole: 'Backend Engineer',
    atsScore: 82,
    uploadedAt: new Date(Date.now() - 3600000 * 24 * 4).toISOString(),
    matchedKeywords: KEYWORDS_BY_ROLE['Backend Engineer'].matched,
    missingKeywords: KEYWORDS_BY_ROLE['Backend Engineer'].missing,
    issues: [
      'Include quantifiable metrics in work descriptions (e.g., "optimized query execution by 30%")',
      'Add a dedicated certifications section',
      'Format contact details to explicitly list GitHub & LinkedIn URIs'
    ]
  },
  {
    id: 'res-2',
    fileName: 'Devansh_Sharma_FS_General.pdf',
    versionLabel: 'v1.0.0 - First Draft',
    fileSize: '298 KB',
    targetRole: 'Full Stack Engineer',
    atsScore: 68,
    uploadedAt: new Date(Date.now() - 3600000 * 24 * 14).toISOString(),
    matchedKeywords: KEYWORDS_BY_ROLE['Full Stack Engineer'].matched,
    missingKeywords: KEYWORDS_BY_ROLE['Full Stack Engineer'].missing,
    issues: [
      'Use action verbs to start bullet points under the Experience section',
      'Reduce top margin size to fix pagination overflow',
      'Missing core fullstack technologies: TypeScript and Docker'
    ]
  }
]

function loadResumes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : DEFAULT_RESUMES
  } catch {
    return DEFAULT_RESUMES
  }
}

export default function ResumeTracker() {
  const [resumes, setResumes] = useState(loadResumes)
  const [activeId, setActiveId] = useState(null)
  const [dragActive, setDragActive] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  
  // Form fields
  const [versionLabel, setVersionLabel] = useState('')
  const [targetRole, setTargetRole] = useState('Frontend Engineer')
  const [selectedFile, setSelectedFile] = useState(null)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(resumes))
  }, [resumes])

  useEffect(() => {
    if (resumes.length > 0 && !activeId) {
      setActiveId(resumes[0].id)
    }
  }, [resumes, activeId])

  const activeResume = resumes.find((r) => r.id === activeId) || null

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

    // Simulate scanning and ATS parsing
    await new Promise((resolve) => setTimeout(resolve, 800))

    const roleData = KEYWORDS_BY_ROLE[targetRole] || KEYWORDS_BY_ROLE['Frontend Engineer']
    const score = Math.floor(Math.random() * 16) + 78 // Score between 78 and 93
    const finalTag = versionLabel.trim() || `v1.${resumes.length + 1}.0 - ${selectedFile.name.replace(/\.[^/.]+$/, '')}`

    const newResume = {
      id: crypto.randomUUID(),
      fileName: selectedFile.name,
      versionLabel: finalTag,
      fileSize: `${Math.round(selectedFile.size / 1024) || 245} KB`,
      targetRole,
      atsScore: score,
      uploadedAt: new Date().toISOString(),
      matchedKeywords: roleData.matched,
      missingKeywords: roleData.missing,
      issues: [
        `Ensure section headers match standard ATS format for ${targetRole} screening algorithms.`,
        'Use strong action verbs (e.g. "engineered", "optimized", "architected") to describe bullet points.',
        `Incorporate missing skills (${roleData.missing.slice(0, 3).join(', ')}) to increase ATS keyword density.`,
        'Format contact section to explicitly feature GitHub & LinkedIn links.'
      ]
    }

    setResumes((prev) => [newResume, ...prev])
    setActiveId(newResume.id)
    setSelectedFile(null)
    setVersionLabel('')
    setIsAnalyzing(false)
  }

  const handleDelete = (id, e) => {
    e.stopPropagation()
    setResumes((prev) => prev.filter((r) => r.id !== id))
    if (activeId === id) {
      setActiveId(resumes.length > 1 ? resumes.find((r) => r.id !== id).id : null)
    }
  }

  return (
    <div className="flex-1 px-12 py-10 max-w-7xl mx-auto w-full overflow-y-auto space-y-8 scrollbar-thin">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-chrome">Resume Tracker</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Drag-and-Drop and Version List */}
        <div className="lg:col-span-1 flex flex-col gap-8">
          
          {/* Upload Box */}
          <div className="glass rounded-[36px] p-6 bg-gunmetal/30 border-hairline">
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
                    <p className="text-[10px] text-signal font-mono mt-0.5">{Math.round(selectedFile.size / 1024) || 245} KB • PDF Ready</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs text-chrome font-semibold">Drag & drop any resume PDF here</p>
                    <p className="text-[10px] text-chrome-dim mt-1 font-mono">or click to browse local files</p>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-chrome-dim uppercase tracking-wider font-mono">Version tag (Optional)</label>
                <input
                  value={versionLabel}
                  onChange={(e) => setVersionLabel(e.target.value)}
                  placeholder={selectedFile ? `v1.${resumes.length + 1}.0 - ${selectedFile.name.replace(/\.[^/.]+$/, '')}` : 'v1.2.0 - Added dynamic projects'}
                  className="bg-steel/60 border border-hairline rounded-full px-4 py-2 text-xs text-chrome outline-none focus:border-signal font-mono"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-chrome-dim uppercase tracking-wider font-mono">Target Role</label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="bg-steel/60 border border-hairline rounded-full px-4 py-2 text-xs text-chrome outline-none focus:border-signal font-mono"
                >
                  <option>Frontend Engineer</option>
                  <option>Backend Engineer</option>
                  <option>Full Stack Engineer</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={!selectedFile || isAnalyzing}
                className="mt-2 flex items-center justify-center gap-2 bg-gradient-to-r from-signal to-violet hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-void font-bold text-xs uppercase tracking-wider py-3 rounded-full cursor-pointer shadow-[0_0_12px_rgba(0,0,0,0.2)]"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 size={15} className="animate-spin text-void" />
                    <span>Analyzing ATS Scan...</span>
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
          <div className="glass rounded-[36px] p-6 bg-gunmetal/30 border-hairline flex-1 flex flex-col min-h-[220px]">
            <h3 className="font-display font-semibold text-chrome text-xs mb-3">Version History ({resumes.length})</h3>
            <div className="flex-1 overflow-y-auto flex flex-col gap-2 pr-1 scrollbar-thin">
              {resumes.map((r) => (
                <div
                  key={r.id}
                  onClick={() => setActiveId(r.id)}
                  className={`p-3.5 rounded-[20px] border cursor-pointer flex items-center justify-between transition-colors ${
                    r.id === activeId
                      ? 'bg-steel border-signal-dim'
                      : 'bg-transparent border-hairline hover:bg-steel/30'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FileText size={15} className={r.id === activeId ? 'text-signal' : 'text-chrome-dim'} />
                    <div className="min-w-0">
                      <p className="text-xs text-chrome font-medium truncate max-w-[130px]">{r.versionLabel}</p>
                      <p className="text-[10px] text-chrome-dim font-mono">{r.targetRole}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded ${
                      r.atsScore >= 80 ? 'text-green-500 bg-green-500/5' : r.atsScore >= 70 ? 'text-yellow-500 bg-yellow-500/5' : 'text-signal bg-signal/5'
                    }`}>
                      {r.atsScore}
                    </span>
                    <button
                      onClick={(e) => handleDelete(r.id, e)}
                      className="text-chrome-dim hover:text-signal transition-colors cursor-pointer"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
              {resumes.length === 0 && (
                <p className="text-xs text-chrome-dim text-center py-6">No resumes uploaded yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: ATS Score Assessment */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          {activeResume ? (
            <motion.div
              key={activeResume.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="glass rounded-[36px] p-6 bg-gunmetal/30 border-hairline flex flex-col gap-6"
            >
              
              {/* Top Score Banner */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-6 border-b border-hairline/50">
                <div className="flex-1 text-center sm:text-left">
                  <h2 className="font-display font-semibold text-chrome text-lg">{activeResume.versionLabel}</h2>
                  <p className="text-xs text-chrome-dim font-mono mt-1">File: {activeResume.fileName} ({activeResume.fileSize})</p>
                  <p className="text-xs text-chrome-dim font-mono">Targeting: {activeResume.targetRole} // Uploaded {new Date(activeResume.uploadedAt).toLocaleDateString()}</p>
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
                  <div className="absolute flex flex-col items-center justify-center font-mono">
                    <span className="text-chrome font-bold text-xl leading-none">{activeResume.atsScore}</span>
                    <span className="text-chrome-dim text-[8px] tracking-wide mt-0.5">ATS SCORE</span>
                  </div>
                </div>
              </div>

              {/* Assessment details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Keyword Analysis */}
                <div className="flex flex-col gap-4">
                  <div>
                    <h4 className="text-xs uppercase font-mono tracking-widest text-chrome font-bold flex items-center gap-1.5">
                      <Award size={13} className="text-signal" />
                      KEYWORD COVERAGE
                    </h4>
                    <p className="text-[10px] text-chrome-dim mt-0.5">Analysis of job requirement keywords found in resume</p>
                  </div>

                  <div className="flex flex-col gap-3">
                    {/* Found keywords */}
                    <div>
                      <p className="text-[10px] text-chrome-dim uppercase tracking-wider font-mono font-bold mb-1.5 text-green-500">FOUND ({activeResume.matchedKeywords.length})</p>
                      <div className="flex flex-wrap gap-1.5">
                        {activeResume.matchedKeywords.map((k) => (
                          <span key={k} className="text-[10px] font-mono bg-green-500/5 text-green-500 px-2 py-0.5 rounded border border-green-500/10">
                            {k}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Missing keywords */}
                    <div>
                      <p className="text-[10px] text-chrome-dim uppercase tracking-wider font-mono font-bold mb-1.5 text-signal">MISSING ({activeResume.missingKeywords.length})</p>
                      <div className="flex flex-wrap gap-1.5">
                        {activeResume.missingKeywords.map((k) => (
                          <span key={k} className="text-[10px] font-mono bg-signal/5 text-signal px-2 py-0.5 rounded border border-signal-dim/10">
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
                    <h4 className="text-xs uppercase font-mono tracking-widest text-chrome font-bold flex items-center gap-1.5">
                      <AlertTriangle size={13} className="text-signal" />
                      IMPROVEMENT ACTIONS
                    </h4>
                    <p className="text-[10px] text-chrome-dim mt-0.5">Actionable feedback for optimizing parsing accuracy</p>
                  </div>

                  <div className="flex flex-col gap-2">
                    {activeResume.issues.map((issue, idx) => (
                      <div key={idx} className="flex gap-2 text-xs leading-relaxed text-chrome-dim">
                        <ChevronRight size={13} className="text-signal shrink-0 mt-1" />
                        <span>{issue}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </motion.div>
          ) : (
            <div className="glass rounded-[36px] p-10 text-center bg-gunmetal/30 border-hairline">
              <p className="text-chrome-dim text-sm">Select or upload a resume to view ATS scan feedback.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
