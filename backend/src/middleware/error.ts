import { Request, Response, NextFunction } from 'express'
import { AppError } from '../types/api'

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500
  let message = 'Internal server error'

  // Handle known errors
  if (err instanceof AppError) {
    statusCode = err.statusCode
    message = err.message
  } else if (err.name === 'ValidationError') {
    statusCode = 400
    message = err.message
  } else if (err.name === 'CastError') {
    statusCode = 400
    message = 'Invalid ID format'
  }

  // Log error for debugging
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  })

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      details: err.message 
    })
  })
}

export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new AppError(404, `Route ${req.originalUrl} not found`)
  next(error)
}