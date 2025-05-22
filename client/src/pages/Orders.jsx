import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Divider,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Alert,
  CircularProgress,
  Breadcrumbs,
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
} from '@mui/material';
import {
  ShoppingBag as OrderIcon,
  LocalShipping as ShippingIcon,
  CheckCircle as CompletedIcon,
  Cancel as CancelledIcon,
  Visibility as ViewIcon,
  Receipt as ReceiptIcon,
  LocalShipping as DeliveryIcon
} from '@mui/icons-material';
import { Timeline, TimelineItem, TimelineSeparator, TimelineConnector, TimelineContent, TimelineDot } from '@mui/lab';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDialog, setOrderDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchOrders();
  }, [isAuthenticated, navigate]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      // In real app, this would be an API call
      // const response = await fetch('/api/orders');
      // const data = await response.json();
      
      // Mock data for demo
      const mockOrders = [
        {
          id: 'ORD-001',
          status: 'delivered',
          total: 299.97,
          created_at: '2024-01-15T10:30:00Z',
          estimated_delivery: '2024-01-20T00:00:00Z',
          actual_delivery: '2024-01-19T14:30:00Z',
          items: [
            {
              id: 1,
              name: 'Premium Wireless Headphones',
              price: 199.99,
              quantity: 1,
              image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&h=100&fit=crop'
            },
            {
              id: 2,
              name: 'Organic Cotton T-Shirt',
              price: 29.99,
              quantity: 2,
              image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100&h=100&fit=crop'
            }
          ],
          shipping_address: {
            firstName: 'John',
            lastName: 'Doe',
            address: '123 Main St',
            city: 'New York',
            state: 'NY',
            zipCode: '10001'
          },
          tracking_number: 'TRK123456789'
        },
        {
          id: 'ORD-002',
          status: 'shipped',
          total: 149.99,
          created_at: '2024-01-20T15:45:00Z',
          estimated_delivery: '2024-01-25T00:00:00Z',
          items: [
            {
              id: 3,
              name: 'Smart Fitness Watch',
              price: 149.99,
              quantity: 1,
              image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&h=100&fit=crop'
            }
          ],
          shipping_address: {
            firstName: 'John',
            lastName: 'Doe',
            address: '123 Main St',
            city: 'New York',
            state: 'NY',
            zipCode: '10001'
          },
          tracking_number: 'TRK987654321'
        },
        {
          id: 'ORD-003',
          status: 'processing',
          total: 79.98,
          created_at: '2024-01-22T09:15:00Z',
          estimated_delivery: '2024-01-28T00:00:00Z',
          items: [
            {
              id: 4,
              name: 'Artisan Coffee Beans',
              price: 24.99,
              quantity: 2,
              image_url: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=100&h=100&fit=crop'
            },
            {
              id: 5,
              name: 'Organic Cotton T-Shirt',
              price: 29.99,
              quantity: 1,
              image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100&h=100&fit=crop'
            }
          ],
          shipping_address: {
            firstName: 'John',
            lastName: 'Doe',
            address: '123 Main St',
            city: 'New York',
            state: 'NY',
            zipCode: '10001'
          }
        }
      ];
      
      setOrders(mockOrders);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return 'success';
      case 'shipped':
        return 'info';
      case 'processing':
        return 'warning';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered':
        return <CompletedIcon />;
      case 'shipped':
        return <ShippingIcon />;
      case 'processing':
        return <OrderIcon />;
      case 'cancelled':
        return <CancelledIcon />;
      default:
        return <OrderIcon />;
    }
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setOrderDialog(true);
  };

  const handleTrackOrder = (trackingNumber) => {
    
    toast.info(`Tracking order: ${trackingNumber}`);
  };

  const renderOrderTimeline = (order) => {
    const events = [
      {
        title: 'Order Placed',
        date: order.created_at,
        completed: true
      },
      {
        title: 'Processing',
        date: order.created_at,
        completed: ['processing', 'shipped', 'delivered'].includes(order.status)
      },
      {
        title: 'Shipped',
        date: order.status === 'shipped' ? new Date().toISOString() : null,
        completed: ['shipped', 'delivered'].includes(order.status)
      },
      {
        title: 'Delivered',
        date: order.actual_delivery,
        completed: order.status === 'delivered'
      }
    ];

    return (
      <Timeline>
        {events.map((event, index) => (
          <TimelineItem key={index}>
            <TimelineSeparator>
              <TimelineDot color={event.completed ? 'primary' : 'grey'}>
                {event.completed && <CheckCircle />}
              </TimelineDot>
              {index < events.length - 1 && <TimelineConnector />}
            </TimelineSeparator>
            <TimelineContent>
              <Typography variant="subtitle2" color={event.completed ? 'text.primary' : 'text.secondary'}>
                {event.title}
              </Typography>
              {event.date && (
                <Typography variant="caption" color="text.secondary">
                  {new Date(event.date).toLocaleDateString()}
                </Typography>
              )}
            </TimelineContent>
          </TimelineItem>
        ))}
      </Timeline>
    );
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  if (orders.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Breadcrumbs sx={{ mb: 3 }}>
          <Link color="inherit" href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }}>
            Home
          </Link>
          <Typography color="text.primary">Orders</Typography>
        </Breadcrumbs>

        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <OrderIcon sx={{ fontSize: 80, color: 'grey.400', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            No orders yet
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            You haven't placed any orders yet. Start shopping to see your orders here.
          </Typography>
          <Button variant="contained" size="large" onClick={() => navigate('/')}>
            Start Shopping
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link color="inherit" href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }}>
          Home
        </Link>
        <Typography color="text.primary">Orders</Typography>
      </Breadcrumbs>

      <Typography variant="h4" component="h1" gutterBottom>
        Order History
      </Typography>

      <Stack spacing={3}>
        {orders.map((order) => (
          <Card key={order.id}>
            <CardContent>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 8 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        Order #{order.id}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Placed on {new Date(order.created_at).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Chip 
                      label={order.status.toUpperCase()} 
                      color={getStatusColor(order.status)}
                      icon={getStatusIcon(order.status)}
                    />
                  </Box>

                  <List dense>
                    {order.items.map((item) => (
                      <ListItem key={item.id} sx={{ px: 0 }}>
                        <ListItemAvatar>
                          <Avatar 
                            src={item.image_url} 
                            variant="rounded"
                            sx={{ width: 60, height: 60 }}
                          />
                        </ListItemAvatar>
                        <ListItemText
                          primary={item.name}
                          secondary={`Qty: ${item.quantity} × ${parseFloat(item.price || 0).toFixed(2)}`}
                          sx={{ ml: 2 }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                    <Typography variant="h5" color="primary" fontWeight="bold" gutterBottom>
                      ${parseFloat(order.total || 0).toFixed(2)}
                    </Typography>
                    
                    {order.estimated_delivery && (
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Expected: {new Date(order.estimated_delivery).toLocaleDateString()}
                      </Typography>
                    )}

                    <Stack spacing={1} sx={{ mt: 2 }}>
                      <Button 
                        variant="outlined" 
                        startIcon={<ViewIcon />}
                        onClick={() => handleViewOrder(order)}
                        fullWidth
                      >
                        View Details
                      </Button>
                      
                      {order.tracking_number && (
                        <Button 
                          variant="text" 
                          startIcon={<DeliveryIcon />}
                          onClick={() => handleTrackOrder(order.tracking_number)}
                          fullWidth
                        >
                          Track Package
                        </Button>
                      )}
                    </Stack>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        ))}
      </Stack>

      {/* Order Details Dialog */}
      <Dialog open={orderDialog} onClose={() => setOrderDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ReceiptIcon />
          Order Details - #{selectedOrder?.id}
        </DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={4}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="h6" gutterBottom>
                    Order Items
                  </Typography>
                  <List>
                    {selectedOrder.items.map((item) => (
                      <ListItem key={item.id} sx={{ px: 0 }}>
                        <ListItemAvatar>
                          <Avatar 
                            src={item.image_url} 
                            variant="rounded"
                            sx={{ width: 50, height: 50 }}
                          />
                        </ListItemAvatar>
                        <ListItemText
                          primary={item.name}
                          secondary={
                            <Box>
                              <Typography variant="body2">
                                Quantity: {item.quantity}
                              </Typography>
                              <Typography variant="body2" color="primary" fontWeight="bold">
                                ${parseFloat(item.price || 0).toFixed(2)} each
                              </Typography>
                            </Box>
                          }
                          sx={{ ml: 2 }}
                        />
                      </ListItem>
                    ))}
                  </List>

                  <Divider sx={{ my: 2 }} />
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography>Subtotal:</Typography>
                    <Typography>${(parseFloat(selectedOrder.total || 0) - 9.99).toFixed(2)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography>Shipping:</Typography>
                    <Typography>$9.99</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                    <Typography variant="h6">Total:</Typography>
                    <Typography variant="h6" color="primary">
                      ${parseFloat(selectedOrder.total || 0).toFixed(2)}
                    </Typography>
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="h6" gutterBottom>
                    Order Status
                  </Typography>
                  {renderOrderTimeline(selectedOrder)}

                  <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                    Shipping Address
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography>
                      {selectedOrder.shipping_address.firstName} {selectedOrder.shipping_address.lastName}
                    </Typography>
                    <Typography>{selectedOrder.shipping_address.address}</Typography>
                    <Typography>
                      {selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state} {selectedOrder.shipping_address.zipCode}
                    </Typography>
                  </Paper>

                  {selectedOrder.tracking_number && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="h6" gutterBottom>
                        Tracking Information
                      </Typography>
                      <Alert severity="info" sx={{ mb: 2 }}>
                        Tracking Number: {selectedOrder.tracking_number}
                      </Alert>
                      <Button 
                        variant="contained" 
                        startIcon={<DeliveryIcon />}
                        onClick={() => handleTrackOrder(selectedOrder.tracking_number)}
                        fullWidth
                      >
                        Track Package
                      </Button>
                    </Box>
                  )}
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOrderDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}