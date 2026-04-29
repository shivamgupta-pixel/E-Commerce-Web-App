/**
 * Authentication Middleware
 * 
 * Handles JWT verification and user authentication for protected routes
 */

const { ApiError } = require('./errorHandler');
const logger = require('./logger');

/**
 * Simulated token store (in production, use JWT verification)
 * Maps token to user data
 */
const tokenStore = new Map();

/**
 * Middleware to verify authentication token
 * 
 * Checks for valid bearer token in Authorization header
 * Attaches user info to request if valid
 * 
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Next middleware
 * @returns {void}
 * @example
 * app.get('/api/protected', authenticateToken, (req, res) => {
 *   // req.user contains authenticated user info
 * });
 */
function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      throw new ApiError(401, 'Access token required');
    }

    // Verify token (simplified - use JWT in production)
    if (!tokenStore.has(token)) {
      throw new ApiError(401, 'Invalid or expired token');
    }

    const user = tokenStore.get(token);
    req.user = user;
    
    logger.info(`User authenticated: ${user.id}`);
    next();
  } catch (error) {
    logger.warn(`Authentication failed: ${error.message}`);
    res.status(error.statusCode || 401).json(error.toJSON?.() || {
      success: false,
      error: { message: error.message }
    });
  }
}

/**
 * Middleware to verify user role/permissions
 * 
 * Checks if authenticated user has required role
 * 
 * @param {...string} allowedRoles - Roles that can access the route
 * @returns {Function} Express middleware
 * @example
 * app.delete('/api/users/:id', 
 *   authenticateToken, 
 *   authorize('admin'), 
 *   deleteUser
 * );
 */
function authorize(...allowedRoles) {
  return (req, res, next) => {
    try {
      if (!req.user) {
        throw new ApiError(401, 'User not authenticated');
      }

      if (!allowedRoles.includes(req.user.role)) {
        throw new ApiError(403, `This action requires one of: ${allowedRoles.join(', ')}`);
      }

      logger.info(`Authorization granted for ${req.user.id} to ${req.method} ${req.path}`);
      next();
    } catch (error) {
      res.status(error.statusCode || 403).json(error.toJSON?.() || {
        success: false,
        error: { message: error.message }
      });
    }
  };
}

/**
 * Generates authentication token for user
 * 
 * Creates and stores token in token store
 * In production, generate proper JWT
 * 
 * @param {Object} user - User object
 * @param {string} user.id - User ID
 * @param {string} user.email - User email
 * @param {string} user.role - User role
 * @returns {string} Authentication token
 * @example
 * const token = generateToken({
 *   id: 'user_123',
 *   email: 'user@example.com',
 *   role: 'user'
 * });
 */
function generateToken(user) {
  const token = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  tokenStore.set(token, {
    id: user.id,
    email: user.email,
    role: user.role,
    issuedAt: new Date(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
  });
  
  logger.info(`Token generated for user ${user.id}`);
  return token;
}

/**
 * Invalidates authentication token (logout)
 * 
 * @param {string} token - Token to revoke
 * @returns {boolean} Whether token was revoked
 * @example
 * revokeToken(userToken);
 */
function revokeToken(token) {
  return tokenStore.delete(token);
}

/**
 * Validates token without middleware
 * 
 * @param {string} token - Token to validate
 * @returns {Object|null} User data if valid, null if invalid
 */
function validateToken(token) {
  return tokenStore.get(token) || null;
}

/**
 * Gets all active tokens (useful for admin purposes)
 * 
 * @returns {Array} Array of active tokens
 */
function getActiveTokens() {
  return Array.from(tokenStore.keys());
}

module.exports = {
  authenticateToken,
  authorize,
  generateToken,
  revokeToken,
  validateToken,
  getActiveTokens
};
