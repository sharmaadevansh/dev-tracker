import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShieldAlert, Users, FolderKanban, BarChart3, Search, CheckCircle2,
  Trash2, Edit, Plus, RefreshCw, LogOut, ArrowLeft, ExternalLink, AlertTriangle,
  UserCheck, UserX, GraduationCap, FileText, FileSpreadsheet
} from 'lucide-react'
import {
  fetchAdminStats,
  fetchAdminUsers,
  createAdminUser,
  updateAdminUser,
  toggleUserVerification,
  toggleUserSuspension,
  deleteAdminUser,
  fetchAdminContent,
  deleteAdminContent,
} from '../services/api/backend'
import { useAuth } from '../context/AuthContext'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const queryClient = useQueryClient()

  const [activeTab, setActiveTab] = useState('users') // 'users', 'content', 'stats'
  const [userSearch, setUserSearch] = useState('')
  const [contentType, setContentType] = useState('projects') // 'projects', 'notes', 'resumes'

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [deletingUser, setDeletingUser] = useState(null)
  const [deletingContent, setDeletingContent] = useState(null)
  const [actionError, setActionError] = useState('')

  // New user form state
  const [newUserForm, setNewUserForm] = useState({
    username: '',
    password: '',
    email: '',
    university: '',
    role: 'user',
    isVerified: false,
  })

  // Queries
  const {
    data: stats,
    isLoading: statsLoading,
    refetch: refetchStats,
  } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: fetchAdminStats,
  })

  const {
    data: users = [],
    isLoading: usersLoading,
    refetch: refetchUsers,
  } = useQuery({
    queryKey: ['admin-users', userSearch],
    queryFn: () => fetchAdminUsers(userSearch),
  })

  const {
    data: contentList = [],
    isLoading: contentLoading,
    refetch: refetchContent,
  } = useQuery({
    queryKey: ['admin-content', contentType],
    queryFn: () => fetchAdminContent(contentType),
  })

  // Mutations
  const verifyMutation = useMutation({
    mutationFn: toggleUserVerification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
    },
    onError: (err) => setActionError(err.response?.data?.error || 'Verification toggle failed.'),
  })

  const suspendMutation = useMutation({
    mutationFn: toggleUserSuspension,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
    },
    onError: (err) => setActionError(err.response?.data?.error || 'Suspension toggle failed.'),
  })

  const deleteUserMutation = useMutation({
    mutationFn: deleteAdminUser,
    onSuccess: () => {
      setDeletingUser(null)
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
      queryClient.invalidateQueries({ queryKey: ['admin-content'] })
    },
    onError: (err) => setActionError(err.response?.data?.error || 'Failed to delete user.'),
  })

  const createUserMutation = useMutation({
    mutationFn: createAdminUser,
    onSuccess: () => {
      setShowAddModal(false)
      setNewUserForm({
        username: '',
        password: '',
        email: '',
        university: '',
        role: 'user',
        isVerified: false,
      })
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
    },
    onError: (err) => setActionError(err.response?.data?.error || 'Failed to create user.'),
  })

  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }) => updateAdminUser(id, data),
    onSuccess: () => {
      setEditingUser(null)
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
    },
    onError: (err) => setActionError(err.response?.data?.error || 'Failed to update user.'),
  })

  const deleteContentMutation = useMutation({
    mutationFn: ({ type, id }) => deleteAdminContent(type, id),
    onSuccess: () => {
      setDeletingContent(null)
      queryClient.invalidateQueries({ queryKey: ['admin-content'] })
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
    },
    onError: (err) => setActionError(err.response?.data?.error || 'Failed to delete content.'),
  })

  const handleRefreshAll = () => {
    refetchStats()
    refetchUsers()
    refetchContent()
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-void text-chrome font-sans flex flex-col selection:bg-signal selection:text-void">
      {/* Top Admin Header Bar */}
      <header className="border-b border-hairline/80 bg-gunmetal/40 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-signal/15 border border-signal/30 flex items-center justify-center text-signal">
            <ShieldAlert size={17} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-semibold text-sm text-chrome">DevTrack Admin Console</h1>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-signal/15 text-signal border border-signal/25">
                TIER-0 ROOT
              </span>
            </div>
            <p className="text-[11px] text-chrome-dim font-mono hidden sm:block">
              Operator: <span className="text-chrome font-medium">{user?.username}</span> • System Operational
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/dashboard')}
            className="px-3 py-1.5 rounded-lg bg-steel/70 hover:bg-steel border border-hairline text-chrome text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Open standard user cockpit"
          >
            <ArrowLeft size={13} />
            <span className="hidden sm:inline">Go to App</span>
          </button>

          <button
            onClick={handleRefreshAll}
            className="w-8 h-8 rounded-lg bg-steel/70 hover:bg-steel border border-hairline text-chrome-dim hover:text-chrome flex items-center justify-center transition-colors cursor-pointer"
            title="Refresh datasets"
          >
            <RefreshCw size={13} />
          </button>

          <button
            onClick={handleLogout}
            className="px-3 py-1.5 rounded-lg bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-400 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <LogOut size={13} />
            <span className="hidden sm:inline">Exit</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 flex flex-col gap-6">
        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-hairline/60 pb-3 flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setActiveTab('users'); setActionError('') }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'users'
                  ? 'bg-signal text-void font-semibold shadow-xs'
                  : 'bg-steel/50 hover:bg-steel text-chrome-dim hover:text-chrome border border-hairline'
              }`}
            >
              <Users size={14} />
              <span>Users Directory</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                activeTab === 'users' ? 'bg-void/30 text-void' : 'bg-void text-chrome-dim'
              }`}>
                {users.length}
              </span>
            </button>

            <button
              onClick={() => { setActiveTab('content'); setActionError('') }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'content'
                  ? 'bg-signal text-void font-semibold shadow-xs'
                  : 'bg-steel/50 hover:bg-steel text-chrome-dim hover:text-chrome border border-hairline'
              }`}
            >
              <FolderKanban size={14} />
              <span>Content Moderation</span>
            </button>

            <button
              onClick={() => { setActiveTab('stats'); setActionError('') }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'stats'
                  ? 'bg-signal text-void font-semibold shadow-xs'
                  : 'bg-steel/50 hover:bg-steel text-chrome-dim hover:text-chrome border border-hairline'
              }`}
            >
              <BarChart3 size={14} />
              <span>Overview & Stats</span>
            </button>
          </div>

          {activeTab === 'users' && (
            <button
              onClick={() => { setActionError(''); setShowAddModal(true) }}
              className="px-3.5 py-1.5 rounded-xl bg-chrome hover:opacity-90 text-void text-xs font-semibold flex items-center gap-1.5 transition-opacity cursor-pointer shadow-xs"
            >
              <Plus size={14} />
              <span>Provision User</span>
            </button>
          )}
        </div>

        {/* Action Error Banner */}
        {actionError && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertTriangle size={15} />
              <span>{actionError}</span>
            </div>
            <button
              onClick={() => setActionError('')}
              className="text-red-400 hover:text-red-200 cursor-pointer text-xs font-mono"
            >
              ✕
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 1: USERS DIRECTORY                                                    */}
        {/* ========================================================================= */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            {/* Search Filter Bar */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-md">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-chrome-dim" />
                <input
                  type="text"
                  placeholder="Filter users by username, email, university..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-steel/40 border border-hairline focus:border-signal outline-none text-xs text-chrome transition-colors placeholder-chrome-dim/50"
                />
              </div>
              <span className="text-xs text-chrome-dim font-mono">
                {users.length} registered {users.length === 1 ? 'account' : 'accounts'}
              </span>
            </div>

            {/* Users Table */}
            <div className="border border-hairline rounded-2xl overflow-hidden bg-gunmetal/30 backdrop-blur-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-hairline/80 bg-steel/40 text-[11px] font-mono uppercase tracking-wider text-chrome-dim">
                      <th className="py-3 px-4">User</th>
                      <th className="py-3 px-4">University</th>
                      <th className="py-3 px-4">DevScore</th>
                      <th className="py-3 px-4">Projects</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Verified</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-hairline/50">
                    {usersLoading ? (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-chrome-dim">
                          <div className="w-5 h-5 border-2 border-signal border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                          <span>Scanning database records...</span>
                        </td>
                      </tr>
                    ) : users.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-chrome-dim">
                          No users match the search criteria.
                        </td>
                      </tr>
                    ) : (
                      users.map((u) => (
                        <tr key={u.id} className="hover:bg-steel/30 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-lg bg-steel flex items-center justify-center font-bold text-xs uppercase text-chrome shrink-0">
                                {u.username.slice(0, 2)}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-medium text-chrome truncate">{u.username}</span>
                                  {u.isVerified && (
                                    <span title="Verified Developer">
                                      <CheckCircle2 size={12} className="text-signal shrink-0" />
                                    </span>
                                  )}
                                </div>
                                <span className="text-[10px] text-chrome-dim truncate block font-mono">
                                  {u.email || 'No email registered'}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-4 text-chrome-dim truncate max-w-[150px]">
                            {u.university || '—'}
                          </td>

                          <td className="py-3 px-4 font-mono font-semibold text-chrome">
                            {u.devScore ?? 0}
                          </td>

                          <td className="py-3 px-4 font-mono text-chrome-dim">
                            {u.projectsCount ?? 0}
                          </td>

                          <td className="py-3 px-4">
                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                              u.role === 'admin'
                                ? 'bg-signal/15 text-signal border-signal/30 font-semibold'
                                : 'bg-steel text-chrome-dim border-hairline'
                            }`}>
                              {u.role}
                            </span>
                          </td>

                          <td className="py-3 px-4">
                            <button
                              onClick={() => verifyMutation.mutate(u.id)}
                              disabled={verifyMutation.isPending}
                              className={`px-2 py-1 rounded-md text-[11px] font-medium border flex items-center gap-1 transition-colors cursor-pointer ${
                                u.isVerified
                                  ? 'bg-signal/10 border-signal/30 text-signal hover:bg-signal/20'
                                  : 'bg-steel/50 border-hairline text-chrome-dim hover:text-chrome'
                              }`}
                              title="Toggle verified badge"
                            >
                              <UserCheck size={11} />
                              <span>{u.isVerified ? 'Verified' : 'Unverified'}</span>
                            </button>
                          </td>

                          <td className="py-3 px-4">
                            <button
                              onClick={() => suspendMutation.mutate(u.id)}
                              disabled={suspendMutation.isPending || u.id === user?._id}
                              className={`px-2 py-1 rounded-md text-[11px] font-medium border flex items-center gap-1 transition-colors cursor-pointer ${
                                u.isSuspended
                                  ? 'bg-red-500/15 border-red-500/30 text-red-400 hover:bg-red-500/25'
                                  : 'bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20'
                              } disabled:opacity-40 disabled:cursor-not-allowed`}
                              title="Toggle account active/freeze"
                            >
                              {u.isSuspended ? <UserX size={11} /> : <CheckCircle2 size={11} />}
                              <span>{u.isSuspended ? 'Suspended' : 'Active'}</span>
                            </button>
                          </td>

                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <a
                                href={`/u/${u.username}`}
                                target="_blank"
                                rel="noreferrer"
                                className="w-7 h-7 rounded-lg bg-steel/60 hover:bg-steel border border-hairline text-chrome-dim hover:text-chrome flex items-center justify-center transition-colors"
                                title="View public profile"
                              >
                                <ExternalLink size={12} />
                              </a>

                              <button
                                onClick={() => setEditingUser(u)}
                                className="w-7 h-7 rounded-lg bg-steel/60 hover:bg-steel border border-hairline text-chrome-dim hover:text-chrome flex items-center justify-center transition-colors cursor-pointer"
                                title="Edit user"
                              >
                                <Edit size={12} />
                              </button>

                              <button
                                onClick={() => setDeletingUser(u)}
                                disabled={u.id === user?._id}
                                className="w-7 h-7 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 flex items-center justify-center transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                                title="Delete account and cascade clean"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: CONTENT MODERATION                                                 */}
        {/* ========================================================================= */}
        {activeTab === 'content' && (
          <div className="space-y-4">
            {/* Content Type Filter */}
            <div className="flex items-center gap-2 border-b border-hairline/60 pb-3">
              <button
                onClick={() => setContentType('projects')}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                  contentType === 'projects'
                    ? 'bg-chrome text-void font-semibold'
                    : 'bg-steel/40 text-chrome-dim hover:text-chrome border border-hairline'
                }`}
              >
                <FolderKanban size={13} />
                <span>Projects</span>
              </button>

              <button
                onClick={() => setContentType('notes')}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                  contentType === 'notes'
                    ? 'bg-chrome text-void font-semibold'
                    : 'bg-steel/40 text-chrome-dim hover:text-chrome border border-hairline'
                }`}
              >
                <FileText size={13} />
                <span>Notes</span>
              </button>

              <button
                onClick={() => setContentType('resumes')}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                  contentType === 'resumes'
                    ? 'bg-chrome text-void font-semibold'
                    : 'bg-steel/40 text-chrome-dim hover:text-chrome border border-hairline'
                }`}
              >
                <FileSpreadsheet size={13} />
                <span>Resumes</span>
              </button>
            </div>

            {/* Content Listing */}
            <div className="border border-hairline rounded-2xl overflow-hidden bg-gunmetal/30">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-hairline/80 bg-steel/40 text-[11px] font-mono uppercase tracking-wider text-chrome-dim">
                      <th className="py-3 px-4">Title / Label</th>
                      <th className="py-3 px-4">Author</th>
                      <th className="py-3 px-4">Details / Metadata</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4 text-right">Moderation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-hairline/50">
                    {contentLoading ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-chrome-dim">
                          <div className="w-5 h-5 border-2 border-signal border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                          <span>Loading platform content...</span>
                        </td>
                      </tr>
                    ) : contentList.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-chrome-dim">
                          No {contentType} found on the platform.
                        </td>
                      </tr>
                    ) : (
                      contentList.map((item) => (
                        <tr key={item._id} className="hover:bg-steel/30 transition-colors">
                          <td className="py-3 px-4 font-medium text-chrome max-w-xs">
                            <div className="truncate">
                              {item.name || item.title || item.fileName || 'Untitled Content'}
                            </div>
                            {item.description && (
                              <p className="text-[11px] text-chrome-dim truncate font-normal mt-0.5">
                                {item.description}
                              </p>
                            )}
                          </td>

                          <td className="py-3 px-4">
                            <span className="font-medium text-chrome">
                              {item.userId?.username || 'Unknown User'}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-chrome-dim text-[11px]">
                            {contentType === 'projects' && (
                              <span>Stack: {item.techStack || 'Not specified'}</span>
                            )}
                            {contentType === 'notes' && (
                              <span>Folder: {item.folder || 'General'}</span>
                            )}
                            {contentType === 'resumes' && (
                              <span>Role: {item.targetRole || 'Full Stack'} • ATS: {item.atsScore}%</span>
                            )}
                          </td>

                          <td className="py-3 px-4 font-mono text-[11px] text-chrome-dim">
                            {(item.createdAt || item.uploadedAt || '').slice(0, 10) || '—'}
                          </td>

                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => setDeletingContent({ type: contentType, item })}
                              className="px-2.5 py-1 rounded-lg bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-400 text-xs font-medium transition-colors cursor-pointer inline-flex items-center gap-1"
                            >
                              <Trash2 size={11} />
                              <span>Purge</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: SYSTEM OVERVIEW & STATS                                            */}
        {/* ========================================================================= */}
        {activeTab === 'stats' && (
          <div className="space-y-6">
            {/* Stat Cards Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-gunmetal/40 border border-hairline flex flex-col justify-between gap-2">
                <span className="text-[11px] font-mono uppercase text-chrome-dim">Total Accounts</span>
                <span className="text-2xl font-bold font-mono text-chrome">
                  {statsLoading ? '...' : stats?.totalUsers || 0}
                </span>
                <span className="text-[10px] text-chrome-dim">System registered developers</span>
              </div>

              <div className="p-5 rounded-2xl bg-gunmetal/40 border border-hairline flex flex-col justify-between gap-2">
                <span className="text-[11px] font-mono uppercase text-signal">Verified Badges</span>
                <span className="text-2xl font-bold font-mono text-signal">
                  {statsLoading ? '...' : stats?.verifiedUsers || 0}
                </span>
                <span className="text-[10px] text-chrome-dim">Authenticated profiles</span>
              </div>

              <div className="p-5 rounded-2xl bg-gunmetal/40 border border-hairline flex flex-col justify-between gap-2">
                <span className="text-[11px] font-mono uppercase text-yellow-400">Suspended Users</span>
                <span className="text-2xl font-bold font-mono text-yellow-400">
                  {statsLoading ? '...' : stats?.suspendedUsers || 0}
                </span>
                <span className="text-[10px] text-chrome-dim">Restricted / frozen access</span>
              </div>

              <div className="p-5 rounded-2xl bg-gunmetal/40 border border-hairline flex flex-col justify-between gap-2">
                <span className="text-[11px] font-mono uppercase text-chrome-dim">Total Projects</span>
                <span className="text-2xl font-bold font-mono text-chrome">
                  {statsLoading ? '...' : stats?.totalProjects || 0}
                </span>
                <span className="text-[10px] text-chrome-dim">Tracked repositories & builds</span>
              </div>
            </div>

            {/* Second Row: Top Universities */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-gunmetal/40 border border-hairline flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <GraduationCap size={16} className="text-signal" />
                  <h3 className="text-sm font-semibold text-chrome">Top Represented Universities</h3>
                </div>

                <div className="space-y-2">
                  {stats?.topUniversities?.length ? (
                    stats.topUniversities.map((uni, idx) => (
                      <div
                        key={uni.university}
                        className="flex items-center justify-between p-3 rounded-xl bg-steel/30 border border-hairline/60 text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-steel flex items-center justify-center font-mono text-[10px] text-chrome-dim">
                            {idx + 1}
                          </span>
                          <span className="font-medium text-chrome">{uni.university}</span>
                        </div>
                        <span className="font-mono text-signal font-semibold">{uni.count} devs</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-chrome-dim">No campus data captured yet.</p>
                  )}
                </div>
              </div>

              {/* System Architecture Details */}
              <div className="p-6 rounded-2xl bg-gunmetal/40 border border-hairline flex flex-col justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <ShieldAlert size={16} className="text-signal" />
                    <h3 className="text-sm font-semibold text-chrome">Security & Execution Environment</h3>
                  </div>
                  <p className="text-xs text-chrome-dim leading-relaxed">
                    Administration console operates with full database read/write authority under isolated token-verified policies.
                  </p>
                </div>

                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between p-2 rounded-lg bg-steel/30 border border-hairline/40">
                    <span className="text-chrome-dim">Security Tier</span>
                    <span className="text-signal font-semibold">Tier-0 Root Admin</span>
                  </div>
                  <div className="flex justify-between p-2 rounded-lg bg-steel/30 border border-hairline/40">
                    <span className="text-chrome-dim">Auth Guard</span>
                    <span className="text-chrome">JWT Bearer (7 Days)</span>
                  </div>
                  <div className="flex justify-between p-2 rounded-lg bg-steel/30 border border-hairline/40">
                    <span className="text-chrome-dim">Public Admin Clues</span>
                    <span className="text-green-400 font-semibold">0 (Stealth URL Only)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* MODAL 1: ADD USER                                                         */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-void/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-gunmetal border border-hairline rounded-3xl p-6 shadow-2xl relative"
            >
              <h2 className="text-base font-semibold text-chrome mb-1">Provision New Account</h2>
              <p className="text-xs text-chrome-dim mb-4">Create a user directly into MongoDB with designated role.</p>

              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  createUserMutation.mutate(newUserForm)
                }}
                className="space-y-3.5 text-xs"
              >
                <div>
                  <label className="block text-chrome-dim mb-1 font-mono uppercase text-[10px]">Username</label>
                  <input
                    type="text"
                    value={newUserForm.username}
                    onChange={(e) => setNewUserForm({ ...newUserForm, username: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-void border border-hairline text-chrome text-xs outline-none focus:border-signal font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-chrome-dim mb-1 font-mono uppercase text-[10px]">Password (min 6 chars)</label>
                  <input
                    type="password"
                    value={newUserForm.password}
                    onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-void border border-hairline text-chrome text-xs outline-none focus:border-signal font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-chrome-dim mb-1 font-mono uppercase text-[10px]">Email (optional)</label>
                  <input
                    type="email"
                    value={newUserForm.email}
                    onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-void border border-hairline text-chrome text-xs outline-none focus:border-signal"
                  />
                </div>

                <div>
                  <label className="block text-chrome-dim mb-1 font-mono uppercase text-[10px]">University (optional)</label>
                  <input
                    type="text"
                    value={newUserForm.university}
                    onChange={(e) => setNewUserForm({ ...newUserForm, university: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-void border border-hairline text-chrome text-xs outline-none focus:border-signal"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-chrome-dim mb-1 font-mono uppercase text-[10px]">Role</label>
                    <select
                      value={newUserForm.role}
                      onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-void border border-hairline text-chrome text-xs outline-none focus:border-signal cursor-pointer"
                    >
                      <option value="user">User</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </div>

                  <div className="flex flex-col justify-end">
                    <label className="flex items-center gap-2 text-chrome text-xs cursor-pointer pb-2">
                      <input
                        type="checkbox"
                        checked={newUserForm.isVerified}
                        onChange={(e) => setNewUserForm({ ...newUserForm, isVerified: e.target.checked })}
                        className="rounded border-hairline text-signal focus:ring-0 cursor-pointer"
                      />
                      <span>Verified Badge</span>
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-hairline/60">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-3.5 py-2 rounded-xl bg-steel/60 hover:bg-steel text-chrome-dim hover:text-chrome text-xs transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createUserMutation.isPending}
                    className="px-4 py-2 rounded-xl bg-signal hover:opacity-90 text-void font-semibold text-xs transition-opacity cursor-pointer disabled:opacity-50"
                  >
                    {createUserMutation.isPending ? 'Provisioning...' : 'Create Account'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL 2: EDIT USER                                                        */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {editingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-void/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-gunmetal border border-hairline rounded-3xl p-6 shadow-2xl relative"
            >
              <h2 className="text-base font-semibold text-chrome mb-1">Edit Account Details</h2>
              <p className="text-xs text-chrome-dim mb-4">Modify attributes for {editingUser.username}.</p>

              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  updateUserMutation.mutate({
                    id: editingUser.id || editingUser._id,
                    data: {
                      username: editingUser.username,
                      email: editingUser.email,
                      university: editingUser.university,
                      role: editingUser.role,
                      isVerified: editingUser.isVerified,
                      isSuspended: editingUser.isSuspended,
                      password: editingUser.newPassword || undefined,
                    },
                  })
                }}
                className="space-y-3.5 text-xs"
              >
                <div>
                  <label className="block text-chrome-dim mb-1 font-mono uppercase text-[10px]">Username</label>
                  <input
                    type="text"
                    value={editingUser.username}
                    onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-void border border-hairline text-chrome text-xs outline-none focus:border-signal font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-chrome-dim mb-1 font-mono uppercase text-[10px]">Email</label>
                  <input
                    type="email"
                    value={editingUser.email || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-void border border-hairline text-chrome text-xs outline-none focus:border-signal"
                  />
                </div>

                <div>
                  <label className="block text-chrome-dim mb-1 font-mono uppercase text-[10px]">University</label>
                  <input
                    type="text"
                    value={editingUser.university || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, university: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-void border border-hairline text-chrome text-xs outline-none focus:border-signal"
                  />
                </div>

                <div>
                  <label className="block text-chrome-dim mb-1 font-mono uppercase text-[10px]">Reset Password (optional)</label>
                  <input
                    type="password"
                    placeholder="Leave blank to keep current"
                    value={editingUser.newPassword || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, newPassword: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-void border border-hairline text-chrome text-xs outline-none focus:border-signal font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-chrome-dim mb-1 font-mono uppercase text-[10px]">Role</label>
                    <select
                      value={editingUser.role}
                      onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-void border border-hairline text-chrome text-xs outline-none focus:border-signal cursor-pointer"
                    >
                      <option value="user">User</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </div>

                  <div className="flex flex-col justify-end gap-1 pb-1">
                    <label className="flex items-center gap-2 text-chrome text-xs cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingUser.isVerified}
                        onChange={(e) => setEditingUser({ ...editingUser, isVerified: e.target.checked })}
                        className="rounded border-hairline text-signal cursor-pointer"
                      />
                      <span>Verified Badge</span>
                    </label>

                    <label className="flex items-center gap-2 text-chrome text-xs cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingUser.isSuspended}
                        onChange={(e) => setEditingUser({ ...editingUser, isSuspended: e.target.checked })}
                        className="rounded border-hairline text-red-500 cursor-pointer"
                      />
                      <span>Suspended</span>
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-hairline/60">
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    className="px-3.5 py-2 rounded-xl bg-steel/60 hover:bg-steel text-chrome-dim hover:text-chrome text-xs transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updateUserMutation.isPending}
                    className="px-4 py-2 rounded-xl bg-signal hover:opacity-90 text-void font-semibold text-xs transition-opacity cursor-pointer disabled:opacity-50"
                  >
                    {updateUserMutation.isPending ? 'Saving...' : 'Save Updates'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL 3: DELETE CONFIRMATION                                              */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {deletingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-void/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-gunmetal border border-red-500/40 rounded-3xl p-6 shadow-2xl relative"
            >
              <div className="w-10 h-10 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center mb-3">
                <Trash2 size={20} />
              </div>

              <h2 className="text-base font-semibold text-chrome mb-1">Confirm Cascade Deletion</h2>
              <p className="text-xs text-chrome-dim mb-4 leading-relaxed">
                Permanently delete <strong className="text-chrome font-semibold">{deletingUser.username}</strong>? This action will cascade delete all their projects, notes, daily goals, resumes, and leaderboard rankings.
              </p>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-hairline/60">
                <button
                  type="button"
                  onClick={() => setDeletingUser(null)}
                  className="px-3.5 py-2 rounded-xl bg-steel/60 hover:bg-steel text-chrome text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => deleteUserMutation.mutate(deletingUser.id || deletingUser._id)}
                  disabled={deleteUserMutation.isPending}
                  className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold text-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {deleteUserMutation.isPending ? 'Deleting...' : 'Delete Permanently'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL 4: DELETE CONTENT CONFIRMATION                                      */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {deletingContent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-void/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-gunmetal border border-red-500/40 rounded-3xl p-6 shadow-2xl relative"
            >
              <div className="w-10 h-10 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center mb-3">
                <Trash2 size={20} />
              </div>

              <h2 className="text-base font-semibold text-chrome mb-1">Purge Content</h2>
              <p className="text-xs text-chrome-dim mb-4 leading-relaxed">
                Remove this {deletingContent.type.slice(0, -1)} permanently from the database?
              </p>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-hairline/60">
                <button
                  type="button"
                  onClick={() => setDeletingContent(null)}
                  className="px-3.5 py-2 rounded-xl bg-steel/60 hover:bg-steel text-chrome text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => deleteContentMutation.mutate({
                    type: deletingContent.type,
                    id: deletingContent.item._id || deletingContent.item.id,
                  })}
                  disabled={deleteContentMutation.isPending}
                  className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold text-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {deleteContentMutation.isPending ? 'Purging...' : 'Purge Item'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
