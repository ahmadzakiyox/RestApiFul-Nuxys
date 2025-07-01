const User = require('../models/userModel');
const ApiKey = require('../models/apiKeyModel');
const Settings = require('../models/settingsModel'); // <-- Impor model
const { exec } = require('child_process'); // <-- Impor untuk menjalankan perintah shell
const path = require('path');
const fs = require('fs');
// @desc    Get all users
// @route   GET /api/admin/users
// @access  Admin
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().populate('apiKey', 'key tier');
        res.status(200).json({ success: true, count: users.length, data: users });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Update a user by ID
// @route   PUT /api/admin/users/:id
// @access  Admin
exports.updateUser = async (req, res) => {
    try {
        // Data yang boleh diubah oleh admin
        const { role, isVerified, isBlocked } = req.body;
        const user = await User.findByIdAndUpdate(req.params.id, { role, isVerified, isBlocked }, {
            new: true,
            runValidators: true
        });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Delete a user by ID
// @route   DELETE /api/admin/users/:id
// @access  Admin
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Hapus juga API key yang terhubung
        await ApiKey.deleteMany({ user: user._id });
        
        // Hapus user
        await user.deleteOne();

        res.status(200).json({ success: true, message: 'User and associated API keys deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Admin
exports.getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalApiKeys = await ApiKey.countDocuments();
        const premiumKeys = await ApiKey.countDocuments({ tier: 'premium' });
        
        // Agregasi untuk total request hari ini
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const dailyRequests = await ApiKey.aggregate([
            { $match: { lastResetDate: { $gte: today } } },
            { $group: { _id: null, total: { $sum: '$requestCount' } } }
        ]);

        const stats = {
            totalUsers,
            totalApiKeys,
            premiumKeys,
            requestsToday: dailyRequests.length > 0 ? dailyRequests[0].total : 0
        };

        res.status(200).json({ success: true, data: stats });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};


// @desc    Get all API keys
// @route   GET /api/admin/apikeys
// @access  Admin
exports.getAllApiKeys = async (req, res) => {
    try {
        const apiKeys = await ApiKey.find().populate('user', 'name email');
        res.status(200).json({ success: true, count: apiKeys.length, data: apiKeys });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Update an API key by ID
// @route   PUT /api/admin/apikeys/:id
// @access  Admin
exports.updateApiKey = async (req, res) => {
    try {
        const { tier } = req.body;
        
        // Tentukan limit baru berdasarkan tier
        const requestLimit = (tier === 'premium') ? 1000000 : 10; // Angka besar untuk unlimited

        const apiKey = await ApiKey.findByIdAndUpdate(req.params.id, { tier, requestLimit }, {
            new: true,
            runValidators: true
        });

        if (!apiKey) {
            return res.status(404).json({ success: false, message: 'API Key not found' });
        }
        res.status(200).json({ success: true, data: apiKey });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};


// @desc    Delete an API key by ID
// @route   DELETE /api/admin/apikeys/:id
// @access  Admin
exports.deleteApiKey = async (req, res) => {
    try {
        const apiKey = await ApiKey.findById(req.params.id);
        if (!apiKey) {
            return res.status(404).json({ success: false, message: 'API Key not found' });
        }

        // Hapus referensi dari dokumen User
        await User.updateOne({ _id: apiKey.user }, { $unset: { apiKey: "" } });
        
        // Hapus API key
        await apiKey.deleteOne();

        res.status(200).json({ success: true, message: 'API Key deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// --- PENGATURAN SISTEM ---
// @desc    Get all settings
// @route   GET /api/admin/settings
// @access  Admin
exports.getSettings = async (req, res) => {
    try {
        const settings = await Settings.find();
        // Ubah array menjadi objek agar lebih mudah diakses di frontend
        const settingsObj = settings.reduce((acc, setting) => {
            acc[setting.key] = setting.value;
            return acc;
        }, {});
        res.status(200).json({ success: true, data: settingsObj });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Update a setting
// @route   PUT /api/admin/settings
// @access  Admin
exports.updateSettings = async (req, res) => {
    try {
        const { key, value } = req.body;
        const updatedSetting = await Settings.findOneAndUpdate({ key }, { value }, {
            new: true,
            upsert: true // Buat jika belum ada
        });
        res.status(200).json({ success: true, data: updatedSetting });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// --- BACKUP & RESTORE ---
// @desc    Backup the database
// @route   POST /api/admin/backup
// @access  Admin
exports.backupDatabase = (req, res) => {
    const backupDir = path.join(__dirname, '..', 'backups');
    if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir);
    }

    const dbName = new URL(process.env.MONGO_URI).pathname.substring(1);
    const backupPath = path.join(backupDir, `backup-${dbName}-${Date.now()}`);

    const command = `mongodump --uri="${process.env.MONGO_URI}" --out="${backupPath}"`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Backup Error: ${error.message}`);
            return res.status(500).json({ success: false, message: 'Backup failed', error: error.message });
        }
        if (stderr) {
            console.warn(`Backup Stderr: ${stderr}`);
        }
        res.status(200).json({ success: true, message: `Backup created successfully at ${backupPath}` });
    });
};