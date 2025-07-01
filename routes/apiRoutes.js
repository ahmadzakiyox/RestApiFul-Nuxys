// routes/apiRoutes.js
const express = require('express');
const { validateApiKey } = require('../middleware/apiKeyMiddleware');
const apiController = require('../controllers/apiController');

const router = express.Router();

// Semua rute di bawah ini akan divalidasi oleh API Key
router.use(validateApiKey);

// --- KATEGORI: ANIME & MANGA ---
/**
 * @openapi
 * /api/v1/top-anime:
 * get:
 * tags: [Anime & Manga]
 * summary: Get Top Anime from MyAnimeList
 * parameters:
 * - in: header
 * name: X-API-Key
 * required: true
 * schema: { type: string }
 * - in: query
 * name: limit
 * schema: { type: number, default: 50 }
 * description: Number of results to return.
 * responses:
 * 200:
 * description: Success
 */
router.get('/top-anime', apiController.getTopAnime);


// --- KATEGORI: DOWNLOADER ---
/**
 * @openapi
 * /api/v1/youtube-dl:
 * get:
 * tags: [Downloader]
 * summary: Get YouTube video download link
 * parameters:
 * - in: header
 * name: X-API-Key
 * required: true
 * schema: { type: string }
 * - in: query
 * name: url
 * required: true
 * schema: { type: string }
 * description: The URL of the YouTube video.
 * responses:
 * 200:
 * description: Success
 */
// Anda perlu membuat fungsi youtubeDownloader di controller
// router.get('/youtube-dl', apiController.youtubeDownloader); 

/**
 * @openapi
 * /api/v1/facebook-dl:
 * get:
 * tags: [Downloader]
 * summary: Get Facebook video download link
 * parameters:
 * - { name: X-API-Key, in: header, required: true, schema: {type: string} }
 * - { name: url, in: query, required: true, schema: {type: string}, description: "Facebook video URL" }
 * responses: { 200: { description: "Success" } }
 */
// router.get('/facebook-dl', apiController.facebookDownloader);

/**
 * @openapi
 * /api/v1/pinterest-dl:
 * get:
 * tags: [Downloader]
 * summary: Get Pinterest video download link
 * parameters:
 * - { name: X-API-Key, in: header, required: true, schema: {type: string} }
 * - { name: url, in: query, required: true, schema: {type: string}, description: "Pinterest video/pin URL" }
 * responses: { 200: { description: "Success" } }
 */
// router.get('/pinterest-dl', apiController.pinterestDownloader);


// --- KATEGORI: STALKER ---
/**
 * @openapi
 * /api/v1/stalk-ig:
 * get:
 * tags: [Stalker]
 * summary: Get Instagram user profile information
 * parameters:
 * - { name: X-API-Key, in: header, required: true, schema: {type: string} }
 * - { name: username, in: query, required: true, schema: {type: string}, description: "Instagram username" }
 * responses: { 200: { description: "Success" } }
 */
// router.get('/stalk-ig', apiController.instagramStalker);


// --- KATEGORI: GENERATOR & UTILITIES ---
/**
 * @openapi
 * /api/v1/ssweb:
 * get:
 * tags: [Utilities]
 * summary: Take a full-page screenshot of a website
 * parameters:
 * - { name: X-API-Key, in: header, required: true, schema: {type: string} }
 * - { name: url, in: query, required: true, schema: {type: string}, description: "URL of the website" }
 * responses:
 * 200:
 * description: Success, returns a PNG image.
 * content:
 * image/png:
 * schema:
 * type: string
 * format: binary
 */
// router.get('/ssweb', apiController.takeScreenshot);

// Anda dapat melanjutkan pola ini untuk semua endpoint lainnya
// seperti /api/film, /api/pin, /api/generate-card

module.exports = router;