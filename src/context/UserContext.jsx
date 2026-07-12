import { createContext, useContext, useState } from 'react'

const UserContext = createContext(null)

const STORAGE_KEY = 'devtrack_handles'

const EMPTY_HANDLES = {
  github: '',
  leetcode: '',
  gfg: '',
  linkedin: '',
  codeforces: '',
  codechef: '',
}

function loadHandles() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? { ...EMPTY_HANDLES, ...JSON.parse(raw) } : EMPTY_HANDLES
  } catch {
    return EMPTY_HANDLES
  }
}

export function UserProvider({ children }) {
  const [handles, setHandlesState] = useState(loadHandles)

  const setHandles = (next) => {
    const merged = { ...handles, ...next }
    setHandlesState(merged)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged))
  }

  const clearHandles = () => {
    localStorage.removeItem(STORAGE_KEY)
    setHandlesState(EMPTY_HANDLES)
  }

  const hasAnyHandle = Object.values(handles).some((v) => v && v.trim().length > 0)

  return (
    <UserContext.Provider value={{ handles, setHandles, clearHandles, hasAnyHandle }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUserHandles() {
  const ctx = useContext(UserContext)
  if (!ctx) throw new Error('useUserHandles must be used within UserProvider')
  return ctx
}
