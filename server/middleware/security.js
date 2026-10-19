// Production Security Middleware for DevTrack.AI
// Provides security headers, in-memory rate limiting, and NoSQL injection sanitization

// 1. Security Headers Middleware
export function securityHeaders(req, res, next) {
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff')
  
  // Prevent clickjacking via iframes
  res.setHeader('X-Frame-Options', 'SAMEORIGIN')
  
  // Cross-site scripting filter
  res.setHeader('X-XSS-Protection', '1; mode=block')
  
  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  // Feature/Permissions Policy
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

  // Remove Express fingerprinting
  res.removeHeader('X-Powered-By')

  // Enforce HTTPS HSTS in production
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  }

  next()
}

// 2. High-performance In-Memory Sliding Window Rate Limiter
function createRateLimiter({ windowMs = 15 * 60 * 1000, max = 100, message = 'Too many requests, please try again later.' }) {
  const requests = new Map()

  // Sweep stale entries periodically to prevent memory leak
  setInterval(() => {
    const now = Date.now()
    for (const [ip, timestamps] of requests.entries()) {
      const valid = timestamps.filter((t) => now - t < windowMs)
      if (valid.length === 0) {
        requests.delete(ip)
      } else {
        requests.set(ip, valid)
      }
    }
  }, windowMs).unref?.() // Do not block Node event loop from exiting

  return function rateLimiterMiddleware(req, res, next) {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown-ip'
    const now = Date.now()
    const clientTimestamps = requests.get(ip) || []

    // Filter timestamps within current window
    const recent = clientTimestamps.filter((t) => now - t < windowMs)

    if (recent.length >= max) {
      res.setHeader('Retry-After', Math.ceil(windowMs / 1000))
      return res.status(429).json({
        error: message,
        retryAfterSeconds: Math.ceil(windowMs / 1000),
      })
    }

    recent.push(now)
    requests.set(ip, recent)

    res.setHeader('X-RateLimit-Limit', max)
    res.setHeader('X-RateLimit-Remaining', Math.max(0, max - recent.length))
    res.setHeader('X-RateLimit-Reset', Math.ceil((now + windowMs) / 1000))

    next()
  }
}

// Rate Limiter Presets
export const apiLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // 300 requests per 15 min
  message: 'API rate limit exceeded. Please slow down your requests.',
})

export const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 login/register attempts per 15 min
  message: 'Too many authentication attempts. Please try again after 15 minutes.',
})

export const viralLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 60, // 60 roast/profile queries per 10 min
  message: 'Viral engine rate limit exceeded. Please try again shortly.',
})

// 3. NoSQL Injection & MongoDB Operator Sanitizer (Mutating in-place for Express 5 compatibility)
function sanitizeInPlace(obj) {
  if (!obj || typeof obj !== 'object') return
  if (Array.isArray(obj)) {
    obj.forEach((item) => {
      if (item && typeof item === 'object') sanitizeInPlace(item)
    })
    return
  }

  for (const key of Object.keys(obj)) {
    if (key.startsWith('$') || key.includes('.')) {
      delete obj[key]
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      sanitizeInPlace(obj[key])
    }
  }
}

export function sanitizeInput(req, res, next) {
  try {
    if (req.body && typeof req.body === 'object') {
      sanitizeInPlace(req.body)
    }
    if (req.query && typeof req.query === 'object') {
      sanitizeInPlace(req.query)
    }
    if (req.params && typeof req.params === 'object') {
      sanitizeInPlace(req.params)
    }
  } catch (err) {
    console.warn('[Sanitize Pipeline Warning]:', err.message)
  }
  next()
}

