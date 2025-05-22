The Jacob Emporium - E-commerce Platform A full-stack e-commerce web application built with React, Node.js, Express, and PostgreSQL. Features a modern user interface, secure authentication, shopping cart functionality, order management, and admin dashboard. Features Customer Features

Product Browsing: View products with high-quality images, descriptions, and pricing Search & Filter: Find products by name, description, or category Shopping Cart: Add/remove items, update quantities, and view cart total User Authentication: Secure login/registration with JWT tokens Order Management: Place orders and view order history Product Reviews: Rate and review purchased products Responsive Design: Mobile-friendly interface

Admin Features

Admin Dashboard: Comprehensive overview of store statistics Product Management: Add, edit, and delete products User Management: View user accounts and activity Order Management: Update order status and track sales Inventory Control: Monitor stock levels and manage product availability

Tech Stack Frontend

React 18 - UI framework Material-UI v6 - Component library and styling React Router - Client-side routing Axios - HTTP client for API requests React Toastify - Notifications

Backend

Node.js - Runtime environment Express.js - Web framework PostgreSQL - Database JWT - Authentication tokens bcryptjs - Password hashing

Project Structure CapstoneProject/ ├── client/ # React frontend │ ├── src/ │ │ ├── components/ # Reusable components │ │ ├── pages/ # Page components │ │ ├── context/ # React context providers │ │ ├── utils/ # API utilities │ │ └── hooks/ # Custom hooks │ └── package.json ├── server/ # Node.js backend │ ├── database/ │ │ ├── db.js # Database connection │ │ ├── seed.js # Database seeding script │ │ └── queries/ # Database query functions │ ├── middleware/ # Express middleware │ ├── routes/ # API route handlers │ └── package.json └── README.md Prerequisites Before running this project, make sure you have the following installed:

Node.js (v18 or higher) - Download here PostgreSQL (v13 or higher) - Download here Git - Download here

Installation & Setup

Clone the Repository bashgit clone https://github.com/yourusername/capstone-project.git cd capstone-project
Backend Setup bash# Navigate to server directory cd server
Install dependencies
npm install

Create environment file
cp .env.example .env 3. Configure Environment Variables Create a .env file in the server directory with the following: env# Database Configuration DB_HOST=localhost DB_PORT=5432 DB_NAME=ecommerce DB_USER=postgres DB_PASSWORD=your_postgres_password

JWT Secrets (use strong, unique values in production)
JWT_SECRET=your_jwt_secret_key_here JWT_REFRESH_SECRET=your_refresh_secret_key_here

Server Port
PORT=5000 4. Database Setup bash# Connect to PostgreSQL and create database psql -U postgres CREATE DATABASE ecommerce; \q

Run database seeding script
node database/seed.js 5. Frontend Setup bash# Navigate to client directory cd ../client

Install dependencies
npm install

Create environment file
echo "VITE_API_BASE_URL=http://localhost:5000/api" > .env Running the Application Development Mode Terminal 1 - Backend: bashcd server npm run dev Terminal 2 - Frontend: bashcd client npm run dev The application will be available at:

Frontend: http://localhost:5173 Backend API: http://localhost:5000

Production Build bash# Build frontend cd client npm run build

The built files will be in client/dist/
Serve these files with your preferred web server
Default Login Credentials After running the seed script, use these credentials to test the application: Admin Account:

Email: admin@example.com Password: admin123

Test User Account:

Email: test@example.com Password: password123

API Endpoints Authentication

POST /api/auth/register - User registration POST /api/auth/login - User login POST /api/auth/logout - User logout POST /api/auth/refresh-token - Refresh JWT token

Products

GET /api/products - Get all products GET /api/products/:id - Get product by ID POST /api/products - Create product (admin only) PUT /api/products/:id - Update product (admin only) DELETE /api/products/:id - Delete product (admin only)

Cart

GET /api/cart - Get user's cart POST /api/cart/items - Add item to cart PUT /api/cart/items/:id - Update cart item quantity DELETE /api/cart/items/:id - Remove item from cart

Orders

GET /api/orders - Get user's orders POST /api/orders - Create new order GET /api/orders/:id - Get order details

Admin

GET /api/admin/users - Get all users (admin only) GET /api/admin/stats - Get dashboard statistics (admin only)

Database Schema Main Tables

users - User accounts and authentication products - Product catalog with images and details carts - Shopping cart functionality cart_items - Items in shopping carts orders - Order information and status order_items - Products within orders reviews - Product reviews and ratings

Developer's Note Working on this e-commerce platform was genuinely enjoyable and rewarding. What made it particularly engaging was how each challenge felt like solving a puzzle - from figuring out the proper data flow between React components to debugging authentication issues and getting the database relationships just right. Every bug was like a mystery to solve, and every successful feature implementation felt like completing a challenging piece of the overall picture. The project pushed me to think critically about system architecture, user experience, and full-stack integration. Some of the most satisfying moments came from debugging complex issues, like getting the admin authentication working properly or ensuring the cart state management was seamless across the application. These problem-solving experiences really reinforced why I enjoy software development - it's that perfect blend of creativity, logic, and persistence that makes each coding session feel like an adventure. The Jacob Emporium - Built with ❤️ for learning and demonstration purposes.