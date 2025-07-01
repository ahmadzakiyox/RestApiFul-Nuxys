// controllers/apiController.js

const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const ytdl = require('@distube/ytdl-core');
const { createCanvas, loadImage, registerFont } = require('canvas');
const path = require('path');
const validUrl = require('valid-url');

// --- FUNGSI DARI FILE scp.js ANDA ---

// Daftarkan font kustom (opsional)
try {
    registerFont(path.join(__dirname, '..', 'Manrope-Bold.ttf'), { family: 'Manrope' });
} catch (error) {
    console.warn('Font kustom "Manrope-Bold.ttf" tidak ditemukan. Gunakan font sistem.');
}

// Fungsi pembantu untuk teks dengan glow di canvas
function drawTextWithGlow(ctx, text, x, y, color, blur) {
    ctx.shadowColor = color; ctx.shadowBlur = blur;
    ctx.fillText(text, x, y);
    ctx.shadowBlur = 0;
}

// Catatan: Semua fungsi scraper dari file scp.js Anda (seperti getTopAnime, scrapeFacebookVideo, dll.)
// disalin ke sini. Saya akan meringkasnya agar tidak terlalu panjang, tetapi Anda harus
// menyalin SEMUA fungsi tersebut (finalScraper, getYouTubeInfo, scrapeFacebookVideo, dll.) ke sini.

exports.finalDownloader = async (req, res, next) => {
    // Logika dari fungsi finalScraper
    // ...
};

exports.youtubeDownloader = async (req, res, next) => {
    const { url } = req.query;
    if (!url) return res.status(400).json({ success: false, message: 'Parameter url diperlukan.'});
    try {
        const videoData = await ytdl.getInfo(url);
        // ... (logika lengkap dari getYouTubeInfo)
        res.status(200).json({ success: true, data: videoData });
    } catch(error) { next(error) }
};

exports.facebookDownloader = async (req, res, next) => {
    // Logika dari fungsi scrapeFacebookVideo
    // ...
};

// ...DAN SETERUSNYA UNTUK SEMUA FUNGSI LAINNYA...
// getInstagramProfile, getRandomPinterestImage, takeScreenshot, getNowPlayingMovies, getTopAnime, generateCoolCard

// Contoh lengkap untuk getTopAnime
exports.getTopAnime = async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit, 10) || 50;
        const targetUrl = 'https://myanimelist.net/topanime.php';
        const { data } = await axios.get(targetUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36' }
        });
        const $ = cheerio.load(data);
        const animeList = [];
        $('tr.ranking-list').each((i, el) => {
            if (i >= limit) return false;
            animeList.push({
                rank: $(el).find('td.rank span').text().trim(),
                title: $(el).find('div.detail h3 a').text().trim(),
                score: $(el).find('td.score span.fs14').text().trim(),
            });
        });
        res.status(200).json({ success: true, source: 'myanimelist.net', data: animeList });
    } catch (error) {
        next(error);
    }
};

// Pastikan Anda memindahkan SEMUA fungsi scraper Anda ke sini dan mengekspornya.