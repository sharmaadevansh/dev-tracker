import { createContext, useContext, useEffect, useState } from 'react'
import {
  AUTH_TOKEN_KEY,
  fetchCurrentUser,
  loginRequest,
  updateCredentialsRequest,
} from '../services/api/backend'

const AuthContext = createContext(null)

const DEFAULT_USER = {
  username: 'devansh',
  password: 'devtrack2026',
}

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => !!sessionStorage.getItem(AUTH_TOKEN_KEY)
  )

  const [user, setUser] = useState(DEFAULT_USER)
  const [authReady, setAuthReady] = useState(false)

  useEffect(() => {
    const restoreSession = async () => {
      if (!sessionStorage.getItem(AUTH_TOKEN_KEY)) {
        setAuthReady(true)
        return
      }

      try {
        const currentUser = await fetchCurrentUser()
        setUser((prev) => ({ ...prev, username: currentUser.username }))
        setIsAuthenticated(true)
      } catch {
        sessionStorage.removeItem(AUTH_TOKEN_KEY)
        setIsAuthenticated(false)
      } finally {
        setAuthReady(true)
      }
    }

    restoreSession()
  }, [])

  const login = async (username, password) => {
    if (!username.trim() || !password.trim()) {
      return { ok: false, error: 'Username and password cannot be blank.' }
    }

    try {
      const result = await loginRequest(username.trim(), password.trim())
      sessionStorage.setItem(AUTH_TOKEN_KEY, result.token)
      setUser({ username: result.user.username, password: password.trim() })
      setIsAuthenticated(true)
      return { ok: true }
    } catch (error) {
      return {
        ok: false,
        error: error.response?.data?.error || 'Backend login failed.',
      }
    }
  }

  const logout = () => {
    sessionStorage.removeItem(AUTH_TOKEN_KEY)
    setIsAuthenticated(false)
  }

  const updateCredentials = async (newUsername, newPassword) => {
    if (!newUsername.trim() || !newPassword.trim()) {
      return { ok: false, error: 'Credentials cannot be blank.' }
    }

    try {
      const result = await updateCredentialsRequest(newUsername.trim(), newPassword.trim())
      sessionStorage.setItem(AUTH_TOKEN_KEY, result.token)
      setUser({ username: result.user.username, password: newPassword.trim() })
      return { ok: true }
    } catch (error) {
      return {
        ok: false,
        error: error.response?.data?.error || 'Unable to update credentials.',
      }
    }
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, authReady, login, logout, updateCredentials }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
