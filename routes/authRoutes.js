const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/signup', userController.signUp);
router.post('/signin', userController.SignIn);
router.post('/forgot-password', userController.forgotPassword);
router.get('/reset-password/:token', userController.validateResetToken);
router.post('/reset-password/:token', userController.resetPassword);

module.exports = router;