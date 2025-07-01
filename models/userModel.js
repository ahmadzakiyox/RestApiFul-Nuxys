const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email address',
    ],
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false, // Jangan ikut sertakan password pada query find secara default
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  isBlocked: {
    type: Boolean,
    default: false,
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  apiKey: {
    type: mongoose.Schema.ObjectId,
    ref: 'ApiKey'
  },
}, {
  timestamps: true, // Otomatis menambahkan createdAt dan updatedAt
});

// Middleware (pre-save hook) untuk hash password sebelum disimpan
userSchema.pre('save', async function(next) {
  // Hanya jalankan jika password diubah (atau baru)
  if (!this.isModified('password')) return next();

  // Hash password dengan cost factor 12
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);

  // Hapus field passwordConfirm jika ada (tidak kita simpan)
  // this.passwordConfirm = undefined; 
  next();
});

// Instance method untuk membandingkan password
userSchema.methods.comparePassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model('User', userSchema);
module.exports = User;