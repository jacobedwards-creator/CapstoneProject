import express from 'express';
import { 
  getCartByUserId, 
  createCart,
  getCartItems,
  addCartItem,
  updateCartItemQuantity,
  removeCartItem,
  clearCart,
  getCartTotal
} from '../database/queries/cart.queries.js';
import { getProductById } from '../database/queries/product.queries.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Require authentication for all cart routes
router.use(authMiddleware);

// Get user's cart
router.get('/', async (req, res) => {
  try {
    // Get cart or create if it doesn't exist
    let cart = await getCartByUserId(req.user.id);
    
    if (!cart) {
      cart = await createCart(req.user.id);
    }
    
    const cartItems = await getCartItems(cart.id);
    const total = await getCartTotal(cart.id);
    
    res.json({
      cart_id: cart.id,
      items: cartItems,
      total
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Add item to cart
router.post('/items', async (req, res) => {
  try {
    const { product_id, quantity = 1 } = req.body;
    
    // Validate product exists
    const product = await getProductById(product_id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Get cart or create if it doesn't exist
    let cart = await getCartByUserId(req.user.id);
    
    if (!cart) {
      cart = await createCart(req.user.id);
    }
    
    // Add item to cart
    const cartItem = await addCartItem({
      cart_id: cart.id,
      product_id,
      quantity
    });
    
    // Get updated cart items and total
    const cartItems = await getCartItems(cart.id);
    const total = await getCartTotal(cart.id);
    
    res.status(201).json({
      message: 'Item added to cart',
      cart_id: cart.id,
      items: cartItems,
      total
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Update cart item quantity
router.put('/items/:id', async (req, res) => {
  try {
    const { quantity } = req.body;
    const cartItemId = req.params.id;
    
    if (!quantity || quantity < 1) {
      return res.status(400).json({ error: 'Quantity must be at least 1' });
    }
    
    const updatedItem = await updateCartItemQuantity(cartItemId, quantity);
    
    if (!updatedItem) {
      return res.status(404).json({ error: 'Cart item not found' });
    }
    
    // Get user's cart to return updated cart data
    const cart = await getCartByUserId(req.user.id);
    const cartItems = await getCartItems(cart.id);
    const total = await getCartTotal(cart.id);
    
    res.json({
      message: 'Cart item updated',
      cart_id: cart.id,
      items: cartItems,
      total
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Remove item from cart
router.delete('/items/:id', async (req, res) => {
  try {
    const cartItemId = req.params.id;
    
    const removedItem = await removeCartItem(cartItemId);
    
    if (!removedItem) {
      return res.status(404).json({ error: 'Cart item not found' });
    }
    
    // Get user's cart to return updated cart data
    const cart = await getCartByUserId(req.user.id);
    const cartItems = await getCartItems(cart.id);
    const total = await getCartTotal(cart.id);
    
    res.json({
      message: 'Item removed from cart',
      cart_id: cart.id,
      items: cartItems,
      total
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Clear entire cart
router.delete('/', async (req, res) => {
  try {
    const cart = await getCartByUserId(req.user.id);
    
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }
    
    await clearCart(cart.id);
    
    res.json({
      message: 'Cart cleared',
      cart_id: cart.id,
      items: [],
      total: 0
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

export default router;