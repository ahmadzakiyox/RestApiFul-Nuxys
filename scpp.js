// File: scp.js (Versi Terminal)

const puppeteer = require('puppeteer');
const axios = require('axios');
const cheerio = require('cheerio');
const ytdl = require('@distube/ytdl-core');
const { createCanvas, loadImage, registerFont } = require('canvas');
const path = require('path');
const fs = require('fs'); // Modul File System untuk menyimpan gambar


/**
 * Fungsi untuk scrape berita dari halaman utama Detik.com
 */
async function scrapeDetik() {
  const url = 'https://www.detik.com/';
  console.log(`\n--- Mengambil data dari DETIK.COM ---`);
  
  try {
    const { data } = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    const $ = cheerio.load(data);
    const articles = [];
    
    // Selector untuk Detik.com (berdasarkan struktur terakhir yang valid)
    $('article.list-content__item').each((i, el) => {
      const title = $(el).find('h2.media__title').text().trim();
      const link = $(el).find('a').attr('href');
      if (title && link) {
        articles.push({ source: 'Detik.com', title, link });
      }
    });

    console.log(articles);
  } catch (error) {
    console.error('❌ Gagal scrape Detik.com:', error.message);
  }
}

async function scrapeCoinMarketCap() {
    const apiUrl = 'https://api.coinmarketcap.com/data-api/v3/cryptocurrency/listing?start=1&limit=15&sortBy=market_cap&sortType=desc&convertId=2781&cryptoType=all&tagType=all';
  console.log(`\n--- Mengambil data dari API COINMARKETCAP.COM ---`);
  
  try {
    const response = await axios.get(apiUrl);

    // Data berada di dalam response.data.data.cryptoCurrencyList
    const cryptoList = response.data.data.cryptoCurrencyList;
    const cryptoData = [];

    // Looping melalui data JSON yang didapat dari API
    cryptoList.forEach(crypto => {
      cryptoData.push({
        rank: crypto.cmcRank,
        name: `${crypto.name} (${crypto.symbol})`,
        // Harga ada di dalam array 'quotes'
        price: crypto.quotes[0].price
      });
    });

    console.log("\n--- HASIL SCRAPING ---");
    console.log(cryptoData);

  } catch (error) {
    console.error('❌ Gagal mengambil data dari API:', error.message);
  }
}


async function tiktokdl(postUrl) {
    console.log(`[Downloader] Memulai proses untuk: ${postUrl}`);
    let browser;
    try {
        browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
        const page = await browser.newPage();
        await page.goto('https://snapsave.app/', { waitUntil: 'networkidle2' });
        await page.type('#url', postUrl, { delay: 100 });
        await page.click('button[type="submit"]');
        await page.waitForSelector('.download-items__btn', { visible: true, timeout: 30000 });
        const downloadLink = await page.evaluate(() => document.querySelector('.download-items__btn a')?.href);
        if (!downloadLink) throw new Error('Link download tidak ditemukan.');
        console.log('\n--- HASIL ---');
        console.log('Link Download:', downloadLink);
    } catch (error) {
        console.error(`❌ Gagal: ${error.message}`);
    } finally {
        if (browser) await browser.close();
    }
}

async function getYouTubeInfo(youtubeUrl) {
    console.log(`[YouTube] Memulai proses untuk: ${youtubeUrl}`);
    if (!ytdl.validateURL(youtubeUrl)) return console.error('URL YouTube tidak valid.');
    try {
        const info = await ytdl.getInfo(youtubeUrl);
        const bestFormat = ytdl.chooseFormat(ytdl.filterFormats(info.formats, 'videoandaudio'), { quality: 'highest' });
        console.log('\n--- HASIL ---');
        console.log('Judul:', info.videoDetails.title);
        console.log('Channel:', info.videoDetails.author.name);
        console.log('Kualitas:', bestFormat.qualityLabel);
        console.log('Link Download:', bestFormat.url);
    } catch (error) {
        console.error(`❌ Gagal: ${error.message}`);
    }
}

async function scrapeFacebookVideo(postUrl) {
    console.log(`[Facebook] Memulai proses untuk: ${postUrl}`);
    let browser;
    try {
        browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
        const page = await browser.newPage();
        await page.goto('https://snapsave.app/', { waitUntil: 'networkidle2' });
        await page.type('#url', postUrl, { delay: 100 });
        await page.click('button[type="submit"]');
        await page.waitForSelector('a.button.is-success.is-small', { visible: true, timeout: 30000 });
        const downloadLink = await page.$eval('a.button.is-success.is-small', el => el.href);
        if (!downloadLink) throw new Error('Link download tidak ditemukan.');
        console.log('\n--- HASIL ---');
        console.log('Link Download:', downloadLink);
    } catch (error) {
        console.error(`❌ Gagal: ${error.message}`);
    } finally {
        if (browser) await browser.close();
    }
}

async function scrapePinterestWithPuppeteer(postUrl) {
    console.log(`[Pinterest] Memulai proses untuk: ${postUrl}`);
    let browser;
    try {
        browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
        const page = await browser.newPage();
        await page.goto('https://pinterestdownloader.com/ID', { waitUntil: 'networkidle2' });
        await page.type('input[name="url"]', postUrl, { delay: 100 });
        await Promise.all([page.click('button[type="submit"]'), page.waitForNavigation({ waitUntil: 'networkidle2' })]);
        await page.waitForSelector('#video_down', { visible: true, timeout: 15000 });
        const downloadLink = await page.$eval('#video_down', el => el.href);
        if (!downloadLink) throw new Error('Link download tidak ditemukan.');
        console.log('\n--- HASIL ---');
        console.log('Link Download:', downloadLink);
    } catch (error) {
        console.error(`❌ Gagal: ${error.message}`);
    } finally {
        if (browser) await browser.close();
    }
}

async function getInstagramProfile( ) {
  const username = 'ahmadzaki_yo'
    console.log(`[Stalker] Memulai proses untuk: ${username}`);
    try {
        const response = await axios.get(`https://storistalker.com/en/${username}`, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36' }
        });
        const $ = cheerio.load(response.data);
        const getCount = (el) => parseInt($(el).text().trim().replace(/,/g, '') || '0', 10);
        const profileData = {
            username: $('.info .nickname').text().trim(),
            fullName: $('.info .name').text().trim(),
            profilePicUrl: $('img.rounded-circle').attr('src'),
            biography: $('.info .description').text().trim(),
            posts: getCount($('.counters .item:nth-child(1) .count')),
            followers: getCount($('.counters .item:nth-child(2) .count')),
            following: getCount($('.counters .item:nth-child(3) .count'))
        };
        if (!profileData.username) throw new Error('Profil tidak ditemukan.');
        console.log('\n--- HASIL ---');
        console.log(JSON.stringify(profileData, null, 2));
    } catch (error) {
        console.error(`❌ Gagal: ${error.message}`);
    }
}

async function getRandomPinterestImage(query) {
    console.log(`[Pin] Memulai proses untuk: "${query}"`);
    let browser;
    try {
        browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
        const page = await browser.newPage();
        await page.goto(`https://www.pinterest.com/search/pins/?q=${encodeURIComponent(query)}`, { waitUntil: 'networkidle2' });
        await page.evaluate(async () => { for (let i = 0; i < 3; i++) { window.scrollBy(0, window.innerHeight); await new Promise(r => setTimeout(r, 500)); } });
        const imageUrls = await page.evaluate(() => Array.from(document.querySelectorAll('div[data-grid-item="true"] img')).map(img => img.src).filter(src => src && src.startsWith('https://i.pinimg.com')));
        if (imageUrls.length === 0) throw new Error('Tidak ada gambar ditemukan.');
        const randomImage = imageUrls[Math.floor(Math.random() * imageUrls.length)];
        console.log('\n--- HASIL ---');
        console.log('Image URL:', randomImage);
    } catch (error) {
        console.error(`❌ Gagal: ${error.message}`);
    } finally {
        if (browser) await browser.close();
    }
}

async function takeScreenshot( ) {
  const url = 'https://google.com'
    console.log(`[SSWeb] Memulai proses untuk: ${url}`);
    let browser;
    try {
        browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 800 });
        await page.goto(url, { waitUntil: 'networkidle2' });
        const imageBuffer = await page.screenshot({ type: 'png', fullPage: true });
        fs.writeFileSync('screenshot.png', imageBuffer);
        console.log('\n--- HASIL ---');
        console.log('✅ Screenshot disimpan sebagai screenshot.png');
    } catch (error) {
        console.error(`❌ Gagal: ${error.message}`);
    } finally {
        if (browser) await browser.close();
    }
}

async function getNowPlayingMovies() {
    console.log(`[Film] Memulai proses...`);
    try {
        const response = await axios.get('https://21cineplex.com/nowplaying', {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36' }
        });
        const $ = cheerio.load(response.data);
        const movies = [];
        $('.grid-item.movie-grid').each((i, el) => {
            const title = $(el).find('a').attr('title');
            const posterUrl = $(el).find('img').attr('src');
            if (title && posterUrl) movies.push({ title, posterUrl });
        });
        if (movies.length === 0) throw new Error('Tidak ada film ditemukan.');
        console.log('\n--- HASIL ---');
        console.log(JSON.stringify(movies, null, 2));
    } catch (error) {
        console.error(`❌ Gagal: ${error.message}`);
    }
}

async function getTopAnime(limit = 10) {
    console.log(`[Anime] Memulai proses (limit: ${limit})`);
    try {
        const response = await axios.get('https://myanimelist.net/topanime.php', {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36' }
        });
        const $ = cheerio.load(response.data);
        const animeList = [];
        $('tr.ranking-list').each((i, el) => {
            if (i >= limit) return false;
            const rank = $(el).find('td.rank span').text().trim();
            const title = $(el).find('div.detail h3 a').text().trim();
            const score = $(el).find('td.score span.fs14').text().trim();
            if (rank && title && score) animeList.push({ rank, title, score });
        });
        if (animeList.length === 0) throw new Error('Tidak ada anime ditemukan.');
        console.log('\n--- HASIL ---');
        console.log(JSON.stringify(animeList, null, 2));
    } catch (error) {
        console.error(`❌ Gagal: ${error.message}`);
    }
}

async function generateCoolCard(params) {
    console.log(`[Card] Memulai proses untuk: ${params.username}`);
    try {
        registerFont(path.join(__dirname, 'Manrope-Bold.ttf'), { family: 'Manrope' });
    } catch (e) { console.warn('Font kustom tidak ditemukan, menggunakan font default.') }
    
    const canvas = createCanvas(700, 250);
    const ctx = canvas.getContext('2d');
    
    // Background
    const gradient = ctx.createLinearGradient(0, 0, 700, 250);
    gradient.addColorStop(0, '#2a214a');
    gradient.addColorStop(1, '#181924');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 700, 250);

    // Teks
    ctx.fillStyle = '#ffffff';
    ctx.font = '50px "Manrope"';
    ctx.fillText('WELCOME,', 250, 90);
    ctx.font = '35px "Manrope"';
    ctx.fillText(params.username, 250, 140);
    
    // Avatar
    ctx.save();
    ctx.beginPath();
    ctx.arc(125, 125, 64, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();
    try {
        const avatar = await loadImage(params.avatar);
        ctx.drawImage(avatar, 61, 61, 128, 128);
    } catch(e) { console.error('Gagal memuat avatar.')}
    ctx.restore();
    
    fs.writeFileSync('card.png', canvas.toBuffer('image/png'));
    console.log('\n--- HASIL ---');
    console.log('✅ Kartu selamat datang disimpan sebagai card.png');
}

async function scrapeTokopedia( ) {
    const query = 'laptop'
    const url = `https://www.tokopedia.com/search?q=${encodeURIComponent(query)}`;
    console.log(`\n[Tokopedia] Mencari produk "${query}" dengan MODE DEBUG...`);
    let browser;

    try {
        const puppeteer = require('puppeteer-extra');
        const StealthPlugin = require('puppeteer-extra-plugin-stealth');
        puppeteer.use(StealthPlugin());

        // --- PERUBAHAN UTAMA: MENJALANKAN BROWSER DALAM MODE TERLIHAT ---
        browser = await puppeteer.launch({ 
            headless: false, // Set 'false' untuk membuka jendela browser
            args: ['--no-sandbox', '--disable-setuid-sandbox'] 
        });
        
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 }); // Timeout navigasi diperpanjang

        console.log("\n!!! PERHATIKAN JENDELA BROWSER YANG MUNCUL !!!");
        console.log("Apakah Anda melihat halaman produk, atau halaman CAPTCHA ('Saya bukan robot')?");

        const productSelector = 'div[data-testid="divProductWrapper"]';
        console.log("   Menunggu produk muncul (maksimal 60 detik)...");
        await page.waitForSelector(productSelector, { timeout: 60000 }); // Timeout menunggu elemen diperpanjang

        const html = await page.content();
        const $ = require('cheerio').load(html);

        const products = [];
        $(productSelector).slice(0, 5).each((i, el) => {
            const product = $(el);
            const name = product.find('div[data-testid="spnSRPProdName"]').text().trim();
            const price = product.find('div[data-testid="spnSRPProdPrice"]').text().trim();
            const shop = product.find('span[data-testid="spnSRPShopName"]').text().trim();
            const location = product.find('span[data-testid="spnSRPShopLocation"]').text().trim();

            if (name && price) {
                products.push({ name, price, shop: `${shop} (${location})` });
            }
        });
        
        if (products.length === 0) {
            throw new Error('Tidak ada produk yang ditemukan.');
        }

        console.log('\n--- HASIL PENCARIAN DI TOKOPEDIA ---');
        console.table(products);

    } catch (error) {
        console.error(`❌ Gagal scrape Tokopedia: ${error.message}`);
    } finally {
        if (browser) {
            console.log("\nMenutup browser dalam 5 detik...");
            await new Promise(r => setTimeout(r, 5000)); // Jeda 5 detik agar Anda bisa melihat halaman terakhir
            await browser.close();
        }
    }
}
async function runAllScrapers() {
  //await scrapeDetik();
  //await scrapeCoinMarketCap();
  //await tiktokdl();
   //await getYouTubeInfo();
    //await scrapePinterestWithPuppeteer();
     //await takeScreenshot();
      await scrapeTokopedia();
  console.log('\n✅ Semua proses scraping selesai.');
}

// Menjalankan scraper utama
runAllScrapers();