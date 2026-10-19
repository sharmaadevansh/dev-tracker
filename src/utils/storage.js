// User-scoped LocalStorage Utility to prevent multi-tenant data bleed
export function getUserStorageKey(key, username) {
  const cleanUser = username && typeof username === 'string' ? username.trim().toLowerCase() : 'shared'
  return `devtrack_${cleanUser}_${key}`
}

export function getScopedItem(key, username, fallback = null) {
  try {
    const scopedKey = getUserStorageKey(key, username)
    const raw = localStorage.getItem(scopedKey)
    if (raw !== null) {
      return JSON.parse(raw)
    }
    // Fallback check to legacy un-scoped key if user-scoped key isn't populated yet
    const legacyRaw = localStorage.getItem(`devtrack_${key}`)
    if (legacyRaw !== null) {
      return JSON.parse(legacyRaw)
    }
    return fallback
  } catch {
    return fallback
  }
}

export function setScopedItem(key, username, value) {
  try {
    const scopedKey = getUserStorageKey(key, username)
    localStorage.setItem(scopedKey, JSON.stringify(value))
  } catch {
    // Ignore storage quota or disabled storage errors
  }
}

export function removeScopedItem(key, username) {
  try {
    const scopedKey = getUserStorageKey(key, username)
    localStorage.removeItem(scopedKey)
  } catch {
    // Ignore
  }
}

export function clearUserStorage(username) {
  if (!username) return
  const prefix = `devtrack_${username.trim().toLowerCase()}_`
  const keysToRemove = []
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)
    if (k && k.startsWith(prefix)) {
      keysToRemove.push(k)
    }
  }
  keysToRemove.forEach((k) => localStorage.removeItem(k))
}
