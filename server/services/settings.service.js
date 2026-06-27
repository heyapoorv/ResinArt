/**
 * services/settings.service.js
 *
 * In-memory cache for WebsiteSettings.
 *
 * Settings are read on nearly every page load (navbar, hero, footer)
 * but updated rarely. This cache reduces DB hits by storing the result
 * for TTL_MS milliseconds.
 *
 * Usage:
 *   const { getSettings, invalidateCache } = require('./settings.service');
 *   const settings = await getSettings();   // cached
 *   invalidateCache();                       // call after PUT /api/settings
 */

const WebsiteSettings = require('../models/WebsiteSettings');
const logger          = require('../utils/logger');

const TTL_MS = 5 * 60 * 1000; // 5 minutes

let cache     = null;
let cacheTime = 0;

/**
 * Get-or-create the singleton settings document, with in-memory caching.
 * @returns {Promise<Document>} Mongoose document (lean object)
 */
const getSettings = async () => {
  const now = Date.now();

  if (cache && (now - cacheTime) < TTL_MS) {
    return cache;
  }

  let settings = await WebsiteSettings.findOne().lean();
  if (!settings) {
    // Create default singleton if it doesn't exist yet
    const doc = await WebsiteSettings.create({});
    settings  = doc.toObject();
    logger.info('WebsiteSettings singleton created with defaults.');
  }

  cache     = settings;
  cacheTime = now;

  return cache;
};

/**
 * Invalidate the in-memory cache.
 * Call this whenever settings are updated so the next read fetches fresh data.
 */
const invalidateCache = () => {
  cache     = null;
  cacheTime = 0;
  logger.debug('WebsiteSettings cache invalidated.');
};

module.exports = { getSettings, invalidateCache };
