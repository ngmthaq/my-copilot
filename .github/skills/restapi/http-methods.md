# HTTP Methods

## Core Rule

Choose the HTTP method based on **what the operation does**, not what sounds convenient.

---

## Method Reference

| Method | Purpose                     | Has Body? | Idempotent? | Safe? |
| ------ | --------------------------- | --------- | ----------- | ----- |
| GET    | Read a resource or list     | No        | Yes         | Yes   |
| POST   | Create a new resource       | Yes       | No          | No    |
| PUT    | Replace a resource entirely | Yes       | Yes         | No    |
| PATCH  | Update specific fields      | Yes       | No          | No    |
| DELETE | Remove a resource           | No        | Yes         | No    |

- **Safe** = does not modify data
- **Idempotent** = calling it multiple times gives the same result

---

## CRUD → HTTP Mapping

| CRUD Operation     | HTTP Method | URL Example         |
| ------------------ | ----------- | ------------------- |
| List all           | GET         | `GET /users`        |
| Get one            | GET         | `GET /users/:id`    |
| Create             | POST        | `POST /users`       |
| Replace all fields | PUT         | `PUT /users/:id`    |
| Update some fields | PATCH       | `PATCH /users/:id`  |
| Delete             | DELETE      | `DELETE /users/:id` |

---

## Rules

- **Never use GET to create or delete** — GET must be safe and side-effect-free.
- **Use POST for actions** that don't map to CRUD (e.g., `POST /orders/:id/cancel`).
- **Prefer PATCH over PUT** when you only update a few fields — PUT replaces the entire resource.
- **DELETE should be idempotent** — deleting an already-deleted resource should return `404`, not `500`.

---

## Examples

```
# List all users
GET /users

# Get a single user
GET /users/42

# Create a user
POST /users
Body: { "name": "Alice", "email": "alice@example.com" }

# Update user's name only
PATCH /users/42
Body: { "name": "Alice Smith" }

# Replace the whole user record
PUT /users/42
Body: { "name": "Alice Smith", "email": "alice@example.com", "role": "admin" }

# Delete a user
DELETE /users/42

# Non-CRUD action via POST
POST /orders/99/cancel
```
