/**
 * Order Controller
 * 
 * Handles order creation, retrieval, status updates, and order management.
 */

const Order = require('../models/orderModel');
const { handleError, ApiError } = require('../../utils/errorHandler');
const logger = require('../../utils/logger');

const orderDatabase = new Map();

/**
 * Get all orders with filtering options
 * 
 * @async
 * @param {Object} req - Express request
 * @param {string} [req.query.userId] - Filter by user ID
 * @param {string} [req.query.status] - Filter by order status
 * @param {Object} res - Express response
 * @returns {Object} Orders array
 */
async function getAllOrders(req, res) {
  try {
    const { userId, status } = req.query;
    logger.info('Fetching orders', { userId, status });

    let orders = Array.from(orderDatabase.values());

    if (userId) {
      orders = orders.filter(o => o.userId === userId);
    }

    if (status) {
      orders = orders.filter(o => o.status === status);
    }

    orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      success: true,
      data: orders.map(o => o.toJSON()),
      count: orders.length
    });
  } catch (error) {
    handleError(res, error, 'Failed to fetch orders');
  }
}

/**
 * Get order by ID
 * 
 * @async
 * @param {Object} req - Express request
 * @param {string} req.params.id - Order ID
 * @param {Object} res - Express response
 * @returns {Object} Order details
 */
async function getOrderById(req, res) {
  try {
    const { id } = req.params;
    logger.info(`Fetching order ${id}`);

    const order = orderDatabase.get(id);
    if (!order) {
      throw new ApiError(404, 'Order not found');
    }

    res.json({
      success: true,
      data: order.toJSON()
    });
  } catch (error) {
    handleError(res, error, 'Failed to fetch order');
  }
}

/**
 * Create a new order
 * 
 * @async
 * @param {Object} req - Express request
 * @param {string} req.body.userId - User placing order
 * @param {Array} req.body.items - Order items
 * @param {string} req.body.shippingAddress - Delivery address
 * @param {Object} res - Express response
 * @returns {Object} Created order
 */
async function createOrder(req, res) {
  try {
    const { userId, items, shippingAddress } = req.body;
    logger.info(`Creating order for user ${userId}`);

    if (!userId || !items || !shippingAddress) {
      throw new ApiError(400, 'Missing required fields: userId, items, shippingAddress');
    }

    const orderId = `order_${Date.now()}`;
    const order = new Order({
      id: orderId,
      userId,
      items,
      shippingAddress,
      totalAmount: items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    });

    const validation = order.validate();
    if (!validation.isValid) {
      throw new ApiError(400, validation.errors.join(', '));
    }

    orderDatabase.set(orderId, order);
    logger.info(`Order created: ${orderId}`);

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order.toJSON()
    });
  } catch (error) {
    handleError(res, error, 'Failed to create order');
  }
}

/**
 * Update order status
 * 
 * @async
 * @param {Object} req - Express request
 * @param {string} req.params.id - Order ID
 * @param {string} req.body.status - New status
 * @param {Object} res - Express response
 * @returns {Object} Updated order
 */
async function updateOrderStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = orderDatabase.get(id);
    if (!order) {
      throw new ApiError(404, 'Order not found');
    }

    if (!status) {
      throw new ApiError(400, 'Status is required');
    }

    const updated = order.updateStatus(status);
    if (!updated) {
      throw new ApiError(400, 'Invalid status value');
    }

    logger.info(`Order ${id} status updated to ${status}`);

    res.json({
      success: true,
      message: 'Order status updated',
      data: order.toJSON()
    });
  } catch (error) {
    handleError(res, error, 'Failed to update order');
  }
}

/**
 * Add item to existing order
 * 
 * @async
 * @param {Object} req - Express request
 * @param {string} req.params.id - Order ID
 * @param {Object} req.body.item - Item to add
 * @param {Object} res - Express response
 * @returns {Object} Updated order
 */
async function addItemToOrder(req, res) {
  try {
    const { id } = req.params;
    const { item } = req.body;

    const order = orderDatabase.get(id);
    if (!order) {
      throw new ApiError(404, 'Order not found');
    }

    if (!item || !item.productId) {
      throw new ApiError(400, 'Invalid item data');
    }

    const added = order.addItem(item);
    if (!added) {
      throw new ApiError(400, 'Failed to add item');
    }

    logger.info(`Item added to order ${id}`);

    res.json({
      success: true,
      message: 'Item added to order',
      data: order.toJSON()
    });
  } catch (error) {
    handleError(res, error, 'Failed to add item');
  }
}

/**
 * Remove item from order
 * 
 * @async
 * @param {Object} req - Express request
 * @param {string} req.params.id - Order ID
 * @param {string} req.params.productId - Product to remove
 * @param {Object} res - Express response
 * @returns {Object} Updated order
 */
async function removeItemFromOrder(req, res) {
  try {
    const { id, productId } = req.params;

    const order = orderDatabase.get(id);
    if (!order) {
      throw new ApiError(404, 'Order not found');
    }

    const removed = order.removeItem(productId);
    if (!removed) {
      throw new ApiError(404, 'Item not found in order');
    }

    logger.info(`Item ${productId} removed from order ${id}`);

    res.json({
      success: true,
      message: 'Item removed from order',
      data: order.toJSON()
    });
  } catch (error) {
    handleError(res, error, 'Failed to remove item');
  }
}

/**
 * Cancel order
 * 
 * @async
 * @param {Object} req - Express request
 * @param {string} req.params.id - Order ID
 * @param {Object} res - Express response
 * @returns {Object} Cancelled order
 */
async function cancelOrder(req, res) {
  try {
    const { id } = req.params;

    const order = orderDatabase.get(id);
    if (!order) {
      throw new ApiError(404, 'Order not found');
    }

    if (order.status === 'shipped' || order.status === 'delivered') {
      throw new ApiError(400, 'Cannot cancel shipped or delivered orders');
    }

    order.status = 'cancelled';
    logger.info(`Order ${id} cancelled`);

    res.json({
      success: true,
      message: 'Order cancelled',
      data: order.toJSON()
    });
  } catch (error) {
    handleError(res, error, 'Failed to cancel order');
  }
}

module.exports = {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  addItemToOrder,
  removeItemFromOrder,
  cancelOrder
};
