import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProductList from './pages/ProductList';
import Navbar from './components/Navbar';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const [loading, setLoading] = useState(true);

  return (
    <BrowserRouter>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<ProductList />} />
        </Routes>
      </main>
      <ToastContainer />
    </BrowserRouter>
  );
}

export default App;