import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Chip,
  Avatar,
  Tabs,
  Tab,
  Fab,
  Tooltip
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Visibility as ViewIcon,
  Person as PersonIcon,
  Inventory as InventoryIcon,
  ShoppingCart as CartIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

export default function AdminDashboard() {
  const [tabValue, setTabValue] = useState(0);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalUsers: 0,
    totalOrders: 0,
    revenue: 0
  });
  
  // Product Dialog States
  const [productDialog, setProductDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    image_url: ''
  });
  
  // User Dialog States
  const [userDialog, setUserDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is admin
    if (!isAuthenticated || !user?.is_admin) { 
        navigate('/');
        toast.error('Access denied. Admin privileges required.');
        return;
    }
    
    fetchData();
  }, [isAuthenticated, user, navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchProducts(),
        fetchUsers(),
        fetchStats()
      ]);
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      // In real app, this would be an admin API call
      const response = await fetch('/api/admin/products');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      // Mock data for demo
      setProducts([
        { id: 1, name: 'Premium Headphones', price: 199.99, category: 'Electronics', stock: 15, status: 'active' },
        { id: 2, name: 'Cotton T-Shirt', price: 29.99, category: 'Clothing', stock: 50, status: 'active' },
        { id: 3, name: 'Fitness Watch', price: 299.99, category: 'Electronics', stock: 8, status: 'active' }
      ]);
    }
  };

  const fetchUsers = async () => {
    try {
      // In real app, this would be an admin API call
      const response = await fetch('/api/admin/users');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      // Mock data for demo
      setUsers([
        { 
          id: 1, 
          username: 'john_doe', 
          email: 'john@example.com', 
          role: 'user', 
          status: 'active',
          created_at: '2024-01-15',
          orders_count: 5,
          total_spent: 299.95
        },
        { 
          id: 2, 
          username: 'jane_smith', 
          email: 'jane@example.com', 
          role: 'user', 
          status: 'active',
          created_at: '2024-01-10',
          orders_count: 3,
          total_spent: 149.97
        }
      ]);
    }
  };

  const fetchStats = async () => {
    try {
      // Mock stats for demo
      setStats({
        totalProducts: 125,
        totalUsers: 1250,
        totalOrders: 845,
        revenue: 25670.50
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  // Product Management Functions
  const handleAddProduct = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      description: '',
      price: '',
      category: '',
      stock: '',
      image_url: ''
    });
    setProductDialog(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      category: product.category,
      stock: product.stock.toString(),
      image_url: product.image_url || ''
    });
    setProductDialog(true);
  };

  const handleSaveProduct = async () => {
    try {
      const productData = {
        ...productForm,
        price: parseFloat(productForm.price),
        stock: parseInt(productForm.stock)
      };

      if (editingProduct) {
        // Update existing product
        console.log('Updating product:', editingProduct.id, productData);
        toast.success('Product updated successfully');
      } else {
        // Create new product
        console.log('Creating new product:', productData);
        toast.success('Product created successfully');
      }

      setProductDialog(false);
      fetchProducts(); // Refresh products list
    } catch (error) {
      console.error('Failed to save product:', error);
      toast.error('Failed to save product');
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      console.log('Deleting product:', productId);
      toast.success('Product deleted successfully');
      fetchProducts(); // Refresh products list
    } catch (error) {
      console.error('Failed to delete product:', error);
      toast.error('Failed to delete product');
    }
  };

  // User Management Functions
  const handleViewUser = (user) => {
    setSelectedUser(user);
    setUserDialog(true);
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
      console.log('Toggling user status:', userId, newStatus);
      toast.success(`User ${newStatus === 'active' ? 'activated' : 'suspended'}`);
      fetchUsers(); // Refresh users list
    } catch (error) {
      console.error('Failed to toggle user status:', error);
      toast.error('Failed to update user status');
    }
  };

  const renderStatsCards = () => (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <InventoryIcon color="primary" sx={{ mr: 2 }} />
              <Box>
                <Typography variant="h4">{stats.totalProducts}</Typography>
                <Typography color="text.secondary">Products</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <PersonIcon color="primary" sx={{ mr: 2 }} />
              <Box>
                <Typography variant="h4">{stats.totalUsers}</Typography>
                <Typography color="text.secondary">Users</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CartIcon color="primary" sx={{ mr: 2 }} />
              <Box>
                <Typography variant="h4">{stats.totalOrders}</Typography>
                <Typography color="text.secondary">Orders</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <TrendingUpIcon color="primary" sx={{ mr: 2 }} />
              <Box>
                <Typography variant="h4">${stats.revenue.toFixed(0)}</Typography>
                <Typography color="text.secondary">Revenue</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderProductsTab = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Product Management</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddProduct}>
          Add Product
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Product</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Stock</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>{product.name}</TableCell>
                <TableCell>${parseFloat(product.price || 0).toFixed(2)}</TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell>
                  <Chip 
                    label={product.stock} 
                    color={product.stock > 10 ? 'success' : product.stock > 0 ? 'warning' : 'error'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip 
                    label={product.status} 
                    color={product.status === 'active' ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEditProduct(product)} size="small">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDeleteProduct(product.id)} size="small" color="error">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  const renderUsersTab = () => (
    <Box>
      <Typography variant="h5" sx={{ mb: 3 }}>User Management</Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Orders</TableCell>
              <TableCell>Total Spent</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ mr: 2, width: 32, height: 32 }}>
                      {user.username[0].toUpperCase()}
                    </Avatar>
                    {user.username}
                  </Box>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Chip 
                    label={user.role} 
                    color={user.role === 'admin' ? 'primary' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>{user.orders_count}</TableCell>
                <TableCell>${parseFloat(user.total_spent || 0).toFixed(2)}</TableCell>
                <TableCell>
                  <Chip 
                    label={user.status} 
                    color={user.status === 'active' ? 'success' : 'error'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleViewUser(user)} size="small">
                    <ViewIcon />
                  </IconButton>
                  <Button
                    size="small"
                    onClick={() => handleToggleUserStatus(user.id, user.status)}
                    color={user.status === 'active' ? 'error' : 'success'}
                  >
                    {user.status === 'active' ? 'Suspend' : 'Activate'}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  if (!isAuthenticated || !user?.is_admin) {
    return null; // Prevents flash before redirect
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>

      {renderStatsCards()}

      <Paper sx={{ width: '100%' }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="Products" />
          <Tab label="Users" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {tabValue === 0 && renderProductsTab()}
          {tabValue === 1 && renderUsersTab()}
        </Box>
      </Paper>

      {/* Product Dialog */}
      <Dialog open={productDialog} onClose={() => setProductDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingProduct ? 'Edit Product' : 'Add New Product'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Product Name"
                value={productForm.name}
                onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Price"
                type="number"
                value={productForm.price}
                onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={productForm.category}
                  onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                >
                  <MenuItem value="Electronics">Electronics</MenuItem>
                  <MenuItem value="Clothing">Clothing</MenuItem>
                  <MenuItem value="Home & Garden">Home & Garden</MenuItem>
                  <MenuItem value="Sports & Fitness">Sports & Fitness</MenuItem>
                  <MenuItem value="Food & Beverage">Food & Beverage</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Stock Quantity"
                type="number"
                value={productForm.stock}
                onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={productForm.description}
                onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Image URL"
                value={productForm.image_url}
                onChange={(e) => setProductForm({ ...productForm, image_url: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProductDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveProduct} variant="contained">
            {editingProduct ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* User Details Dialog */}
      <Dialog open={userDialog} onClose={() => setUserDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>User Details</DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="h6" gutterBottom>
                {selectedUser.username}
              </Typography>
              <Typography><strong>Email:</strong> {selectedUser.email}</Typography>
              <Typography><strong>Role:</strong> {selectedUser.role}</Typography>
              <Typography><strong>Status:</strong> {selectedUser.status}</Typography>
              <Typography><strong>Member Since:</strong> {selectedUser.created_at}</Typography>
              <Typography><strong>Total Orders:</strong> {selectedUser.orders_count}</Typography>
              <Typography><strong>Total Spent:</strong> ${parseFloat(selectedUser.total_spent || 0).toFixed(2)}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUserDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}