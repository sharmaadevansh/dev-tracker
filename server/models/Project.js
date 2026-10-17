import mongoose from 'mongoose'

const projectSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      enum: ['Planned', 'In Progress', 'Completed', 'On Hold'],
      default: 'Planned',
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium',
    },
    techStack: {
      type: String,
      default: '',
      trim: true,
    },
    githubLink: {
      type: String,
      default: '',
      trim: true,
    },
    liveLink: {
      type: String,
      default: '',
      trim: true,
    },
    startDate: {
      type: String,
      default: '',
    },
    deadline: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
)

projectSchema.virtual('id').get(function () {
  return this._id.toHexString()
})

projectSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString()
    delete ret.__v
    return ret
  },
})

export const Project = mongoose.model('Project', projectSchema)
export default Project
