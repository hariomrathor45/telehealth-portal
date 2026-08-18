require('dotenv').config();

const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',

  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/telehealth',
  },

  jwt: {
    secret: process.env.JWT_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
  },

  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  adminSetupKey: process.env.ADMIN_SETUP_KEY || 'telehealth-admin-setup-2024',

  upload: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
    uploadDir: process.env.UPLOAD_DIR || 'uploads',
  },
};

// ============================================================
// VALIDATE ENVIRONMENT VARIABLES
// ============================================================

const errors = [];

if (!config.jwt.secret) {
  errors.push('❌ Missing required env variable: JWT_SECRET');
}
if (!config.jwt.refreshSecret) {
  errors.push('❌ Missing required env variable: JWT_REFRESH_SECRET');
}
if (!config.mongodb.uri) {
  errors.push('❌ Missing required env variable: MONGODB_URI');
}

if (errors.length > 0) {
  console.error('\n╔══════════════════════════════════════════════════════════════╗');
  console.error('║         ⚠️  ENVIRONMENT CONFIGURATION ERRORS ⚠️              ║');
  console.error('╚══════════════════════════════════════════════════════════════╝\n');
  errors.forEach(e => console.error(`  ${e}`));
  console.error('\n  Fix the above errors in backend/.env and restart the server.\n');

  if (config.nodeEnv === 'production') {
    process.exit(1);
  }
} else {
  console.log('✅ Environment variables validated successfully');
}

module.exports = config;
