import axios from 'axios'

export async function fetchCodechefProfile(username) {
  if (!username) return null

  // 1. Try local backend proxy scraper (fast, avoids CORS, avoids dead vercel mirrors)
  try {
    const { data } = await axios.get(`/api/proxy/codechef/${encodeURIComponent(username)}`, { timeout: 7000 })
    return {
      username: data.username || username,
      rating: data.rating || 0,
      highestRating: data.highestRating || data.rating || 0,
      stars: data.stars || 'Unrated',
      starsCount: data.starsCount || 0,
      division: data.division || 'Unrated',
      globalRank: data.globalRank || 'Unranked',
      countryRank: data.countryRank || 'Unranked',
      countryName: data.countryName || 'Global',
    }
  } catch (err) {
    console.warn('Backend CodeChef proxy failed, trying direct mirror:', err.message)
  }

  // 2. Fallback to public mirror if available
  try {
    const { data } = await axios.get(`https://codechef-api.vercel.app/${encodeURIComponent(username)}`, { timeout: 4000 })
    return {
      username,
      rating: data.currentRating || 0,
      highestRating: data.highestRating || 0,
      stars: data.stars || 'Unrated',
      starsCount: parseInt(data.stars, 10) || 0,
      division: (data.currentRating >= 2000) ? 'Div 1' : (data.currentRating >= 1600 ? 'Div 2' : (data.currentRating ? 'Div 3' : 'Unrated')),
      globalRank: data.globalRank || 'Unranked',
      countryRank: data.countryRank || 'Unranked',
      countryName: data.countryName || 'Global',
    }
  } catch {
    // 3. Fallback safe profile
    return {
      username,
      rating: 0,
      highestRating: 0,
      stars: 'Unrated',
      starsCount: 0,
      division: 'Unrated',
      globalRank: 'Unranked',
      countryRank: 'Unranked',
      countryName: 'Global',
      isDemo: false,
    }
  }
}
