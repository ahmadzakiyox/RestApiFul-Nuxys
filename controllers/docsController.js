// controllers/docsController.js

// Di aplikasi nyata, data ini bisa datang dari database.
// Untuk sekarang, kita definisikan secara statis.
const apiFeatures = [
    {
        name: 'Top Anime',
        category: 'Anime & Manga',
        methods: ['GET'],
        description: 'Get Top Anime from MyAnimeList.',
        parameters: 'apikey, limit',
        status: 'Active',
        endpoint: '/api/v1/top-anime'
    },
    {
        name: 'YouTube Downloader',
        category: 'Downloader',
        methods: ['GET'],
        description: 'Get YouTube video download link.',
        parameters: 'apikey, url',
        status: 'Active',
        endpoint: '/api/v1/youtube-dl'
    },
    {
        name: 'Facebook Downloader',
        category: 'Downloader',
        methods: ['GET'],
        description: 'Get Facebook video download link.',
        parameters: 'apikey, url',
        status: 'Active',
        endpoint: '/api/v1/facebook-dl'
    },
    {
        name: 'Instagram Stalker',
        category: 'Stalker',
        methods: ['GET'],
        description: 'Get Instagram user profile information.',
        parameters: 'apikey, username',
        status: 'Active',
        endpoint: '/api/v1/stalk-ig'
    },
    {
        name: 'Web Screenshot',
        category: 'Utilities',
        methods: ['GET'],
        description: 'Take a full-page screenshot of a website.',
        parameters: 'apikey, url',
        status: 'Active',
        endpoint: '/api/v1/ssweb'
    },
    {
        name: 'Pinterest Downloader',
        category: 'Downloader',
        methods: ['GET'],
        description: 'Get Pinterest video download link.',
        parameters: 'apikey, url',
        status: 'Under Maintenance',
        endpoint: '/api/v1/pinterest-dl'
    }
    // Tambahkan semua fitur Anda yang lain di sini
];

exports.getApiFeatures = (req, res) => {
    res.status(200).json({ success: true, data: apiFeatures });
};