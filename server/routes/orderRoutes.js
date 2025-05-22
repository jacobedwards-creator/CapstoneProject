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
  
  // Update order status (admin only)
  router.patch('/:id/status', isAdmin, async (req, res) => {
    try {
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({ error: 'Status is required' });
      }
      
      const order = await getOrderById(req.params.id);
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
      
      const updatedOrder = await updateOrderStatus(req.params.id, status);
      res.json({ message: 'Order status updated', order: updatedOrder });
    } catch (err) {
      res.status(500).json({ error: 'Server error', details: err.message });
    }
  });
  
export default router;