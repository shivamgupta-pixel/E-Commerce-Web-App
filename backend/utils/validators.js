/**
 * Validators Utility Module
 * 
 * Provides reusable validation functions for common data types and formats.
 * These validators ensure data integrity before processing.
 * 
 * @module utils/validators
 */

/**
 * Validates email address format
 * 
 * Uses a regular expression to check if an email follows standard format.
 * Validates that the email has a local part, @ symbol, and domain.
 * 
 * @param {string} email - Email address to validate
 * @returns {boolean} True if email format is valid
 * @example
 * validateEmail('user@example.com'); // true
 * validateEmail('invalid.email');    // false
 */
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates password strength
 * 
 * Checks that password meets minimum length requirements.
 * In production, consider adding complexity requirements
 * (uppercase, lowercase, numbers, special characters).
 * 
 * @param {string} password - Password to validate
 * @param {number} minLength - Minimum required length (default: 6)
 * @returns {boolean} True if password meets requirements
 * @example
 * validatePassword('MyPass123');     // true
 * validatePassword('short');         // false
 * validatePassword('MyPass123', 10); // false
 */
function validatePassword(password, minLength = 6) {
  if (!password || typeof password !== 'string') {
    return false;
  }
  return password.length >= minLength;
}

/**
 * Validates phone number format
 * 
 * Accepts phone numbers with or without formatting.
 * Supports international and domestic formats.
 * 
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if phone format is valid
 * @example
 * validatePhone('(123) 456-7890'); // true
 * validatePhone('123-456-7890');   // true
 * validatePhone('1234567890');     // true
 */
function validatePhone(phone) {
  const phoneRegex = /^[\d\s\-\(\)\+]+$/;
  const digitsOnly = phone.replace(/\D/g, '');
  return phoneRegex.test(phone) && digitsOnly.length >= 10;
}

/**
 * Validates URL format
 * 
 * Checks if a string is a valid URL with proper protocol.
 * Supports HTTP, HTTPS, and FTP protocols.
 * 
 * @param {string} url - URL to validate
 * @returns {boolean} True if URL format is valid
 * @example
 * validateUrl('https://example.com');  // true
 * validateUrl('not a url');            // false
 */
function validateUrl(url) {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Validates that a value is a positive integer
 * 
 * Ensures value is a whole number greater than zero.
 * Useful for quantities, counts, and IDs.
 * 
 * @param {*} value - Value to validate
 * @returns {boolean} True if value is a positive integer
 * @example
 * validatePositiveInteger(5);    // true
 * validatePositiveInteger(0);    // false
 * validatePositiveInteger(-10);  // false
 * validatePositiveInteger('5');  // false
 */
function validatePositiveInteger(value) {
  return Number.isInteger(value) && value > 0;
}

/**
 * Validates that a value is a positive number
 * 
 * Allows any positive number including decimals.
 * Useful for prices, ratings, and measurements.
 * 
 * @param {*} value - Value to validate
 * @returns {boolean} True if value is a positive number
 * @example
 * validatePositiveNumber(19.99);  // true
 * validatePositiveNumber(0);      // false
 * validatePositiveNumber(-5.5);   // false
 */
function validatePositiveNumber(value) {
  return typeof value === 'number' && !isNaN(value) && value > 0;
}

/**
 * Validates that a string is not empty or whitespace
 * 
 * Trims whitespace and checks for minimum length.
 * 
 * @param {string} str - String to validate
 * @param {number} minLength - Minimum required length (default: 1)
 * @returns {boolean} True if string is not empty
 * @example
 * validateNonEmptyString('valid'); // true
 * validateNonEmptyString('   ');   // false
 * validateNonEmptyString('abc', 5); // false
 */
function validateNonEmptyString(str, minLength = 1) {
  return typeof str === 'string' && str.trim().length >= minLength;
}

/**
 * Validates that a value exists in allowed values
 * 
 * Checks if value matches one of the allowed options.
 * Useful for enums and restricted choices.
 * 
 * @param {*} value - Value to validate
 * @param {Array} allowedValues - Array of valid values
 * @returns {boolean} True if value is in allowed list
 * @example
 * validateInArray('admin', ['admin', 'user', 'guest']); // true
 * validateInArray('owner', ['admin', 'user', 'guest']); // false
 */
function validateInArray(value, allowedValues) {
  return Array.isArray(allowedValues) && allowedValues.includes(value);
}

/**
 * Validates date format (YYYY-MM-DD)
 * 
 * Checks if a string is a valid date in standard format
 * and represents an actual date.
 * 
 * @param {string} dateString - Date string to validate
 * @returns {boolean} True if date format is valid
 * @example
 * validateDate('2026-04-29');  // true
 * validateDate('2026-02-30');  // false (invalid date)
 * validateDate('29-04-2026');  // false (wrong format)
 */
function validateDate(dateString) {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) {
    return false;
  }
  
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
}

/**
 * Validates JSON string
 * 
 * Attempts to parse a string as JSON and returns validity.
 * 
 * @param {string} jsonString - String to validate
 * @returns {boolean} True if valid JSON
 * @example
 * validateJson('{"key":"value"}');  // true
 * validateJson('{invalid json}');   // false
 */
function validateJson(jsonString) {
  try {
    JSON.parse(jsonString);
    return true;
  } catch (error) {
    return false;
  }
}

module.exports = {
  validateEmail,
  validatePassword,
  validatePhone,
  validateUrl,
  validatePositiveInteger,
  validatePositiveNumber,
  validateNonEmptyString,
  validateInArray,
  validateDate,
  validateJson
};
