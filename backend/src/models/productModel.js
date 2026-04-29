/**
 * Product Model
 * 
 * This module defines the Product data model representing items available
 * in the catalog. It includes methods for managing product information,
 * inventory, and pricing.
 * 
 * @module models/productModel
 */

class Product {
  /**
   * Creates a new Product instance
   * 
   * @param {Object} data - Product data object
   * @param {string} data.id - Unique product identifier
   * @param {string} data.name - Product name or title
   * @param {string} data.description - Detailed product description
   * @param {number} data.price - Product price in USD
   * @param {number} data.inventory - Current stock quantity
   * @param {string} data.category - Product category
   * @param {string[]} data.tags - Array of product tags for categorization
   * @param {number} data.rating - Average product rating (0-5)
   * @param {Date} data.createdAt - Product creation timestamp
   */
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.price = data.price;
    this.inventory = data.inventory;
    this.category = data.category;
    this.tags = data.tags || [];
    this.rating = data.rating || 0;
    this.createdAt = data.createdAt || new Date();
  }

  /**
   * Validates product data for database operations
   * Checks price, inventory, and other required fields
   * 
   * @returns {Object} Validation result with status and error messages
   * @example
   * const product = new Product(productData);
   * if (product.validate().isValid) {
   *   // Save to database
   * }
   */
  validate() {
    const errors = [];

    // Validate name
    if (!this.name || this.name.trim().length === 0) {
      errors.push('Product name is required');
    }

    // Validate price
    if (typeof this.price !== 'number' || this.price < 0) {
      errors.push('Price must be a positive number');
    }

    // Validate inventory
    if (!Number.isInteger(this.inventory) || this.inventory < 0) {
      errors.push('Inventory must be a non-negative integer');
    }

    // Validate rating
    if (this.rating < 0 || this.rating > 5) {
      errors.push('Rating must be between 0 and 5');
    }

    // Validate category
    const validCategories = ['electronics', 'clothing', 'books', 'home', 'sports'];
    if (!validCategories.includes(this.category)) {
      errors.push(`Category must be one of: ${validCategories.join(', ')}`);
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }

  /**
   * Checks if product is available for purchase
   * 
   * @param {number} quantity - Number of units to check
   * @returns {boolean} Whether requested quantity is in stock
   */
  isAvailable(quantity = 1) {
    return this.inventory >= quantity;
  }

  /**
   * Reduces inventory when product is purchased
   * 
   * @param {number} quantity - Number of units to deduct
   * @returns {boolean} Whether operation was successful
   */
  reduceInventory(quantity) {
    if (!this.isAvailable(quantity)) {
      return false;
    }
    this.inventory -= quantity;
    return true;
  }

  /**
   * Increases inventory for restocking
   * 
   * @param {number} quantity - Number of units to add
   * @returns {number} New inventory level
   */
  addInventory(quantity) {
    this.inventory += quantity;
    return this.inventory;
  }

  /**
   * Calculates discounted price
   * 
   * @param {number} discountPercent - Discount percentage (0-100)
   * @returns {number} Price after discount
   */
  getDiscountedPrice(discountPercent) {
    if (discountPercent < 0 || discountPercent > 100) {
      throw new Error('Discount must be between 0 and 100');
    }
    return this.price * (1 - discountPercent / 100);
  }

  /**
   * Converts product to API response format
   * 
   * @returns {Object} Clean product data object
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      price: this.price,
      inventory: this.inventory,
      category: this.category,
      tags: this.tags,
      rating: this.rating,
      createdAt: this.createdAt,
      inStock: this.isAvailable()
    };
  }
}

module.exports = Product;
