// START: db.js - Fixed Database Configuration with String Conversion
import pg from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const { Pool } = pg;


console.log('Environment check:');
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD exists:', !!process.env.DB_PASSWORD);
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_PORT:', process.env.DB_PORT);

// Ensure all values are properly typed and defined
const dbConfig = {
  user: String(process.env.DB_USER || 'postgres'),
  password: String(process.env.DB_PASSWORD || ''),
  host: String(process.env.DB_HOST || 'localhost'),
  database: String(process.env.DB_NAME || 'postgres'),
  port: parseInt(process.env.DB_PORT || '5432', 10)
};

// Additional debug
console.log('Final DB config:');
console.log('User:', dbConfig.user);
console.log('Password length:', dbConfig.password.length);
console.log('Host:', dbConfig.host);
console.log('Database:', dbConfig.database);
console.log('Port:', dbConfig.port);

const pool = new Pool(dbConfig);

// Test the connection
pool.on('connect', () => {
  console.log(' Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error(' Database connection error:', err);
});

export { pool };