import mongoose from 'mongoose'

let isConnected = false

export async function connectDB() {
  if (isConnected) return mongoose.connection

  const uri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/devtrack'

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    })

    isConnected = true
    console.log(`[Database] MongoDB connected successfully to ${conn.connection.host}/${conn.connection.name}`)

    mongoose.connection.on('error', (err) => {
      console.error('[Database] Connection error:', err.message)
    })

    mongoose.connection.on('disconnected', () => {
      console.warn('[Database] MongoDB disconnected. Attempting reconnection...')
      isConnected = false
    })

    return conn.connection
  } catch (error) {
    console.error(`[Database] Initial MongoDB connection failed: ${error.message}`)
    console.warn('[Database] DevTracker will operate in resilient hybrid mode.')
    return null
  }
}

export function isDbConnected() {
  return isConnected && mongoose.connection.readyState === 1
}

export default connectDB
