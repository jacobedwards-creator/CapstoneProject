import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardMedia,
  Grid,
  Typography,
  IconButton,
  TextField,
  Box,
  Chip,
  Button,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon
} from '@mui/icons-material';

export default function CartItem({
  item,
  onQuantityChange,
  onRemove,
  onToggleFavorite,
  updating = false,
  readonly = false,
  showControls = true
}) {
  const [localQuantity, setLocalQuantity] = useState(item.quantity);
  const [isFavorite, setIsFavorite] = useState(item.isFavorite || false);
  const navigate = useNavigate();

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity < 1 || newQuantity > 99) return;
    
    setLocalQuantity(newQuantity);
    if (onQuantityChange) {
      onQuantityChange(item.id, newQuantity);
    }
  };

  const handleQuantityInputChange = (e) => {
    const value = parseInt(e.target.value) || 1;
    handleQuantityChange(value);
  };

  const handleRemove = () => {
    if (onRemove) {
      onRemove(item.id, item.name);
    }
  };

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
    if (onToggleFavorite) {
      onToggleFavorite(item.id, !isFavorite);
    }
  };

  const handleProductClick = () => {
    navigate(`/product/${item.product_id}`);
  };

  const isOutOfStock = item.stock === 0;
  const isLowStock = item.stock > 0 && item.stock <= 5;
  // 🔧 PRICE FIX
  const itemTotal = parseFloat(item.price || 0) * item.quantity;

  return (
    <Card 
      sx={{ 
        mb: 2,
        opacity: isOutOfStock ? 0.6 : 1,
        position: 'relative'
      }}
    >
      <CardContent>
        <Grid container spacing={2} alignItems="center">
          {/* Product Image */}
          <Grid size={{ xs: 12, sm: 3, md: 2 }}>
            <CardMedia
              component="img"
              height="120"
              image={item.image_url || 'https://via.placeholder.com/150x120?text=No+Image'}
              alt={item.name}
              sx={{ 
                objectFit: 'cover',
                borderRadius: 1,
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'scale(1.05)'
                }
              }}
              onClick={handleProductClick}
            />
          </Grid>

          {/* Product Details */}
          <Grid size={{ xs: 12, sm: 5, md: 4 }}>
            <Box>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                {item.category}
              </Typography>

              <Typography 
                variant="h6" 
                gutterBottom
                sx={{ 
                  cursor: 'pointer',
                  '&:hover': { color: 'primary.main' }
                }}
                onClick={handleProductClick}
              >
                {item.name}
              </Typography>

              {item.description && (
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
                  {item.description}
                </Typography>
              )}

              {/* Price per unit - 🔧 PRICE FIX */}
              <Typography variant="body2" color="text.secondary">
                ${parseFloat(item.price || 0).toFixed(2)} each
              </Typography>

              <Box sx={{ mt: 1 }}>
                {isOutOfStock ? (
                  <Chip label="Out of Stock" color="error" size="small" />
                ) : isLowStock ? (
                  <Chip label={`Only ${item.stock} left`} color="warning" size="small" />
                ) : (
                  <Chip label="In Stock" color="success" size="small" />
                )}
              </Box>
            </Box>
          </Grid>

          {/* Quantity Controls */}
          <Grid size={{ xs: 12, sm: 2, md: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Quantity
              </Typography>
              
              {showControls && !readonly ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <IconButton
                    size="small"
                    onClick={() => handleQuantityChange(localQuantity - 1)}
                    disabled={updating || localQuantity <= 1 || isOutOfStock}
                  >
                    <RemoveIcon />
                  </IconButton>
                  
                  <TextField
                    size="small"
                    value={localQuantity}
                    onChange={handleQuantityInputChange}
                    slotProps={{
                      htmlInput: { 
                        min: 1,
                        max: item.stock || 99,
                        style: { textAlign: 'center', width: '60px' }
                      }
                    }}
                    disabled={updating || isOutOfStock}
                  />
                  
                  <IconButton
                    size="small"
                    onClick={() => handleQuantityChange(localQuantity + 1)}
                    disabled={updating || localQuantity >= (item.stock || 99) || isOutOfStock}
                  >
                    <AddIcon />
                  </IconButton>
                </Box>
              ) : (
                <Typography variant="h6" color="primary">
                  {item.quantity}
                </Typography>
              )}

              {localQuantity >= (item.stock || 99) && item.stock > 0 && (
                <Typography variant="caption" color="warning.main">
                  Max available: {item.stock}
                </Typography>
              )}
            </Box>
          </Grid>

          {/* Price and Actions */}
          <Grid size={{ xs: 12, sm: 2, md: 3 }}>
            <Box sx={{ textAlign: 'center' }}>
              {/* Item Total - 🔧 PRICE FIX */}
              <Typography variant="h6" color="primary" fontWeight="bold">
                ${itemTotal.toFixed(2)}
              </Typography>
              
              {item.quantity > 1 && (
                <Typography variant="caption" color="text.secondary">
                  ${parseFloat(item.price || 0).toFixed(2)} × {item.quantity}
                </Typography>
              )}

              {showControls && !readonly && (
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 1 }}>
                  <Tooltip title={isFavorite ? "Remove from favorites" : "Add to favorites"}>
                    <IconButton
                      size="small"
                      onClick={handleToggleFavorite}
                      color={isFavorite ? "error" : "default"}
                    >
                      {isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Remove from cart">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={handleRemove}
                      disabled={updating}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              )}

              {showControls && !readonly && (
                <Button
                  size="small"
                  sx={{ mt: 1, fontSize: '0.75rem' }}
                  onClick={() => {
                    console.log('Save for later:', item.id);
                  }}
                >
                  Save for Later
                </Button>
              )}
            </Box>
          </Grid>
        </Grid>

        {isOutOfStock && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 1
            }}
          >
            <Typography variant="h6" color="error" fontWeight="bold">
              OUT OF STOCK
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}