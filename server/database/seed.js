import { pool } from './db.js';
import bcrypt from 'bcryptjs';

const seedData = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM cart_items');
    await client.query('DELETE FROM reviews');
    await client.query('DELETE FROM order_items');
    await client.query('DELETE FROM products');
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

    // test user creation
    const testPassword = await bcrypt.hash('password123', salt);
    await client.query(`
      INSERT INTO users (username, email, password, is_admin)
      VALUES ('testuser', 'test@example.com', $1, false)
      ON CONFLICT (email) DO NOTHING
    `, [testPassword]);

    // Clear existing products first if you want to update them
    await client.query('DELETE FROM products');
    
    // Insert products with matching images
    await client.query(`
      INSERT INTO products (name, description, price, stock, image_url, category)
      VALUES 
        ('Wireless Headphones', 'High-quality wireless headphones with noise cancellation', 99.99, 50, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', 'Electronics'),
        ('Smartphone', 'Latest model smartphone with high-resolution camera', 699.99, 30, 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', 'Electronics'),
        ('Running Shoes', 'Comfortable running shoes with excellent support', 89.99, 100, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', 'Sports'),
        ('Coffee Maker', 'Programmable coffee maker with thermal carafe', 149.99, 25, 'https://images.unsplash.com/photo-1572286258217-aac2e004d9c5?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', 'Home'),
        ('Laptop', 'Powerful laptop with long battery life', 1299.99, 15, 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', 'Electronics'),
        ('Fitness Tracker', 'Water-resistant fitness tracker with heart rate monitor', 79.99, 75, 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', 'Electronics'),
        ('Desk Chair', 'Ergonomic desk chair with lumbar support', 249.99, 20, 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', 'Home'),
        ('Blender', 'High-speed blender for smoothies and more', 69.99, 40, 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', 'Home'),
        ('Basketball', 'Official NBA size and weight basketball', 29.99, 60, 'https://images.unsplash.com/photo-1546519638-68e109498ffc?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', 'Sports'),
        ('Yoga Mat', 'Non-slip yoga mat for home workouts', 24.99, 80, 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', 'Sports'),
        ('Gaming Mouse', 'High-precision gaming mouse with RGB lighting', 59.99, 90, 'https://images.unsplash.com/photo-1527814050087-3793815479db?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', 'Electronics'),
        ('Backpack', 'Durable backpack with multiple compartments', 79.99, 55, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', 'Clothing'),
        ('Sunglasses', 'Polarized sunglasses with UV protection', 129.99, 65, 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', 'Clothing'),
        ('Water Bottle', 'Insulated stainless steel water bottle', 34.99, 120, 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', 'Sports'),
        ('Wireless Keyboard', 'Slim wireless keyboard with backlight', 89.99, 45, 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', 'Electronics'),
        ('Sneakers', 'Casual sneakers for everyday wear', 119.99, 85, 'https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', 'Clothing'),
        ('Table Lamp', 'Modern LED table lamp with adjustable brightness', 45.99, 30, 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', 'Home'),
        ('Wireless Earbuds', 'True wireless earbuds with charging case', 159.99, 70, 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', 'Electronics'),
        ('Watch', 'Classic analog watch with leather strap', 199.99, 25, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', 'Clothing'),
        ('Plant Pot', 'Ceramic plant pot with drainage holes', 19.99, 100, 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', 'Home')
    `);

    //sample reviews
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
    console.log('Database seeded successfully');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error:', err.message);
  } finally {
    client.release();
  }
};

seedData();