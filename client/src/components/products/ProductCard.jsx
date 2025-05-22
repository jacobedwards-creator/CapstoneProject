import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardMedia, 
  CardActions, 
  Typography, 
  Button, 
  Box, 
  Rating,
  Chip, 
  IconButton, 
  Tooltip, 
  Snackbar, 
  Alert
} from '@mui/material';
import {
  AddShoppingCart as AddShoppingCartIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

export default function ProductCard({ product, onAddToCart, averageRating = 0, reviewCount = 0 }) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    
    if (!isAuthenticated) {
      setAlertMessage('Please login to add items to cart');
      setShowAlert(true);
      return;
    }

    try {
      await onAddToCart(product.id, 1);
      setAlertMessage('Added to cart!');
      setShowAlert(true);
    } catch (error) {
      setAlertMessage('Failed to add to cart');
      setShowAlert(true);
    }
  };

  const handleFavoriteToggle = (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      setAlertMessage('Please login to add favorites');
      setShowAlert(true);
      return;
    }
    setIsFavorite(!isFavorite);
  };

  const handleCardClick = () => {
    navigate(`/product/${product.id}`);
  };

  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  return (
    <>
      <Card 
        sx={{ 
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          cursor: 'pointer',
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: 6
          },
          position: 'relative'
        }}
        onClick={handleCardClick}
      >
        {/* Stock status chip */}
        {(isOutOfStock || isLowStock) && (
          <Chip
            label={isOutOfStock ? 'Out of Stock' : `Only ${product.stock} left`}
            color={isOutOfStock ? 'error' : 'warning'}
            size="small"
            sx={{
              position: 'absolute',
              top: 8,
              left: 8,
              zIndex: 1
            }}
          />
        )}

        {/* Favorite button */}
        <IconButton
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 1,
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.9)'
            }
          }}
          onClick={handleFavoriteToggle}
        >
          {isFavorite ? (
            <FavoriteIcon color="error" />
          ) : (
            <FavoriteBorderIcon />
          )}
        </IconButton>

        {/* Product Image */}
        <CardMedia
          component="img"
          height="200"
          image={product.image_url || 'https://via.placeholder.com/300x200?text=No+Image'}
          alt={product.name}
          sx={{
            objectFit: 'cover',
            filter: isOutOfStock ? 'grayscale(100%)' : 'none'
          }}
        />

        <CardContent sx={{ flexGrow: 1, pb: 1 }}>
          {/* Category */}
          <Typography variant="caption" color="text.secondary" gutterBottom>
            {product.category}
          </Typography>

          {/* Product Name */}
          <Typography 
            variant="h6" 
            component="h2" 
            gutterBottom
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              lineHeight: 1.2,
              height: '2.4em'
            }}
          >
            {product.name}
          </Typography>

          {/* Description */}
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              mb: 1
            }}
          >
            {product.description}
          </Typography>

          {/* Rating */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Rating value={averageRating} precision={0.5} size="small" readOnly />
            <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
              ({reviewCount} reviews)
            </Typography>
          </Box>

          {/* Price - PRICE FIX */}
          <Typography 
            variant="h5" 
            color="primary" 
            fontWeight="bold"
            sx={{ mt: 'auto' }}
          >
            ${parseFloat(product.price || 0).toFixed(2)}
          </Typography>
        </CardContent>

        <CardActions sx={{ p: 2, pt: 0 }}>
          <Button
            variant="contained"
            startIcon={<AddShoppingCartIcon />}
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            fullWidth
            sx={{ mr: 1 }}
          >
            {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
          </Button>
          
          <Tooltip title="View Details">
            <IconButton 
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/product/${product.id}`);
              }}
              color="primary"
            >
              <VisibilityIcon />
            </IconButton>
          </Tooltip>
        </CardActions>
      </Card>

      {/* Alert Snackbar */}
      <Snackbar
        open={showAlert}
        autoHideDuration={3000}
        onClose={() => setShowAlert(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setShowAlert(false)} 
          severity={alertMessage.includes('Failed') ? 'error' : 'success'}
        >
          {alertMessage}
        </Alert>
      </Snackbar>
    </>
  );
}