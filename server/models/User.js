import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: [3, 'Username must be at least 3 characters'],
      index: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
    },
    university: {
      type: String,
      trim: true,
      default: '',
      index: true,
    },
    handles: {
      github: { type: String, default: '', trim: true },
      leetcode: { type: String, default: '', trim: true },
      codeforces: { type: String, default: '', trim: true },
      codechef: { type: String, default: '', trim: true },
      gfg: { type: String, default: '', trim: true },
      linkedin: { type: String, default: '', trim: true },
    },
    activePlatforms: {
      github: { type: Boolean, default: true },
      leetcode: { type: Boolean, default: true },
      codeforces: { type: Boolean, default: true },
      codechef: { type: Boolean, default: true },
      gfg: { type: Boolean, default: false },
      linkedin: { type: Boolean, default: false },
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isSuspended: {
      type: Boolean,
      default: false,
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
)

// Pre-save hook to hash password with bcrypt
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  try {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (err) {
    next(err)
  }
})

// Instance method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}

// Transform output to hide password
userSchema.methods.toJSON = function () {
  const obj = this.toObject()
  delete obj.password
  return obj
}

export const User = mongoose.model('User', userSchema)
export default User
