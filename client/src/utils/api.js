import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const getAllProducts = async () => {
  const response = await axios.get(`${API_BASE_URL}/products`);
  return response.data;
};

export const getProductById = async (id) => {
  const response = await axios.get(`${API_BASE_URL}/products/${id}`);
  return response.data;
};

export const getProductsByCategory = async (category) => {
  const response = await axios.get(`${API_BASE_URL}/products/category/${category}`);
  return response.data;
};

export const searchProducts = async (searchTerm) => {
  const response = await axios.get(`${API_BASE_URL}/products/search/${encodeURIComponent(searchTerm)}`);
  return response.data;
};

// Cart API
export const getCart = async () => {
  const response = await axios.get(`${API_BASE_URL}/cart`);
  return response.data;
};

export const addToCart = async (productId, quantity) => {
  const response = await axios.post(`${API_BASE_URL}/cart/items`, {
    product_id: productId,
    quantity
  });
  return response.data;
};

export const updateCartItem = async (itemId, quantity) => {
  const response = await axios.put(`${API_BASE_URL}/cart/items/${itemId}`, {
    quantity
  });
  return response.data;
};

export const removeFromCart = async (itemId) => {
  const response = await axios.delete(`${API_BASE_URL}/cart/items/${itemId}`);
  return response.data;
};

export const clearCart = async () => {
  const response = await axios.delete(`${API_BASE_URL}/cart`);
  return response.data;
};

// Orders API
export const getOrders = async () => {
  const response = await axios.get(`${API_BASE_URL}/orders`);
  return response.data;
};

export const getOrderById = async (orderId) => {
  const response = await axios.get(`${API_BASE_URL}/orders/${orderId}`);
  return response.data;
};

export const createOrder = async (orderData) => {
  const response = await axios.post(`${API_BASE_URL}/orders`, orderData);
  return response.data;
};

// Reviews API
export const getProductReviews = async (productId) => {
  const response = await axios.get(`${API_BASE_URL}/reviews/product/${productId}`);
  return response.data;
};

export const getAverageRating = async (productId) => {
  const response = await axios.get(`${API_BASE_URL}/reviews/product/${productId}/rating`);
  return response.data;
};

export const createReview = async (productId, rating, comment) => {
  const response = await axios.post(`${API_BASE_URL}/reviews`, {
    product_id: productId,
    rating,
    comment
  });
  return response.data;
};

export const getUserReviews = async () => {
  const response = await axios.get(`${API_BASE_URL}/reviews/my-reviews`);
  return response.data;
};

// User API
export const getUserProfile = async () => {
  const response = await axios.get(`${API_BASE_URL}/users/profile`);
  return response.data;
};

export const updateUserProfile = async (userData) => {
  const response = await axios.put(`${API_BASE_URL}/users/profile`, userData);
  return response.data;
};

export const changePassword = async (currentPassword, newPassword) => {
  const response = await axios.put(`${API_BASE_URL}/users/password`, {
    currentPassword,
    newPassword
  });
  return response.data;
};