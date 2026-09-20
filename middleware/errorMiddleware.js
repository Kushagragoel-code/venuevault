/**
 * Central error-handling middleware.
 * Must have 4 arguments so Express recognises it as an error handler.
 */
const errorHandler = (err, req, res, next) => {
  console.error('❌ Error:', err.stack || err.message);

  /* Mongoose validation errors */
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message).join(', ');
    return res.status(400).render('error', { statusCode: 400, message: messages });
  }

  /* Mongoose duplicate key (unique constraint) */
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(400).render('error', {
      statusCode: 400,
      message   : `${field.charAt(0).toUpperCase() + field.slice(1)} already exists.`
    });
  }

  /* Mongoose cast error (bad ObjectId) */
  if (err.name === 'CastError') {
    return res.status(400).render('error', { statusCode: 400, message: 'Invalid ID format.' });
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).render('error', {
    statusCode,
    message: err.message || 'Something went wrong. Please try again.'
  });
};

module.exports = { errorHandler };
