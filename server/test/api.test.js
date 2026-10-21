import test from 'node:test'
import assert from 'node:assert/strict'
import axios from 'axios'
import http from 'node:http'
import app from '../app.js'
import { connectDB } from '../config/db.js'
import mongoose from 'mongoose'
import User from '../models/User.js'

let server
const TEST_PORT = 5001
const BASE_URL = `http://localhost:${TEST_PORT}`
let authToken = ''
let testProjectId = ''

const SUITE_USER = `testdev_${Date.now()}`
const SUITE_PASS = 'TestPass123!'

test.before(async () => {
  await connectDB()
  await new Promise((resolve) => {
    server = http.createServer(app).listen(TEST_PORT, () => {
      console.log(`[Test Runner] Test server listening on ${BASE_URL}`)
      resolve()
    })
  })

  // Ensure test account exists for test suite
  try {
    await axios.post(`${BASE_URL}/api/auth/register`, {
      username: SUITE_USER,
      password: SUITE_PASS,
      email: `${SUITE_USER}@example.com`,
    })
  } catch {
    // Ignore if already registered
  }
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
        username: SUITE_USER,
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

test('2b. POST /api/auth/register registers a new unique developer account', async () => {
  const uniqueUser = `reguser_${Date.now()}`
  const res = await axios.post(`${BASE_URL}/api/auth/register`, {
    username: uniqueUser,
    password: 'password123',
    email: `${uniqueUser}@example.com`,
  })
  assert.equal(res.status, 201)
  assert.equal(res.data.ok, true)
  assert.equal(res.data.user.username, uniqueUser)
  assert.ok(res.data.token, 'Should return JWT token for new user')
})

test('3. POST /api/auth/login succeeds with valid credentials and returns JWT', async () => {
  const res = await axios.post(`${BASE_URL}/api/auth/login`, {
    username: SUITE_USER,
    password: SUITE_PASS,
  })
  assert.equal(res.status, 200)
  assert.equal(res.data.ok, true)
  assert.ok(res.data.token, 'Token should be returned')
  assert.equal(res.data.user.username, SUITE_USER)
  authToken = res.data.token
})

test('4. GET /api/auth/me returns authenticated user identity', async () => {
  const res = await axios.get(`${BASE_URL}/api/auth/me`, {
    headers: { Authorization: `Bearer ${authToken}` },
  })
  assert.equal(res.status, 200)
  assert.equal(res.data.username, SUITE_USER)
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

test('10. GET /api/ranking/leaderboard returns candidates ranking list', async () => {
  const res = await axios.get(`${BASE_URL}/api/ranking/leaderboard`)
  assert.equal(res.status, 200)
  assert.ok(Array.isArray(res.data.entries))
})

test('11. GET /api/profile/:username returns public profile data', async () => {
  const res = await axios.get(`${BASE_URL}/api/profile/devansh`)
  assert.equal(res.status, 200)
  assert.equal(res.data.username, 'devansh')
  assert.ok(res.data.ranking)
})

test('12. GET /api/badge/:username returns valid dynamic SVG image card', async () => {
  const res = await axios.get(`${BASE_URL}/api/badge/devansh`)
  assert.equal(res.status, 200)
  assert.match(res.headers['content-type'], /image\/svg\+xml/i)
  assert.match(res.data, /<svg/i)
})

test('13. GET /api/roast/:username generates comedy AI developer roast', async () => {
  const res = await axios.get(`${BASE_URL}/api/roast/devansh`)
  assert.equal(res.status, 200)
  assert.ok(res.data.roast)
  assert.ok(res.data.burnRating)
})

test('14. Security Headers & Rate Limit headers are enforced', async () => {
  const res = await axios.get(`${BASE_URL}/api/health`)
  assert.equal(res.headers['x-content-type-options'], 'nosniff')
  assert.equal(res.headers['x-frame-options'], 'SAMEORIGIN')
  assert.ok(res.headers['x-ratelimit-remaining'] !== undefined)
})

test('15. GET /api/ranking/compare returns head-to-head metrics for 2 developers', async () => {
  const res = await axios.get(`${BASE_URL}/api/ranking/compare?u1=devansh&u2=alex`)
  assert.equal(res.status, 200)
  assert.equal(res.data.developerA.username, 'devansh')
  assert.equal(res.data.developerB.username, 'alex')
  assert.ok(res.data.metrics.devScore)
  assert.ok(res.data.summary.overallLeader)
})

test('16. GET /api/ranking/achievements returns badge milestones and progress', async () => {
  const res = await axios.get(`${BASE_URL}/api/ranking/achievements/devansh`)
  assert.equal(res.status, 200)
  assert.ok(Array.isArray(res.data.achievements))
  assert.ok(res.data.total >= 8)
  assert.ok(res.data.completionPercentage >= 0)
})

test('17. POST /api/ai/optimize-bullet generates 3 ATS-optimized bullet variations', async () => {
  const res = await axios.post(`${BASE_URL}/api/ai/optimize-bullet`, {
    bullet: 'Worked on user authentication using JWT and bcrypt, improving system security.',
    role: 'Senior Backend Engineer',
    targetKeywords: 'JWT, bcrypt, security, microservices'
  })
  assert.equal(res.status, 200)
  assert.ok(res.data.impactScore >= 80)
  assert.equal(res.data.variations.length, 3)
  assert.ok(res.data.variations[0].text.length > 20)
  assert.ok(Array.isArray(res.data.powerVerbs))
})

test('18. GET /api/ai/recommend-problems returns 3 targeted daily problem challenges', async () => {
  const res = await axios.get(`${BASE_URL}/api/ai/recommend-problems?username=devansh`)
  assert.equal(res.status, 200)
  assert.equal(res.data.recommendations.length, 3)
  assert.ok(res.data.focusArea)
  assert.ok(res.data.recommendations[0].url.startsWith('http'))
  assert.ok(res.data.recommendations[0].hint)
})

let adminAuthToken = ''
let testManagedUserId = ''
const ADMIN_TEST_USER = `admin_test_${Date.now()}`
const ADMIN_TEST_PASS = 'AdminPassSecure99!'

test('19. GET /api/admin/stats rejects unauthenticated requests with 401', async () => {
  await assert.rejects(
    async () => {
      await axios.get(`${BASE_URL}/api/admin/stats`)
    },
    (err) => {
      assert.equal(err.response.status, 401)
      return true
    }
  )
})

test('20. Standard user token is rejected from /api/admin/stats with 403 Forbidden', async () => {
  await assert.rejects(
    async () => {
      await axios.get(`${BASE_URL}/api/admin/stats`, {
        headers: { Authorization: `Bearer ${authToken}` },
      })
    },
    (err) => {
      assert.equal(err.response.status, 403)
      assert.ok(err.response.data.error.includes('Administrator privileges required'))
      return true
    }
  )
})

test('21. Admin user can authenticate and obtain admin JWT token', async () => {
  // Create an admin user directly
  const user = await User.create({
    username: ADMIN_TEST_USER,
    password: ADMIN_TEST_PASS,
    email: `${ADMIN_TEST_USER}@admin.devtrack.ai`,
    role: 'admin',
    isVerified: true,
  })
  assert.equal(user.role, 'admin')

  const loginRes = await axios.post(`${BASE_URL}/api/auth/login`, {
    username: ADMIN_TEST_USER,
    password: ADMIN_TEST_PASS,
  })
  assert.equal(loginRes.status, 200)
  assert.equal(loginRes.data.user.role, 'admin')
  assert.equal(loginRes.data.user.isVerified, true)
  assert.ok(loginRes.data.token)
  adminAuthToken = loginRes.data.token
})

test('22. Admin can access /api/admin/stats and /api/admin/users successfully', async () => {
  const statsRes = await axios.get(`${BASE_URL}/api/admin/stats`, {
    headers: { Authorization: `Bearer ${adminAuthToken}` },
  })
  assert.equal(statsRes.status, 200)
  assert.ok(statsRes.data.totalUsers >= 1)
  assert.ok(typeof statsRes.data.verifiedUsers === 'number')

  const usersRes = await axios.get(`${BASE_URL}/api/admin/users`, {
    headers: { Authorization: `Bearer ${adminAuthToken}` },
  })
  assert.equal(usersRes.status, 200)
  assert.ok(Array.isArray(usersRes.data))
  const foundUser = usersRes.data.find((u) => u.username === SUITE_USER)
  assert.ok(foundUser)
  testManagedUserId = foundUser.id || foundUser._id
})

test('23. Admin can toggle user verification badge via PATCH /api/admin/users/:id/verify', async () => {
  assert.ok(testManagedUserId)
  const patchRes = await axios.patch(
    `${BASE_URL}/api/admin/users/${testManagedUserId}/verify`,
    {},
    { headers: { Authorization: `Bearer ${adminAuthToken}` } }
  )
  assert.equal(patchRes.status, 200)
  assert.equal(patchRes.data.isVerified, true)

  // Verify in public profile
  const profileRes = await axios.get(`${BASE_URL}/api/profile/${SUITE_USER}`)
  assert.equal(profileRes.status, 200)
  assert.equal(profileRes.data.isVerified, true)
})

test('24. Admin can toggle user suspension and suspended user is blocked from logging in', async () => {
  assert.ok(testManagedUserId)
  const suspendRes = await axios.patch(
    `${BASE_URL}/api/admin/users/${testManagedUserId}/suspend`,
    {},
    { headers: { Authorization: `Bearer ${adminAuthToken}` } }
  )
  assert.equal(suspendRes.status, 200)
  assert.equal(suspendRes.data.isSuspended, true)

  // Blocked login
  await assert.rejects(
    async () => {
      await axios.post(`${BASE_URL}/api/auth/login`, {
        username: SUITE_USER,
        password: SUITE_PASS,
      })
    },
    (err) => {
      assert.equal(err.response.status, 403)
      assert.ok(err.response.data.error.includes('suspended'))
      return true
    }
  )

  // Reactivate user
  const unsuspendRes = await axios.patch(
    `${BASE_URL}/api/admin/users/${testManagedUserId}/suspend`,
    {},
    { headers: { Authorization: `Bearer ${adminAuthToken}` } }
  )
  assert.equal(unsuspendRes.status, 200)
  assert.equal(unsuspendRes.data.isSuspended, false)
})


