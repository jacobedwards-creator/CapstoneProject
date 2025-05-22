import axios from 'axios';

// API base URL configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
            refreshToken
          });
          
          const { accessToken } = response.data;
          localStorage.setItem('accessToken', accessToken);
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Force logout if refresh fails
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// ==================== AUTH API CALLS ====================

export const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

export const register = async (username, email, password) => {
  const response = await api.post('/auth/register', { username, email, password });
  return response.data;
};

export const logout = async (refreshToken) => {
  const response = await api.post('/auth/logout', { refreshToken });
  return response.data;
};

// ==================== PRODUCT API CALLS ====================

export const getAllProducts = async () => {
  const response = await api.get('/products');
  return response.data;
};

export const getProductById = async (id) => {
  const response = await api.get(`/products/${id}`);
  return response.data;
};

export const searchProducts = async (searchTerm) => {
  const response = await api.get(`/products/search/${encodeURIComponent(searchTerm)}`);
  return response.data;
};

export const getProductsByCategory = async (category) => {
  const response = await api.get(`/products/category/${encodeURIComponent(category)}`);
  return response.data;
};

// Admin Product API calls
export const createProduct = async (productData) => {
  const response = await api.post('/products', productData);
  return response.data;
};

export const updateProduct = async (id, productData) => {
  const response = await api.put(`/products/${id}`, productData);
  return response.data;
};

export const deleteProduct = async (id) => {
  const response = await api.delete(`/products/${id}`);
  return response.data;
};

// ==================== CART API CALLS ====================

export const getCart = async () => {
  const response = await api.get('/cart');
  return response.data;
};

export const addToCart = async (productId, quantity = 1) => {
  const response = await api.post('/cart/items', {
    product_id: productId,
    quantity
  });
  return response.data;
};

export const updateCartItem = async (itemId, quantity) => {
  const response = await api.put(`/cart/items/${itemId}`, { quantity });
  return response.data;
};

export const removeFromCart = async (itemId) => {
  const response = await api.delete(`/cart/items/${itemId}`);
  return response.data;
};

export const clearCart = async () => {
  const response = await api.delete('/cart');
  return response.data;
};

// ==================== ORDER API CALLS ====================

export const getOrders = async () => {
  const response = await api.get('/orders');
  return response.data;
};

export const getOrderById = async (orderId) => {
  const response = await api.get(`/orders/${orderId}`);
  return response.data;
};

export const createOrder = async (orderData) => {
  try {
    console.log('Creating order with data:', orderData);
    const response = await api.post('/orders', orderData);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Create order error:', error);
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to create order'
    };
  }
};

export const cancelOrder = async (orderId) => {
  const response = await api.patch(`/orders/${orderId}/cancel`);
  return response.data;
};

// ==================== REVIEW API CALLS ====================

export const getProductReviews = async (productId) => {
  const response = await api.get(`/reviews/product/${productId}`);
  return response.data;
};

export const createReview = async (reviewData) => {
  const response = await api.post('/reviews', reviewData);
  return response.data;
};

// ==================== USER PROFILE API CALLS ====================

export const getUserProfile = async () => {
  const response = await api.get('/users/profile');
  return response.data;
};

export const updateUserProfile = async (userData) => {
  const response = await api.put('/users/profile', userData);
  return response.data;
};

export const changePassword = async (passwordData) => {
  const response = await api.put('/users/change-password', passwordData);
  return response.data;
};

export const changeEmail = async (emailData) => {
  const response = await api.put('/users/change-email', emailData);
  return response.data;
};

// ==================== ADMIN API CALLS ====================

// Admin Stats
export const getAdminStats = async () => {
  const response = await api.get('/admin/stats');
  return response.data;
};

// Admin User Management
export const getAllUsers = async () => {
  const response = await api.get('/admin/users');
  return response.data;
};

export const getUserById = async (userId) => {
  const response = await api.get(`/admin/users/${userId}`);
  return response.data;
};

export const updateUser = async (userId, userData) => {
  const response = await api.put(`/admin/users/${userId}`, userData);
  return response.data;
};

export const promoteUser = async (userId, isAdmin) => {
  const response = await api.patch(`/admin/users/${userId}/promote`, { is_admin: isAdmin });
  return response.data;
};

export const deleteUser = async (userId) => {
  const response = await api.delete(`/admin/users/${userId}`);
  return response.data;
};

export const updateUserStatus = async (userId, status) => {
  const response = await api.patch(`/admin/users/${userId}/status`, { status });
  return response.data;
};

// Admin Order Management
export const getAllOrders = async () => {
  const response = await api.get('/admin/orders');
  return response.data;
};

export const getAdminOrderById = async (orderId) => {
  const response = await api.get(`/admin/orders/${orderId}`);
  return response.data;
};

export const updateOrderStatus = async (orderId, status) => {
  const response = await api.patch(`/orders/${orderId}/status`, { status });
  return response.data;
};

// Admin Category Management
export const getAllCategories = async () => {
  const response = await api.get('/admin/categories');
  return response.data;
};

export const createCategory = async (categoryData) => {
  const response = await api.post('/admin/categories', categoryData);
  return response.data;
};

export const updateCategory = async (categoryId, categoryData) => {
  const response = await api.put(`/admin/categories/${categoryId}`, categoryData);
  return response.data;
};

export const deleteCategory = async (categoryId) => {
  const response = await api.delete(`/admin/categories/${categoryId}`);
  return response.data;
};

// Search and Filter Functions for Admin
export const searchOrders = async (searchTerm, statusFilter) => {
  const params = new URLSearchParams();
  if (searchTerm) params.append('search', searchTerm);
  if (statusFilter && statusFilter !== 'all') params.append('status', statusFilter);
  
  const response = await api.get(`/admin/orders/search?${params}`);
  return response.data;
};

export const searchUsers = async (searchTerm) => {
  const response = await api.get(`/admin/users/search?q=${encodeURIComponent(searchTerm)}`);
  return response.data;
};

export const getOrdersByStatus = async (status) => {
  const response = await api.get(`/admin/orders/status/${status}`);
  return response.data;
};

// Advanced Admin Analytics
export const getRevenueByPeriod = async (period = 'month') => {
  const response = await api.get(`/admin/analytics/revenue?period=${period}`);
  return response.data;
};

export const getTopProducts = async (limit = 10) => {
  const response = await api.get(`/admin/analytics/top-products?limit=${limit}`);
  return response.data;
};

export const getUserGrowth = async (period = 'month') => {
  const response = await api.get(`/admin/analytics/user-growth?period=${period}`);
  return response.data;
};

export default api;