const express = require('express');
const { generateApiKey, checkApiKey } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Semua rute di bawah ini akan diproteksi (membutuhkan login)
router.use(protect);

router.route('/apikey')
  .post(generateApiKey)
  .get(checkApiKey);

module.exports = router;