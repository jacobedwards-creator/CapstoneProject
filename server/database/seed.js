const pool = require('./db');

const seedData = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

   // table creation
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        stock INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        total_amount DECIMAL(10, 2) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    //clearing data but preserving schema like a boss
    await client.query('DELETE FROM orders');
    await client.query('DELETE FROM products');
    await client.query('DELETE FROM users');
    
    // resetting sequence for less confusion 
    await client.query('ALTER SEQUENCE users_id_seq RESTART WITH 1');
    await client.query('ALTER SEQUENCE products_id_seq RESTART WITH 1');
    await client.query('ALTER SEQUENCE orders_id_seq RESTART WITH 1');

    // dummy data insertion
    await client.query(`
      INSERT INTO users (email, password_hash)
      VALUES ('test@example.com', '$2a$10$fakehashedpassword1234567890')
    `);

    await client.query(`
      INSERT INTO products (name, price, stock)
      VALUES 
        ('Wireless Headphones', 99.99, 50),
        ('Smartphone', 699.99, 30),
        ('Laptop', 1299.99, 15)
    `);

    await client.query('COMMIT');
    console.log('Database seeded successfully!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error seeding database:', err);
  } finally {
    client.release();
  }
};

seedData();