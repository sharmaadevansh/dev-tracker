import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function AdminRoute({ children }) {
  const { isAuthenticated, user, authReady } = useAuth()

  if (!authReady) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen p-8 text-center bg-void">
        <div className="w-8 h-8 rounded-full border-2 border-signal border-t-transparent animate-spin mb-4" />
        <p className="text-xs font-mono text-chrome-dim tracking-wider uppercase">Authenticating administrative credentials...</p>
      </div>
    )
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to="/login" replace />
  }

  return children
}
