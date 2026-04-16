const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 5,
  handler: (req, res, next, options) => {
    res.status(options.statusCode).json({
      error: options.message.error,
      retryAfter: Math.ceil(req.rateLimit.resetTime - Date.now())
    });
  },
  message: {
    error: 'Too many login attempts, please try again after 15 minutes'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

module.exports = { loginLimiter };
