/**
 * Logger Utility Module
 * 
 * Provides centralized logging functionality for the application.
 * Logs messages at different severity levels with timestamps and
 * context information.
 * 
 * @module utils/logger
 */

/**
 * Log levels enumeration
 * @const {Object}
 */
const LogLevel = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG'
};

/**
 * Logger class
 * 
 * Provides methods for logging at different severity levels.
 * All logs include timestamps and can be filtered by level.
 * 
 * @class Logger
 */
class Logger {
  /**
   * Creates a new Logger instance
   * 
   * @param {string} name - Logger identifier (typically module name)
   * @param {string} level - Logging level (default: 'INFO')
   */
  constructor(name = 'App', level = 'INFO') {
    this.name = name;
    this.level = level;
    this.logs = [];
  }

  /**
   * Gets current timestamp in ISO format
   * 
   * @returns {string} Formatted timestamp
   * @private
   */
  getTimestamp() {
    return new Date().toISOString();
  }

  /**
   * Formats log message
   * 
   * @param {string} level - Log level
   * @param {string} message - Log message
   * @param {*} data - Additional data to log
   * @returns {Object} Formatted log object
   * @private
   */
  formatLog(level, message, data = null) {
    return {
      timestamp: this.getTimestamp(),
      level: level,
      logger: this.name,
      message: message,
      data: data
    };
  }

  /**
   * Logs message at INFO level
   * 
   * Use for general informational messages about application flow.
   * 
   * @param {string} message - Log message
   * @param {*} [data] - Additional data
   * @returns {void}
   * @example
   * logger.info('User registered successfully', { userId: '123' });
   */
  info(message, data = null) {
    const logEntry = this.formatLog(LogLevel.INFO, message, data);
    this.logs.push(logEntry);
    console.log(
      `[${logEntry.timestamp}] [${logEntry.logger}] [${LogLevel.INFO}] ${message}`,
      data ? data : ''
    );
  }

  /**
   * Logs message at DEBUG level
   * 
   * Use for detailed technical information useful for debugging.
   * Debug logs typically don't appear in production.
   * 
   * @param {string} message - Log message
   * @param {*} [data] - Additional data
   * @returns {void}
   * @example
   * logger.debug('Processing request', { method: 'GET', url: '/api/users' });
   */
  debug(message, data = null) {
    if (this.level === LogLevel.DEBUG) {
      const logEntry = this.formatLog(LogLevel.DEBUG, message, data);
      this.logs.push(logEntry);
      console.log(
        `[${logEntry.timestamp}] [${logEntry.logger}] [${LogLevel.DEBUG}] ${message}`,
        data ? data : ''
      );
    }
  }

  /**
   * Logs message at WARN level
   * 
   * Use for warning messages about potential issues that don't
   * prevent normal operation.
   * 
   * @param {string} message - Log message
   * @param {*} [data] - Additional data
   * @returns {void}
   * @example
   * logger.warn('Deprecated API endpoint accessed', { endpoint: '/v1/users' });
   */
  warn(message, data = null) {
    const logEntry = this.formatLog(LogLevel.WARN, message, data);
    this.logs.push(logEntry);
    console.warn(
      `[${logEntry.timestamp}] [${logEntry.logger}] [${LogLevel.WARN}] ${message}`,
      data ? data : ''
    );
  }

  /**
   * Logs message at ERROR level
   * 
   * Use for error messages about failures and exceptions.
   * Error logs should always include error details.
   * 
   * @param {string} message - Log message
   * @param {Error|Object} [data] - Error object or additional data
   * @returns {void}
   * @example
   * logger.error('Database connection failed', error);
   */
  error(message, data = null) {
    const logEntry = this.formatLog(LogLevel.ERROR, message, data);
    this.logs.push(logEntry);
    console.error(
      `[${logEntry.timestamp}] [${logEntry.logger}] [${LogLevel.ERROR}] ${message}`,
      data ? data : ''
    );
  }

  /**
   * Retrieves all logs or logs matching a specific level
   * 
   * Useful for monitoring, auditing, and debugging.
   * 
   * @param {string} [levelFilter] - Optional log level to filter by
   * @returns {Array<Object>} Array of log entries
   * @example
   * const errors = logger.getLogs('ERROR');
   * const allLogs = logger.getLogs();
   */
  getLogs(levelFilter = null) {
    if (levelFilter) {
      return this.logs.filter(log => log.level === levelFilter);
    }
    return this.logs;
  }

  /**
   * Clears all stored logs
   * 
   * Use with caution as logs cannot be recovered after clearing.
   * 
   * @returns {void}
   */
  clearLogs() {
    this.logs = [];
  }

  /**
   * Gets summary statistics about logs
   * 
   * Returns count of logs at each level.
   * 
   * @returns {Object} Log statistics
   * @example
   * {
   *   total: 150,
   *   info: 100,
   *   warn: 30,
   *   error: 20,
   *   debug: 0
   * }
   */
  getStatistics() {
    const stats = {
      total: this.logs.length,
      info: 0,
      warn: 0,
      error: 0,
      debug: 0
    };

    this.logs.forEach(log => {
      if (stats.hasOwnProperty(log.level.toLowerCase())) {
        stats[log.level.toLowerCase()]++;
      }
    });

    return stats;
  }
}

// Create default logger instance
const defaultLogger = new Logger('Backend', LogLevel.INFO);

// Export both the class and default instance
module.exports = defaultLogger;
module.exports.Logger = Logger;
module.exports.LogLevel = LogLevel;
