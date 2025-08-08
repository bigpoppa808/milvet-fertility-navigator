// Comprehensive error handling utilities for military-grade applications

export interface AppError {
  code: string
  message: string
  details?: any
  timestamp: Date
  userId?: string
  action?: string
  recoverable: boolean
}

export class ApplicationError extends Error {
  public readonly code: string
  public readonly details?: any
  public readonly timestamp: Date
  public readonly userId?: string
  public readonly action?: string
  public readonly recoverable: boolean

  constructor(
    message: string,
    code: string,
    options: {
      details?: any
      userId?: string
      action?: string
      recoverable?: boolean
    } = {}
  ) {
    super(message)
    this.name = 'ApplicationError'
    this.code = code
    this.details = options.details
    this.timestamp = new Date()
    this.userId = options.userId
    this.action = options.action
    this.recoverable = options.recoverable ?? true

    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApplicationError)
    }
  }

  toJSON(): AppError {
    return {
      code: this.code,
      message: this.message,
      details: this.details,
      timestamp: this.timestamp,
      userId: this.userId,
      action: this.action,
      recoverable: this.recoverable
    }
  }
}

// Error codes for different types of errors
export const ERROR_CODES = {
  // Authentication & Authorization
  AUTH_REQUIRED: 'AUTH_REQUIRED',
  AUTH_INVALID: 'AUTH_INVALID',
  AUTH_EXPIRED: 'AUTH_EXPIRED',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  
  // Network & Connectivity
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  OFFLINE_ERROR: 'OFFLINE_ERROR',
  RATE_LIMITED: 'RATE_LIMITED',
  
  // Data & Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  DATA_NOT_FOUND: 'DATA_NOT_FOUND',
  DATA_CONFLICT: 'DATA_CONFLICT',
  INVALID_FORMAT: 'INVALID_FORMAT',
  
  // Server & Database
  SERVER_ERROR: 'SERVER_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  
  // Client & Application
  CLIENT_ERROR: 'CLIENT_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  FEATURE_UNAVAILABLE: 'FEATURE_UNAVAILABLE'
} as const

// User-friendly error messages
export const ERROR_MESSAGES = {
  [ERROR_CODES.AUTH_REQUIRED]: 'Please log in to continue.',
  [ERROR_CODES.AUTH_INVALID]: 'Your login credentials are invalid. Please try again.',
  [ERROR_CODES.AUTH_EXPIRED]: 'Your session has expired. Please log in again.',
  [ERROR_CODES.INSUFFICIENT_PERMISSIONS]: 'You don\'t have permission to perform this action.',
  
  [ERROR_CODES.NETWORK_ERROR]: 'Network connection failed. Please check your internet connection.',
  [ERROR_CODES.TIMEOUT_ERROR]: 'The request took too long to complete. Please try again.',
  [ERROR_CODES.OFFLINE_ERROR]: 'You\'re currently offline. Some features may not be available.',
  [ERROR_CODES.RATE_LIMITED]: 'Too many requests. Please wait a moment before trying again.',
  
  [ERROR_CODES.VALIDATION_ERROR]: 'Please check your input and try again.',
  [ERROR_CODES.DATA_NOT_FOUND]: 'The requested information could not be found.',
  [ERROR_CODES.DATA_CONFLICT]: 'This data conflicts with existing information.',
  [ERROR_CODES.INVALID_FORMAT]: 'The data format is invalid.',
  
  [ERROR_CODES.SERVER_ERROR]: 'A server error occurred. Please try again later.',
  [ERROR_CODES.DATABASE_ERROR]: 'A database error occurred. Please try again later.',
  [ERROR_CODES.SERVICE_UNAVAILABLE]: 'The service is temporarily unavailable.',
  
  [ERROR_CODES.CLIENT_ERROR]: 'An application error occurred.',
  [ERROR_CODES.UNKNOWN_ERROR]: 'An unexpected error occurred.',
  [ERROR_CODES.FEATURE_UNAVAILABLE]: 'This feature is currently unavailable.'
} as const

// Classify errors based on their type and status
export function classifyError(error: any): ApplicationError {
  // Handle ApplicationError instances
  if (error instanceof ApplicationError) {
    return error
  }

  // Handle network errors
  if (error.name === 'NetworkError' || error.code === 'NETWORK_ERROR') {
    return new ApplicationError(
      ERROR_MESSAGES[ERROR_CODES.NETWORK_ERROR],
      ERROR_CODES.NETWORK_ERROR,
      { details: error, recoverable: true }
    )
  }

  // Handle timeout errors
  if (error.name === 'TimeoutError' || error.code === 'TIMEOUT') {
    return new ApplicationError(
      ERROR_MESSAGES[ERROR_CODES.TIMEOUT_ERROR],
      ERROR_CODES.TIMEOUT_ERROR,
      { details: error, recoverable: true }
    )
  }

  // Handle Supabase errors
  if (error.message && typeof error.message === 'string') {
    // Authentication errors
    if (error.message.includes('Invalid login credentials')) {
      return new ApplicationError(
        ERROR_MESSAGES[ERROR_CODES.AUTH_INVALID],
        ERROR_CODES.AUTH_INVALID,
        { details: error, recoverable: true }
      )
    }

    if (error.message.includes('JWT expired') || error.message.includes('session_timeout')) {
      return new ApplicationError(
        ERROR_MESSAGES[ERROR_CODES.AUTH_EXPIRED],
        ERROR_CODES.AUTH_EXPIRED,
        { details: error, recoverable: true }
      )
    }

    // Permission errors
    if (error.message.includes('insufficient_privilege') || error.message.includes('permission')) {
      return new ApplicationError(
        ERROR_MESSAGES[ERROR_CODES.INSUFFICIENT_PERMISSIONS],
        ERROR_CODES.INSUFFICIENT_PERMISSIONS,
        { details: error, recoverable: false }
      )
    }

    // Row Level Security violations
    if (error.message.includes('row-level security')) {
      return new ApplicationError(
        ERROR_MESSAGES[ERROR_CODES.INSUFFICIENT_PERMISSIONS],
        ERROR_CODES.INSUFFICIENT_PERMISSIONS,
        { details: error, recoverable: false }
      )
    }
  }

  // Handle HTTP status codes
  if (typeof error.status === 'number') {
    if (error.status >= 400 && error.status < 500) {
      // Client errors
      if (error.status === 401) {
        return new ApplicationError(
          ERROR_MESSAGES[ERROR_CODES.AUTH_REQUIRED],
          ERROR_CODES.AUTH_REQUIRED,
          { details: error, recoverable: true }
        )
      }

      if (error.status === 403) {
        return new ApplicationError(
          ERROR_MESSAGES[ERROR_CODES.INSUFFICIENT_PERMISSIONS],
          ERROR_CODES.INSUFFICIENT_PERMISSIONS,
          { details: error, recoverable: false }
        )
      }

      if (error.status === 404) {
        return new ApplicationError(
          ERROR_MESSAGES[ERROR_CODES.DATA_NOT_FOUND],
          ERROR_CODES.DATA_NOT_FOUND,
          { details: error, recoverable: false }
        )
      }

      if (error.status === 409) {
        return new ApplicationError(
          ERROR_MESSAGES[ERROR_CODES.DATA_CONFLICT],
          ERROR_CODES.DATA_CONFLICT,
          { details: error, recoverable: true }
        )
      }

      if (error.status === 422) {
        return new ApplicationError(
          ERROR_MESSAGES[ERROR_CODES.VALIDATION_ERROR],
          ERROR_CODES.VALIDATION_ERROR,
          { details: error, recoverable: true }
        )
      }

      if (error.status === 429) {
        return new ApplicationError(
          ERROR_MESSAGES[ERROR_CODES.RATE_LIMITED],
          ERROR_CODES.RATE_LIMITED,
          { details: error, recoverable: true }
        )
      }

      return new ApplicationError(
        ERROR_MESSAGES[ERROR_CODES.CLIENT_ERROR],
        ERROR_CODES.CLIENT_ERROR,
        { details: error, recoverable: true }
      )
    }

    if (error.status >= 500) {
      // Server errors
      if (error.status === 503) {
        return new ApplicationError(
          ERROR_MESSAGES[ERROR_CODES.SERVICE_UNAVAILABLE],
          ERROR_CODES.SERVICE_UNAVAILABLE,
          { details: error, recoverable: true }
        )
      }

      return new ApplicationError(
        ERROR_MESSAGES[ERROR_CODES.SERVER_ERROR],
        ERROR_CODES.SERVER_ERROR,
        { details: error, recoverable: true }
      )
    }
  }

  // Default to unknown error
  return new ApplicationError(
    ERROR_MESSAGES[ERROR_CODES.UNKNOWN_ERROR],
    ERROR_CODES.UNKNOWN_ERROR,
    { details: error, recoverable: true }
  )
}

// Log errors with appropriate level and context
export function logError(error: ApplicationError, context?: any) {
  const logData = {
    ...error.toJSON(),
    context,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    url: typeof window !== 'undefined' ? window.location.href : undefined
  }

  // In development, always log to console
  if (process.env.NODE_ENV === 'development') {
    console.error('Application Error:', logData)
    return
  }

  // In production, you would send this to your logging service
  // For now, we'll still log to console but you can replace this
  // with your preferred logging solution (e.g., Sentry, LogRocket, etc.)
  console.error('Application Error:', logData)

  // Example: Send to error reporting service
  // if (window.errorReporting) {
  //   window.errorReporting.captureError(error, { extra: logData })
  // }
}

// Handle errors with user notification
export function handleError(error: any, options?: {
  showToast?: boolean
  fallback?: () => void
  context?: any
}) {
  const appError = classifyError(error)
  
  // Log the error
  logError(appError, options?.context)

  // Show user notification if requested
  if (options?.showToast) {
    // You can replace this with your preferred toast/notification system
    if (typeof window !== 'undefined' && 'toast' in window) {
      // Assuming you have a global toast function
      ;(window as any).toast.error(appError.message)
    } else {
      // Fallback to console for now
      console.warn('Toast notification requested but not available:', appError.message)
    }
  }

  // Execute fallback if provided
  if (options?.fallback) {
    try {
      options.fallback()
    } catch (fallbackError) {
      console.error('Error in fallback function:', fallbackError)
    }
  }

  return appError
}

// Retry function with exponential backoff
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number
    baseDelay?: number
    maxDelay?: number
    backoffFactor?: number
    shouldRetry?: (error: any) => boolean
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 30000,
    backoffFactor = 2,
    shouldRetry = (error) => {
      const appError = classifyError(error)
      return appError.recoverable && ![
        ERROR_CODES.AUTH_INVALID,
        ERROR_CODES.INSUFFICIENT_PERMISSIONS,
        ERROR_CODES.DATA_NOT_FOUND
      ].includes(appError.code as any)
    }
  } = options

  let lastError: any

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error

      // Don't retry on the last attempt or if error is not retryable
      if (attempt === maxRetries || !shouldRetry(error)) {
        throw error
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        baseDelay * Math.pow(backoffFactor, attempt),
        maxDelay
      )

      // Add jitter to prevent thundering herd
      const jitter = delay * 0.1 * Math.random()
      const totalDelay = delay + jitter

      console.log(`Retry attempt ${attempt + 1}/${maxRetries} after ${totalDelay}ms`)
      
      await new Promise(resolve => setTimeout(resolve, totalDelay))
    }
  }

  throw lastError
}