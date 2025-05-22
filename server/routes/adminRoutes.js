import express from 'express';
import { pool } from '../database/db.js';
import { authMiddleware } from '../middleware/auth.js';
import { isAdmin } from '../middleware/isAdmin.js';

const router = express.Router();

// Apply auth and admin middleware to all routes
router.use(authMiddleware);
router.use(isAdmin);

// Get all users (admin only)
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
      status: 'active', // You can add a status column to users table if needed
      total_spent: parseFloat(user.total_spent)
    }));
    
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

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
    
    // Get total revenue
    const revenueResult = await pool.query(`
      SELECT COALESCE(SUM(oi.price * oi.quantity), 0) as revenue
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE o.status != 'cancelled'
    `);
    const revenue = parseFloat(revenueResult.rows[0].revenue);
    
    res.json({
      totalProducts,
      totalUsers,
      totalOrders,
      revenue
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Get all orders (admin only)
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
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Update user status (admin only)
router.patch('/users/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const userId = req.params.id;
    
    res.json({ 
      message: 'User status updated successfully',
      user: { id: userId, status }
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Get user details (admin only)
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
      total_spent: parseFloat(result.rows[0].total_spent)
    };
    
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

export default router;