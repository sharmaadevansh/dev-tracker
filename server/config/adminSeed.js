import User from '../models/User.js'
import { isDbConnected } from './db.js'

export async function seedAdminAccount() {
  if (!isDbConnected()) return

  try {
    const adminUsername = (process.env.ADMIN_USERNAME || 'admin').trim().toLowerCase()
    const adminPassword = (process.env.ADMIN_PASSWORD || 'admin123456').trim()
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@devtrack.local').trim()

    // Check if the primary configured admin account exists
    let adminUser = await User.findOne({ username: adminUsername })
    if (adminUser) {
      let modified = false
      if (adminUser.role !== 'admin') {
        adminUser.role = 'admin'
        modified = true
      }
      if (!adminUser.isVerified) {
        adminUser.isVerified = true
        modified = true
      }
      if (adminUser.isSuspended) {
        adminUser.isSuspended = false
        modified = true
      }
      if (modified) {
        await adminUser.save()
        console.log(`[AdminSeed] Existing user '${adminUsername}' upgraded to administrator.`)
      } else {
        console.log(`[AdminSeed] Admin account verified in MongoDB: '${adminUsername}'`)
      }
      return adminUser
    }

    // Create the default admin account
    adminUser = await User.create({
      username: adminUsername,
      password: adminPassword,
      email: adminEmail,
      role: 'admin',
      isVerified: true,
      isSuspended: false,
    })
    console.log(`[AdminSeed] Initial admin account created successfully: '${adminUsername}'`)
    return adminUser
  } catch (error) {
    console.error('[AdminSeed] Error while ensuring admin account:', error.message)
    return null
  }
}

export default seedAdminAccount
