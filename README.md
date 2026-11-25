# 932420.Vladimirova.Alisa.lab7

# Лабораторная работа №7. Работа с базой данных (SQLite) и CRUD-операции

## Цель работы
Изучить основы работы с реляционными базами данных на примере SQLite, реализовать модульные CRUD-операции и интегрировать их в REST-подобный API на базе Node.js и Express.

---

## Стек технологий
* **Node.js** и **Express** — серверная часть и маршрутизация REST API.
* **SQLite (`sqlite3`)** — реляционная база данных для хранения заказов.
* **HTML / CSS / JS (PWA)** — клиентская часть проекта.

---

## Структура проекта
```text
public/             # Статические файлы сайта (HTML, CSS, JS, PWA)
database.js         # Модуль подключения к SQLite и CRUD-функции
server.js           # Express-сервер и обработка API-маршрутов
package.json        # Зависимости проекта
```

---

## Запуск проекта

1. Установите зависимости:
   ```bash
   npm install
   ```

2. Запустите сервер:
   ```bash
   node server.js
   ```
   При первом запуске автоматически создастся файл базы данных `orders.db` и таблица `orders`. Сервер будет доступен по адресу: `http://localhost:3000`.

---

## Структура таблицы `orders`

| Поле | Тип данных | Описание |
| :--- | :--- | :--- |
| `id` | `INTEGER PRIMARY KEY AUTOINCREMENT` | Уникальный идентификатор заказа |
| `customer_name` | `TEXT NOT NULL` | Имя клиента |
| `total_amount` | `REAL NOT NULL` | Сумма заказа (`>= 0`) |
| `status` | `TEXT DEFAULT 'new'` | Статус заказа (`new`, `paid`, `shipped`, `delivered`) |

---

## Описание REST API маршрутов

### 1. Получить список заказов
* **Метод и URL:** `GET /api/orders`
* **Фильтрация (опционально):** `GET /api/orders?status=paid` — возвращает заказы с указанным статусом.
* **Ответ (`200 OK`):** массив объектов заказов.

### 2. Создать новый заказ
* **Метод и URL:** `POST /api/orders`
* **Тело запроса (JSON):**
  ```json
  {
    "customer_name": "Алиса",
    "total_amount": 1500
  }
  ```
* **Логика:** статус по умолчанию устанавливается в `new`. При пустом имени или `total_amount < 0` возвращается ошибка `400 Bad Request`.
* **Ответ (`201 Created`):** созданный объект заказа.

### 3. Обновить статус заказа
* **Метод и URL:** `PATCH /api/orders/:id`
* **Тело запроса (JSON):**
  ```json
  {
    "status": "paid"
  }
  ```
* **Логика:** разрешена смена только поля `status` на одно из допустимых значений (`new`, `paid`, `shipped`, `delivered`). При передаче неизвестного статуса возвращается `400 Bad Request`, если заказ не найден — `404 Not Found`.
* **Ответ (`200 OK`):** обновлённый объект заказа.

### 4. Удалить заказ
* **Метод и URL:** `DELETE /api/orders/:id`
* **Ответ (`200 OK`):** подтверждение удаления (или `404 Not Found`, если ID не существует).

---

## Примеры проверки через `curl`

```bash
# Создание заказа
curl -X POST http://localhost:3000/api/orders -H "Content-Type: application/json" -d "{\"customer_name\": \"Алиса\", \"total_amount\": 1500}"

# Получение всех заказов
curl http://localhost:3000/api/orders

# Изменение статуса
curl -X PATCH http://localhost:3000/api/orders/1 -H "Content-Type: application/json" -d "{\"status\": \"paid\"}"

# Фильтрация по статусу
curl "http://localhost:3000/api/orders?status=paid"

# Удаление заказа
curl -X DELETE http://localhost:3000/api/orders/1
```
