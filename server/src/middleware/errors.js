export function notFound(_req, res) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Endpoint not found.' } }); }
export function errorHandler(err, _req, res, _next) {
  if (err.code === 11000) return res.status(409).json({ success: false, error: { code: 'DUPLICATE', message: 'A record with that value already exists.' } });
  if (err.name === 'ValidationError' || err.name === 'CastError' || err.code === 'EBADCSRFTOKEN') {
    const status = err.code === 'EBADCSRFTOKEN' ? 403 : 400;
    return res.status(status).json({ success: false, error: { code: status === 403 ? 'CSRF_INVALID' : 'VALIDATION_ERROR', message: status === 403 ? 'Invalid or missing CSRF token. Refresh and try again.' : 'The supplied input is invalid.' } });
  }
  if (err.status === 429) return res.status(429).json({ success: false, error: { code: 'RATE_LIMITED', message: 'Too many attempts. Please try again later.' } });
  if (process.env.NODE_ENV !== 'production') console.error(err);
  res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'An unexpected server error occurred.' } });
}