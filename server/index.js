import 'dotenv/config'
import app from './app.js'
import { connectDB } from './config/db.js'
import { migrateFromLegacyJson } from './config/migrate.js'

const PORT = process.env.PORT || 5000

// Initialize database connection and legacy migration
connectDB().then(async (conn) => {
  if (conn) {
    await migrateFromLegacyJson()
  }
})

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Server] DevTrack backend running at http://localhost:${PORT}`)
})

export default server
