import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Divider
} from '@mui/material';
import { 
  ShoppingCart as ShoppingCartIcon,
  AccountCircle as AccountCircleIcon,
  Person as PersonIcon,
  Receipt as ReceiptIcon,
  ExitToApp as LogoutIcon,
  AdminPanelSettings as AdminIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  

  const cartCount = 0;
  
  // Profile menu state
  const [anchorEl, setAnchorEl] = useState(null);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // Profile menu handlers
  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMenuClick = (path) => {
    navigate(path);
    handleProfileMenuClose();
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ flexGrow: 1, cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          The Jacob Emporium
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {isAuthenticated ? (
            <>
              <Typography variant="body2">
                Welcome, {user.username}!
              </Typography>
              
              <IconButton 
                color="inherit" 
                onClick={() => navigate('/cart')}
              >
                <Badge badgeContent={cartCount} color="error">
                  <ShoppingCartIcon />
                </Badge>
              </IconButton>
              
              {/* Profile Menu Button */}
              <IconButton 
                color="inherit" 
                onClick={handleProfileMenuOpen}
              >
                <AccountCircleIcon />
              </IconButton>
              
              {/* Profile Dropdown Menu */}
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleProfileMenuClose}
                onClick={handleProfileMenuClose}
                PaperProps={{
                  elevation: 3,
                  sx: {
                    mt: 1.5,
                    minWidth: 200,
                    '& .MuiMenuItem-root': {
                      px: 2,
                      py: 1,
                    },
                  },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <MenuItem onClick={() => handleMenuClick('/profile')}>
                  <PersonIcon sx={{ mr: 2 }} />
                  My Profile
                </MenuItem>
                <MenuItem onClick={() => handleMenuClick('/orders')}>
                  <ReceiptIcon sx={{ mr: 2 }} />
                  Order History
                </MenuItem>
                <Divider />
                {user?.is_admin && (
                  <MenuItem onClick={() => handleMenuClick('/admin')}>
                    <AdminIcon sx={{ mr: 2 }} />
                    Admin Dashboard
                  </MenuItem>
                )}
                {user?.is_admin && <Divider />}
                <MenuItem onClick={handleLogout}>
                  <LogoutIcon sx={{ mr: 2 }} />
                  Logout
                </MenuItem>
              </Menu>
              
              <Button color="inherit" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button color="inherit" onClick={() => navigate('/login')}>
                Login
              </Button>
              <Button color="inherit" onClick={() => navigate('/register')}>
                Register
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}