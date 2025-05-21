import express from 'express';
import { 
  getProductReviews, 
  createReview, 
  updateReview, 
  deleteReview,
  getUserReviews,
  getAverageRating
} from '../database/queries/review.queries.js';
import { getProductById } from '../database/queries/product.queries.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Get reviews for a product
router.get('/product/:productId', async (req, res) => {
  try {
    const reviews = await getProductReviews(req.params.productId);
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Authentication required for the following routes
router.use(authMiddleware);

// Create a review
router.post('/', async (req, res) => {
  try {
    const { product_id, rating, comment } = req.body;
    
    // Validate product exists
    const product = await getProductById(product_id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }
    
    const review = await createReview({
      user_id: req.user.id,
      product_id,
      rating,
      comment
    });
    
    res.status(201).json({
      message: 'Review created successfully',
      review
    });
  } catch (err) {
    if (err.message.includes('duplicate key')) {
      return res.status(400).json({ error: 'You have already reviewed this product' });
    }
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});
