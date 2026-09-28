# Task 2 — Equipment & Requests API (Кейс 3)

Сервис учёта заявок на обслуживание оборудования. Переведён с файлового хранилища на PostgreSQL.

**Стек:** Node.js 20 · Express 4 · PostgreSQL 16 · Sequelize 6 · Zod · Pino

---

## Содержание

- [Быстрый старт](#быстрый-старт)
- [Переменные окружения](#переменные-окружения)
- [Схема БД](#схема-бд)
- [Транзакции](#транзакции)
- [Эндпоинты](#эндпоинты)
- [Отчёты](#отчёты)
- [Запуск Postman](#запуск-postman)
- [Защита от SQL-инъекций](#защита-от-sql-инъекций)
- [Миграции](#миграции)
- [Сиды](#сиды)
- [Ассоциации Sequelize](#ассоциации-sequelize)
- [Остановка и пересоздание](#остановка-и-пересоздание)
- [Структура проекта](#структура-проекта)
- [Реализованные требования Кейса 3](#реализованные-требования-кейса-3)

---

## Быстрый старт

```bash
npm install

cp .env.example .env

docker compose up -d
docker compose ps                        # дождаться (healthy)

npx sequelize-cli db:migrate

npx sequelize-cli db:seed:all

node src/server.js
```

Сервер: **http://localhost:3000**

---

## Переменные окружения

| Переменная | Назначение | По умолчанию |
|---|---|---|
| `NODE_ENV` | Режим работы | `development` |
| `PORT` | Порт сервера | `3000` |
| `DB_HOST` | Хост PostgreSQL | `localhost` |
| `DB_PORT` | Порт PostgreSQL | `5432` |
| `DB_NAME` | Имя БД | `task2` |
| `DB_USER` | Пользователь БД | `task2` |
| `DB_PASSWORD` | Пароль БД | `task2pass` |
| `CORS_ORIGINS` | Разрешённые origin | `http://localhost:3000` |
| `RATE_LIMIT_WINDOW_MS` | Окно rate limit | `60000` |
| `RATE_LIMIT_MAX` | Максимум запросов | `100` |
| `WEATHER_API_URL` | Open-Meteo API | `https://api.open-meteo.com/v1/forecast` |
| `REQUEST_TIMEOUT_MS` | Таймаут погоды | `5000` |
| `WEATHER_MAX_WIND_SPEED` | Порог ветра | `10` |
| `WEATHER_MAX_PRECIPITATION` | Порог осадков | `0` |

---

## Схема БД

### Сущности

| Таблица | Назначение |
|---|---|
| `sites` | Площадки: название, код, регион, координаты |
| `equipment` | Оборудование: FK на площадку, тип, серийный номер (UNIQUE), статус, дата установки |
| `equipment_passports` | Паспорт 1:1: производитель, модель, мощность, дата поверки |
| `maintenance_requests` | Заявки: FK на оборудование, тема, приоритет, статус, плановая дата |
| `request_status_history` | Журнал смены статусов (append-only) |
| `technicians` | Специалисты: ФИО, специализация, табельный номер (UNIQUE) |
| `request_assignees` | N:M: роль (`lead`/`member`), плановые часы |

### Связи

- `sites` **1:N** `equipment` (FK `equipment.site_id`)
- `equipment` **1:1** `equipment_passports` (FK `equipment_passports.equipment_id` UNIQUE)
- `equipment` **1:N** `maintenance_requests` (FK `maintenance_requests.equipment_id`)
- `maintenance_requests` **1:N** `request_status_history` (FK `request_status_history.request_id`)
- `maintenance_requests` **N:M** `technicians` через `request_assignees` (поля `role`, `hours`)

### ER-диаграмма

```
sites 1───N equipment 1───1 equipment_passports
              │
              │ 1:N
              ▼
       maintenance_requests 1───N request_status_history
              │
              │ N:M (через request_assignees: role, hours)
              ▼
         technicians
```

### Нормализация (3НФ)

- Нет дублирования — справочные значения вынесены в enum-поля с валидацией.
- Связь N:M вынесена в отдельную таблицу `request_assignees` с доп. полями.
- Паспорт вынесен в отдельную таблицу (1:1) — избегаем NULL-колонок.

### Целостность на уровне БД

- **NOT NULL** — все обязательные поля.
- **UNIQUE** — `equipment.serial_number`, `technicians.employee_number`, `equipment_passports.equipment_id`, `(request_id, technician_id)`.
- **FK с ON DELETE:**
  - `equipment.site_id` → `sites.id` **RESTRICT**
  - `maintenance_requests.equipment_id` → `equipment.id` **RESTRICT**
  - `request_status_history.request_id` → `maintenance_requests.id` **CASCADE**
  - `request_assignees.*` → **CASCADE**

### Удаление оборудования

1. **На уровне БД:** FK `maintenance_requests.equipment_id ON DELETE RESTRICT`.
2. **На уровне сервиса:** проверка `findOpenByEquipmentId` → **409**.

---

## Транзакции

### Смена статуса заявки

`requestService.changeStatus` — **одна транзакция**:

1. `SELECT ... FOR UPDATE` (`lock: t.LOCK.UPDATE`).
2. Проверка перехода по `ALLOWED_TRANSITIONS`.
3. Проверка: `in_progress` без исполнителей → **409**.
4. `UPDATE maintenance_requests.status`.
5. `INSERT request_status_history`.

При ошибке — **полный откат**. Сценарий отката демонстрируется на защите.

### Назначение бригады

`requestService.assignTeam` — **одна транзакция**:

1. Проверка: **ровно один** `lead`, иначе **422**.
2. Проверка существования всех `technicianId`, иначе **404**.
3. `DELETE` старых назначений.
4. `INSERT` новых.

---

## Эндпоинты

### Оборудование

| Метод | Путь | Назначение |
|---|---|---|
| GET | `/api/equipment` | Список с фильтрами, сортировкой, пагинацией |
| POST | `/api/equipment` | Создание |
| GET | `/api/equipment/:id` | Карточка (с `site` и `passport`) |
| PATCH | `/api/equipment/:id` | Обновление |
| DELETE | `/api/equipment/:id` | Удаление (409 при открытых заявках) |
| GET | `/api/equipment/:id/requests` | Заявки оборудования |
| GET | `/api/equipment/:id/weather` | Погода (200 или 502) |

### Заявки

| Метод | Путь | Назначение |
|---|---|---|
| GET | `/api/requests` | Список с фильтрами |
| POST | `/api/requests` | Создание |
| GET | `/api/requests/:id` | Карточка с исполнителями |
| PATCH | `/api/requests/:id` | Обновление полей |
| PATCH | `/api/requests/:id/status` | Смена статуса (транзакция + история) |
| DELETE | `/api/requests/:id` | Удаление |
| POST | `/api/requests/:id/assignees` | Назначение бригады (транзакция) |
| DELETE | `/api/requests/:id/assignees/:userId` | Снятие специалиста |
| GET | `/api/requests/:id/history` | История статусов |

### Площадки и отчёты

| Метод | Путь | Назначение |
|---|---|---|
| GET | `/api/sites/:id/summary` | Сводка по площадке |
| GET | `/api/reports/equipment-load` | Отчёт по нагрузке |

---

## Отчёты

### `GET /api/sites/:id/summary`

- `site` — краткая информация.
- `byStatus` — количество заявок по **статусам и приоритетам**.
- `avgClosureHours` — среднее время закрытия (`status='done'`).

### `GET /api/reports/equipment-load`

**Raw SQL** с `JOIN equipment ← maintenance_requests ← request_assignees`:

```sql
SELECT e.id, e.name, e.serial_number,
       COUNT(r.id) AS "totalRequests",
       SUM(CASE WHEN r.status='done' THEN 1 ELSE 0 END) AS "closedRequests",
       COALESCE(SUM(ra.hours), 0) AS "totalHours",
       MAX(CASE WHEN r.status='done' THEN r.updated_at END) AS "lastMaintenance"
FROM equipment e
LEFT JOIN maintenance_requests r ON r.equipment_id = e.id
LEFT JOIN request_assignees ra ON ra.request_id = r.id
WHERE (:from IS NULL OR r.created_at >= :from)
  AND (:to IS NULL OR r.created_at <= :to)
GROUP BY e.id, e.name, e.serial_number
HAVING COUNT(r.id) >= :minRequests
ORDER BY "totalRequests" DESC
```

**Параметры:**

| Параметр | Тип | Назначение |
|---|---|---|
| `from` | ISO datetime | Нижняя граница |
| `to` | ISO datetime | Верхняя граница |
| `minRequests` | integer ≥ 0 | Минимум заявок (HAVING) |

Все параметры — через `replacements` (bind-параметры).

---

## Запуск Postman

В репозитории две коллекции:

```
docs/postman/case3.postman_collection.json
docs/postman/local.postman_environment.json
```

### Импорт

1. Postman → **Import** → выберите **оба** файла.
2. В правом верхнем углу выберите окружение **`local`**.

### Переменные окружения

| Переменная | Значение |
|---|---|
| `baseUrl` | `http://localhost:3000` |
| `equipmentId` | Заполняется автоматически |
| `requestId` | Заполняется автоматически |
| `serialNumber` | Заполняется автоматически |
| **`technicianId`** | **Заполнить вручную** |
| **`siteId`** | **Заполнить вручную** |

### Как заполнить `technicianId` и `siteId`

**UUID генерируются сидами каждый раз заново**, поэтому в файл не зашиты. Получите их из БД:

```bash
docker compose exec db psql -U task2 -d task2 -c \
  "SELECT id, employee_number FROM technicians LIMIT 1;"

docker compose exec db psql -U task2 -d task2 -c \
  "SELECT id, code FROM sites LIMIT 1;"
```

Скопируйте UUID в **Postman → Environments → local**:

- `technicianId` = `<UUID специалиста>`
- `siteId` = `<UUID площадки>`

### Запуск

Правый клик на коллекции → **Run collection**.

**Порядок папок:** `1. Health` → `2. Equipment` → `3. Requests` → `4. Sites` → `5. Reports` → `6. Common`.

### Покрытие

- **Кейс 2:** все прежние эндпоинты без изменений.
- **Кейс 3 — новые:** `POST /assignees`, `DELETE /assignees/:userId`, `GET /history`, `GET /sites/:id/summary`, `GET /reports/equipment-load`.
- **Негативные:** 404 (нет специалиста), 422 (нет `lead`), 409 (`in_progress` без исполнителей, повторное назначение).

---

## Защита от SQL-инъекций

- **Whitelist сортировки** в репозиториях:

  ```js
  const ALLOWED_SORT = ['name', 'installedAt', 'createdAt'];
  const ALLOWED_ORDER = ['ASC', 'DESC'];
  ```

  Значения из query не подставляются в `ORDER BY` напрямую.

- **Raw SQL** — только с bind-параметрами (`replacements`).

- **Zod** — все входные данные валидируются на уровне маршрута.

---

## Миграции

Все миграции — в `src/migrations/`.

### Применить

```bash
npx sequelize-cli db:migrate
```

### Откатить

```bash
npx sequelize-cli db:migrate:undo:all

npx sequelize-cli db:migrate:undo
```

### Полный цикл (проверка отката)

```bash
npx sequelize-cli db:migrate:undo:all
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
```

Каждая миграция содержит `up` и `down`.

---

## Сиды

| Сид | Данные |
|---|---|
| `01-demo-sites.js` | 2 площадки |
| `02-demo-equipment.js` | 6 единиц оборудования |
| `03-demo-passports.js` | 6 паспортов (1:1) |
| `04-demo-technicians.js` | 5 специалистов |
| `05-demo-requests.js` | 20 заявок |
| `06-demo-assignees-history.js` | назначения + история |

```bash
npx sequelize-cli db:seed:all
npx sequelize-cli db:seed:undo:all   
```

---

## Ассоциации Sequelize

Описанные в `src/models/index.js`:

- `Site.hasMany(Equipment, { as: 'equipment' })`
- `Equipment.belongsTo(Site, { as: 'site' })`
- `Equipment.hasOne(EquipmentPassport, { as: 'passport' })`
- `EquipmentPassport.belongsTo(Equipment, { as: 'equipment' })`
- `Equipment.hasMany(MaintenanceRequest, { as: 'requests' })`
- `MaintenanceRequest.belongsTo(Equipment, { as: 'equipment' })`
- `MaintenanceRequest.hasMany(RequestStatusHistory, { as: 'history' })`
- `MaintenanceRequest.belongsToMany(Technician, { through: RequestAssignee, as: 'technicians' })`
- `Technician.belongsToMany(MaintenanceRequest, { through: RequestAssignee, as: 'requests' })`

**Include** во всех списочных запросах — N+1 отсутствует. **Attributes** ограничены.

---

## Остановка и пересоздание

```bash
docker compose down

docker compose down -v

docker compose up -d
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
```

---

## Структура проекта

```
src/
├── config/
│   └── database.js          # Конфиг PostgreSQL из env
├── models/                  # Sequelize-модели + ассоциации
├── migrations/              # Миграции схемы
├── seeders/                 # Сиды
├── repositories/            # Работа с БД (WHERE, ORDER BY, LIMIT/OFFSET)
├── services/                # Бизнес-логика + транзакции
├── controllers/             # HTTP-слой
├── routes/                  # Роутинг
├── validators/              # Zod-схемы
├── middlewares/             # validate, asyncHandler, requestId
├── errors/                  # NotFoundError, ConflictError, ValidationError
└── app.js, server.js        # Точка входа

docs/
└── postman/
    ├── case3.postman_collection.json
    └── local.postman_environment.json
```

---

