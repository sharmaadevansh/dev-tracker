import { createContext, useContext, useEffect, useState } from 'react'
import {
  AUTH_TOKEN_KEY,
  fetchCurrentUser,
  loginRequest,
  registerRequest,
  updateCredentialsRequest,
} from '../services/api/backend'

const AuthContext = createContext(null)

const DEFAULT_USER = {
  username: '',
  password: '',
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

  const register = async (username, password, email = '') => {
    const cleanUser = username.trim().toLowerCase()
    const cleanPass = password.trim()
    const cleanEmail = email.trim()

    if (!cleanUser || !cleanPass) {
      return { ok: false, error: 'Username and password cannot be blank.' }
    }
    if (cleanUser.length < 3) {
      return { ok: false, error: 'Username must be at least 3 characters.' }
    }
    if (cleanPass.length < 6) {
      return { ok: false, error: 'Password must be at least 6 characters.' }
    }

    try {
      const result = await registerRequest(cleanUser, cleanPass, cleanEmail)
      sessionStorage.setItem(AUTH_TOKEN_KEY, result.token)
      setUser({ username: result.user.username, email: result.user.email })
      setIsAuthenticated(true)
      return { ok: true }
    } catch (error) {
      return {
        ok: false,
        error: error.response?.data?.error || 'Registration failed.',
      }
    }
  }

  const logout = () => {
    sessionStorage.removeItem(AUTH_TOKEN_KEY)
    setIsAuthenticated(false)
    setUser(null)
  }

  const updateCredentials = async (newUsername, newPassword) => {
    const cleanUser = typeof newUsername === 'string' ? newUsername.trim() : ''
    const cleanPass = typeof newPassword === 'string' && newPassword.trim() ? newPassword.trim() : undefined

    if (!cleanUser) {
      return { ok: false, error: 'Username cannot be blank.' }
    }

    try {
      const result = await updateCredentialsRequest(cleanUser, cleanPass)
      if (result.token) {
        sessionStorage.setItem(AUTH_TOKEN_KEY, result.token)
      }
      setUser((prev) => ({
        ...prev,
        username: result.user?.username || cleanUser,
        university: result.user?.university !== undefined ? result.user.university : prev?.university,
      }))
      return { ok: true }
    } catch (error) {
      return {
        ok: false,
        error: error.response?.data?.error || 'Unable to update credentials.',
      }
    }
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, authReady, login, register, logout, updateCredentials }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
