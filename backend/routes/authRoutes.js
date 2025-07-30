const express = require('express');
const router = express.Router();
const { login, register, forgotPassword, resetPassword } = require('../controllers/authController');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

router.post('/login', login);
router.post('/register', register);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

router.get('/verify-auth', async function(req, res) {
  const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ valid: false });
  }

  try {
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    
    // Check if user exists in database
    const user = await User.findById(decoded.userId).exec();
    
    if (!user) {
      return res.status(401).json({ valid: false });
    }

    // If everything is valid, return user information
    res.json({ 
      valid: true, 
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        name: user.name,
        email: user.email,
        department: user.department,
        employeeCode: user.employeeCode,
        designation: user.designation,
        contactNumber: user.contactNumber
      }
    });
    
  } catch (err) {
    console.error('Token verification error:', err);
    return res.status(401).json({ valid: false });
  }
});

module.exports = router;
