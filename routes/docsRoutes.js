// routes/docsRoutes.js
const express = require('express');
const { getApiFeatures } = require('../controllers/docsController');
const router = express.Router();

router.get('/features', getApiFeatures);

module.exports = router;