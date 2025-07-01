const User = require('../models/userModel');
const ApiKey = require('../models/apiKeyModel');
const generateApiKey = require('../utils/apiKeyGenerator');

// @desc    Generate or retrieve a user's API key
// @route   POST /api/user/apikey
// @access  Private
exports.generateApiKey = async (req, res) => {
  try {
    // Cek apakah user sudah punya API key
    let apiKey = await ApiKey.findOne({ user: req.user.id });

    if (apiKey) {
      return res.status(400).json({ 
        success: false, 
        message: 'API Key already exists for this user.' 
      });
    }

    // Jika belum ada, buat yang baru
    const newKeyString = generateApiKey(15);
    apiKey = await ApiKey.create({
      key: newKeyString,
      user: req.user.id,
      // tier dan requestLimit akan menggunakan nilai default dari skema
    });
    
    // Simpan referensi apiKey di dokumen User
    await User.findByIdAndUpdate(req.user.id, { apiKey: apiKey._id });

    res.status(201).json({
      success: true,
      message: 'API Key generated successfully',
      apiKey: apiKey.key,
    });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};


// @desc    Get user's API key details
// @route   GET /api/user/apikey
// @access  Private
exports.checkApiKey = async (req, res) => {
    try {
        const apiKey = await ApiKey.findOne({ user: req.user.id });

        if (!apiKey) {
            return res.status(404).json({ success: false, message: 'No API Key found for this user. Please generate one.' });
        }

        res.status(200).json({
            success: true,
            apiKey: {
                key: apiKey.key,
                tier: apiKey.tier,
                requestCount: apiKey.requestCount,
                requestLimit: apiKey.requestLimit,
                createdAt: apiKey.createdAt
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};