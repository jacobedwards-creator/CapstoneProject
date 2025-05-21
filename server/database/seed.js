import { pool } from './db.js';
import bcrypt from 'bcryptjs';

const seedData = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        is_admin BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create products table (with more fields)
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        stock INTEGER DEFAULT 0,
        image_url VARCHAR(255),
        category VARCHAR(100),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create orders table
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        status VARCHAR(50) NOT NULL,
        shipping_address JSONB NOT NULL,
        payment_method VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create order_items table
    await client.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES orders(id),
        product_id INTEGER REFERENCES products(id),
        quantity INTEGER NOT NULL,
        price DECIMAL(10, 2) NOT NULL
      )
    `);

    // Create admin user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);
    
    await client.query(`
      INSERT INTO users (username, email, password, is_admin)
      VALUES ('admin', 'admin@example.com', $1, true)
      ON CONFLICT (email) DO NOTHING
    `, [hashedPassword]);

    // Insert sample products
    await client.query(`
      INSERT INTO products (name, description, price, stock, image_url, category)
      VALUES 
        ('Wireless Headphones', 'High-quality wireless headphones with noise cancellation', 99.99, 50, 'https://example.com/headphones.jpg', 'Electronics'),
        ('Smartphone', 'Latest model smartphone with high-resolution camera', 699.99, 30, 'https://example.com/smartphone.jpg', 'Electronics'),
        ('Running Shoes', 'Comfortable running shoes with excellent support', 89.99, 100, 'https://example.com/shoes.jpg', 'Sports'),
        ('Coffee Maker', 'Programmable coffee maker with thermal carafe', 149.99, 25, 'https://example.com/coffee.jpg', 'Home')
      ON CONFLICT (name) DO NOTHING
    `);

    await client.query('COMMIT');
    console.log('✅ Database seeded successfully!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Error:', err.message);
  } finally {
    client.release();
  }
};

seedData();