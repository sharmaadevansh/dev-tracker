import test from 'node:test'
import assert from 'node:assert/strict'
import axios from 'axios'
import http from 'node:http'
import app from '../app.js'
import { connectDB } from '../config/db.js'
import mongoose from 'mongoose'

let server
const TEST_PORT = 5001
const BASE_URL = `http://localhost:${TEST_PORT}`
let authToken = ''
let testProjectId = ''

test.before(async () => {
  await connectDB()
  await new Promise((resolve) => {
    server = http.createServer(app).listen(TEST_PORT, () => {
      console.log(`[Test Runner] Test server listening on ${BASE_URL}`)
      resolve()
    })
  })
})

test.after(async () => {
  await new Promise((resolve) => server.close(resolve))
  await mongoose.disconnect()
})

test('1. GET /api/health returns service ok and environment status', async () => {
  const res = await axios.get(`${BASE_URL}/api/health`)
  assert.equal(res.status, 200)
  assert.equal(res.data.ok, true)
  assert.equal(res.data.service, 'devtrack-backend')
})

test('2. POST /api/auth/login rejects invalid credentials with 401', async () => {
  await assert.rejects(
    async () => {
      await axios.post(`${BASE_URL}/api/auth/login`, {
        username: 'devansh',
        password: 'wrongpassword123',
      })
    },
    (err) => {
      assert.equal(err.response.status, 401)
      assert.match(err.response.data.error, /invalid username or password/i)
      return true
    }
  )
})

test('3. POST /api/auth/login succeeds with valid credentials and returns JWT', async () => {
  const res = await axios.post(`${BASE_URL}/api/auth/login`, {
    username: 'devansh',
    password: 'devtrack2026',
  })
  assert.equal(res.status, 200)
  assert.equal(res.data.ok, true)
  assert.ok(res.data.token, 'Token should be returned')
  assert.equal(res.data.user.username, 'devansh')
  authToken = res.data.token
})

test('4. GET /api/auth/me returns authenticated user identity', async () => {
  const res = await axios.get(`${BASE_URL}/api/auth/me`, {
    headers: { Authorization: `Bearer ${authToken}` },
  })
  assert.equal(res.status, 200)
  assert.equal(res.data.username, 'devansh')
})

test('5. GET /api/handles returns platform handles and active flags', async () => {
  const res = await axios.get(`${BASE_URL}/api/handles`, {
    headers: { Authorization: `Bearer ${authToken}` },
  })
  assert.equal(res.status, 200)
  assert.ok(res.data.handles)
  assert.ok(res.data.activePlatforms)
})

test('6. POST /api/projects creates a new project record', async () => {
  const res = await axios.post(
    `${BASE_URL}/api/projects`,
    {
      name: 'Automated Test Suite Project',
      description: 'End-to-end integration test validation',
      status: 'In Progress',
      priority: 'High',
      techStack: 'Node.js, Express, MongoDB, React',
    },
    { headers: { Authorization: `Bearer ${authToken}` } }
  )
  assert.equal(res.status, 201)
  assert.ok(res.data.id)
  assert.equal(res.data.name, 'Automated Test Suite Project')
  testProjectId = res.data.id
})

test('7. PUT /api/projects/:id updates the existing project record', async () => {
  assert.ok(testProjectId, 'testProjectId must exist')
  const res = await axios.put(
    `${BASE_URL}/api/projects/${testProjectId}`,
    { status: 'Completed' },
    { headers: { Authorization: `Bearer ${authToken}` } }
  )
  assert.equal(res.status, 200)
  assert.equal(res.data.status, 'Completed')
})

test('8. DELETE /api/projects/:id deletes the created project', async () => {
  assert.ok(testProjectId, 'testProjectId must exist')
  const res = await axios.delete(`${BASE_URL}/api/projects/${testProjectId}`, {
    headers: { Authorization: `Bearer ${authToken}` },
  })
  assert.equal(res.status, 204)
})

test('9. GET /api/dashboard-summary aggregates metrics correctly', async () => {
  const res = await axios.get(`${BASE_URL}/api/dashboard-summary`, {
    headers: { Authorization: `Bearer ${authToken}` },
  })
  assert.equal(res.status, 200)
  assert.ok('projects' in res.data)
  assert.ok('goals' in res.data)
  assert.ok('notes' in res.data)
  assert.ok('resumes' in res.data)
  assert.ok('learning' in res.data)
})
