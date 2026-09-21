# Task 2 — Equipment & Maintenance Requests API

REST API на Express для учёта заявок на техническое обслуживание оборудования производственной площадки. Сервис ведёт справочник оборудования, контролирует жизненный цикл заявки и оценивает погодные условия на объекте перед планированием наружных работ.

## Требования к окружению

- Node.js — 20.x или выше
- npm — 10.x или выше
- Postman — для тестирования
- Git — для работы с репозиторием

## Установка и запуск

    git clone https://github.com/artemiysakh/GreenAtom_task2.git
    cd task_2
    npm install
    cp .env.example .env
    npm start

Сервер запустится на `http://localhost:3000`.

## Переменные окружения

| Переменная | Описание | По умолчанию |
|---|---|---|
| `PORT` | Порт сервера | `3000` |
| `NODE_ENV` | Окружение (`development` / `production`) | `development` |
| `CORS_ORIGINS` | Разрешённые источники через запятую | — |
| `RATE_LIMIT_WINDOW_MS` | Окно rate limit, мс | `60000` |
| `RATE_LIMIT_MAX` | Максимум запросов за окно | `100` |
| `WEATHER_API_URL` | Базовый URL погодного API | `https://api.open-meteo.com/v1/forecast` |
| `REQUEST_TIMEOUT_MS` | Таймаут запроса к внешнему API, мс | `5000` |
| `WEATHER_MAX_WIND_SPEED` | Порог ветра для пригодного окна, м/с | `10` |
| `WEATHER_MAX_PRECIPITATION` | Порог осадков для пригодного окна, мм | `0` |

Шаблон — в `.env.example`. Реальный `.env` не коммитится.

## Структура проекта

    task_2/
    ├── docs/
    │   └── postman/
    ├── src/
    │   ├── controllers/
    │   │   ├── equipmentController.js
    │   │   ├── healthController.js
    │   │   └── requestsController.js
    │   ├── errors/
    │   │   └── errors.js
    │   ├── middlewares/
    │   │   ├── asyncHandler.js
    │   │   ├── errorHandler.js
    │   │   ├── logger.js
    │   │   ├── notFound.js
    │   │   ├── requestId.js
    │   │   └── validate.js
    │   ├── repositories/
    │   │   ├── equipment.repository.js
    │   │   └── request.repository.js
    │   ├── routes/
    │   │   ├── equipment.route.js
    │   │   ├── health.route.js
    │   │   ├── requests.route.js
    │   │   └── routes.js
    │   ├── services/
    │   │   ├── equipment.service.js
    │   │   ├── request.service.js
    │   │   └── weather.service.js
    │   ├── validators/
    │   ├── app.js
    │   └── server.js
    ├── .env.example
    └── package.json

Слоистая архитектура: routes → controllers → services → repositories.

## Модель данных

### Оборудование (equipment)

| Поле | Тип | Ограничения |
|---|---|---|
| `id` | string (uuid) | генерируется сервером |
| `name` | string | 3–100 символов, обязательное |
| `type` | string | `turbine` \| `inverter` \| `sensor` \| `substation` |
| `serialNumber` | string | уникальный в системе |
| `location` | object | `{ lat: number, lon: number }` |
| `status` | string | `operational` \| `maintenance` \| `fault` \| `decommissioned` |
| `installedAt` | string (ISO) | не в будущем |

### Заявка (maintenance request)

| Поле | Тип | Ограничения |
|---|---|---|
| `id` | string (uuid) | генерируется сервером |
| `equipmentId` | string (uuid) | ссылка на оборудование |
| `title` | string | 5–120 символов, обязательное |
| `description` | string | до 2000 символов |
| `priority` | string | `low` \| `medium` \| `high` \| `critical` |
| `status` | string | `new` \| `in_progress` \| `done` \| `rejected`, по умолчанию `new` |
| `plannedAt` | string (ISO) | необязательное |
| `createdAt` | string (ISO) | проставляется сервером |
| `updatedAt` | string (ISO) | проставляется сервером |

## Схема переходов статусов

    new ──► in_progress ──► done
     │            │
     └──► rejected ◄──┘

| Из | В |
|---|---|
| `new` | `in_progress`, `rejected` |
| `in_progress` | `done`, `rejected` |
| `done` | — |
| `rejected` | — |

Недопустимый переход → **409 Conflict**.

## Эндпоинты

| Метод | Путь | Назначение |
|---|---|---|
| GET | `/api/health` | Проверка доступности |
| GET | `/api/equipment` | Список оборудования |
| POST | `/api/equipment` | Создание оборудования |
| GET | `/api/equipment/:id` | Карточка оборудования |
| PATCH | `/api/equipment/:id` | Обновление |
| DELETE | `/api/equipment/:id` | Удаление |
| GET | `/api/equipment/:id/requests` | Заявки по оборудованию |
| GET | `/api/equipment/:id/weather` | Прогноз и пригодность окна |
| GET | `/api/requests` | Список заявок |
| POST | `/api/requests` | Создание заявки |
| GET | `/api/requests/:id` | Карточка заявки |
| PATCH | `/api/requests/:id` | Обновление заявки |
| PATCH | `/api/requests/:id/status` | Смена статуса |
| DELETE | `/api/requests/:id` | Удаление заявки |

## Формат ответа

Одиночный объект:

    { "data": { "...": "..." } }

Список:

    { "data": [ "..." ], "meta": { "total": 42, "page": 1, "limit": 5 } }

Создание — `201` с заголовком `Location`. Удаление — `204`.

## Формат ошибок

    {
      "error": {
        "code": "VALIDATION_ERROR",
        "message": "Некорректные данные запроса",
        "details": [{ "field": "priority", "message": "Недопустимое значение" }],
        "requestId": "b1f2c3d4-..."
      }
    }

| Код | HTTP |
|---|---|
| `VALIDATION_ERROR` | 422 |
| `NOT_FOUND` | 404 |
| `CONFLICT` | 409 |
| `EXTERNAL_SERVICE_ERROR` | 502 |
| `INTERNAL_ERROR` | 500 |

## Примеры запросов

Создать оборудование:

    POST /api/equipment
    Content-Type: application/json

    {
      "name": "Turbine Alpha",
      "type": "turbine",
      "serialNumber": "WT-001",
      "location": { "lat": 55.75, "lon": 37.62 },
      "status": "operational",
      "installedAt": "2023-05-12T10:00:00.000Z"
    }

Дубль `serialNumber` → **409 Conflict**.

Невалидное тело → **422** с `details`.

Создать заявку:

    POST /api/requests
    Content-Type: application/json

    {
      "equipmentId": "af383a88-4f2e-4dca-8e95-4fb284c2bf92",
      "title": "Плановое ТО",
      "priority": "high"
    }

Создание на несуществующее оборудование → **404 Not Found**.

Смена статуса:

    PATCH /api/requests/:id/status
    Content-Type: application/json

    { "status": "in_progress" }

Недопустимый переход (`new → done`) → **409 Conflict**.

## Правила безопасности

- **CORS**: явный список источников из `CORS_ORIGINS` (не `*`). В `.env.example`: `http://localhost:3000,http://localhost:5173`.
- **Rate limiting**: на `/api`, окно `RATE_LIMIT_WINDOW_MS`, максимум `RATE_LIMIT_MAX`. При превышении — **429** с заголовками `RateLimit-*`.
- **Ограничение размера тела**: `express.json({ limit: '100kb' })` → **413** при превышении.
- **Helmet**: защитные HTTP-заголовки.
- **Секреты**: только `.env.example` в репозитории, реальный `.env` в `.gitignore`.
- **Production**: без стек-трейсов в ответах.
- **Cookie**: не используются.

## Погодный сервис

`GET /api/equipment/:id/weather`:

1. Берёт координаты оборудования.
2. Обращается к `WEATHER_API_URL` с таймаутом `REQUEST_TIMEOUT_MS`.
3. Возвращает прогноз и флаг `suitable`.

Правило пригодности: ветер `< WEATHER_MAX_WIND_SPEED` и осадки `<= WEATHER_MAX_PRECIPITATION`.

При недоступности внешнего API — **502** `EXTERNAL_SERVICE_ERROR`, сервер не падает.

## Тестирование в Postman

Коллекция и окружение — в `docs/postman/`. Импортировать оба файла, выбрать окружение `local`, запустить сервер, прогнать через Runner.