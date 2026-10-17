import User from '../models/User.js'
import { isDbConnected } from '../config/db.js'

const DEFAULT_HANDLES = {
  github: '',
  leetcode: '',
  codeforces: '',
  codechef: '',
  gfg: '',
  linkedin: '',
}

const DEFAULT_ACTIVE_PLATFORMS = {
  github: true,
  leetcode: true,
  codeforces: true,
  codechef: true,
  gfg: false,
  linkedin: false,
}

export async function getHandles(req, res, next) {
  try {
    if (isDbConnected() && req.user._id) {
      const user = await User.findById(req.user._id)
      if (user) {
        return res.json({
          ...DEFAULT_HANDLES,
          ...(user.handles?.toObject?.() || user.handles || {}),
          handles: { ...DEFAULT_HANDLES, ...(user.handles?.toObject?.() || user.handles || {}) },
          activePlatforms: { ...DEFAULT_ACTIVE_PLATFORMS, ...(user.activePlatforms?.toObject?.() || user.activePlatforms || {}) },
        })
      }
    }

    res.json({
      ...DEFAULT_HANDLES,
      handles: DEFAULT_HANDLES,
      activePlatforms: DEFAULT_ACTIVE_PLATFORMS,
    })
  } catch (err) {
    next(err)
  }
}

export async function updateHandles(req, res, next) {
  try {
    const payload = req.body || {}
    let handlesToUpdate = {}
    let platformsToUpdate = {}

    if (payload.handles && typeof payload.handles === 'object') {
      handlesToUpdate = payload.handles
    } else {
      const { activePlatforms, ...rest } = payload
      handlesToUpdate = rest
    }

    if (payload.activePlatforms && typeof payload.activePlatforms === 'object') {
      platformsToUpdate = payload.activePlatforms
    }

    if (isDbConnected() && req.user._id) {
      const user = await User.findById(req.user._id)
      if (user) {
        user.handles = {
          ...DEFAULT_HANDLES,
          ...(user.handles?.toObject?.() || user.handles || {}),
          ...handlesToUpdate,
        }
        if (Object.keys(platformsToUpdate).length > 0) {
          user.activePlatforms = {
            ...DEFAULT_ACTIVE_PLATFORMS,
            ...(user.activePlatforms?.toObject?.() || user.activePlatforms || {}),
            ...platformsToUpdate,
          }
        }
        await user.save()

        return res.json({
          ...user.handles.toObject(),
          handles: user.handles.toObject(),
          activePlatforms: user.activePlatforms.toObject(),
        })
      }
    }

    res.json({
      ...DEFAULT_HANDLES,
      ...handlesToUpdate,
      handles: { ...DEFAULT_HANDLES, ...handlesToUpdate },
      activePlatforms: { ...DEFAULT_ACTIVE_PLATFORMS, ...platformsToUpdate },
    })
  } catch (err) {
    next(err)
  }
}
