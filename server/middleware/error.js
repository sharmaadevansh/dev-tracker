export function errorHandler(err, req, res, _next) {
  console.error('[Error Pipeline]', err.name || 'Error', ':', err.message)

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message)
    return res.status(400).json({ error: messages.join(', ') })
  }

  // Mongoose bad ObjectId / CastError
  if (err.name === 'CastError') {
    return res.status(400).json({ error: `Resource not found with id ${err.value}` })
  }

  // Mongoose duplicate key error (code 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field'
    return res.status(409).json({ error: `A record with that ${field} already exists.` })
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Invalid authentication token.' })
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Authentication token has expired.' })
  }

  const isProduction = process.env.NODE_ENV === 'production'
  const statusCode = err.status || 500

  res.status(statusCode).json({
    error: isProduction && statusCode === 500 
      ? 'An unexpected server error occurred. Please try again later.' 
      : (err.message || 'Unexpected server error.'),
  })
}

export default errorHandler
