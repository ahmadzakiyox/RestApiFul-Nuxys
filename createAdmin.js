const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const User = require('./models/userModel');

// Load environment variables
dotenv.config();

// Hubungkan ke database
connectDB();

const createAdmin = async () => {
    try {
        // --- UBAH DETAIL ADMIN DI SINI ---
        const adminEmail = 'admin@zaki.com';
        const adminPassword = '123456';
        const adminName = 'Admin Utama';
        // ------------------------------------

        // Cek apakah admin sudah ada
        const adminExists = await User.findOne({ email: adminEmail });

        if (adminExists) {
            console.log('Akun admin dengan email tersebut sudah ada.');
            process.exit();
        }

        // Buat user admin baru
        // isVerified di-set true agar tidak perlu verifikasi email
        const admin = await User.create({
            name: adminName,
            email: adminEmail,
            password: adminPassword,
            role: 'admin',
            isVerified: true 
        });

        console.log('✅ Akun Admin Berhasil Dibuat!');
        console.log(`   Email: ${admin.email}`);
        console.log(`   Password: ${adminPassword} (Ganti segera setelah login)`);
        process.exit();

    } catch (error) {
        console.error('❌ Gagal membuat akun admin:', error);
        process.exit(1);
    }
};

// Panggil fungsi untuk membuat admin
createAdmin();