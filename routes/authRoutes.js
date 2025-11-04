const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Registration route
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/loginT', authController.loginT);
router.post('/registerT', authController.registerT);
router.get('/profile', authController.getProfile);
module.exports = router
