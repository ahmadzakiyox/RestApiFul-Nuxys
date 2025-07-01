const crypto = require('crypto');
const User = require('../models/userModel');
const sendEmail = require('../services/emailService');
const jwt = require('jsonwebtoken');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  const { name, email, password } = req.body;

  try {
    // 1) Cek apakah email sudah terdaftar
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already in use' });
    }

    // 2) Buat token verifikasi
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const emailVerificationToken = crypto
      .createHash('sha256')
      .update(verificationToken)
      .digest('hex');

    const emailVerificationExpires = Date.now() + 10 * 60 * 1000; // 10 menit

    // 3) Buat user baru (password akan di-hash oleh pre-save hook di model)
    const user = await User.create({
      name,
      email,
      password,
      emailVerificationToken,
      emailVerificationExpires,
    });

    // 4) Kirim email verifikasi
    const verificationURL = `${process.env.BASE_URL}/api/auth/verifyemail/${verificationToken}`;
    const message = `
      <h1>Email Verification</h1>
      <p>Hi ${user.name},</p>
      <p>Thank you for registering. Please click the link below to verify your email address:</p>
      <a href="${verificationURL}" target="_blank">Verify Email</a>
      <p>This link will expire in 10 minutes.</p>
    `;

    await sendEmail({
      email: user.email,
      subject: 'Verify Your Email Address',
      html: message,
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email to verify your account.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Verify user's email
// @route   GET /api/auth/verifyemail/:token
// @access  Public
exports.verifyEmail = async (req, res, next) => {
    try {
        // 1) Dapatkan token dari URL dan hash token tersebut
        const hashedToken = crypto
            .createHash('sha256')
            .update(req.params.token)
            .digest('hex');
            
        // 2) Cari user berdasarkan token dan pastikan token belum expired
        const user = await User.findOne({ 
            emailVerificationToken: hashedToken,
            emailVerificationExpires: { $gt: Date.now() }
        });

        // 3) Jika user tidak ditemukan atau token expired
        if (!user) {
            return res.status(400).send('<h1>Error</h1><p>Token is invalid or has expired.</p>');
        }

        // 4) Jika ditemukan, update status verifikasi user
        user.isVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpires = undefined;
        await user.save();

        // Redirect ke halaman login atau halaman sukses
        // Untuk sekarang, kita kirim pesan sukses saja
        res.status(200).send('<h1>Success!</h1><p>Your email has been verified. You can now log in.</p>');

    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// Fungsi untuk membuat dan mengirim token
const sendTokenResponse = (user, statusCode, res) => {
  // Buat token
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  // Opsi untuk cookie (lebih aman)
  const cookieOptions = {
    expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 hari
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') {
    cookieOptions.secure = true;
  }

  res.status(statusCode)
     .cookie('token', token, cookieOptions)
     .json({
       success: true,
       token,
       // Redirect di-handle oleh frontend, kita berikan sinyal sukses
       message: 'Login successful. Redirecting to /docs...' 
     });
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Please provide email and password' });
  }
  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password, user.password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    if (!user.isVerified) {
        return res.status(401).json({ success: false, message: 'Please verify your email first' });
    }
    if (user.isBlocked) {
        return res.status(403).json({ success: false, message: 'Your account has been blocked.' });
    }
    sendTokenResponse(user, 200, res);
  } catch (error) {
    // BARIS DEBUGGING DITAMBAHKAN DI SINI
    console.log('LOGIN ERROR:', error); 
    next(error);
  }
};