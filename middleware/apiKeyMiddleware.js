const path = require('path');
const ApiKey = require('../models/apiKeyModel');

const validateApiKey = async (req, res, next) => {
  const apiKey = req.header('X-API-Key');

  // 1. Cek jika API key ada di header
  if (!apiKey) {
    return res.status(401).json({ success: false, message: 'Access denied. No API Key provided.' });
  }

  try {
    // 2. Cari key di database
    const keyData = await ApiKey.findOne({ key: apiKey });

    if (!keyData) {
      // Sesuai permintaan, kirim file HTML statis untuk key tidak valid
      return res.status(403).sendFile(path.join(__dirname, '..', 'public', '404.html'));
    }

    // 3. Cek logika reset limit harian
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set ke awal hari

    if (keyData.lastResetDate < today) {
      keyData.requestCount = 0;
      keyData.lastResetDate = today;
    }

    // 4. Cek limit request (tier 'premium' tidak punya limit)
    if (keyData.tier === 'free' && keyData.requestCount >= keyData.requestLimit) {
      return res.status(429).json({
        success: false,
        message: 'Too Many Requests. Daily limit exceeded.',
      });
    }

    // 5. Jika semua valid, update hitungan dan lanjutkan
    keyData.requestCount += 1;
    await keyData.save();

    // Pasang info user ke request untuk logging jika perlu
    req.user = { id: keyData.user };
    next();

  } catch (error) {
    console.error('API Key Middleware Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

module.exports = { validateApiKey };