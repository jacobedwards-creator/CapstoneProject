import express from 'express';
import bcrypt from 'bcryptjs';
import { 
  getUserById, 
  updateUser, 
  updatePassword,
  getUserProfile,
  deleteUser
} from '../database/queries/user.queries.js';
import { authMiddleware } from '../middleware/auth.js';
import { isAdmin } from '../middleware/isAdmin.js';

const router = express.Router();

// Require authentication for all user routes
router.use(authMiddleware);

// Get current user profile
router.get('/profile', async (req, res) => {
  try {
    const profile = await getUserProfile(req.user.id);
    
    if (!profile) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Update user profile
router.put('/profile', async (req, res) => {
  try {
    const { username, email } = req.body;
    
    const updatedUser = await updateUser(req.user.id, { username, email });
    
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (err) {
    if (err.message.includes('duplicate key')) {
      return res.status(400).json({ error: 'Email already in use' });
    }
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

export default router;