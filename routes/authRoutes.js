const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/users/:userId', authController.getUserDetails);

router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password/:resetToken', authController.resetPassword);


module.exports = router;
