import axios from 'axios'

// CodeChef has no official public API. Using a community-maintained wrapper.
// If it's ever unavailable, self-host an equivalent scraper and point
// CC_API at your own deployment.
const CC_API = 'https://codechef-api.vercel.app'

export async function fetchCodechefProfile(username) {
  const { data } = await axios.get(`${CC_API}/${username}`)
  return {
    username,
    rating: data.currentRating,
    highestRating: data.highestRating,
    stars: data.stars,
    globalRank: data.globalRank,
    countryRank: data.countryRank,
    countryName: data.countryName,
    heatmap: data.heatMap || [],
  }
}
