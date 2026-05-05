/**
 * Global error handler middleware
 * Catches errors passed via next(err)
 */
const errorHandler = (err, req, res, next) => {
  console.error('Unhandled error:', err);

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal server error';

  return res.status(statusCode).json({
    success: false,
    error: message,
    code: statusCode,
  });
};

module.exports = { errorHandler };
