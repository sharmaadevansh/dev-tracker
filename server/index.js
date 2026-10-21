import 'dotenv/config'
import app from './app.js'
import { connectDB } from './config/db.js'
import { migrateFromLegacyJson } from './config/migrate.js'
import { seedAdminAccount } from './config/adminSeed.js'

const PORT = process.env.PORT || 5000

// Initialize database connection, legacy migration, and admin seeding
connectDB().then(async (conn) => {
  if (conn) {
    await migrateFromLegacyJson()
    await seedAdminAccount()
  }
})

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Server] DevTrack backend running at http://localhost:${PORT}`)
})

export default server
