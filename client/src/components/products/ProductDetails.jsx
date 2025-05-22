import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Box,
  Typography,
  Button,
  Rating,
  Chip,
  Divider,
  Card,
  CardContent,
  TextField,
  Avatar,
  Stack,
  CircularProgress,
  Alert,
  Paper,
  IconButton,
  Breadcrumbs,
  Link
} from '@mui/material';
import {
  AddShoppingCart as AddShoppingCartIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Share as ShareIcon,
  ArrowBack as ArrowBackIcon,
  Star as StarIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { getProductById } from '../../utils/api';

export default function ProductDetails({ onAddToCart }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const data = await getProductById(id);
      setProduct(data);
      //fetch review logic goes here!!!!!!!!
     
    } catch (err) {
      setError('Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      await onAddToCart(product.id, quantity);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };

  const handleQuantityChange = (e) => {
    const value = Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1));
    setQuantity(value);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setSubmittingReview(true);
    try {
      //submit review logic here!!!!!!!!!
      console.log('Submitting review:', newReview);
      setNewReview({ rating: 5, comment: '' });
    } catch (error) {
      console.error('Failed to submit review:', error);
    } finally {
      setSubmittingReview(false);
    }
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

  if (error || !product) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || 'Product not found'}
        </Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/')}>
          Back to Products
        </Button>
      </Container>
    );
  }

  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;
  const averageRating = 4.2;
  const reviewCount = 15; //don't forget to connect this to apo!!1!!

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link 
          color="inherit" 
          href="/" 
          onClick={(e) => { e.preventDefault(); navigate('/'); }}
          sx={{ cursor: 'pointer' }}
        >
          Home
        </Link>
        <Link 
          color="inherit" 
          onClick={(e) => { e.preventDefault(); navigate(`/?category=${product.category}`); }}
          sx={{ cursor: 'pointer' }}
        >
          {product.category}
        </Link>
        <Typography color="text.primary">{product.name}</Typography>
      </Breadcrumbs>

      <Grid container spacing={4}>
        {/* Product Images */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2}>
            <Box
              component="img"
              src={product.image_url || 'https://via.placeholder.com/600x400?text=No+Image'}
              alt={product.name}
              sx={{
                width: '100%',
                height: { xs: 300, md: 500 },
                objectFit: 'cover',
                borderRadius: 1
              }}
            />
          </Paper>
        </Grid>

        {/* Product Info */}
        <Grid item xs={12} md={6}>
          <Box>
            {/* Category */}
            <Chip 
              label={product.category} 
              color="primary" 
              variant="outlined" 
              sx={{ mb: 2 }} 
            />

            {/* Product Name */}
            <Typography variant="h4" component="h1" gutterBottom>
              {product.name}
            </Typography>

            {/* Rating */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Rating value={averageRating} precision={0.5} readOnly />
              <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                ({reviewCount} reviews)
              </Typography>
            </Box>

            {/* Price */}
            <Typography variant="h3" color="primary" fontWeight="bold" sx={{ mb: 2 }}>
              ${product.price.toFixed(2)}
            </Typography>

            {/* Stock Status */}
            <Box sx={{ mb: 3 }}>
              {isOutOfStock ? (
                <Chip label="Out of Stock" color="error" />
              ) : isLowStock ? (
                <Chip label={`Only ${product.stock} left in stock`} color="warning" />
              ) : (
                <Chip label="In Stock" color="success" />
              )}
            </Box>

            {/* Description */}
            <Typography variant="body1" paragraph sx={{ mb: 3 }}>
              {product.description}
            </Typography>

            <Divider sx={{ my: 3 }} />

            {/* Quantity and Add to Cart */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Quantity:
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <TextField
                  type="number"
                  size="small"
                  value={quantity}
                  onChange={handleQuantityChange}
                  inputProps={{ min: 1, max: product.stock }}
                  sx={{ width: 100 }}
                  disabled={isOutOfStock}
                />
                <Typography variant="body2" color="text.secondary">
                  {product.stock} available
                </Typography>
              </Box>

              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<AddShoppingCartIcon />}
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  sx={{ flex: 1 }}
                >
                  {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                </Button>
                
                <IconButton
                  onClick={() => setIsFavorite(!isFavorite)}
                  color={isFavorite ? 'error' : 'default'}
                  size="large"
                >
                  {isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                </IconButton>
                
                <IconButton size="large">
                  <ShareIcon />
                </IconButton>
              </Stack>
            </Box>
          </Box>
        </Grid>
      </Grid>

      {/* Reviews Section */}
      <Box sx={{ mt: 6 }}>
        <Typography variant="h5" gutterBottom>
          Customer Reviews
        </Typography>

        {/* Review Summary */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Grid container spacing={3} alignItems="center">
              <Grid item>
                <Box textAlign="center">
                  <Typography variant="h3" component="div">
                    {averageRating.toFixed(1)}
                  </Typography>
                  <Rating value={averageRating} precision={0.5} readOnly />
                  <Typography variant="caption" display="block">
                    Based on {reviewCount} reviews
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs>
                {/* Rating breakdown would go here */}
                <Typography variant="body2" color="text.secondary">
                  Customer satisfaction: {Math.round((averageRating / 5) * 100)}%
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Add Review Form */}
        {isAuthenticated && (
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Write a Review
              </Typography>
              <Box component="form" onSubmit={handleReviewSubmit}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    Rating:
                  </Typography>
                  <Rating
                    value={newReview.rating}
                    onChange={(e, value) => setNewReview({ ...newReview, rating: value })}
                  />
                </Box>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Your Review"
                  value={newReview.comment}
                  onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                  sx={{ mb: 2 }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  disabled={submittingReview}
                  startIcon={submittingReview ? <CircularProgress size={20} /> : <StarIcon />}
                >
                  Submit Review
                </Button>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Reviews List */}
        <Stack spacing={2}>
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <Avatar>{review.username[0].toUpperCase()}</Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Typography variant="subtitle2">
                        {review.username}
                      </Typography>
                      <Rating value={review.rating} size="small" readOnly />
                      <Typography variant="caption" color="text.secondary">
                        {new Date(review.created_at).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Typography variant="body2">
                      {review.comment}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>
      </Box>
    </Container>
  );
}