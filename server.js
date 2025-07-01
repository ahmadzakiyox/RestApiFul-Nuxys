const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorMiddleware');

// Impor model dan middleware yang dibutuhkan
const Settings = require('./models/settingsModel');
const { protect, authorize } = require('./middleware/authMiddleware');

// Load environment variables
dotenv.config();

const app = express();

// Middleware Inti
app.use(express.json()); // Membaca body JSON
app.use(express.urlencoded({ extended: false })); // Membaca body form
app.use(cookieParser()); // Membaca cookie
app.use(cors()); // Mengizinkan Cross-Origin Resource Sharing

// Middleware untuk menyajikan file statis dari folder 'public'
// Kode yang sudah diperbaiki
app.use(express.static(path.join(__dirname, 'public'), { extensions: ['html'] }));

// Middleware untuk Mode Maintenance (dinamis dari database)
// Ditempatkan setelah middleware statis agar tidak mengganggu file CSS/JS
app.use(async (req, res, next) => {
  // Abaikan cek untuk rute admin agar admin tetap bisa login untuk menonaktifkan mode
  if (req.path.startsWith('/api/admin') || req.path.startsWith('/admin')) {
    return next();
  }
  try {
    const maintenanceSetting = await Settings.findOne({ key: 'maintenanceMode' });
    if (maintenanceSetting && maintenanceSetting.value === true) {
      return res.status(503).sendFile(path.join(__dirname, 'public', 'maintenance.html'));
    }
    next();
  } catch (error) {
    // Jika ada error koneksi DB saat cek, lanjutkan saja agar situs tidak mati total
    console.error("Maintenance check failed, proceeding...", error);
    next();
  }
});

// === BAGIAN RUTE (ROUTES) ===
// Rute utama ke index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Rute API
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/user', require('./routes/userRoutes'));
app.use('/api/v1', require('./routes/apiRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/docs', require('./routes/docsRoutes'));

// Rute halaman yang diproteksi
app.get('/docs', protect, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'docs.html'));
});

app.get('/admin', protect, authorize('admin'), (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'admin.html'));
});

// Middleware Penanganan Error (Harus diletakkan paling akhir)
app.use(errorHandler);

// === BAGIAN SERVER START ===
const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        // 1. Hubungkan ke database
        await connectDB();
        
        // 2. Inisialisasi pengaturan default setelah DB terhubung
        await Settings.initialize();
        
        // 3. Jalankan server HANYA JIKA DB berhasil terhubung
        app.listen(PORT, () => {
            console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
        });
    } catch (error) {
        console.error("Failed to connect to database:", error);
        process.exit(1); // Hentikan proses jika koneksi DB gagal
    }
};

// Panggil fungsi untuk memulai server
startServer();