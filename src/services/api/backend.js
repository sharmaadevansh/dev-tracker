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

export default api
