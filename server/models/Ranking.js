import mongoose from 'mongoose'

const rankingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    username: {
      type: String,
      required: true,
      index: true,
    },
    isEligible: {
      type: Boolean,
      default: false,
      index: true,
    },
    university: {
      type: String,
      default: '',
      index: true,
    },
    universityRank: {
      type: Number,
      default: 0,
      index: true,
    },
    // Global Composite Score & Rank
    devScore: {
      type: Number,
      default: 0,
      index: true,
    },
    globalRank: {
      type: Number,
      default: 0,
      index: true,
    },
    totalSolvedAll: {
      type: Number,
      default: 0,
      index: true,
    },

    // Individual Platform Specific Data & Ranks
    leetcode: {
      handle: { type: String, default: '' },
      rating: { type: Number, default: 0 },
      solved: { type: Number, default: 0 },
      easySolved: { type: Number, default: 0 },
      mediumSolved: { type: Number, default: 0 },
      hardSolved: { type: Number, default: 0 },
      score: { type: Number, default: 0, index: true },
      rank: { type: Number, default: 0, index: true },
    },
    codeforces: {
      handle: { type: String, default: '' },
      rating: { type: Number, default: 0 },
      maxRating: { type: Number, default: 0 },
      rankLabel: { type: String, default: 'Unrated' },
      score: { type: Number, default: 0, index: true },
      rank: { type: Number, default: 0, index: true },
    },
    codechef: {
      handle: { type: String, default: '' },
      rating: { type: Number, default: 0 },
      stars: { type: String, default: '0★' },
      division: { type: String, default: '' },
      score: { type: Number, default: 0, index: true },
      rank: { type: Number, default: 0, index: true },
    },
    github: {
      handle: { type: String, default: '' },
      repos: { type: Number, default: 0 },
      stars: { type: Number, default: 0 },
      contributions: { type: Number, default: 0 },
      score: { type: Number, default: 0, index: true },
      rank: { type: Number, default: 0, index: true },
    },
    gfg: {
      handle: { type: String, default: '' },
      codingScore: { type: Number, default: 0 },
      totalSolved: { type: Number, default: 0 },
      score: { type: Number, default: 0, index: true },
      rank: { type: Number, default: 0, index: true },
    },

    lastCalculatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
)

// Compound indexes for deterministic sorting and tie-breaking
rankingSchema.index({ devScore: -1, totalSolvedAll: -1, createdAt: 1 })
rankingSchema.index({ university: 1, devScore: -1, totalSolvedAll: -1, createdAt: 1 })
rankingSchema.index({ 'leetcode.score': -1, 'leetcode.solved': -1, createdAt: 1 })
rankingSchema.index({ 'codeforces.score': -1, 'codeforces.rating': -1, createdAt: 1 })
rankingSchema.index({ 'codechef.score': -1, 'codechef.rating': -1, createdAt: 1 })
rankingSchema.index({ 'github.score': -1, 'github.stars': -1, createdAt: 1 })
rankingSchema.index({ 'gfg.score': -1, 'gfg.totalSolved': -1, createdAt: 1 })

export const Ranking = mongoose.model('Ranking', rankingSchema)
export default Ranking
