const { NotFoundError } = require('../errors/errors')

function notFound(req, res, next) {
  next(new NotFoundError(`Маршрут ${req.method} ${req.originalUrl}`));
}
module.exports = notFound