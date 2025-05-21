import { pool } from '../db.js';

export const getUserByEmail = async (email) => {
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0];
};

export const getUserById = async (id) => {
  const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
  return result.rows[0];
};

export const createUser = async (userData) => {
  const { username, email, password } = userData;
  const result = await pool.query(
    'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email, created_at',
    [username, email, password]
  );
  return result.rows[0];
};

export const updateUser = async (id, userData) => {
  const { username, email } = userData;
  const result = await pool.query(
    'UPDATE users SET username = $1, email = $2 WHERE id = $3 RETURNING id, username, email, created_at',
    [username, email, id]
  );
  return result.rows[0];
};

export const updatePassword = async (id, hashedPassword) => {
  const result = await pool.query(
    'UPDATE users SET password = $1 WHERE id = $2 RETURNING id',
    [hashedPassword, id]
  );
  return result.rows[0];
};

export const deleteUser = async (id) => {
  const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
  return result.rows[0];
};

export const getUserProfile = async (id) => {
  const result = await pool.query(`
    SELECT u.id, u.username, u.email, u.created_at, 
           COUNT(DISTINCT o.id) as order_count
    FROM users u
    LEFT JOIN orders o ON u.id = o.user_id
    WHERE u.id = $1
    GROUP BY u.id, u.username, u.email, u.created_at
  `, [id]);
  return result.rows[0];
};