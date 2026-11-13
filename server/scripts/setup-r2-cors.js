// One-time: allow the browser to upload directly to the R2 bucket.
// Usage: node scripts/setup-r2-cors.js   (reads CLIENT_URL + R2_* from .env)
require('dotenv').config();
const { PutBucketCorsCommand } = require('@aws-sdk/client-s3');
const { s3 } = require('../utils/storage');

const origins = (process.env.CLIENT_URL || 'http://localhost:5173')
    .split(',').map((o) => o.trim().replace(/\/$/, '')).filter(Boolean);

s3.send(new PutBucketCorsCommand({
    Bucket: process.env.R2_BUCKET,
    CORSConfiguration: {
        CORSRules: [{
            AllowedOrigins: origins,
            AllowedMethods: ['PUT', 'GET', 'HEAD'],
            AllowedHeaders: ['*'],
            MaxAgeSeconds: 3600,
        }],
    },
})).then(() => console.log('R2 CORS set for:', origins.join(', ')))
  .catch((e) => { console.error('Failed:', e.message); process.exit(1); });
