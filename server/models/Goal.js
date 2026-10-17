import mongoose from 'mongoose'

const goalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    text: {
      type: String,
      required: [true, 'Goal text is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['Coding', 'Projects', 'Revision', 'Other'],
      default: 'Coding',
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
)

goalSchema.virtual('id').get(function () {
  return this._id.toHexString()
})

goalSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString()
    delete ret.__v
    return ret
  },
})

export const Goal = mongoose.model('Goal', goalSchema)
export default Goal
