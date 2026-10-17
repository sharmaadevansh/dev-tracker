import mongoose from 'mongoose'

const subtopicSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    completed: { type: Boolean, default: false },
  },
  { _id: false }
)

const learningTopicSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    topicId: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    notes: {
      type: String,
      default: '',
    },
    targetDate: {
      type: String,
      default: '',
    },
    subtopics: {
      type: [subtopicSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
)

learningTopicSchema.virtual('id').get(function () {
  return this.topicId || this._id.toHexString()
})

learningTopicSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret.topicId || ret._id.toString()
    delete ret.__v
    return ret
  },
})

export const LearningTopic = mongoose.model('LearningTopic', learningTopicSchema)
export default LearningTopic
