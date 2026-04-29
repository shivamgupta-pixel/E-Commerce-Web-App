/**
 * Order Model
 * 
 * Represents a customer order containing one or more products
 * with pricing, status tracking, and fulfillment information.
 */

class Order {
  /**
   * Creates a new Order instance
   * 
   * @param {Object} data - Order data
   * @param {string} data.id - Unique order identifier
   * @param {string} data.userId - User who placed the order
   * @param {Array} data.items - Array of ordered items with quantity
   * @param {number} data.totalAmount - Total order amount
   * @param {string} data.status - Order status (pending, processed, shipped, delivered)
   * @param {string} data.shippingAddress - Delivery address
   * @param {Date} data.createdAt - Order creation timestamp
   * @param {Date} [data.deliveredAt] - Delivery completion timestamp
   */
  constructor(data) {
    this.id = data.id;
    this.userId = data.userId;
    this.items = data.items || [];
    this.totalAmount = data.totalAmount || 0;
    this.status = data.status || 'pending';
    this.shippingAddress = data.shippingAddress;
    this.createdAt = data.createdAt || new Date();
    this.deliveredAt = data.deliveredAt || null;
    this.notes = data.notes || '';
  }

  /**
   * Validates order data before processing
   * 
   * @returns {Object} Validation result
   */
  validate() {
    const errors = [];

    if (!this.userId) {
      errors.push('User ID is required');
    }

    if (!Array.isArray(this.items) || this.items.length === 0) {
      errors.push('Order must contain at least one item');
    }

    if (this.items.some(item => !item.productId || item.quantity <= 0)) {
      errors.push('Each item must have a valid product ID and quantity');
    }

    if (typeof this.totalAmount !== 'number' || this.totalAmount <= 0) {
      errors.push('Total amount must be a positive number');
    }

    const validStatuses = ['pending', 'processed', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(this.status)) {
      errors.push(`Status must be one of: ${validStatuses.join(', ')}`);
    }

    if (!this.shippingAddress || this.shippingAddress.trim().length === 0) {
      errors.push('Shipping address is required');
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }

  /**
   * Calculates subtotal before tax and shipping
   * 
   * @returns {number} Subtotal amount
   */
  getSubtotal() {
    return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  /**
   * Calculates tax on order (assumes 8% tax rate)
   * 
   * @returns {number} Tax amount
   */
  calculateTax(taxRate = 0.08) {
    return this.getSubtotal() * taxRate;
  }

  /**
   * Adds item to order
   * 
   * @param {Object} item - Item to add
   * @param {string} item.productId - Product identifier
   * @param {string} item.productName - Product name
   * @param {number} item.price - Item price
   * @param {number} item.quantity - Quantity ordered
   * @returns {boolean} Whether item was added
   */
  addItem(item) {
    if (!item.productId || item.quantity <= 0) {
      return false;
    }

    const existingItem = this.items.find(i => i.productId === item.productId);
    
    if (existingItem) {
      existingItem.quantity += item.quantity;
    } else {
      this.items.push(item);
    }

    this.recalculateTotal();
    return true;
  }

  /**
   * Removes item from order
   * 
   * @param {string} productId - Product to remove
   * @returns {boolean} Whether item was removed
   */
  removeItem(productId) {
    const initialLength = this.items.length;
    this.items = this.items.filter(item => item.productId !== productId);
    
    if (this.items.length < initialLength) {
      this.recalculateTotal();
      return true;
    }
    return false;
  }

  /**
   * Recalculates total order amount
   * 
   * @returns {void}
   */
  recalculateTotal() {
    this.totalAmount = this.getSubtotal();
  }

  /**
   * Updates order status
   * 
   * @param {string} newStatus - New status
   * @returns {boolean} Whether status was updated
   */
  updateStatus(newStatus) {
    const validStatuses = ['pending', 'processed', 'shipped', 'delivered', 'cancelled'];
    
    if (!validStatuses.includes(newStatus)) {
      return false;
    }

    this.status = newStatus;

    if (newStatus === 'delivered') {
      this.deliveredAt = new Date();
    }

    return true;
  }

  /**
   * Calculates days since order was placed
   * 
   * @returns {number} Number of days
   */
  getDaysOld() {
    const now = new Date();
    const diff = now - this.createdAt;
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  /**
   * Converts order to API response format
   * 
   * @returns {Object} Order data
   */
  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      items: this.items,
      subtotal: this.getSubtotal(),
      tax: this.calculateTax(),
      totalAmount: this.totalAmount,
      status: this.status,
      shippingAddress: this.shippingAddress,
      createdAt: this.createdAt,
      deliveredAt: this.deliveredAt,
      notes: this.notes,
      daysOld: this.getDaysOld()
    };
  }
}

module.exports = Order;
