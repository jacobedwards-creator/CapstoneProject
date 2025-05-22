import { pool } from './db.js';
import bcrypt from 'bcryptjs';

const seedData = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    //users table
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

    //products table
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

    //orders table
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

    //order_items table
    await client.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
        product_id INTEGER REFERENCES products(id),
        quantity INTEGER NOT NULL,
        price DECIMAL(10, 2) NOT NULL
      )
    `);
    
    //refresh tokens table(JWT)
    await client.query(`
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        token VARCHAR(255) NOT NULL UNIQUE,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    //carts table
    await client.query(`
      CREATE TABLE IF NOT EXISTS carts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    //cart_items table
    await client.query(`
      CREATE TABLE IF NOT EXISTS cart_items (
        id SERIAL PRIMARY KEY,
        cart_id INTEGER REFERENCES carts(id) ON DELETE CASCADE,
        product_id INTEGER REFERENCES products(id),
        quantity INTEGER NOT NULL DEFAULT 1,
        UNIQUE(cart_id, product_id)
      )
    `);

    //reviews table
    await client.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, product_id)
      )
    `);

    //admin user creation
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);
    
    await client.query(`
      INSERT INTO users (username, email, password, is_admin)
      VALUES ('admin', 'admin@example.com', $1, true)
      ON CONFLICT (email) DO NOTHING
    `, [hashedPassword]);

    //dummy product data
    await client.query(`
      INSERT INTO products (name, description, price, stock, image_url, category)
      VALUES 
        ('Wireless Headphones', 'High-quality wireless headphones with noise cancellation', 99.99, 50, 'https://example.com/headphones.jpg', 'Electronics'),
        ('Smartphone', 'Latest model smartphone with high-resolution camera', 699.99, 30, 'https://example.com/smartphone.jpg', 'Electronics'),
        ('Running Shoes', 'Comfortable running shoes with excellent support', 89.99, 100, 'https://example.com/shoes.jpg', 'Sports'),
        ('Coffee Maker', 'Programmable coffee maker with thermal carafe', 149.99, 25, 'https://example.com/coffee.jpg', 'Home'),
        ('Laptop', 'Powerful laptop with long battery life', 1299.99, 15, 'https://example.com/laptop.jpg', 'Electronics'),
        ('Fitness Tracker', 'Water-resistant fitness tracker with heart rate monitor', 79.99, 75, 'https://example.com/tracker.jpg', 'Electronics'),
        ('Desk Chair', 'Ergonomic desk chair with lumbar support', 249.99, 20, 'https://example.com/chair.jpg', 'Home'),
        ('Blender', 'High-speed blender for smoothies and more', 69.99, 40, 'https://example.com/blender.jpg', 'Home'),
        ('Basketball', 'Official NBA size and weight basketball', 29.99, 60, 'https://example.com/basketball.jpg', 'Sports'),
        ('Yoga Mat', 'Non-slip yoga mat for home workouts', 24.99, 80, 'https://example.com/yogamat.jpg', 'Sports')
      ON CONFLICT (name) DO NOTHING
    `);

    //dummy reviews
    await client.query(`
      INSERT INTO reviews (user_id, product_id, rating, comment)
      SELECT 
        1, -- admin user ID
        p.id,
        5, -- 5-star rating
        'Excellent product, highly recommended!'
      FROM products p
      WHERE p.name = 'Wireless Headphones'
      ON CONFLICT (user_id, product_id) DO NOTHING
    `);

    await client.query('COMMIT');
    console.log('Database seeded successfully!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error:', err.message);
  } finally {
    client.release();
  }
};

seedData();