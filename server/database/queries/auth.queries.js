import { pool } from '../db.js';

export const createRefreshToken = async (userId, token, expiresAt) => {
  const result = await pool.query(
    'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3) RETURNING *',
    [userId, token, expiresAt]
  );
  return result.rows[0];
};

export const getRefreshToken = async (token) => {
  const result = await pool.query('SELECT * FROM refresh_tokens WHERE token = $1', [token]);
  return result.rows[0];
};

export const deleteRefreshToken = async (token) => {
  const result = await pool.query('DELETE FROM refresh_tokens WHERE token = $1', [token]);
  return result.rowCount > 0;
};

export const deleteUserRefreshTokens = async (userId) => {
  const result = await pool.query('DELETE FROM refresh_tokens WHERE user_id = $1', [userId]);
  return result.rowCount > 0;
};

export const cleanExpiredTokens = async () => {
  const result = await pool.query('DELETE FROM refresh_tokens WHERE expires_at < NOW()');
  return result.rowCount;
};