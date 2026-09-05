import { Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './context/AuthContext'
import { UserProvider } from './context/UserContext'
import ProtectedRoute from './components/ProtectedRoute'
import DashboardLayout from './layouts/DashboardLayout'
import Login from './pages/Login'
import UsernameSetup from './pages/UsernameSetup'
import Dashboard from './pages/Dashboard'
import Repositories from './pages/Repositories'
import Projects from './pages/Projects'
import CodingAnalytics from './pages/CodingAnalytics'
import Notes from './pages/Notes'
import ResumeTracker from './pages/ResumeTracker'
import DailyGoals from './pages/DailyGoals'
import Profile from './pages/Profile'
import LearningTracker from './pages/LearningTracker'

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
            <Routes>
              <Route path="/login" element={<Login />} />
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
                <Route path="repos" element={<Repositories />} />
                <Route path="projects" element={<Projects />} />
                <Route path="analytics" element={<CodingAnalytics />} />
                <Route path="notes" element={<Notes />} />
                <Route path="resume" element={<ResumeTracker />} />
                <Route path="goals" element={<DailyGoals />} />
                <Route path="profile" element={<Profile />} />
                <Route path="learning" element={<LearningTracker />} />
              </Route>
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </div>
        </UserProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}
