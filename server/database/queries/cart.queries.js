import { pool } from '../db.js';

export const getCartByUserId = async (userId) => {
  const result = await pool.query(
    'SELECT * FROM carts WHERE user_id = $1',
    [userId]
  );
  return result.rows[0];
};

export const createCart = async (userId) => {
  const result = await pool.query(
    'INSERT INTO carts (user_id) VALUES ($1) RETURNING *',
    [userId]
  );
  return result.rows[0];
};

export const getCartItems = async (cartId) => {
  const result = await pool.query(
    `SELECT ci.*, p.name, p.price, p.image_url 
     FROM cart_items ci
     JOIN products p ON ci.product_id = p.id
     WHERE ci.cart_id = $1`,
    [cartId]
  );
  return result.rows;
};

export const addCartItem = async (cartData) => {
  const { cart_id, product_id, quantity } = cartData;
  
  // Check if item already exists in cart
  const existingItem = await pool.query(
    'SELECT * FROM cart_items WHERE cart_id = $1 AND product_id = $2',
    [cart_id, product_id]
  );
  
  if (existingItem.rows.length > 0) {
    // Update quantity if item exists
    const result = await pool.query(
      'UPDATE cart_items SET quantity = quantity + $1 WHERE cart_id = $2 AND product_id = $3 RETURNING *',
      [quantity, cart_id, product_id]
    );
    return result.rows[0];
  } else {
    // Add new item if it doesn't exist
    const result = await pool.query(
      'INSERT INTO cart_items (cart_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING *',
      [cart_id, product_id, quantity]
    );
    return result.rows[0];
  }
};

export const updateCartItemQuantity = async (cartItemId, quantity) => {
  const result = await pool.query(
    'UPDATE cart_items SET quantity = $1 WHERE id = $2 RETURNING *',
    [quantity, cartItemId]
  );
  return result.rows[0];
};

export const removeCartItem = async (cartItemId) => {
  const result = await pool.query(
    'DELETE FROM cart_items WHERE id = $1 RETURNING *',
    [cartItemId]
  );
  return result.rows[0];
};

export const clearCart = async (cartId) => {
  const result = await pool.query(
    'DELETE FROM cart_items WHERE cart_id = $1',
    [cartId]
  );
  return result.rowCount > 0;
};

export const getCartTotal = async (cartId) => {
  const result = await pool.query(
    `SELECT SUM(p.price * ci.quantity) as total
     FROM cart_items ci
     JOIN products p ON ci.product_id = p.id
     WHERE ci.cart_id = $1`,
    [cartId]
  );
  return result.rows[0].total || 0;
};