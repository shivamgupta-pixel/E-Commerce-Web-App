/**
 * Error Handler Utility Module
 * 
 * Provides centralized error handling and custom error classes for
 * consistent error responses throughout the application.
 * 
 * @module utils/errorHandler
 */

/**
 * Custom API Error class
 * 
 * Extends Error to provide HTTP status codes and consistent formatting
 * for API responses.
 * 
 * @class ApiError
 * @extends Error
 */
class ApiError extends Error {
  /**
   * Creates a new ApiError instance
   * 
   * @param {number} statusCode - HTTP status code
   * @param {string} message - Error message
   * @param {Array<string>} [details] - Additional error details
   */
  constructor(statusCode, message, details = []) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }

  /**
   * Converts error to JSON response format
   * 
   * @returns {Object} Formatted error object
   */
  toJSON() {
    return {
      success: false,
      error: {
        message: this.message,
        statusCode: this.statusCode,
        details: this.details,
        timestamp: this.timestamp
      }
    };
  }
}

/**
 * Validation Error class
 * 
 * Used specifically for input validation errors with field information.
 * 
 * @class ValidationError
 * @extends ApiError
 */
class ValidationError extends ApiError {
  /**
   * Creates a new ValidationError instance
   * 
   * @param {Array<Object>} errors - Array of field validation errors
   * @example
   * [{ field: 'email', message: 'Invalid email format' }]
   */
  constructor(errors) {
    super(400, 'Validation failed');
    this.name = 'ValidationError';
    this.errors = errors;
  }

  toJSON() {
    return {
      success: false,
      error: {
        message: this.message,
        statusCode: this.statusCode,
        errors: this.errors,
        timestamp: this.timestamp
      }
    };
  }
}

/**
 * Database Error class
 * 
 * Used for database operation failures.
 * 
 * @class DatabaseError
 * @extends ApiError
 */
class DatabaseError extends ApiError {
  /**
   * Creates a new DatabaseError instance
   * 
   * @param {string} message - Error message
   * @param {string} [operation] - Database operation that failed
   */
  constructor(message, operation = null) {
    super(500, message || 'Database operation failed');
    this.name = 'DatabaseError';
    this.operation = operation;
  }
}

/**
 * Centralized error handler middleware
 * 
 * Processes errors and sends appropriate HTTP responses.
 * Handles different error types with appropriate status codes.
 * Logs errors for debugging purposes.
 * 
 * @param {Object} res - Express response object
 * @param {Error} error - Error object to handle
 * @param {string} [defaultMessage] - Default message if error is generic
 * @returns {void} Sends error response
 * @example
 * try {
 *   // operation
 * } catch (error) {
 *   handleError(res, error, 'Operation failed');
 * }
 */
function handleError(res, error, defaultMessage = 'An error occurred') {
  // Log error for debugging
  console.error('[ERROR]', {
    name: error.name,
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString()
  });

  // Handle custom API errors
  if (error instanceof ApiError) {
    return res.status(error.statusCode).json(error.toJSON());
  }

  // Handle validation errors
  if (error instanceof ValidationError) {
    return res.status(error.statusCode).json(error.toJSON());
  }

  // Handle database errors
  if (error instanceof DatabaseError) {
    return res.status(error.statusCode).json(error.toJSON());
  }

  // Handle generic errors
  const statusCode = error.statusCode || 500;
  const message = error.message || defaultMessage;

  res.status(statusCode).json({
    success: false,
    error: {
      message: message,
      statusCode: statusCode,
      timestamp: new Date().toISOString()
    }
  });
}

/**
 * Async error wrapper for Express routes
 * 
 * Wraps async route handlers to catch and forward errors
 * to the error handling middleware.
 * 
 * @param {Function} fn - Async route handler
 * @returns {Function} Wrapped function
 * @example
 * app.get('/api/users', asyncHandler(async (req, res) => {
 *   const users = await User.findAll();
 *   res.json(users);
 * }));
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Validates request data
 * 
 * Checks required fields and returns validation errors.
 * 
 * @param {Object} data - Data object to validate
 * @param {Array<string>} requiredFields - Required field names
 * @throws {ValidationError} If validation fails
 * @example
 * validateRequest(body, ['email', 'password']);
 */
function validateRequest(data, requiredFields) {
  const errors = [];

  requiredFields.forEach(field => {
    if (!data[field]) {
      errors.push({
        field: field,
        message: `${field} is required`
      });
    }
  });

  if (errors.length > 0) {
    throw new ValidationError(errors);
  }
}

/**
 * Safe JSON parse with error handling
 * 
 * Attempts to parse JSON and returns null on failure
 * instead of throwing an error.
 * 
 * @param {string} jsonString - JSON string to parse
 * @returns {Object|null} Parsed object or null if parsing fails
 * @example
 * const data = safeJsonParse(jsonString);
 * if (data === null) {
 *   console.log('Invalid JSON');
 * }
 */
function safeJsonParse(jsonString) {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('JSON parse error:', error.message);
    return null;
  }
}

module.exports = {
  ApiError,
  ValidationError,
  DatabaseError,
  handleError,
  asyncHandler,
  validateRequest,
  safeJsonParse
};
