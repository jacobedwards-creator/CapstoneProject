import jwt from 'jsonwebtoken';
import { getUserById } from '../database/queries/user.queries.js';

export const authMiddleware = async (req, res, next) => {
  // Get token from header
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Authorization denied, no token provided' });
  }
  
  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decoded for user ID:', decoded.id);
    
    // Get full user details from database
    const user = await getUserById(decoded.id);
    if (!user) {
      console.log('User not found in database:', decoded.id);
      return res.status(401).json({ error: 'User not found' });
    }
    
    console.log('User found:', { id: user.id, username: user.username, is_admin: user.is_admin });
    req.user = user;
    next();
  } catch (err) {
    console.error('Token verification error:', err);
    res.status(401).json({ error: 'Token is not valid' });
  }
};