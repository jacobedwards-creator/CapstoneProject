import express from 'express';
import { pool } from '../database/db.js';
import { authMiddleware } from '../middleware/auth.js';
import { isAdmin } from '../middleware/isAdmin.js';

const router = express.Router();

// Apply auth and admin middleware to all routes
router.use(authMiddleware);
router.use(isAdmin);

// ==================== STATS ENDPOINTS ====================

// Get admin dashboard stats
router.get('/stats', async (req, res) => {
  try {
    // Get total products
    const productsResult = await pool.query('SELECT COUNT(*) as count FROM products');
    const totalProducts = parseInt(productsResult.rows[0].count);
    
    // Get total users
    const usersResult = await pool.query('SELECT COUNT(*) as count FROM users');
    const totalUsers = parseInt(usersResult.rows[0].count);
    
    // Get total orders
    const ordersResult = await pool.query('SELECT COUNT(*) as count FROM orders');
    const totalOrders = parseInt(ordersResult.rows[0].count);
    
    // Get total revenue from completed orders
    const revenueResult = await pool.query(`
      SELECT COALESCE(SUM(oi.price * oi.quantity), 0) as revenue
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE o.status IN ('delivered', 'shipped', 'processing', 'pending')
    `);
    const revenue = parseFloat(revenueResult.rows[0].revenue);
    
    res.json({
      totalProducts,
      totalUsers,
      totalOrders,
      revenue
    });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// ==================== USER MANAGEMENT ====================

// Get all users with stats
router.get('/users', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT u.id, u.username, u.email, u.is_admin, u.created_at,
             COUNT(DISTINCT o.id) as orders_count,
             COALESCE(SUM(oi.price * oi.quantity), 0) as total_spent
      FROM users u
      LEFT JOIN orders o ON u.id = o.user_id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      GROUP BY u.id, u.username, u.email, u.is_admin, u.created_at
      ORDER BY u.created_at DESC
    `);
    
    const users = result.rows.map(user => ({
      ...user,
      role: user.is_admin ? 'admin' : 'user',
      status: 'active',
      total_spent: parseFloat(user.total_spent),
      orders_count: parseInt(user.orders_count)
    }));
    
    res.json(users);
  } catch (err) {
    console.error('Users fetch error:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Get user details by ID
router.get('/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    
    const result = await pool.query(`
      SELECT u.id, u.username, u.email, u.is_admin, u.created_at,
             COUNT(DISTINCT o.id) as orders_count,
             COALESCE(SUM(oi.price * oi.quantity), 0) as total_spent
      FROM users u
      LEFT JOIN orders o ON u.id = o.user_id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE u.id = $1
      GROUP BY u.id, u.username, u.email, u.is_admin, u.created_at
    `, [userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = {
      ...result.rows[0],
      role: result.rows[0].is_admin ? 'admin' : 'user',
      status: 'active',
      total_spent: parseFloat(result.rows[0].total_spent),
      orders_count: parseInt(result.rows[0].orders_count)
    };
    
    res.json(user);
  } catch (err) {
    console.error('User details fetch error:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Update user details
router.put('/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const { username, email, is_admin } = req.body;
    
    const result = await pool.query(`
      UPDATE users 
      SET username = $1, email = $2, is_admin = $3
      WHERE id = $4
      RETURNING id, username, email, is_admin, created_at
    `, [username, email, is_admin, userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ 
      success: true, 
      message: 'User updated successfully',
      user: result.rows[0] 
    });
  } catch (err) {
    console.error('User update error:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Promote/demote user admin status
router.patch('/users/:id/promote', async (req, res) => {
  try {
    const userId = req.params.id;
    const { is_admin } = req.body;
    
    const result = await pool.query(`
      UPDATE users 
      SET is_admin = $1
      WHERE id = $2
      RETURNING id, username, email, is_admin
    `, [is_admin, userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ 
      success: true, 
      message: `User ${is_admin ? 'promoted to' : 'demoted from'} admin successfully`,
      user: result.rows[0] 
    });
  } catch (err) {
    console.error('User promotion error:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Delete user
router.delete('/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Check if user exists and is not the current admin
    if (parseInt(userId) === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }
    
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id, username', [userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ 
      success: true, 
      message: 'User deleted successfully',
      user: result.rows[0] 
    });
  } catch (err) {
    console.error('User deletion error:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// ==================== ORDER MANAGEMENT ====================

// Get all orders with customer info
router.get('/orders', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT o.*, u.username, u.email,
             COUNT(oi.id) as item_count,
             SUM(oi.price * oi.quantity) as total_amount
      FROM orders o
      JOIN users u ON o.user_id = u.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      GROUP BY o.id, u.username, u.email
      ORDER BY o.created_at DESC
    `);
    
    res.json(result.rows);
  } catch (err) {
    console.error('Orders fetch error:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Get order details by ID (admin can view any order)
router.get('/orders/:id', async (req, res) => {
  try {
    const orderId = req.params.id;
    
    // Get order details
    const orderResult = await pool.query(`
      SELECT o.*, u.username, u.email
      FROM orders o
      JOIN users u ON o.user_id = u.id
      WHERE o.id = $1
    `, [orderId]);
    
    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Get order items
    const itemsResult = await pool.query(`
      SELECT oi.*, p.name as product_name, p.image_url
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = $1
    `, [orderId]);
    
    const order = {
      ...orderResult.rows[0],
      items: itemsResult.rows
    };
    
    res.json(order);
  } catch (err) {
    console.error('Order details fetch error:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// ==================== CATEGORY MANAGEMENT ====================

// Get all categories
router.get('/categories', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.*, COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON c.name = p.category
      GROUP BY c.id, c.name, c.description
      ORDER BY c.name
    `);
    
    res.json(result.rows);
  } catch (err) {
    console.error('Categories fetch error:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Create category
router.post('/categories', async (req, res) => {
  try {
    const { name, description } = req.body;
    
    const result = await pool.query(`
      INSERT INTO categories (name, description)
      VALUES ($1, $2)
      RETURNING *
    `, [name, description]);
    
    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      category: result.rows[0]
    });
  } catch (err) {
    console.error('Category creation error:', err);
    if (err.code === '23505') { // Unique violation
      res.status(400).json({ error: 'Category name already exists' });
    } else {
      res.status(500).json({ error: 'Server error', details: err.message });
    }
  }
});

// Update category
router.put('/categories/:id', async (req, res) => {
  try {
    const categoryId = req.params.id;
    const { name, description } = req.body;
    
    const result = await pool.query(`
      UPDATE categories
      SET name = $1, description = $2
      WHERE id = $3
      RETURNING *
    `, [name, description, categoryId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    res.json({
      success: true,
      message: 'Category updated successfully',
      category: result.rows[0]
    });
  } catch (err) {
    console.error('Category update error:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Delete category
router.delete('/categories/:id', async (req, res) => {
  try {
    const categoryId = req.params.id;
    
    // Check if category is being used by products
    const usageCheck = await pool.query(`
      SELECT COUNT(*) as count
      FROM products p
      JOIN categories c ON p.category = c.name
      WHERE c.id = $1
    `, [categoryId]);
    
    if (parseInt(usageCheck.rows[0].count) > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete category that is being used by products' 
      });
    }
    
    const result = await pool.query('DELETE FROM categories WHERE id = $1 RETURNING *', [categoryId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    res.json({
      success: true,
      message: 'Category deleted successfully',
      category: result.rows[0]
    });
  } catch (err) {
    console.error('Category deletion error:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

export default router;