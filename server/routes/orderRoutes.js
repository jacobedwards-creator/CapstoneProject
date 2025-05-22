import express from 'express';
import { pool } from '../database/db.js';
import { 
    createOrder, 
    getOrders,
    getOrderById,
    addOrderItem,
    getOrdersByUserId,
    getOrderItems,
    updateOrderStatus,
    updateProductStock,
    getOrderSummary
} from '../database/queries/order.queries.js';
import { getProductById, checkProductAvailability } from '../database/queries/product.queries.js';
import { isAdmin } from '../middleware/isAdmin.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

// Get all orders for authenticated user
router.get('/', async (req, res) => {
    try {
      const orders = await getOrdersByUserId(req.user.id);
      res.json(orders);
    } catch (err) {
      res.status(500).json({ error: 'Server error', details: err.message });
    }
  });
  
  // Get specific order by ID
  router.get('/:id', async (req, res) => {
    try {
      const order = await getOrderById(req.params.id, req.user.id);
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
      
      const orderItems = await getOrderItems(order.id);
      res.json({ ...order, items: orderItems });
    } catch (err) {
      res.status(500).json({ error: 'Server error', details: err.message });
    }
  });
  
  // Get order summary
  router.get('/:id/summary', async (req, res) => {
    try {
      // Admin can view any order, regular users can only view their own
      let order;
      if (req.user.is_admin) {
        order = await getOrderById(req.params.id);
      } else {
        order = await getOrderById(req.params.id, req.user.id);
      }
      
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
      
      const summary = await getOrderSummary(order.id);
      res.json(summary);
    } catch (err) {
      res.status(500).json({ error: 'Server error', details: err.message });
    }
  });
  
  // Create a new order
  router.post('/', async (req, res) => {
    const { items, shipping_address, payment_method } = req.body;
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Create order
      const orderData = {
        user_id: req.user.id,
        status: 'pending',
        shipping_address,
        payment_method
      };
      
      const order = await createOrder(orderData, client);
      
      // Add order items and update stock
      for (const item of items) {
        // Check if product exists and has enough stock
        const product = await getProductById(item.product_id);
        if (!product) {
          throw new Error(`Product with ID ${item.product_id} not found`);
        }
        
        const isAvailable = await checkProductAvailability(item.product_id, item.quantity);
        if (!isAvailable) {
          throw new Error(`Insufficient stock for product ID ${item.product_id}`);
        }
        
        // Add item to order
        const orderItem = {
          order_id: order.id,
          product_id: item.product_id,
          quantity: item.quantity,
          price: product.price
        };
        
        await addOrderItem(orderItem, client);
        
        // Update product stock
        await updateProductStock(item.product_id, item.quantity, client);
      }
      
      await client.query('COMMIT');
      
      // Get order items for response
      const orderItems = await getOrderItems(order.id);
      
      res.status(201).json({
        success: true,
        message: 'Order created successfully',
        order: { ...order, items: orderItems }
      });
    } catch (err) {
      await client.query('ROLLBACK');
      res.status(400).json({ error: err.message });
    } finally {
      client.release();
    }
  });

  // Cancel order (user can cancel their own orders in pending/processing status)
  router.patch('/:id/cancel', async (req, res) => {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const orderId = req.params.id;
      
      // Get the order to verify ownership and status
      const order = await getOrderById(orderId, req.user.id);
      
      if (!order) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Order not found' });
      }
      
      // Check if order can be cancelled
      if (!['pending', 'processing'].includes(order.status)) {
        await client.query('ROLLBACK');
        return res.status(400).json({ 
          error: 'Order cannot be cancelled. Only pending or processing orders can be cancelled.' 
        });
      }
      
      // Update order status to cancelled and update timestamp
      const result = await client.query(`
        UPDATE orders 
        SET status = 'cancelled', updated_at = NOW() 
        WHERE id = $1 
        RETURNING *
      `, [orderId]);
      
      if (result.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(500).json({ error: 'Failed to cancel order' });
      }
      
      // Restore product stock
      const orderItems = await getOrderItems(orderId);
      for (const item of orderItems) {
        // Restore stock by adding back the quantity
        await client.query(
          'UPDATE products SET stock = stock + $1 WHERE id = $2',
          [item.quantity, item.product_id]
        );
      }
      
      await client.query('COMMIT');
      
      res.json({ 
        success: true, 
        message: 'Order cancelled successfully',
        order: result.rows[0]
      });
      
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('Cancel order error:', err);
      res.status(500).json({ error: 'Server error', details: err.message });
    } finally {
      client.release();
    }
  });
  
  // Update order status (admin only or for specific transitions)
  router.patch('/:id/status', async (req, res) => {
    try {
      const { status } = req.body;
      const orderId = req.params.id;
      
      if (!status) {
        return res.status(400).json({ error: 'Status is required' });
      }

      // Validate status values
      const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status value' });
      }
      
      // Get the current order
      let order;
      if (req.user.is_admin) {
        // Admin can update any order
        order = await getOrderById(orderId);
      } else {
        // Regular users can only update their own orders (limited transitions)
        order = await getOrderById(orderId, req.user.id);
        
        // Users can only cancel pending/processing orders
        if (status === 'cancelled' && !['pending', 'processing'].includes(order.status)) {
          return res.status(400).json({ 
            error: 'You can only cancel pending or processing orders' 
          });
        }
        
        // Users cannot set other statuses
        if (status !== 'cancelled') {
          return res.status(403).json({ 
            error: 'Only administrators can update order status to this value' 
          });
        }
      }
      
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      // Prevent invalid status transitions
      const currentStatus = order.status;
      const invalidTransitions = {
        'delivered': ['pending', 'processing', 'shipped'], // Can't go back from delivered
        'cancelled': ['pending', 'processing', 'shipped', 'delivered'] // Can't change from cancelled
      };

      if (invalidTransitions[currentStatus] && invalidTransitions[currentStatus].includes(status)) {
        return res.status(400).json({ 
          error: `Cannot change order status from ${currentStatus} to ${status}` 
        });
      }

      // Handle stock restoration for cancellations
      if (status === 'cancelled' && currentStatus !== 'cancelled') {
        const client = await pool.connect();
        try {
          await client.query('BEGIN');
          
          // Update order status
          const result = await client.query(`
            UPDATE orders 
            SET status = $1, updated_at = NOW() 
            WHERE id = $2 
            RETURNING *
          `, [status, orderId]);

          // Restore product stock
          const orderItems = await getOrderItems(orderId);
          for (const item of orderItems) {
            await client.query(
              'UPDATE products SET stock = stock + $1 WHERE id = $2',
              [item.quantity, item.product_id]
            );
          }

          await client.query('COMMIT');
          
          res.json({ 
            success: true,
            message: 'Order cancelled and stock restored', 
            order: result.rows[0] 
          });
        } catch (err) {
          await client.query('ROLLBACK');
          throw err;
        } finally {
          client.release();
        }
      } else {
        // Regular status update without stock changes
        const result = await pool.query(`
          UPDATE orders 
          SET status = $1, updated_at = NOW() 
          WHERE id = $2 
          RETURNING *
        `, [status, orderId]);

        if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Order not found' });
        }

        res.json({ 
          success: true,
          message: 'Order status updated successfully', 
          order: result.rows[0] 
        });
      }
      
    } catch (err) {
      console.error('Order status update error:', err);
      res.status(500).json({ error: 'Server error', details: err.message });
    }
  });

  // Get orders by status (admin only)
  router.get('/status/:status', isAdmin, async (req, res) => {
    try {
      const { status } = req.params;
      
      const result = await pool.query(`
        SELECT o.*, u.username, u.email,
               COUNT(oi.id) as item_count,
               SUM(oi.price * oi.quantity) as total_amount
        FROM orders o
        JOIN users u ON o.user_id = u.id
        LEFT JOIN order_items oi ON o.id = oi.order_id
        WHERE o.status = $1
        GROUP BY o.id, u.username, u.email
        ORDER BY o.created_at DESC
      `, [status]);
      
      res.json(result.rows);
    } catch (err) {
      console.error('Orders by status fetch error:', err);
      res.status(500).json({ error: 'Server error', details: err.message });
    }
  });

  // Search orders (admin only)
  router.get('/search', isAdmin, async (req, res) => {
    try {
      const { search, status } = req.query;
      
      let query = `
        SELECT o.*, u.username, u.email,
               COUNT(oi.id) as item_count,
               SUM(oi.price * oi.quantity) as total_amount
        FROM orders o
        JOIN users u ON o.user_id = u.id
        LEFT JOIN order_items oi ON o.id = oi.order_id
        WHERE 1=1
      `;
      
      const params = [];
      let paramCount = 0;

      if (search) {
        paramCount++;
        query += ` AND (
          o.id::text ILIKE $${paramCount} OR 
          u.username ILIKE $${paramCount} OR 
          u.email ILIKE $${paramCount}
        )`;
        params.push(`%${search}%`);
      }

      if (status && status !== 'all') {
        paramCount++;
        query += ` AND o.status = $${paramCount}`;
        params.push(status);
      }

      query += ` GROUP BY o.id, u.username, u.email ORDER BY o.created_at DESC`;
      
      const result = await pool.query(query, params);
      res.json(result.rows);
    } catch (err) {
      console.error('Order search error:', err);
      res.status(500).json({ error: 'Server error', details: err.message });
    }
  });
  
export default router;