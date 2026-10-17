import { createContext, useContext, useEffect, useState } from 'react'
import { fetchHandles, updateHandlesRequest } from '../services/api/backend'
import { useAuth } from './AuthContext'

const UserContext = createContext(null)

const STORAGE_KEY = 'devtrack_handles'
const PLATFORMS_STORAGE_KEY = 'devtrack_active_platforms'

const EMPTY_HANDLES = {
  github: '',
  leetcode: '',
  gfg: '',
  linkedin: '',
  codeforces: '',
  codechef: '',
}

export const DEFAULT_ACTIVE_PLATFORMS = {
  github: true,
  leetcode: true,
  codeforces: true,
  codechef: true,
  gfg: false,
  linkedin: false,
}

function loadHandles() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? { ...EMPTY_HANDLES, ...JSON.parse(raw) } : EMPTY_HANDLES
  } catch {
    return EMPTY_HANDLES
  }
}

function loadActivePlatforms() {
  try {
    const raw = localStorage.getItem(PLATFORMS_STORAGE_KEY)
    return raw ? { ...DEFAULT_ACTIVE_PLATFORMS, ...JSON.parse(raw) } : DEFAULT_ACTIVE_PLATFORMS
  } catch {
    return DEFAULT_ACTIVE_PLATFORMS
  }
}

export function UserProvider({ children }) {
  const { isAuthenticated } = useAuth()
  const [handles, setHandlesState] = useState(loadHandles)
  const [activePlatforms, setActivePlatformsState] = useState(loadActivePlatforms)
  const [handlesLoading, setHandlesLoading] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) return

    const loadRemoteHandles = async () => {
      setHandlesLoading(true)
      try {
        const remoteData = await fetchHandles()
        const remoteHandles = remoteData.handles || remoteData
        const remotePlatforms = remoteData.activePlatforms || null

        const mergedHandles = { ...EMPTY_HANDLES, ...remoteHandles }
        setHandlesState(mergedHandles)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedHandles))

        if (remotePlatforms) {
          const mergedPlatforms = { ...DEFAULT_ACTIVE_PLATFORMS, ...remotePlatforms }
          setActivePlatformsState(mergedPlatforms)
          localStorage.setItem(PLATFORMS_STORAGE_KEY, JSON.stringify(mergedPlatforms))
        }
      } catch {
        setHandlesState(loadHandles())
        setActivePlatformsState(loadActivePlatforms())
      } finally {
        setHandlesLoading(false)
      }
    }

    loadRemoteHandles()
  }, [isAuthenticated])

  const setHandles = async (nextHandles, nextPlatforms = null) => {
    const mergedHandles = { ...handles, ...nextHandles }
    const mergedPlatforms = nextPlatforms ? { ...activePlatforms, ...nextPlatforms } : activePlatforms

    setHandlesState(mergedHandles)
    setActivePlatformsState(mergedPlatforms)

    localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedHandles))
    localStorage.setItem(PLATFORMS_STORAGE_KEY, JSON.stringify(mergedPlatforms))

    try {
      const response = await updateHandlesRequest({
        handles: mergedHandles,
        activePlatforms: mergedPlatforms,
      })
      const remoteHandles = response.handles || response
      const normalizedHandles = { ...EMPTY_HANDLES, ...remoteHandles }
      setHandlesState(normalizedHandles)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizedHandles))

      if (response.activePlatforms) {
        const normalizedPlatforms = { ...DEFAULT_ACTIVE_PLATFORMS, ...response.activePlatforms }
        setActivePlatformsState(normalizedPlatforms)
        localStorage.setItem(PLATFORMS_STORAGE_KEY, JSON.stringify(normalizedPlatforms))
      }
      return { ok: true }
    } catch (error) {
      return {
        ok: false,
        error: error.response?.data?.error || 'Handles saved locally, but backend sync failed.',
      }
    }
  }

  const togglePlatform = async (platformKey) => {
    const nextPlatforms = {
      ...activePlatforms,
      [platformKey]: !activePlatforms[platformKey],
    }
    setActivePlatformsState(nextPlatforms)
    localStorage.setItem(PLATFORMS_STORAGE_KEY, JSON.stringify(nextPlatforms))

    try {
      await updateHandlesRequest({
        handles,
        activePlatforms: nextPlatforms,
      })
    } catch (err) {
      console.warn('Backend sync failed for platform toggle:', err.message)
    }
  }

  const setPlatformActive = async (platformKey, isActive) => {
    const nextPlatforms = {
      ...activePlatforms,
      [platformKey]: !!isActive,
    }
    setActivePlatformsState(nextPlatforms)
    localStorage.setItem(PLATFORMS_STORAGE_KEY, JSON.stringify(nextPlatforms))

    try {
      await updateHandlesRequest({
        handles,
        activePlatforms: nextPlatforms,
      })
    } catch (err) {
      console.warn('Backend sync failed for platform toggle:', err.message)
    }
  }

  const clearHandles = () => {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(PLATFORMS_STORAGE_KEY)
    setHandlesState(EMPTY_HANDLES)
    setActivePlatformsState(DEFAULT_ACTIVE_PLATFORMS)
  }

  const hasAnyHandle = Object.entries(handles).some(
    ([key, v]) => activePlatforms[key] && v && v.trim().length > 0
  )

  const isPlatformActive = (key) => !!activePlatforms[key]

  return (
    <UserContext.Provider
      value={{
        handles,
        activePlatforms,
        setHandles,
        togglePlatform,
        setPlatformActive,
        isPlatformActive,
        clearHandles,
        hasAnyHandle,
        handlesLoading,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export function useUserHandles() {
  const ctx = useContext(UserContext)
  if (!ctx) throw new Error('useUserHandles must be used within UserProvider')
  return ctx
}
