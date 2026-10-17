import mongoose from 'mongoose'

const resumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    fileName: {
      type: String,
      required: [true, 'Resume file name is required'],
      trim: true,
    },
    versionLabel: {
      type: String,
      default: '',
      trim: true,
    },
    fileSize: {
      type: String,
      default: '',
    },
    targetRole: {
      type: String,
      default: 'Full Stack Engineer',
      trim: true,
    },
    atsScore: {
      type: Number,
      default: 70,
    },
    matchedKeywords: {
      type: [String],
      default: [],
    },
    missingKeywords: {
      type: [String],
      default: [],
    },
    issues: {
      type: [String],
      default: [],
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
)

resumeSchema.virtual('id').get(function () {
  return this._id.toHexString()
})

resumeSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString()
    delete ret.__v
    return ret
  },
})

export const Resume = mongoose.model('Resume', resumeSchema)
export default Resume
