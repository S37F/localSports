const Analytics = require('../models/Analytics');

/**
 * Utility function to log analytics events
 * @param {string} eventName - Standardized event name (e.g. 'user.registered', 'request.sent')
 * @param {string|null} userId - The ID of the user triggering the event
 * @param {object} metadata - Any additional context
 */
const logEvent = async (eventName, userId = null, metadata = {}) => {
  try {
    await Analytics.create({
      event: eventName,
      userId,
      metadata
    });
  } catch (err) {
    console.error(`Analytics Logging Failed for event ${eventName}:`, err.message);
    // We intentionally don't throw here to avoid disrupting the main application flow
  }
};

module.exports = {
  logEvent
};
