const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
}, {
  timestamps: true,
});

// Pastikan ada pengaturan default saat aplikasi pertama kali berjalan
settingsSchema.statics.initialize = async function() {
  const maintenance = await this.findOne({ key: 'maintenanceMode' });
  if (!maintenance) {
    await this.create({ key: 'maintenanceMode', value: false });
    console.log('Default setting "maintenanceMode" initialized.');
  }
};

const Settings = mongoose.model('Settings', settingsSchema);
module.exports = Settings;