const express = require('express');
const Router = express.Router();
const { verifyToken, checkRole } = require('../middleware/authMiddleware');
const AuthController = require('../controllers/AuthController.js');

// Public routes
Router.post('/signUp', AuthController.userSignUp);
Router.post('/signIn', AuthController.userSignIn);

// Protected routes
Router.get('/profile', verifyToken, AuthController.getProfile);
Router.put('/change-password', verifyToken, AuthController.changePassword);

module.exports = Router;