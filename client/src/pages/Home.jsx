import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  TextField,
  InputAdornment,
  Grid,
  CircularProgress,
  Paper,
  Fade,
  IconButton
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { getProducts, searchProducts } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import ProductCard from '../components/products/ProductCard';
import { useDebounce } from '../hooks/useDebounce';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searching, setSearching] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Debounce search term to avoid too many API calls
  const debouncedSearchTerm = useDebounce ? useDebounce(searchTerm, 300) : searchTerm;

  useEffect(() => {
    fetchProducts();
  }, []);

  // Handle search when debounced term changes
  useEffect(() => {
    handleSearch(debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await getProducts();
      setProducts(data);
      setFilteredProducts(data);
    } catch (error) {
      console.error('Failed to load products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (term) => {
    if (!term.trim()) {
      setFilteredProducts(products);
      setSearching(false);
      return;
    }

    try {
      setSearching(true);
      
      // You can choose to search locally or via API
      // For now, let's do local search for better performance
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(term.toLowerCase()) ||
        product.description?.toLowerCase().includes(term.toLowerCase()) ||
        product.category.toLowerCase().includes(term.toLowerCase())
      );
      
      setFilteredProducts(filtered);
    } catch (error) {
      console.error('Search failed:', error);
      // Fallback to local search
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(term.toLowerCase()) ||
        product.description?.toLowerCase().includes(term.toLowerCase()) ||
        product.category.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredProducts(filtered);
    } finally {
      setSearching(false);
    }
  };

  const handleAddToCart = async (productId, quantity = 1) => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      navigate('/login');
      return;
    }
    
    try {
      // This would call your cart API
      console.log(`Adding product ${productId} with quantity ${quantity} to cart`);
      toast.success('Added to cart!');
    } catch (error) {
      console.error('Failed to add to cart:', error);
      toast.error('Failed to add to cart');
    }
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setFilteredProducts(products);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Hero Section with Search */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
          color: 'white',
          py: { xs: 6, md: 8 },
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Background decoration */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.1,
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <Container maxWidth="md" sx={{ position: 'relative', textAlign: 'center' }}>
          <Fade in timeout={1000}>
            <Box>
              <Typography 
                variant="h2" 
                component="h1" 
                fontWeight="bold" 
                gutterBottom
                sx={{ 
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  mb: 2
                }}
              >
                Wares for Weary Travelers
              </Typography>
              
              <Typography 
                variant="h6" 
                sx={{ 
                  mb: 4, 
                  opacity: 0.9,
                  maxWidth: '600px',
                  mx: 'auto'
                }}
              >
                Discover quality goods for your journey ahead
              </Typography>

              {/* Search Bar */}
              <Paper
                sx={{
                  p: 1,
                  display: 'flex',
                  alignItems: 'center',
                  maxWidth: 500,
                  mx: 'auto',
                  boxShadow: 3,
                  borderRadius: 2
                }}
              >
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Search for wares..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: searchTerm && (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={handleClearSearch}
                          edge="end"
                        >
                          <ClearIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                    sx: {
                      '& .MuiOutlinedInput-notchedOutline': {
                        border: 'none'
                      }
                    }
                  }}
                  sx={{
                    '& .MuiInputBase-input': {
                      py: 1.5
                    }
                  }}
                />
              </Paper>
            </Box>
          </Fade>
        </Container>
      </Box>

      {/* Products Section */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Search Results Info */}
        {searchTerm && (
          <Fade in timeout={500}>
            <Box sx={{ mb: 3, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary">
                {searching ? (
                  <>Searching for "{searchTerm}"...</>
                ) : (
                  <>
                    {filteredProducts.length} result{filteredProducts.length !== 1 ? 's' : ''} 
                    {filteredProducts.length > 0 ? ' found' : ''} for "{searchTerm}"
                  </>
                )}
              </Typography>
            </Box>
          </Fade>
        )}

        {/* Loading State */}
        {loading && (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
            <CircularProgress size={60} />
          </Box>
        )}

        {/* No Results */}
        {!loading && searchTerm && filteredProducts.length === 0 && (
          <Fade in timeout={500}>
            <Paper sx={{ p: 6, textAlign: 'center', mt: 4 }}>
              <Typography variant="h6" gutterBottom>
                No wares found
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                We couldn't find any items matching "{searchTerm}". 
                <br />
                Try a different search term or browse all our wares below.
              </Typography>
            </Paper>
          </Fade>
        )}

        {/* Products Grid */}
        {!loading && filteredProducts.length > 0 && (
          <Fade in timeout={700}>
            <Grid container spacing={3}>
              {filteredProducts.map((product) => (
                <Grid item key={product.id} xs={12} sm={6} md={4} lg={3}>
                  <ProductCard 
                    product={product} 
                    onAddToCart={handleAddToCart}
                    averageRating={4.2} // You would get this from your API
                    reviewCount={Math.floor(Math.random() * 50) + 1} // Demo data
                  />
                </Grid>
              ))}
            </Grid>
          </Fade>
        )}

        {/* Browse All Products Link */}
        {!searchTerm && !loading && (
          <Box sx={{ textAlign: 'center', mt: 6 }}>
            <Typography variant="body1" color="text.secondary">
              Browse our complete collection
            </Typography>
          </Box>
        )}
      </Container>

      {/* Footer Section */}
      <Box
        sx={{
          bgcolor: 'grey.100',
          py: 4,
          mt: 8,
          textAlign: 'center'
        }}
      >
        <Container maxWidth="md">
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            "Every journey begins with the right provisions"
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Quality wares for the discerning traveler
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}