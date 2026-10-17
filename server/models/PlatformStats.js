import mongoose from 'mongoose'

const platformStatsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    platform: {
      type: String,
      required: true,
      enum: ['github', 'leetcode', 'codeforces', 'codechef', 'gfg'],
      index: true,
    },
    handle: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    stats: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    history: [
      {
        timestamp: { type: Date, default: Date.now },
        metric: { type: String },
        value: { type: Number },
      },
    ],
    lastSyncedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
)

platformStatsSchema.index({ platform: 1, handle: 1 }, { unique: true })

export const PlatformStats = mongoose.model('PlatformStats', platformStatsSchema)
export default PlatformStats
