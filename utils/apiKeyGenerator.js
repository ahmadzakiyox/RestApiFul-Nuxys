const crypto = require('crypto');

/**
 * Generates a random alphanumeric string of a given length.
 * @param {number} length The desired length of the key. Default is 15.
 * @returns {string} The generated API key.
 */
const generateApiKey = (length = 15) => {
  return crypto.randomBytes(Math.ceil(length / 2))
    .toString('hex')
    .slice(0, length).toUpperCase();
};

module.exports = generateApiKey;