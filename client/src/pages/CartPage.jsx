import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Button,
  Paper,
  CircularProgress,
  Breadcrumbs,
  Link,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Alert
} from '@mui/material';
import {
  Delete as DeleteIcon,
  ShoppingCart as ShoppingCartIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { getCart, updateCartItem, removeFromCart, clearCart } from '../utils/api';
import { toast } from 'react-toastify';
import CartItem from '../components/cart/CartItem';
import CartSummary from '../components/cart/CartSummary';

export default function CartPage() {
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [clearCartDialog, setClearCartDialog] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchCart();
  }, [isAuthenticated, navigate]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const cartData = await getCart();
      setCart(cartData);
    } catch (error) {
      console.error('Failed to load cart:', error);
      toast.error('Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    try {
      setUpdating(true);
      await updateCartItem(itemId, newQuantity);
      await fetchCart();
      toast.success('Cart updated!');
    } catch (error) {
      console.error('Failed to update cart:', error);
      toast.error('Failed to update cart');
    } finally {
      setUpdating(false);
    }
  };

  const handleRemoveItem = async (itemId, itemName) => {
    try {
      const item = cart.items.find(i => i.id === itemId);
      if (item && parseFloat(item.price || 0) * item.quantity > 100) {
        const confirmed = window.confirm(
          `Are you sure you want to remove "${itemName}" from your cart?`
        );
        if (!confirmed) return;
      }

      setUpdating(true);
      await removeFromCart(itemId);
      await fetchCart();
      toast.success('Item removed from cart');
    } catch (error) {
      console.error('Failed to remove item:', error);
      toast.error('Failed to remove item');
    } finally {
      setUpdating(false);
    }
  };

  const handleClearCart = async () => {
    setClearCartDialog(false);
    
    try {
      setUpdating(true);
      await clearCart();
      setCart({ items: [], total: 0 });
      toast.success('Cart cleared');
    } catch (error) {
      console.error('Failed to clear cart:', error);
      toast.error('Failed to clear cart');
    } finally {
      setUpdating(false);
    }
  };

  const handleToggleFavorite = (itemId, isFavorite) => {
    console.log(`Toggle favorite for item ${itemId}:`, isFavorite);
    toast.success(isFavorite ? 'Added to favorites' : 'Removed from favorites');
  };

  const handleApplyCoupon = (couponCode) => {
    console.log('Applying coupon:', couponCode);
    toast.success('Coupon applied successfully!');
  };

  // 🔧 PRICE FIX - Safe calculation functions
  const calculateSubtotal = () => {
    return cart.items.reduce((sum, item) => sum + (parseFloat(item.price || 0) * item.quantity), 0);
  };

  const calculateShipping = () => {
    const subtotal = calculateSubtotal();
    return subtotal > 50 ? 0 : 9.99;
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.08;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateShipping() + calculateTax();
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  if (cart.items.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Breadcrumbs sx={{ mb: 3 }}>
          <Link 
            color="inherit" 
            href="/" 
            onClick={(e) => { e.preventDefault(); navigate('/'); }}
            sx={{ cursor: 'pointer' }}
          >
            Home
          </Link>
          <Typography color="text.primary">Shopping Cart</Typography>
        </Breadcrumbs>

        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <ShoppingCartIcon sx={{ fontSize: 80, color: 'grey.400', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Your cart is empty
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Looks like you haven't added any items to your cart yet.
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/')}
          >
            Start Shopping
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link 
          color="inherit" 
          href="/" 
          onClick={(e) => { e.preventDefault(); navigate('/'); }}
          sx={{ cursor: 'pointer' }}
        >
          Home
        </Link>
        <Typography color="text.primary">Shopping Cart</Typography>
      </Breadcrumbs>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Shopping Cart ({cart.items.length} items)
        </Typography>
        <Button
          variant="outlined"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={() => setClearCartDialog(true)}
          disabled={updating}
        >
          Clear Cart
        </Button>
      </Box>

      {cart.items.some(item => item.stock === 0) && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Some items in your cart are out of stock. Please review your order before checkout.
        </Alert>
      )}

      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Box>
            {cart.items.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                onQuantityChange={handleQuantityChange}
                onRemove={handleRemoveItem}
                onToggleFavorite={handleToggleFavorite}
                updating={updating}
                showControls={true}
                readonly={false}
              />
            ))}
          </Box>

          <Box sx={{ mt: 3 }}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/')}
              size="large"
            >
              Continue Shopping
            </Button>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <CartSummary
            items={cart.items}
            subtotal={calculateSubtotal()}
            shipping={calculateShipping()}
            tax={calculateTax()}
            total={calculateTotal()}
            freeShippingThreshold={50}
            onApplyCoupon={handleApplyCoupon}
            showCheckoutButton={true}
            showCouponCode={true}
            checkoutButtonText="Proceed to Checkout"
            loading={updating}
          />
        </Grid>
      </Grid>

      <Dialog
        open={clearCartDialog}
        onClose={() => setClearCartDialog(false)}
      >
        <DialogTitle>Clear Shopping Cart?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to remove all items from your cart? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setClearCartDialog(false)}>
            Cancel
          </Button>
          <Button onClick={handleClearCart} color="error" variant="contained">
            Clear Cart
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}