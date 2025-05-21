import { pool } from '../db.js';

export const getOrders = async (req, res) => {
    const user_id = req.user.id;
    
    try {
      const result = await pool.query(
        'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
        [user_id]
      );
      
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: 'Database error', details: err.message });
    }
  };
  

export const createOrder = async (orderData, client = pool) => {
  const { user_id, status, shipping_address, payment_method } = orderData;
  const result = await client.query(
    'INSERT INTO orders (user_id, status, shipping_address, payment_method, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING *',
    [user_id, status, shipping_address, payment_method]
  );
  return result.rows[0];
};

export const addOrderItem = async (orderItemData, client = pool) => {
  const { order_id, product_id, quantity, price } = orderItemData;
  const result = await client.query(
    'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4) RETURNING *',
    [order_id, product_id, quantity, price]
  );
  return result.rows[0];
};

export const getOrdersByUserId = async (userId) => {
  const result = await pool.query(
    'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  );
  return result.rows;
};

export const getOrderById = async (orderId, userId = null) => {
  let query = 'SELECT * FROM orders WHERE id = $1';
  const params = [orderId];
  
  if (userId) {
    query += ' AND user_id = $2';
    params.push(userId);
  }
  
  const result = await pool.query(query, params);
  return result.rows[0];
};

export const getOrderItems = async (orderId) => {
  const result = await pool.query(
    `SELECT oi.*, p.name as product_name, p.image_url 
     FROM order_items oi 
     JOIN products p ON oi.product_id = p.id 
     WHERE oi.order_id = $1`,
    [orderId]
  );
  return result.rows;
};

export const updateOrderStatus = async (orderId, status) => {
  const result = await pool.query(
    'UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
    [status, orderId]
  );
  return result.rows[0];
};

export const updateProductStock = async (productId, quantity, client = pool) => {
  const result = await client.query(
    'UPDATE products SET stock = stock - $1 WHERE id = $2 RETURNING *',
    [quantity, productId]
  );
  return result.rows[0];
};

export const getOrderSummary = async (orderId) => {
  const result = await pool.query(
    `SELECT 
       o.id, o.status, o.created_at, o.shipping_address, o.payment_method,
       u.username, u.email,
       SUM(oi.price * oi.quantity) as total_amount,
       COUNT(oi.id) as total_items
     FROM orders o
     JOIN users u ON o.user_id = u.id
     JOIN order_items oi ON o.id = oi.order_id
     WHERE o.id = $1
     GROUP BY o.id, o.status, o.created_at, o.shipping_address, o.payment_method, u.username, u.email`,
    [orderId]
  );
  return result.rows[0];
};