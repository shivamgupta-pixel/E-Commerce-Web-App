/**
 * Product Controller
 * 
 * Handles all product-related operations including listing, searching,
 * filtering by category, managing inventory, and calculating prices
 * with discounts.
 * 
 * @module controllers/productController
 */

const Product = require('../models/productModel');
const { handleError, ApiError } = require('../../utils/errorHandler');
const logger = require('../../utils/logger');

/**
 * Simulated product database (in production, use actual database)
 */
const productDatabase = new Map();

// Initialize with sample products
function initializeSampleProducts() {
  const sampleProducts = [
    {
      id: 'prod_001',
      name: 'Wireless Headphones',
      description: 'High-quality wireless headphones with noise cancellation',
      price: 149.99,
      inventory: 50,
      category: 'electronics',
      tags: ['audio', 'wireless', 'premium'],
      rating: 4.5
    },
    {
      id: 'prod_002',
      name: 'Cotton T-Shirt',
      description: 'Comfortable 100% cotton t-shirt available in multiple colors',
      price: 29.99,
      inventory: 200,
      category: 'clothing',
      tags: ['casual', 'cotton', 'unisex'],
      rating: 4.2
    }
  ];

  sampleProducts.forEach(data => {
    const product = new Product(data);
    productDatabase.set(product.id, product);
  });
}

initializeSampleProducts();

/**
 * Get all products with optional filtering
 * 
 * Retrieves products with support for pagination, category filtering,
 * and sorting options.
 * 
 * @async
 * @param {Object} req - Express request object
 * @param {string} [req.query.category] - Filter by category
 * @param {number} [req.query.page=1] - Page number for pagination
 * @param {number} [req.query.limit=10] - Items per page
 * @param {string} [req.query.sort] - Sort by: price, rating, newest
 * @param {Object} res - Express response object
 * @returns {Object} Products array with pagination metadata
 * @example
 * GET /api/products?category=electronics&page=1&limit=10&sort=price
 * Response: {
 *   success: true,
 *   data: [...],
 *   pagination: { page: 1, limit: 10, total: 25 }
 * }
 */
async function getAllProducts(req, res) {
  try {
    const { category, page = 1, limit = 10, sort = 'newest' } = req.query;

    logger.info(`Fetching products with filters: category=${category}, sort=${sort}`);

    let products = Array.from(productDatabase.values());

    // Filter by category if provided
    if (category) {
      products = products.filter(p => p.category === category);
    }

    // Sort products
    switch (sort) {
      case 'price':
        products.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        products.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        products.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
      default:
        products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    // Pagination
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const startIndex = (pageNum - 1) * limitNum;
    const paginatedProducts = products.slice(startIndex, startIndex + limitNum);

    res.json({
      success: true,
      data: paginatedProducts.map(p => p.toJSON()),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: products.length,
        hasMore: startIndex + limitNum < products.length
      }
    });
  } catch (error) {
    handleError(res, error, 'Failed to retrieve products');
  }
}

/**
 * Get product by ID
 * 
 * Retrieves detailed information about a specific product.
 * 
 * @async
 * @param {Object} req - Express request object
 * @param {string} req.params.id - Product ID
 * @param {Object} res - Express response object
 * @returns {Object} Product details
 */
async function getProductById(req, res) {
  try {
    const { id } = req.params;
    logger.info(`Fetching product with id: ${id}`);

    const product = productDatabase.get(id);
    if (!product) {
      throw new ApiError(404, 'Product not found');
    }

    res.json({
      success: true,
      data: product.toJSON()
    });
  } catch (error) {
    handleError(res, error, 'Failed to retrieve product');
  }
}

/**
 * Create a new product
 * 
 * Adds a new product to the catalog. Validates all required fields
 * and inventory levels.
 * 
 * @async
 * @param {Object} req - Express request object
 * @param {string} req.body.name - Product name
 * @param {string} req.body.description - Product description
 * @param {number} req.body.price - Product price
 * @param {number} req.body.inventory - Initial stock quantity
 * @param {string} req.body.category - Product category
 * @param {Object} res - Express response object
 * @returns {Object} Created product
 */
async function createProduct(req, res) {
  try {
    const { name, description, price, inventory, category, tags } = req.body;

    logger.info(`Creating new product: ${name}`);

    const productId = `prod_${Date.now()}`;
    const newProduct = new Product({
      id: productId,
      name,
      description,
      price,
      inventory,
      category,
      tags: tags || []
    });

    const validation = newProduct.validate();
    if (!validation.isValid) {
      throw new ApiError(400, validation.errors.join(', '));
    }

    productDatabase.set(productId, newProduct);
    logger.info(`Product created with id: ${productId}`);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: newProduct.toJSON()
    });
  } catch (error) {
    handleError(res, error, 'Failed to create product');
  }
}

/**
 * Apply discount and get final price
 * 
 * Calculates the discounted price for a product.
 * 
 * @async
 * @param {Object} req - Express request object
 * @param {string} req.params.id - Product ID
 * @param {number} req.query.discount - Discount percentage (0-100)
 * @param {Object} res - Express response object
 * @returns {Object} Original and discounted prices
 * @example
 * GET /api/products/prod_001/discount?discount=15
 * Response: {
 *   success: true,
 *   originalPrice: 149.99,
 *   discountPercent: 15,
 *   discountedPrice: 127.49,
 *   savings: 22.50
 * }
 */
async function applyDiscount(req, res) {
  try {
    const { id } = req.params;
    const { discount } = req.query;

    const product = productDatabase.get(id);
    if (!product) {
      throw new ApiError(404, 'Product not found');
    }

    const discountPercent = parseFloat(discount);
    if (isNaN(discountPercent) || discountPercent < 0 || discountPercent > 100) {
      throw new ApiError(400, 'Discount must be a number between 0 and 100');
    }

    const discountedPrice = product.getDiscountedPrice(discountPercent);
    const savings = product.price - discountedPrice;

    res.json({
      success: true,
      originalPrice: product.price,
      discountPercent: discountPercent,
      discountedPrice: parseFloat(discountedPrice.toFixed(2)),
      savings: parseFloat(savings.toFixed(2))
    });
  } catch (error) {
    handleError(res, error, 'Failed to calculate discount');
  }
}

/**
 * Update product inventory
 * 
 * Restocks or adjusts product inventory levels.
 * Useful for managing warehouse operations.
 * 
 * @async
 * @param {Object} req - Express request object
 * @param {string} req.params.id - Product ID
 * @param {number} req.body.quantity - Quantity to add (negative to reduce)
 * @param {Object} res - Express response object
 * @returns {Object} Updated inventory level
 */
async function updateInventory(req, res) {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    const product = productDatabase.get(id);
    if (!product) {
      throw new ApiError(404, 'Product not found');
    }

    if (!Number.isInteger(quantity)) {
      throw new ApiError(400, 'Quantity must be an integer');
    }

    const newInventory = product.addInventory(quantity);
    logger.info(`Product ${id} inventory updated to ${newInventory}`);

    res.json({
      success: true,
      message: 'Inventory updated successfully',
      previousInventory: product.inventory - quantity,
      newInventory: newInventory
    });
  } catch (error) {
    handleError(res, error, 'Failed to update inventory');
  }
}

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  applyDiscount,
  updateInventory
};
