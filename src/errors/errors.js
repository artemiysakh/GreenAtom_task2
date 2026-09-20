class AppError extends Error {
  constructor(message, { status = 500, code = 'INTERNAL_ERROR', details, cause } = {}) {
    super(message, { cause });
    this.name = new.target.name;
    this.status = status;
    this.code = code;
    this.details = details;
    this.isOperational = true;
  }
}

class NotFoundError extends AppError {
  constructor(what = 'Ресурс') {
    super(`${what} не найден`, { status: 404, code: 'NOT_FOUND' });
  }
}

class ConflictError extends AppError {
  constructor(message = 'Конфликт данных') {
    super(message, { status: 409, code: 'CONFLICT' });
  }
}

class ValidationError extends AppError {
  constructor(zodError) {
    super('Некорректные данные запроса', {
      status: 422,
      code: 'VALIDATION_ERROR',
      details: zodError.issues.map((i) => ({
        field: i.path.join('.') || '_',
        message: i.message,
      })),
    });
  }
}

class ExternalServiceError extends AppError {
  constructor(message = 'Внешний сервис недоступен') {
    super(message, { status: 502, code: 'EXTERNAL_SERVICE_ERROR' });
  }
}
module.exports = {
  AppError,
  NotFoundError,
  ConflictError,
  ValidationError,
  ExternalServiceError,
};