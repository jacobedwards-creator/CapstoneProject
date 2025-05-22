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
  CircularProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Stack,
  InputAdornment,
  TablePagination,
  Autocomplete,
  Switch,
  FormControlLabel,
  DialogContentText
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Visibility as ViewIcon,
  Person as PersonIcon,
  Inventory as InventoryIcon,
  ShoppingCart as CartIcon,
  TrendingUp as TrendingUpIcon,
  Receipt as ReceiptIcon,
  LocalShipping as ShippingIcon,
  CheckCircle as CompletedIcon,
  Cancel as CancelledIcon,
  Pending as PendingIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  AdminPanelSettings as AdminIcon,
  Category as CategoryIcon,
  PhotoCamera as PhotoIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { 
  getAllProducts, 
  createProduct, 
  updateProduct, 
  deleteProduct
} from '../utils/api';
import { toast } from 'react-toastify';
import axios from 'axios';

export default function AdminDashboard() {
  const [tabValue, setTabValue] = useState(0);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalUsers: 0,
    totalOrders: 0,
    revenue: 0
  });
  
  // Search and Filter States
  const [productSearch, setProductSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  // Pagination States
  const [productPage, setProductPage] = useState(0);
  const [orderPage, setOrderPage] = useState(0);
  const [userPage, setUserPage] = useState(0);
  const rowsPerPage = 10;
  
  // Product Dialog States
  const [productDialog, setProductDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    image_url: '',
    tags: []
  });
  
  // Category Dialog States
  const [categoryDialog, setCategoryDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: ''
  });
  
  // User Dialog States
  const [userDialog, setUserDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editUserDialog, setEditUserDialog] = useState(false);
  const [userForm, setUserForm] = useState({
    username: '',
    email: '',
    is_admin: false
  });
  
  // Order Dialog States
  const [orderDialog, setOrderDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [updatingOrderStatus, setUpdatingOrderStatus] = useState(null);
  
  // Delete Confirmation States
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);
  const [deleteType, setDeleteType] = useState('');
  
  const [loading, setLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
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
        fetchOrders(),
        fetchCategories(),
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
      const data = await getAllProducts();
      setProducts(data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      toast.error('Failed to load products');
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/admin/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setUsers([]);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await axios.get('/api/admin/orders');
      setOrders(response.data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      setOrders([]);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/admin/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      setCategories([]);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/admin/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      setStats({ totalProducts: 0, totalUsers: 0, totalOrders: 0, revenue: 0 });
    }
  };

  // Product Management Functions
  const handleAddProduct = () => {
    setEditingProduct(null);
    setProductForm({
      name: '', description: '', price: '', category: '', stock: '', image_url: '', tags: []
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
      image_url: product.image_url || '',
      tags: product.tags || []
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
        await updateProduct(editingProduct.id, productData);
        toast.success('Product updated successfully');
      } else {
        await createProduct(productData);
        toast.success('Product created successfully');
      }

      setProductDialog(false);
      fetchProducts();
    } catch (error) {
      console.error('Failed to save product:', error);
      toast.error(error.response?.data?.error || 'Failed to save product');
    }
  };

  // Category Management Functions
  const handleAddCategory = () => {
    setEditingCategory(null);
    setCategoryForm({ name: '', description: '' });
    setCategoryDialog(true);
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setCategoryForm({ name: category.name, description: category.description || '' });
    setCategoryDialog(true);
  };

  const handleSaveCategory = async () => {
    try {
      if (editingCategory) {
        await axios.put(`/api/admin/categories/${editingCategory.id}`, categoryForm);
        toast.success('Category updated successfully');
      } else {
        await axios.post('/api/admin/categories', categoryForm);
        toast.success('Category created successfully');
      }
      setCategoryDialog(false);
      fetchCategories();
    } catch (error) {
      console.error('Failed to save category:', error);
      toast.error(error.response?.data?.error || 'Failed to save category');
    }
  };

  // Order Management Functions
  const handleViewOrder = async (order) => {
    try {
      const response = await axios.get(`/api/admin/orders/${order.id}`);
      setSelectedOrder(response.data);
      setOrderItems(response.data.items || []);
      setOrderDialog(true);
    } catch (error) {
      console.error('Failed to fetch order details:', error);
      toast.error('Failed to load order details');
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      setUpdatingOrderStatus(orderId);
      await axios.patch(`/api/orders/${orderId}/status`, { status: newStatus });
      toast.success('Order status updated successfully');
      fetchOrders();
    } catch (error) {
      console.error('Failed to update order status:', error);
      toast.error('Failed to update order status');
    } finally {
      setUpdatingOrderStatus(null);
    }
  };

  // User Management Functions
  const handleViewUser = (user) => {
    setSelectedUser(user);
    setUserDialog(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setUserForm({
      username: user.username,
      email: user.email,
      is_admin: user.is_admin
    });
    setEditUserDialog(true);
  };

  const handleSaveUser = async () => {
    try {
      await axios.put(`/api/admin/users/${selectedUser.id}`, userForm);
      toast.success('User updated successfully');
      setEditUserDialog(false);
      fetchUsers();
    } catch (error) {
      console.error('Failed to update user:', error);
      toast.error(error.response?.data?.error || 'Failed to update user');
    }
  };

  const handlePromoteUser = async (userId, promote) => {
    try {
      await axios.patch(`/api/admin/users/${userId}/promote`, { is_admin: promote });
      toast.success(`User ${promote ? 'promoted to' : 'demoted from'} admin successfully`);
      fetchUsers();
    } catch (error) {
      console.error('Failed to update user role:', error);
      toast.error('Failed to update user role');
    }
  };

  // Delete Functions
  const handleDeleteConfirm = (item, type) => {
    setDeleteItem(item);
    setDeleteType(type);
    setDeleteDialog(true);
  };

  const executeDelete = async () => {
    try {
      switch (deleteType) {
        case 'product':
          await deleteProduct(deleteItem.id);
          toast.success('Product deleted successfully');
          fetchProducts();
          break;
        case 'category':
          await axios.delete(`/api/admin/categories/${deleteItem.id}`);
          toast.success('Category deleted successfully');
          fetchCategories();
          break;
        case 'user':
          await axios.delete(`/api/admin/users/${deleteItem.id}`);
          toast.success('User deleted successfully');
          fetchUsers();
          break;
      }
      setDeleteDialog(false);
    } catch (error) {
      console.error('Failed to delete item:', error);
      toast.error(`Failed to delete ${deleteType}`);
    }
  };

  // Utility Functions
  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'success';
      case 'shipped': return 'info';
      case 'processing': return 'warning';
      case 'pending': return 'default';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered': return <CompletedIcon />;
      case 'shipped': return <ShippingIcon />;
      case 'processing': return <PendingIcon />;
      case 'pending': return <PendingIcon />;
      case 'cancelled': return <CancelledIcon />;
      default: return <PendingIcon />;
    }
  };

  // Filter Functions
  const getFilteredProducts = () => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(productSearch.toLowerCase()) ||
                           product.description?.toLowerCase().includes(productSearch.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  };

  const getFilteredOrders = () => {
    return orders.filter(order => {
      const matchesSearch = order.id.toString().includes(orderSearch) ||
                           order.username.toLowerCase().includes(orderSearch.toLowerCase()) ||
                           order.email.toLowerCase().includes(orderSearch.toLowerCase());
      const matchesStatus = orderStatusFilter === 'all' || order.status === orderStatusFilter;
      return matchesSearch && matchesStatus;
    });
  };

  const getFilteredUsers = () => {
    return users.filter(user => {
      const matchesSearch = user.username.toLowerCase().includes(userSearch.toLowerCase()) ||
                           user.email.toLowerCase().includes(userSearch.toLowerCase());
      return matchesSearch;
    });
  };

  // Render Functions
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

  const renderProductsTab = () => {
    const filteredProducts = getFilteredProducts();
    const paginatedProducts = filteredProducts.slice(
      productPage * rowsPerPage,
      productPage * rowsPerPage + rowsPerPage
    );

    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h5">Product Management</Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddProduct}>
            Add Product
          </Button>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search products..."
            variant="outlined"
            size="small"
            value={productSearch}
            onChange={(e) => setProductSearch(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>
            }}
            sx={{ minWidth: 250 }}
          />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={categoryFilter}
              label="Category"
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <MenuItem value="all">All Categories</MenuItem>
              {categories.map(cat => (
                <MenuItem key={cat.id} value={cat.name}>{cat.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Image</TableCell>
                <TableCell>Product</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Stock</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <Avatar
                      src={product.image_url}
                      variant="rounded"
                      sx={{ width: 50, height: 50 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2">{product.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {product.description?.substring(0, 50)}...
                    </Typography>
                  </TableCell>
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
                    <IconButton onClick={() => handleEditProduct(product)} size="small">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteConfirm(product, 'product')} size="small" color="error">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={filteredProducts.length}
            page={productPage}
            onPageChange={(e, newPage) => setProductPage(newPage)}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[rowsPerPage]}
          />
        </TableContainer>
      </Box>
    );
  };

  const renderCategoriesTab = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Category Management</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddCategory}>
          Add Category
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Products Count</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell>{category.name}</TableCell>
                <TableCell>{category.description}</TableCell>
                <TableCell>
                  {products.filter(p => p.category === category.name).length}
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEditCategory(category)} size="small">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDeleteConfirm(category, 'category')} size="small" color="error">
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

  const renderOrdersTab = () => {
    const filteredOrders = getFilteredOrders();
    const paginatedOrders = filteredOrders.slice(
      orderPage * rowsPerPage,
      orderPage * rowsPerPage + rowsPerPage
    );

    return (
      <Box>
        <Typography variant="h5" sx={{ mb: 3 }}>Order Management</Typography>

        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search orders, customers..."
            variant="outlined"
            size="small"
            value={orderSearch}
            onChange={(e) => setOrderSearch(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>
            }}
            sx={{ minWidth: 250 }}
          />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={orderStatusFilter}
              label="Status"
              onChange={(e) => setOrderStatusFilter(e.target.value)}
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="processing">Processing</MenuItem>
              <MenuItem value="shipped">Shipped</MenuItem>
              <MenuItem value="delivered">Delivered</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Order ID</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Items</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>#{order.id}</TableCell>
                  <TableCell>
                    <Typography variant="subtitle2">{order.username}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {order.email}
                    </Typography>
                  </TableCell>
                  <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>{order.item_count} items</TableCell>
                  <TableCell>${parseFloat(order.total_amount || 0).toFixed(2)}</TableCell>
                  <TableCell>
                    <Chip 
                      label={order.status.toUpperCase()}
                      color={getStatusColor(order.status)}
                      icon={getStatusIcon(order.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleViewOrder(order)} size="small">
                      <ViewIcon />
                    </IconButton>
                    <FormControl size="small" sx={{ minWidth: 120, ml: 1 }}>
                      <Select
                        value={order.status}
                        onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                        disabled={updatingOrderStatus === order.id}
                      >
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="processing">Processing</MenuItem>
                        <MenuItem value="shipped">Shipped</MenuItem>
                        <MenuItem value="delivered">Delivered</MenuItem>
                        <MenuItem value="cancelled">Cancelled</MenuItem>
                      </Select>
                    </FormControl>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={filteredOrders.length}
            page={orderPage}
            onPageChange={(e, newPage) => setOrderPage(newPage)}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[rowsPerPage]}
          />
        </TableContainer>
      </Box>
    );
  };

  const renderUsersTab = () => {
    const filteredUsers = getFilteredUsers();
    const paginatedUsers = filteredUsers.slice(
      userPage * rowsPerPage,
      userPage * rowsPerPage + rowsPerPage
    );

    return (
      <Box>
        <Typography variant="h5" sx={{ mb: 3 }}>User Management</Typography>

        <Box sx={{ mb: 3 }}>
          <TextField
            placeholder="Search users..."
            variant="outlined"
            size="small"
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>
            }}
            sx={{ minWidth: 250 }}
          />
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Orders</TableCell>
                <TableCell>Total Spent</TableCell>
                <TableCell>Member Since</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedUsers.map((user) => (
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
                      icon={user.role === 'admin' ? <AdminIcon /> : <PersonIcon />}
                    />
                  </TableCell>
                  <TableCell>{user.orders_count}</TableCell>
                  <TableCell>${parseFloat(user.total_spent || 0).toFixed(2)}</TableCell>
                  <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleViewUser(user)} size="small">
                      <ViewIcon />
                    </IconButton>
                    <IconButton onClick={() => handleEditUser(user)} size="small">
                      <EditIcon />
                    </IconButton>
                    <Button
                      size="small"
                      onClick={() => handlePromoteUser(user.id, !user.is_admin)}
                      color={user.is_admin ? 'error' : 'primary'}
                      sx={{ mx: 1 }}
                    >
                      {user.is_admin ? 'Demote' : 'Promote'}
                    </Button>
                    <IconButton onClick={() => handleDeleteConfirm(user, 'user')} size="small" color="error">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={filteredUsers.length}
            page={userPage}
            onPageChange={(e, newPage) => setUserPage(newPage)}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[rowsPerPage]}
          />
        </TableContainer>
      </Box>
    );
  };

  if (!isAuthenticated || !user?.is_admin) {
    return null;
  }

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>

      {renderStatsCards()}

      <Paper sx={{ width: '100%' }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="Products" />
          <Tab label="Categories" />
          <Tab label="Orders" />
          <Tab label="Users" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {tabValue === 0 && renderProductsTab()}
          {tabValue === 1 && renderCategoriesTab()}
          {tabValue === 2 && renderOrdersTab()}
          {tabValue === 3 && renderUsersTab()}
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
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Price"
                type="number"
                value={productForm.price}
                onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Autocomplete
                options={categories}
                getOptionLabel={(option) => option.name}
                freeSolo
                value={productForm.category}
                onChange={(e, newValue) => 
                  setProductForm({ ...productForm, category: typeof newValue === 'string' ? newValue : newValue?.name || '' })
                }
                renderInput={(params) => (
                  <TextField {...params} label="Category" required />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Stock Quantity"
                type="number"
                value={productForm.stock}
                onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                required
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
                InputProps={{
                  startAdornment: <InputAdornment position="start"><PhotoIcon /></InputAdornment>
                }}
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

      {/* Category Dialog */}
      <Dialog open={categoryDialog} onClose={() => setCategoryDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingCategory ? 'Edit Category' : 'Add New Category'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Category Name"
              value={categoryForm.name}
              onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
              required
            />
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={3}
              value={categoryForm.description}
              onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCategoryDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveCategory} variant="contained">
            {editingCategory ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Order Details Dialog */}
      <Dialog open={orderDialog} onClose={() => setOrderDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ReceiptIcon />
          Order Details - #{selectedOrder?.id}
        </DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="h6" gutterBottom>Order Items</Typography>
                  <List>
                    {orderItems.map((item) => (
                      <ListItem key={item.id} sx={{ px: 0 }}>
                        <ListItemAvatar>
                          <Avatar src={item.image_url} variant="rounded" sx={{ width: 50, height: 50 }} />
                        </ListItemAvatar>
                        <ListItemText
                          primary={item.product_name || item.name}
                          secondary={`Qty: ${item.quantity} × $${parseFloat(item.price || 0).toFixed(2)}`}
                          sx={{ ml: 2 }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="h6" gutterBottom>Customer Info</Typography>
                  <Typography><strong>Name:</strong> {selectedOrder.username}</Typography>
                  <Typography><strong>Email:</strong> {selectedOrder.email}</Typography>
                  <Typography><strong>Order Date:</strong> {new Date(selectedOrder.created_at).toLocaleDateString()}</Typography>
                  <Typography><strong>Status:</strong> {selectedOrder.status}</Typography>
                  <Typography><strong>Total:</strong> ${parseFloat(selectedOrder.total_amount || 0).toFixed(2)}</Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOrderDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* User Edit Dialog */}
      <Dialog open={editUserDialog} onClose={() => setEditUserDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Username"
              value={userForm.username}
              onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={userForm.email}
              onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={userForm.is_admin}
                  onChange={(e) => setUserForm({ ...userForm, is_admin: e.target.checked })}
                />
              }
              label="Administrator"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditUserDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveUser} variant="contained">Update</Button>
        </DialogActions>
      </Dialog>

      {/* User Details Dialog */}
      <Dialog open={userDialog} onClose={() => setUserDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>User Details</DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="h6" gutterBottom>{selectedUser.username}</Typography>
              <Typography><strong>Email:</strong> {selectedUser.email}</Typography>
              <Typography><strong>Role:</strong> {selectedUser.role}</Typography>
              <Typography><strong>Member Since:</strong> {new Date(selectedUser.created_at).toLocaleDateString()}</Typography>
              <Typography><strong>Total Orders:</strong> {selectedUser.orders_count}</Typography>
              <Typography><strong>Total Spent:</strong> ${parseFloat(selectedUser.total_spent || 0).toFixed(2)}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUserDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this {deleteType}? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
          <Button onClick={executeDelete} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}