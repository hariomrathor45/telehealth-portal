const jwt = require('jsonwebtoken');
const config = require('../config');

/**
 * Generate access token (short-lived)
 */
function generateAccessToken(user) {
  return jwt.sign(
    {
      id: user._id || user.id,
      email: user.email,
      role: user.role,
    },
    config.jwt.secret,
    { expiresIn: config.jwt.accessExpiry }
  );
}

/**
 * Generate refresh token (long-lived)
 */
function generateRefreshToken(user) {
  return jwt.sign(
    {
      id: user._id || user.id,
    },
    config.jwt.refreshSecret,
    { expiresIn: config.jwt.refreshExpiry }
  );
}

/**
 * Verify access token
 */
function verifyAccessToken(token) {
  return jwt.verify(token, config.jwt.secret);
}

/**
 * Verify refresh token
 */
function verifyRefreshToken(token) {
  return jwt.verify(token, config.jwt.refreshSecret);
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
