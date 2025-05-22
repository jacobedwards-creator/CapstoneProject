import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Avatar,
  Divider,
  Tab,
  Tabs,
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
  IconButton,
  InputAdornment
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Security as SecurityIcon,
  AccountCircle as AccountIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import axios from 'axios';

export default function Profile() {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // Profile Info State
  const [profileInfo, setProfileInfo] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: ''
  });
  const [editingProfile, setEditingProfile] = useState(false);
  
  // Email Change State
  const [emailDialog, setEmailDialog] = useState(false);
  const [emailForm, setEmailForm] = useState({
    currentPassword: '',
    newEmail: '',
    confirmEmail: ''
  });
  const [emailLoading, setEmailLoading] = useState(false);
  
  // Password Change State
  const [passwordDialog, setPasswordDialog] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    // Initialize profile info with user data
    setProfileInfo({
      username: user.username || '',
      email: user.email || '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      phone: user.phone || '',
      address: user.address || '',
      city: user.city || '',
      state: user.state || '',
      zipCode: user.zipCode || ''
    });
  }, [user, navigate]);

  // Profile Info Functions
  const handleProfileSave = async () => {
    try {
      setLoading(true);
      
      const response = await axios.put('/api/users/profile', {
        firstName: profileInfo.firstName,
        lastName: profileInfo.lastName,
        phone: profileInfo.phone,
        address: profileInfo.address,
        city: profileInfo.city,
        state: profileInfo.state,
        zipCode: profileInfo.zipCode
      });

      if (response.data.success) {
        toast.success('Profile updated successfully');
        setEditingProfile(false);
      } else {
        toast.error(response.data.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  // Email Change Functions
  const validateEmailForm = () => {
    if (!emailForm.currentPassword) {
      toast.error('Current password is required');
      return false;
    }
    if (!emailForm.newEmail) {
      toast.error('New email is required');
      return false;
    }
    if (!emailForm.newEmail.includes('@')) {
      toast.error('Please enter a valid email address');
      return false;
    }
    if (emailForm.newEmail !== emailForm.confirmEmail) {
      toast.error('Email addresses do not match');
      return false;
    }
    if (emailForm.newEmail === user.email) {
      toast.error('New email must be different from current email');
      return false;
    }
    return true;
  };

  const handleEmailChange = async () => {
    if (!validateEmailForm()) return;

    try {
      setEmailLoading(true);
      
      const response = await axios.put('/api/users/change-email', {
        currentPassword: emailForm.currentPassword,
        newEmail: emailForm.newEmail
      });

      if (response.data.success) {
        toast.success('Email updated successfully! Please log in again.');
        setEmailDialog(false);
        setEmailForm({ currentPassword: '', newEmail: '', confirmEmail: '' });
        
        // Force logout since email changed
        setTimeout(() => {
          logout();
          navigate('/login');
        }, 2000);
      } else {
        toast.error(response.data.error || 'Failed to update email');
      }
    } catch (error) {
      console.error('Email change error:', error);
      toast.error(error.response?.data?.error || 'Failed to update email');
    } finally {
      setEmailLoading(false);
    }
  };

  // Password Change Functions
  const validatePasswordForm = () => {
    if (!passwordForm.currentPassword) {
      toast.error('Current password is required');
      return false;
    }
    if (!passwordForm.newPassword) {
      toast.error('New password is required');
      return false;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long');
      return false;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return false;
    }
    if (passwordForm.newPassword === passwordForm.currentPassword) {
      toast.error('New password must be different from current password');
      return false;
    }
    return true;
  };

  const handlePasswordChange = async () => {
    if (!validatePasswordForm()) return;

    try {
      setPasswordLoading(true);
      
      const response = await axios.put('/api/users/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });

      if (response.data.success) {
        toast.success('Password updated successfully!');
        setPasswordDialog(false);
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        toast.error(response.data.error || 'Failed to update password');
      }
    } catch (error) {
      console.error('Password change error:', error);
      toast.error(error.response?.data?.error || 'Failed to update password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const renderProfileTab = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Profile Information</Typography>
        <Button
          variant={editingProfile ? "outlined" : "contained"}
          startIcon={editingProfile ? <CancelIcon /> : <EditIcon />}
          onClick={() => {
            setEditingProfile(!editingProfile);
            if (editingProfile) {
              // Reset form when canceling
              setProfileInfo({
                username: user.username || '',
                email: user.email || '',
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                phone: user.phone || '',
                address: user.address || '',
                city: user.city || '',
                state: user.state || '',
                zipCode: user.zipCode || ''
              });
            }
          }}
        >
          {editingProfile ? 'Cancel' : 'Edit Profile'}
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar sx={{ width: 100, height: 100, mx: 'auto', mb: 2, fontSize: '2rem' }}>
                {user?.username?.[0]?.toUpperCase() || 'U'}
              </Avatar>
              <Typography variant="h6" gutterBottom>
                {user?.username}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {user?.email}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Member since {new Date(user?.created_at || Date.now()).toLocaleDateString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Username"
                    value={profileInfo.username}
                    disabled
                    helperText="Username cannot be changed"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Email"
                    value={profileInfo.email}
                    disabled
                    helperText="Use security tab to change email"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="First Name"
                    value={profileInfo.firstName}
                    onChange={(e) => setProfileInfo({...profileInfo, firstName: e.target.value})}
                    disabled={!editingProfile}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    value={profileInfo.lastName}
                    onChange={(e) => setProfileInfo({...profileInfo, lastName: e.target.value})}
                    disabled={!editingProfile}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Phone"
                    value={profileInfo.phone}
                    onChange={(e) => setProfileInfo({...profileInfo, phone: e.target.value})}
                    disabled={!editingProfile}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Address"
                    value={profileInfo.address}
                    onChange={(e) => setProfileInfo({...profileInfo, address: e.target.value})}
                    disabled={!editingProfile}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    fullWidth
                    label="City"
                    value={profileInfo.city}
                    onChange={(e) => setProfileInfo({...profileInfo, city: e.target.value})}
                    disabled={!editingProfile}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    fullWidth
                    label="State"
                    value={profileInfo.state}
                    onChange={(e) => setProfileInfo({...profileInfo, state: e.target.value})}
                    disabled={!editingProfile}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    fullWidth
                    label="ZIP Code"
                    value={profileInfo.zipCode}
                    onChange={(e) => setProfileInfo({...profileInfo, zipCode: e.target.value})}
                    disabled={!editingProfile}
                  />
                </Grid>
              </Grid>

              {editingProfile && (
                <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    onClick={() => setEditingProfile(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleProfileSave}
                    disabled={loading}
                  >
                    {loading ? <CircularProgress size={20} /> : 'Save Changes'}
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  const renderSecurityTab = () => (
    <Box>
      <Typography variant="h5" gutterBottom>
        Security Settings
      </Typography>

      <Stack spacing={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <EmailIcon sx={{ mr: 2, color: 'primary.main' }} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6">Email Address</Typography>
                <Typography variant="body2" color="text.secondary">
                  Current: {user?.email}
                </Typography>
              </Box>
              <Button
                variant="outlined"
                onClick={() => setEmailDialog(true)}
                startIcon={<EditIcon />}
              >
                Change Email
              </Button>
            </Box>
            <Alert severity="info" sx={{ mt: 2 }}>
              Changing your email will require you to log in again for security.
            </Alert>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <LockIcon sx={{ mr: 2, color: 'primary.main' }} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6">Password</Typography>
                <Typography variant="body2" color="text.secondary">
                  Last changed: Recently
                </Typography>
              </Box>
              <Button
                variant="outlined"
                onClick={() => setPasswordDialog(true)}
                startIcon={<EditIcon />}
              >
                Change Password
              </Button>
            </Box>
            <Alert severity="warning" sx={{ mt: 2 }}>
              Use a strong password with at least 6 characters for better security.
            </Alert>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );

  if (!user) {
    return null;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link color="inherit" href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }}>
          Home
        </Link>
        <Typography color="text.primary">Profile</Typography>
      </Breadcrumbs>

      <Typography variant="h4" gutterBottom>
        My Profile
      </Typography>

      <Paper sx={{ width: '100%' }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab icon={<AccountIcon />} label="Profile" />
          <Tab icon={<SecurityIcon />} label="Security" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {tabValue === 0 && renderProfileTab()}
          {tabValue === 1 && renderSecurityTab()}
        </Box>
      </Paper>

      {/* Email Change Dialog */}
      <Dialog open={emailDialog} onClose={() => setEmailDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <EmailIcon />
          Change Email Address
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 3 }}>
            For security, you must confirm your current password to change your email.
          </Alert>
          
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              type="password"
              label="Current Password"
              value={emailForm.currentPassword}
              onChange={(e) => setEmailForm({...emailForm, currentPassword: e.target.value})}
              required
            />
            <TextField
              fullWidth
              type="email"
              label="New Email Address"
              value={emailForm.newEmail}
              onChange={(e) => setEmailForm({...emailForm, newEmail: e.target.value})}
              required
            />
            <TextField
              fullWidth
              type="email"
              label="Confirm New Email"
              value={emailForm.confirmEmail}
              onChange={(e) => setEmailForm({...emailForm, confirmEmail: e.target.value})}
              required
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setEmailDialog(false);
            setEmailForm({ currentPassword: '', newEmail: '', confirmEmail: '' });
          }}>
            Cancel
          </Button>
          <Button 
            onClick={handleEmailChange}
            variant="contained"
            disabled={emailLoading}
          >
            {emailLoading ? <CircularProgress size={20} /> : 'Change Email'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Password Change Dialog */}
      <Dialog open={passwordDialog} onClose={() => setPasswordDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LockIcon />
          Change Password
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 3 }}>
            Your new password must be at least 6 characters long and different from your current password.
          </Alert>
          
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              type={showPasswords.current ? 'text' : 'password'}
              label="Current Password"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
              required
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => togglePasswordVisibility('current')}
                        edge="end"
                      >
                        {showPasswords.current ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  )
                }
              }}
            />
            <TextField
              fullWidth
              type={showPasswords.new ? 'text' : 'password'}
              label="New Password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
              required
              helperText="Must be at least 6 characters"
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => togglePasswordVisibility('new')}
                        edge="end"
                      >
                        {showPasswords.new ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  )
                }
              }}
            />
            <TextField
              fullWidth
              type={showPasswords.confirm ? 'text' : 'password'}
              label="Confirm New Password"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
              required
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => togglePasswordVisibility('confirm')}
                        edge="end"
                      >
                        {showPasswords.confirm ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  )
                }
              }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setPasswordDialog(false);
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
          }}>
            Cancel
          </Button>
          <Button 
            onClick={handlePasswordChange}
            variant="contained"
            disabled={passwordLoading}
          >
            {passwordLoading ? <CircularProgress size={20} /> : 'Change Password'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}