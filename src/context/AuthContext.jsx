import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

const DEFAULT_USER = {
  username: 'devansh',
  password: 'devtrack2026',
}

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => sessionStorage.getItem('devtrack_auth') === 'true'
  )

  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('devtrack_user_credentials_v2')
      return raw ? JSON.parse(raw) : DEFAULT_USER
    } catch {
      return DEFAULT_USER
    }
  })

  const login = (username, password) => {
    if (username === user.username && password === user.password) {
      sessionStorage.setItem('devtrack_auth', 'true')
      setIsAuthenticated(true)
      return { ok: true }
    }
    return { ok: false, error: 'Invalid username or password.' }
  }

  const logout = () => {
    sessionStorage.removeItem('devtrack_auth')
    setIsAuthenticated(false)
  }

  const updateCredentials = (newUsername, newPassword) => {
    if (!newUsername.trim() || !newPassword.trim()) {
      return { ok: false, error: 'Credentials cannot be blank.' }
    }
    const updated = { username: newUsername.trim(), password: newPassword.trim() }
    localStorage.setItem('devtrack_user_credentials_v2', JSON.stringify(updated))
    setUser(updated)
    return { ok: true }
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, updateCredentials }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
