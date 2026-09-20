const {AppError} =require('../errors/errors')

function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  const isAppError = err instanceof AppError;

  const status = isAppError ? err.status : 500;
  const code = isAppError ? err.code : 'INTERNAL_ERROR';
  const message = isAppError ? err.message : 'Внутренняя ошибка сервера';

  console.error(JSON.stringify({
    level: 'error',
    requestId: req.id,
    code,
    status,
    message,
    stack: err.stack,
  }));

  const body = {
    error: {
      code,
      message,
      requestId: req.id,
    },
  };

  if (isAppError && err.details) body.error.details = err.details;

  if (process.env.NODE_ENV !== 'production' && !isAppError) {
    body.error.stack = err.stack;
  }

  res.status(status).json(body);
}
module.exports = errorHandler