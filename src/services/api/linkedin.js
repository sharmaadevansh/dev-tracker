// LinkedIn has no public, ToS-compliant API for reading arbitrary profiles
// without OAuth + partner access. Rather than scrape (which violates
// LinkedIn's terms and is unreliable), DevTrack treats LinkedIn as a
// manually-linked profile card. Swap this for the official LinkedIn OAuth
// API in Phase 2 if you get partner access.
export function buildLinkedinProfileUrl(handleOrUrl) {
  if (!handleOrUrl) return null
  if (handleOrUrl.startsWith('http')) return handleOrUrl
  return `https://www.linkedin.com/in/${handleOrUrl}`
}
