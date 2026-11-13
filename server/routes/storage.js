// routes/storage.js - issue presigned R2 upload URLs to logged-in users
const express = require('express');
const authMiddleware = require('../middleware/auth');
const { createUploadUrl } = require('../utils/storage');

const router = express.Router();

// POST /storage/presign { folder, fileName, contentType } -> { uploadUrl, publicUrl, key }
router.post('/presign', authMiddleware, async (req, res) => {
    try {
        res.json(await createUploadUrl(req.body || {}));
    } catch (err) {
        console.error('Presign failed:', err.message);
        res.status(err.status || 500).json({ message: err.message || 'Could not create upload URL' });
    }
});

module.exports = router;
