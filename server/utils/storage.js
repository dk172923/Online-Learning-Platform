// utils/storage.js - Cloudflare R2 (S3-compatible) file storage
const crypto = require('crypto');
const path = require('path');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
require('dotenv').config();

const s3 = new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
    },
});

// Allowed upload folders and the content types each one accepts
const FOLDERS = {
    course_videos: /^video\//,
    course_images: /^image\//,
    instructor_profiles: /^image\//,
    user_profiles: /^image\//,
};

/**
 * Create a short-lived URL the browser can PUT a file to directly,
 * plus the public URL the file will be served from afterwards.
 */
async function createUploadUrl({ folder, fileName, contentType }) {
    if (!FOLDERS[folder]) throw Object.assign(new Error('Invalid folder'), { status: 400 });
    if (!contentType || !FOLDERS[folder].test(contentType)) {
        throw Object.assign(new Error(`Content type ${contentType} not allowed for ${folder}`), { status: 400 });
    }
    const ext = path.extname(fileName || '').toLowerCase().replace(/[^.a-z0-9]/g, '');
    const key = `${folder}/${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`;

    const uploadUrl = await getSignedUrl(
        s3,
        new PutObjectCommand({ Bucket: process.env.R2_BUCKET, Key: key, ContentType: contentType }),
        { expiresIn: 60 * 15 }
    );
    const publicUrl = `${process.env.R2_PUBLIC_URL.replace(/\/$/, '')}/${key}`;
    return { uploadUrl, publicUrl, key };
}

module.exports = { s3, createUploadUrl };
