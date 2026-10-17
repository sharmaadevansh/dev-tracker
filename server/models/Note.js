import mongoose from 'mongoose'

const noteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Note title is required'],
      trim: true,
    },
    content: {
      type: String,
      default: '',
    },
    folder: {
      type: String,
      default: 'General',
      trim: true,
    },
    tags: {
      type: String,
      default: '',
      trim: true,
    },
    pinned: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
)

noteSchema.virtual('id').get(function () {
  return this._id.toHexString()
})

noteSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString()
    delete ret.__v
    return ret
  },
})

export const Note = mongoose.model('Note', noteSchema)
export default Note
