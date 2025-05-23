import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Divider,
  Stack,
  Alert,
  Chip,
  LinearProgress,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  ShoppingCart as ShoppingCartIcon,
  LocalShipping as ShippingIcon,
  Security as SecurityIcon,
  Discount as DiscountIcon,
  Info as InfoIcon
} from '@mui/icons-material';

export default function CartSummary({
  items = [],
  subtotal = 0,
  shipping = 0,
  tax = 0,
  discount = 0,
  total = 0,
  freeShippingThreshold = 50,
  onCheckout,
  onApplyCoupon,
  checkoutButtonText = "Proceed to Checkout",
  showCheckoutButton = true,
  showCouponCode = true,
  isCheckoutPage = false,
  loading = false
}) {
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = React.useState('');
  const [couponError, setCouponError] = React.useState('');

  // 🔧 PRICE FIX - Calculate item count and totals safely
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const freeShippingProgress = Math.min((subtotal / freeShippingThreshold) * 100, 100);
  const amountForFreeShipping = Math.max(freeShippingThreshold - subtotal, 0);
  const qualifiesForFreeShipping = subtotal >= freeShippingThreshold;

  const handleCheckout = () => {
    if (onCheckout) {
      onCheckout();
    } else {
      navigate('/checkout');
    }
  };

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }

    if (onApplyCoupon) {
      onApplyCoupon(couponCode.trim());
    } else {
      const validCoupons = {
        'SAVE10': { type: 'percentage', value: 10, description: '10% off' },
        'WELCOME': { type: 'fixed', value: 5, description: '$5 off' },
        'FREESHIP': { type: 'shipping', value: 0, description: 'Free shipping' }
      };

      if (validCoupons[couponCode.toUpperCase()]) {
        setCouponError('');
        console.log('Coupon applied:', couponCode);
      } else {
        setCouponError('Invalid coupon code');
      }
    }
  };

  return (
    <Card sx={{ position: 'sticky', top: 24 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <ShoppingCartIcon color="primary" />
          <Typography variant="h6">
            Order Summary
          </Typography>
          {itemCount > 0 && (
            <Chip 
              label={`${itemCount} item${itemCount !== 1 ? 's' : ''}`} 
              size="small" 
              color="primary"
            />
          )}
        </Box>

        <Divider sx={{ mb: 2 }} />

        <Stack spacing={2}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography>Subtotal:</Typography>
            <Typography fontWeight="medium">${subtotal.toFixed(2)}</Typography>
          </Box>

          {discount > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', color: 'success.main' }}>
              <Typography>Discount:</Typography>
              <Typography fontWeight="medium">-${discount.toFixed(2)}</Typography>
            </Box>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography>Shipping:</Typography>
              {shipping === 0 && subtotal > 0 && (
                <Tooltip title="Free shipping applied">
                  <ShippingIcon fontSize="small" color="success" />
                </Tooltip>
              )}
            </Box>
            <Typography fontWeight="medium">
              {shipping === 0 ? 'Free' : `${shipping.toFixed(2)}`}
            </Typography>
          </Box>

          {!qualifiesForFreeShipping && subtotal > 0 && (
            <Alert 
              severity="info" 
              icon={<ShippingIcon />}
              sx={{ py: 1 }}
            >
              <Box>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Add ${amountForFreeShipping.toFixed(2)} more for free shipping
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={freeShippingProgress}
                  sx={{ height: 6, borderRadius: 3 }}
                />
              </Box>
            </Alert>
          )}

          {qualifiesForFreeShipping && shipping === 0 && subtotal > 0 && (
            <Alert severity="success" icon={<ShippingIcon />}>
              <Typography variant="body2">
                🎉 You qualify for free shipping!
              </Typography>
            </Alert>
          )}

          {tax > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography>Tax:</Typography>
                <Tooltip title="Tax calculated based on shipping address">
                  <InfoIcon fontSize="small" color="action" />
                </Tooltip>
              </Box>
              <Typography fontWeight="medium">${tax.toFixed(2)}</Typography>
            </Box>
          )}

          <Divider />

          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="h6">Total:</Typography>
            <Typography variant="h6" color="primary" fontWeight="bold">
              ${total.toFixed(2)}
            </Typography>
          </Box>

          {!isCheckoutPage && subtotal > 0 && (
            <Box sx={{ textAlign: 'center', py: 1 }}>
              <Typography variant="body2" color="text.secondary">
                📦 Estimated delivery: 3-5 business days
              </Typography>
            </Box>
          )}
        </Stack>

        {showCouponCode && !isCheckoutPage && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <DiscountIcon fontSize="small" />
              Promo Code
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <input
                type="text"
                value={couponCode}
                onChange={(e) => {
                  setCouponCode(e.target.value);
                  setCouponError('');
                }}
                placeholder="Enter coupon code"
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  border: `1px solid ${couponError ? '#f44336' : '#ddd'}`,
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
              <Button
                variant="outlined"
                size="small"
                onClick={handleApplyCoupon}
                disabled={!couponCode.trim()}
              >
                Apply
              </Button>
            </Box>
            {couponError && (
              <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                {couponError}
              </Typography>
            )}
            
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Try: SAVE10, WELCOME, or FREESHIP
            </Typography>
          </Box>
        )}

        {showCheckoutButton && (
          <Button
            variant="contained"
            fullWidth
            size="large"
            sx={{ mt: 3 }}
            onClick={handleCheckout}
            disabled={loading || itemCount === 0}
            startIcon={loading ? undefined : <ShoppingCartIcon />}
          >
            {loading ? 'Processing...' : checkoutButtonText}
          </Button>
        )}

        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <SecurityIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
          <Typography variant="caption" color="text.secondary">
            Secure checkout guaranteed
          </Typography>
        </Box>

        {!isCheckoutPage && (
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
              We accept:
            </Typography>
            {!isCheckoutPage && (
  <Box sx={{ mt: 2, textAlign: 'center' }}>
    <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
      We accept:
    </Typography>
    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, opacity: 0.7 }}>
      <Typography variant="caption" sx={{ px: 1, py: 0.5, border: '1px solid #ddd', borderRadius: 1 }}>
        VISA
      </Typography>
      <Typography variant="caption" sx={{ px: 1, py: 0.5, border: '1px solid #ddd', borderRadius: 1 }}>
        MC
      </Typography>
      <Typography variant="caption" sx={{ px: 1, py: 0.5, border: '1px solid #ddd', borderRadius: 1 }}>
        PayPal
      </Typography>
      <Typography variant="caption" sx={{ px: 1, py: 0.5, border: '1px solid #ddd', borderRadius: 1 }}>
        Apple Pay
      </Typography>
    </Box>
  </Box>
)}
          </Box>
        )}

        {!isCheckoutPage && (
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="caption">
            30-day money-back guarantee
            </Typography>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}