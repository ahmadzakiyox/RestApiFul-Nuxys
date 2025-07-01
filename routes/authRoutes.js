const express = require('express');
// Pastikan 'login' diimpor di sini
const { register, verifyEmail, login } = require('../controllers/authController');
const router = express.Router();

router.post('/register', register);
router.post('/login', login); // Baris ini sekarang akan berfungsi
router.get('/verifyemail/:token', verifyEmail);

module.exports = router;