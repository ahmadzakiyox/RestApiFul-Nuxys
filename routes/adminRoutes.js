const express = require('express');

// Impor semua fungsi controller yang dibutuhkan dalam satu statement
const { 
    getAllUsers, 
    updateUser, 
    deleteUser,
    getDashboardStats, 
    getAllApiKeys, 
    updateApiKey, 
    deleteApiKey,
    getSettings,
    updateSettings,
    backupDatabase 
} = require('../controllers/adminController');

const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Middleware ini akan melindungi semua rute di bawah untuk admin saja
router.use(protect);
router.use(authorize('admin'));

// Rute Manajemen Pengguna
router.route('/users')
    .get(getAllUsers);

router.route('/users/:id')
    .put(updateUser)
    .delete(deleteUser);

// Rute Statistik
router.route('/stats')
    .get(getDashboardStats);

// Rute Manajemen API Key
router.route('/apikeys')
    .get(getAllApiKeys);

router.route('/apikeys/:id')
    .put(updateApiKey)
    .delete(deleteApiKey);

// Rute Pengaturan Sistem
router.route('/settings')
    .get(getSettings)
    .put(updateSettings);

// Rute Backup Database
router.post('/backup', backupDatabase);

module.exports = router;