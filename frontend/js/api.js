/**
 * API Service Module
 * Handles all API calls to the backend server
 */

const API_BASE_URL = 'http://localhost:3000/api';

// User API calls
const userAPI = {
  getAllUsers: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  },

  getUserById: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${id}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  },

  createUser: async (userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      });
      return await response.json();
    } catch (error) {
      console.error('Error creating user:', error);
      return null;
    }
  },

  updateUser: async (id, userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      });
      return await response.json();
    } catch (error) {
      console.error('Error updating user:', error);
      return null;
    }
  },

  deleteUser: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'DELETE'
      });
      return await response.json();
    } catch (error) {
      console.error('Error deleting user:', error);
      return null;
    }
  }
};

// Product API calls
const productAPI = {
  getAllProducts: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/products`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  },

  getProductById: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching product:', error);
      return null;
    }
  },

  createProduct: async (productData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData)
      });
      return await response.json();
    } catch (error) {
      console.error('Error creating product:', error);
      return null;
    }
  },

  updateInventory: async (id, quantity) => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}/inventory`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity })
      });
      return await response.json();
    } catch (error) {
      console.error('Error updating inventory:', error);
      return null;
    }
  },

  applyDiscount: async (id, discountPercent) => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}/discount`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      return await response.json();
    } catch (error) {
      console.error('Error applying discount:', error);
      return null;
    }
  }
};

// Health check API
const systemAPI = {
  checkHealth: async () => {
    try {
      const response = await fetch(`${API_BASE_URL.replace('/api', '')}/health`);
      return await response.json();
    } catch (error) {
      console.error('Error checking health:', error);
      return null;
    }
  }
};
