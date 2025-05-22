import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProductList from './pages/ProductList';
import ProductDetails from './components/products/ProductDetails';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Navbar from './components/Navbar';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
    const handleAddToCart = async (productId, quantity) => {
        // cart logic here
        console.log(`Adding product ${productId} with quantity ${quantity} to cart`);
      };

  return (
<AuthProvider>
    <BrowserRouter>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<ProductList />} />
          <Route 
              path="/product/:id" 
              element={<ProductDetails onAddToCart={handleAddToCart} />} 
            />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          
        </Routes>
      </main>
      <ToastContainer position="bottom-right"/>
    </BrowserRouter>
</AuthProvider>
  );
}

export default App;