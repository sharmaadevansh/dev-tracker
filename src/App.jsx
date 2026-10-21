import React, { Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './context/AuthContext'
import { UserProvider } from './context/UserContext'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import DashboardLayout from './layouts/DashboardLayout'

// Code-split page routes with React.lazy
const Login = React.lazy(() => import('./pages/Login'))
const UsernameSetup = React.lazy(() => import('./pages/UsernameSetup'))
const Dashboard = React.lazy(() => import('./pages/Dashboard'))
const Repositories = React.lazy(() => import('./pages/Repositories'))
const Projects = React.lazy(() => import('./pages/Projects'))
const CodingAnalytics = React.lazy(() => import('./pages/CodingAnalytics'))
const Notes = React.lazy(() => import('./pages/Notes'))
const ResumeTracker = React.lazy(() => import('./pages/ResumeTracker'))
const DailyGoals = React.lazy(() => import('./pages/DailyGoals'))
const Profile = React.lazy(() => import('./pages/Profile'))
const PublicProfile = React.lazy(() => import('./pages/PublicProfile'))
const Leaderboard = React.lazy(() => import('./pages/Leaderboard'))
const AdminLogin = React.lazy(() => import('./pages/AdminLogin'))
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'))

function PageFallback() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] p-8 text-center">
      <div className="w-8 h-8 rounded-full border-2 border-signal border-t-transparent animate-spin mb-4" />
      <p className="text-xs font-sans font-medium text-chrome-dim tracking-wider uppercase">Loading module...</p>
    </div>
  )
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { refetchOnWindowFocus: false },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <UserProvider>
          <div className="app-frame">
            <Suspense fallback={<PageFallback />}>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Login defaultMode="signup" />} />
                <Route path="/login/admin" element={<AdminLogin />} />
                <Route path="/u/:username" element={<PublicProfile />} />
                <Route
                  path="/admin"
                  element={
                    <AdminRoute>
                      <AdminDashboard />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/setup"
                  element={
                    <ProtectedRoute>
                      <UsernameSetup />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <DashboardLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Dashboard />} />
                  <Route path="leaderboard" element={<Leaderboard />} />
                  <Route path="repos" element={<Repositories />} />
                  <Route path="projects" element={<Projects />} />
                  <Route path="analytics" element={<CodingAnalytics />} />
                  <Route path="notes" element={<Notes />} />
                  <Route path="resume" element={<ResumeTracker />} />
                  <Route path="goals" element={<DailyGoals />} />
                  <Route path="profile" element={<Profile />} />
                </Route>
                <Route path="*" element={<Navigate to="/login" replace />} />
              </Routes>
            </Suspense>
          </div>
        </UserProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}
