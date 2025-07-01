const axios = require('axios');
const cheerio = require('cheerio');

async function scrapeFastDl(instagramUrl) {
  console.log(`\n--- Memproses URL: ${instagramUrl} ---`);

  try {
    const API_ENDPOINT = 'https://fastdl.app/api/convert';
    const payload = { url: instagramUrl };

    const response = await axios.post(API_ENDPOINT, payload, {
      // --- PERBAIKAN: Menambahkan header untuk meniru permintaan browser asli ---
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
        'Origin': 'https://fastdl.app',
        'Referer': 'https://fastdl.app/id/',
        'X-Requested-With': 'XMLHttpRequest'
      },
    });

    if (!response.data || !response.data.result) {
      console.error('❌ Gagal mendapatkan respons dari API FastDl.');
      return;
    }

    const htmlResult = response.data.result;
    const $ = cheerio.load(htmlResult);
    const downloadLinks = [];

    $('a.button-download').each((i, el) => {
      const link = $(el).attr('href');
      if (link) {
        downloadLinks.push(link);
      }
    });

    if (downloadLinks.length > 0) {
      console.log("\n✅ Link unduhan ditemukan:");
      downloadLinks.forEach((link, index) => {
        console.log(`   ${index + 1}: ${link}`);
      });
    } else {
      console.log("\n❌ Tidak ada link unduhan yang ditemukan. URL mungkin tidak valid, privat, atau tidak didukung.");
    }

  } catch (error) {
    console.error('❌ Terjadi kesalahan:', error.message);
  }
}

const targetUrl = process.argv[2];

if (!targetUrl) {
  console.log('Error: Harap berikan URL Instagram sebagai argumen.');
  console.log('Contoh: node scraper.js https://www.instagram.com/p/C8oIdqYy3wU/');
} else {
  scrapeFastDl(targetUrl);
}