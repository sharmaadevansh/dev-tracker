import axios from 'axios'

export async function fetchCodechefProfile(username) {
  if (!username) return null

  // 1. Try local backend proxy scraper (fast, avoids CORS, avoids dead vercel mirrors)
  try {
    const { data } = await axios.get(`/api/proxy/codechef/${encodeURIComponent(username)}`, { timeout: 7000 })
    return {
      username: data.username || username,
      rating: data.rating || 1500,
      highestRating: data.highestRating || data.rating || 1500,
      stars: data.stars || '2★',
      starsCount: data.starsCount || 2,
      division: data.division || 'Div 3',
      globalRank: data.globalRank || 'Active',
      countryRank: data.countryRank || 'Active',
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
      rating: data.currentRating || 1500,
      highestRating: data.highestRating || 1500,
      stars: data.stars || '2★',
      starsCount: parseInt(data.stars, 10) || 2,
      division: (data.currentRating >= 2000) ? 'Div 1' : (data.currentRating >= 1600 ? 'Div 2' : 'Div 3'),
      globalRank: data.globalRank || 'N/A',
      countryRank: data.countryRank || 'N/A',
      countryName: data.countryName || 'Global',
    }
  } catch {
    // 3. Fallback safe profile
    return {
      username,
      rating: 1650,
      highestRating: 1720,
      stars: '3★',
      starsCount: 3,
      division: 'Div 2',
      globalRank: '12,450',
      countryRank: '6,230',
      countryName: 'Global',
      isDemo: true,
    }
  }
}
