import { createContext, useContext, useEffect, useState } from 'react'
import { fetchHandles, updateHandlesRequest } from '../services/api/backend'
import { useAuth } from './AuthContext'
import { getScopedItem, setScopedItem, removeScopedItem } from '../utils/storage'

const UserContext = createContext(null)

const HANDLES_KEY = 'handles'
const PLATFORMS_KEY = 'active_platforms'
const UNIVERSITY_KEY = 'university'

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

export function UserProvider({ children }) {
  const { user, isAuthenticated } = useAuth()
  const username = user?.username || ''

  const [handles, setHandlesState] = useState(() =>
    getScopedItem(HANDLES_KEY, username, EMPTY_HANDLES)
  )
  const [activePlatforms, setActivePlatformsState] = useState(() =>
    getScopedItem(PLATFORMS_KEY, username, DEFAULT_ACTIVE_PLATFORMS)
  )
  const [university, setUniversityState] = useState(() =>
    getScopedItem(UNIVERSITY_KEY, username, '')
  )
  const [handlesLoading, setHandlesLoading] = useState(false)

  // Re-sync local state when active authenticated user switches
  useEffect(() => {
    if (!isAuthenticated) {
      setHandlesState(EMPTY_HANDLES)
      setActivePlatformsState(DEFAULT_ACTIVE_PLATFORMS)
      setUniversityState('')
      return
    }

    setHandlesState(getScopedItem(HANDLES_KEY, username, EMPTY_HANDLES))
    setActivePlatformsState(getScopedItem(PLATFORMS_KEY, username, DEFAULT_ACTIVE_PLATFORMS))
    setUniversityState(getScopedItem(UNIVERSITY_KEY, username, ''))

    const loadRemoteHandles = async () => {
      setHandlesLoading(true)
      try {
        const remoteData = await fetchHandles()
        const remoteHandles = remoteData.handles || remoteData
        const remotePlatforms = remoteData.activePlatforms || null
        const remoteUni = remoteData.university || ''

        const mergedHandles = { ...EMPTY_HANDLES, ...remoteHandles }
        setHandlesState(mergedHandles)
        setScopedItem(HANDLES_KEY, username, mergedHandles)

        if (remotePlatforms) {
          const mergedPlatforms = { ...DEFAULT_ACTIVE_PLATFORMS, ...remotePlatforms }
          setActivePlatformsState(mergedPlatforms)
          setScopedItem(PLATFORMS_KEY, username, mergedPlatforms)
        }

        if (remoteUni) {
          setUniversityState(remoteUni)
          setScopedItem(UNIVERSITY_KEY, username, remoteUni)
        }
      } catch {
        // Fall back to current scoped local cache
      } finally {
        setHandlesLoading(false)
      }
    }

    loadRemoteHandles()
  }, [isAuthenticated, username])

  const setHandles = async (nextHandles, nextPlatforms = null, nextUniversity = null) => {
    const mergedHandles = { ...handles, ...nextHandles }
    const mergedPlatforms = nextPlatforms ? { ...activePlatforms, ...nextPlatforms } : activePlatforms
    const finalUniversity = nextUniversity !== null ? nextUniversity : university

    setHandlesState(mergedHandles)
    setActivePlatformsState(mergedPlatforms)
    setUniversityState(finalUniversity)

    setScopedItem(HANDLES_KEY, username, mergedHandles)
    setScopedItem(PLATFORMS_KEY, username, mergedPlatforms)
    setScopedItem(UNIVERSITY_KEY, username, finalUniversity)

    try {
      const response = await updateHandlesRequest({
        handles: mergedHandles,
        activePlatforms: mergedPlatforms,
        university: finalUniversity,
      })
      const remoteHandles = response.handles || response
      const normalizedHandles = { ...EMPTY_HANDLES, ...remoteHandles }
      setHandlesState(normalizedHandles)
      setScopedItem(HANDLES_KEY, username, normalizedHandles)

      if (response.activePlatforms) {
        const normalizedPlatforms = { ...DEFAULT_ACTIVE_PLATFORMS, ...response.activePlatforms }
        setActivePlatformsState(normalizedPlatforms)
        setScopedItem(PLATFORMS_KEY, username, normalizedPlatforms)
      }

      if (response.university) {
        setUniversityState(response.university)
        setScopedItem(UNIVERSITY_KEY, username, response.university)
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
    setScopedItem(PLATFORMS_KEY, username, nextPlatforms)

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
    setScopedItem(PLATFORMS_KEY, username, nextPlatforms)

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
    removeScopedItem(HANDLES_KEY, username)
    removeScopedItem(PLATFORMS_KEY, username)
    removeScopedItem(UNIVERSITY_KEY, username)
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
        university,
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
