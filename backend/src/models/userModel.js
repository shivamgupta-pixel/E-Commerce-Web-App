/**
 * User Model
 * 
 * This module defines the User data model and provides methods for
 * interacting with user data in the database. It handles user creation,
 * retrieval, updates, and deletion operations.
 * 
 * @module models/userModel
 */

class User {
  /**
   * Creates a new User instance
   * 
   * @param {Object} data - User data object
   * @param {string} data.id - Unique user identifier
   * @param {string} data.name - User's full name
   * @param {string} data.email - User's email address
   * @param {string} data.password - User's encrypted password
   * @param {string} data.role - User's role (admin, user, guest)
   * @param {Date} data.createdAt - Account creation timestamp
   * @param {boolean} data.isActive - Whether the user account is active
   */
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.email = data.email;
    this.password = data.password;
    this.role = data.role || 'user';
    this.createdAt = data.createdAt || new Date();
    this.isActive = data.isActive !== undefined ? data.isActive : true;
  }

  /**
   * Validates the user data before saving to database
   * 
   * @returns {Object} Validation result with status and errors
   * @example
   * const user = new User(userData);
   * const validation = user.validate();
   * if (!validation.isValid) {
   *   console.log(validation.errors);
   * }
   */
  validate() {
    const errors = [];

    // Validate name
    if (!this.name || this.name.trim().length < 2) {
      errors.push('Name must be at least 2 characters long');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      errors.push('Invalid email format');
    }

    // Validate password strength
    if (!this.password || this.password.length < 6) {
      errors.push('Password must be at least 6 characters long');
    }

    // Validate role
    const validRoles = ['admin', 'user', 'guest'];
    if (!validRoles.includes(this.role)) {
      errors.push(`Role must be one of: ${validRoles.join(', ')}`);
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }

  /**
   * Converts user object to a plain JavaScript object for API responses
   * Excludes sensitive information like password
   * 
   * @returns {Object} User data without sensitive fields
   */
  toJSON() {
    const { password, ...userWithoutPassword } = {
      id: this.id,
      name: this.name,
      email: this.email,
      role: this.role,
      createdAt: this.createdAt,
      isActive: this.isActive
    };
    return userWithoutPassword;
  }

  /**
   * Updates user profile information
   * 
   * @param {Object} updateData - Fields to update
   * @returns {boolean} Whether update was successful
   */
  update(updateData) {
    if (updateData.name) this.name = updateData.name;
    if (updateData.email) this.email = updateData.email;
    if (updateData.role) this.role = updateData.role;
    if (typeof updateData.isActive === 'boolean') {
      this.isActive = updateData.isActive;
    }
    return true;
  }
}

module.exports = User;
