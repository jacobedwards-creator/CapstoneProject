import { pool } from '../db.js';

export const getProductReviews = async (productId) => {
  const result = await pool.query(
    `SELECT r.*, u.username
     FROM reviews r
     JOIN users u ON r.user_id = u.id
     WHERE r.product_id = $1
     ORDER BY r.created_at DESC`,
    [productId]
  );
  return result.rows;
};

export const createReview = async (reviewData) => {
  const { user_id, product_id, rating, comment } = reviewData;
  const result = await pool.query(
    'INSERT INTO reviews (user_id, product_id, rating, comment) VALUES ($1, $2, $3, $4) RETURNING *',
    [user_id, product_id, rating, comment]
  );
  return result.rows[0];
};

export const updateReview = async (reviewId, userId, reviewData) => {
  const { rating, comment } = reviewData;
  const result = await pool.query(
    'UPDATE reviews SET rating = $1, comment = $2 WHERE id = $3 AND user_id = $4 RETURNING *',
    [rating, comment, reviewId, userId]
  );
  return result.rows[0];
};

export const deleteReview = async (reviewId, userId) => {
  const result = await pool.query(
    'DELETE FROM reviews WHERE id = $1 AND user_id = $2 RETURNING *',
    [reviewId, userId]
  );
  return result.rows[0];
};

export const getUserReviews = async (userId) => {
  const result = await pool.query(
    `SELECT r.*, p.name as product_name
     FROM reviews r
     JOIN products p ON r.product_id = p.id
     WHERE r.user_id = $1
     ORDER BY r.created_at DESC`,
    [userId]
  );
  return result.rows;
};

export const getAverageRating = async (productId) => {
  const result = await pool.query(
    `SELECT AVG(rating) as average_rating
     FROM reviews
     WHERE product_id = $1`,
    [productId]
  );
  return result.rows[0].average_rating || 0;
};
