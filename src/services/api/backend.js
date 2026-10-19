import axios from 'axios'

export const AUTH_TOKEN_KEY = 'devtrack_auth_token'

const api = axios.create({
  baseURL: '/api',
})

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem(AUTH_TOKEN_KEY)
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export async function loginRequest(username, password) {
  const { data } = await api.post('/auth/login', { username, password })
  return data
}

export async function registerRequest(username, password, email = '') {
  const { data } = await api.post('/auth/register', { username, password, email })
  return data
}

export async function fetchCurrentUser() {
  const { data } = await api.get('/auth/me')
  return data
}

export async function updateCredentialsRequest(username, password) {
  const { data } = await api.put('/auth/credentials', { username, password })
  return data
}

export async function fetchHandles() {
  const { data } = await api.get('/handles')
  return data
}

export async function updateHandlesRequest(handles) {
  const { data } = await api.put('/handles', handles)
  return data
}

export async function fetchDashboardSummary() {
  const { data } = await api.get('/dashboard-summary')
  return data
}

export async function fetchCollection(collection) {
  const { data } = await api.get(`/${collection}`)
  return data
}

export async function createCollectionItem(collection, item) {
  const { data } = await api.post(`/${collection}`, item)
  return data
}

export async function updateCollectionItem(collection, id, item) {
  const { data } = await api.put(`/${collection}/${id}`, item)
  return data
}

export async function deleteCollectionItem(collection, id) {
  await api.delete(`/${collection}/${id}`)
}

export async function fetchLearning() {
  const { data } = await api.get('/learning')
  return data
}

export async function saveLearning(topics) {
  const { data } = await api.put('/learning', topics)
  return data
}

export async function fetchLeaderboard(params = {}) {
  const { data } = await api.get('/ranking/leaderboard', { params })
  return data
}

export async function fetchMyRanking() {
  const { data } = await api.get('/ranking/me')
  return data
}

export async function triggerRankingSync() {
  const { data } = await api.post('/ranking/sync')
  return data
}

export async function fetchUniversities() {
  const { data } = await api.get('/ranking/universities')
  return data
}

export async function fetchPublicProfile(username) {
  const { data } = await api.get(`/profile/${encodeURIComponent(username)}`)
  return data
}

export async function fetchAiRoast(username) {
  const { data } = await api.get(`/roast/${encodeURIComponent(username)}`)
  return data
}

export async function fetchAchievements(username = '') {
  const url = username ? `/ranking/achievements/${encodeURIComponent(username)}` : '/ranking/achievements'
  const { data } = await api.get(url)
  return data
}

export async function optimizeResumeBullet({ bullet, role, targetKeywords }) {
  const { data } = await api.post('/ai/optimize-bullet', { bullet, role, targetKeywords })
  return data
}

export async function fetchRecommendedProblems(username = '') {
  const { data } = await api.get('/ai/recommend-problems', {
    params: username ? { username } : {}
  })
  return data
}

export async function fetchCommunityStats() {
  const { data } = await api.get('/community-stats')
  return data
}

export default api



