import { pool } from '../db.js';

export const getProducts = async () => {
  const result = await pool.query('SELECT * FROM products');
  return result.rows;
};

export const getProductById = async (id) => {
  const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
  return result.rows[0];
};

export const createProduct = async (productData) => {
  const { name, description, price, stock, image_url, category } = productData;
  const result = await pool.query(
    'INSERT INTO products (name, description, price, stock, image_url, category) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
    [name, description, price, stock, image_url, category]
  );
  return result.rows[0];
};

export const updateProduct = async (id, productData) => {
  const { name, description, price, stock, image_url, category } = productData;
  const result = await pool.query(
    'UPDATE products SET name = $1, description = $2, price = $3, stock = $4, image_url = $5, category = $6 WHERE id = $7 RETURNING *',
    [name, description, price, stock, image_url, category, id]
  );
  return result.rows[0];
};

export const deleteProduct = async (id) => {
  const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);
  return result.rows[0];
};

export const getProductsByCategory = async (category) => {
  const result = await pool.query('SELECT * FROM products WHERE category = $1', [category]);
  return result.rows;
};

export const searchProducts = async (searchTerm) => {
  const result = await pool.query(
    'SELECT * FROM products WHERE name ILIKE $1 OR description ILIKE $1',
    [`%${searchTerm}%`]
  );
  return result.rows;
};

export const checkProductAvailability = async (id, quantity) => {
  const result = await pool.query('SELECT stock FROM products WHERE id = $1', [id]);
  if (result.rows.length === 0) {
    return false;
  }
  return result.rows[0].stock >= quantity;
};