/**
 * Main Application Logic
 * Handles UI interactions and state management
 */

let currentEditType = null;
let currentEditId = null;

// Initialize app on page load
document.addEventListener('DOMContentLoaded', () => {
  loadUsers();
  loadProducts();
  checkServerHealth();
});

// ===== Navigation =====
function showSection(sectionName) {
  // Hide all sections
  document.querySelectorAll('.section').forEach(section => {
    section.classList.remove('active');
  });

  // Show selected section
  document.getElementById(sectionName).classList.add('active');

  // Update nav buttons
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  event.target.classList.add('active');

  // Reload data
  if (sectionName === 'users') {
    loadUsers();
  } else if (sectionName === 'products') {
    loadProducts();
  }
}

// ===== Users Management =====
async function loadUsers() {
  const usersList = document.getElementById('usersList');
  usersList.innerHTML = '<p class="loading">Loading users...</p>';

  const users = await userAPI.getAllUsers();
  
  if (!users || users.length === 0) {
    usersList.innerHTML = '<p class="empty-state">No users found</p>';
    return;
  }

  usersList.innerHTML = users.map(user => `
    <div class="item-card">
      <div class="item-header">
        <h4>${user.name || 'Unnamed User'}</h4>
        <span class="item-id">ID: ${user.id}</span>
      </div>
      <div class="item-details">
        <p><strong>Email:</strong> ${user.email || 'N/A'}</p>
        <p><strong>Phone:</strong> ${user.phone || 'N/A'}</p>
      </div>
      <div class="item-actions">
        <button class="btn btn-edit" onclick="editUser(${user.id}, '${user.name}', '${user.email}', '${user.phone || ''}')">Edit</button>
        <button class="btn btn-delete" onclick="deleteUserConfirm(${user.id})">Delete</button>
      </div>
    </div>
  `).join('');
}

async function addUser(event) {
  event.preventDefault();

  const userData = {
    name: document.getElementById('userName').value,
    email: document.getElementById('userEmail').value,
    phone: document.getElementById('userPhone').value
  };

  const result = await userAPI.createUser(userData);

  if (result && result.success) {
    showAlert('User added successfully!', 'success');
    document.getElementById('userForm').reset();
    loadUsers();
  } else {
    showAlert('Failed to add user', 'error');
  }
}

function editUser(id, name, email, phone) {
  currentEditType = 'user';
  currentEditId = id;

  const formFields = document.getElementById('editFormFields');
  formFields.innerHTML = `
    <input type="text" id="editName" value="${name}" placeholder="Full Name" required>
    <input type="email" id="editEmail" value="${email}" placeholder="Email Address" required>
    <input type="tel" id="editPhone" value="${phone}" placeholder="Phone Number">
  `;

  document.getElementById('modalTitle').textContent = 'Edit User';
  document.getElementById('editModal').style.display = 'block';
}

async function deleteUserConfirm(id) {
  if (confirm('Are you sure you want to delete this user?')) {
    const result = await userAPI.deleteUser(id);
    if (result && result.success) {
      showAlert('User deleted successfully!', 'success');
      loadUsers();
    } else {
      showAlert('Failed to delete user', 'error');
    }
  }
}

// ===== Products Management =====
async function loadProducts() {
  const productsList = document.getElementById('productsList');
  productsList.innerHTML = '<p class="loading">Loading products...</p>';

  const products = await productAPI.getAllProducts();

  if (!products || products.length === 0) {
    productsList.innerHTML = '<p class="empty-state">No products found</p>';
    return;
  }

  productsList.innerHTML = products.map(product => `
    <div class="item-card">
      <div class="item-header">
        <h4>${product.name || 'Unnamed Product'}</h4>
        <span class="item-id">ID: ${product.id}</span>
      </div>
      <div class="item-details">
        <p><strong>Description:</strong> ${product.description || 'N/A'}</p>
        <p><strong>Price:</strong> $${(product.price || 0).toFixed(2)}</p>
        <p><strong>Stock:</strong> ${product.stock || 0} units</p>
      </div>
      <div class="item-actions">
        <button class="btn btn-edit" onclick="editProduct(${product.id}, '${product.name}', '${product.description || ''}', ${product.price}, ${product.stock})">Edit</button>
      </div>
    </div>
  `).join('');
}

async function addProduct(event) {
  event.preventDefault();

  const productData = {
    name: document.getElementById('productName').value,
    description: document.getElementById('productDescription').value,
    price: parseFloat(document.getElementById('productPrice').value),
    stock: parseInt(document.getElementById('productStock').value)
  };

  const result = await productAPI.createProduct(productData);

  if (result && result.success) {
    showAlert('Product added successfully!', 'success');
    document.getElementById('productForm').reset();
    loadProducts();
  } else {
    showAlert('Failed to add product', 'error');
  }
}

function editProduct(id, name, description, price, stock) {
  currentEditType = 'product';
  currentEditId = id;

  const formFields = document.getElementById('editFormFields');
  formFields.innerHTML = `
    <input type="text" id="editName" value="${name}" placeholder="Product Name" required>
    <textarea id="editDescription" placeholder="Description">${description}</textarea>
    <input type="number" id="editPrice" value="${price}" placeholder="Price" step="0.01" required>
    <input type="number" id="editStock" value="${stock}" placeholder="Stock Quantity" required>
  `;

  document.getElementById('modalTitle').textContent = 'Edit Product';
  document.getElementById('editModal').style.display = 'block';
}

// ===== Modal Handling =====
async function saveEdit(event) {
  event.preventDefault();

  if (currentEditType === 'user') {
    const userData = {
      name: document.getElementById('editName').value,
      email: document.getElementById('editEmail').value,
      phone: document.getElementById('editPhone').value
    };
    const result = await userAPI.updateUser(currentEditId, userData);
    if (result && result.success) {
      showAlert('User updated successfully!', 'success');
      loadUsers();
      closeModal();
    } else {
      showAlert('Failed to update user', 'error');
    }
  } else if (currentEditType === 'product') {
    const productData = {
      name: document.getElementById('editName').value,
      description: document.getElementById('editDescription').value,
      price: parseFloat(document.getElementById('editPrice').value),
      stock: parseInt(document.getElementById('editStock').value)
    };
    // Note: Backend may need update endpoint for products
    showAlert('Product update feature coming soon', 'info');
    closeModal();
  }
}

function closeModal() {
  document.getElementById('editModal').style.display = 'none';
  currentEditType = null;
  currentEditId = null;
}

// Close modal when clicking outside
window.onclick = function(event) {
  const modal = document.getElementById('editModal');
  if (event.target === modal) {
    closeModal();
  }
}

// ===== Utility Functions =====
function showAlert(message, type = 'info') {
  // Create alert element
  const alert = document.createElement('div');
  alert.className = `alert alert-${type}`;
  alert.textContent = message;
  alert.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 20px;
    background-color: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
    color: white;
    border-radius: 4px;
    z-index: 1000;
    animation: slideIn 0.3s ease-in-out;
  `;

  document.body.appendChild(alert);

  // Remove alert after 3 seconds
  setTimeout(() => {
    alert.style.animation = 'slideOut 0.3s ease-in-out';
    setTimeout(() => alert.remove(), 300);
  }, 3000);
}

async function checkServerHealth() {
  const health = await systemAPI.checkHealth();
  if (health && health.status === 'healthy') {
    console.log('Server is healthy ✓');
  } else {
    console.warn('Server may not be responding');
  }
}
