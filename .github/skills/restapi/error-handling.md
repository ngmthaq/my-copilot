# Error Handling

## Core Rule

Return structured, consistent error responses on every failure. Never expose internal server details to clients.

---

## Standard Error Response Shape

```json
{
  "success": false,
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "User with id 42 was not found.",
    "details": []
  }
}
```

| Field     | Type   | Description                                          |
| --------- | ------ | ---------------------------------------------------- |
| `code`    | string | Machine-readable error identifier (UPPER_SNAKE_CASE) |
| `message` | string | Human-readable description safe to show users        |
| `details` | array  | Optional list of field-level errors (for validation) |

---

## Validation Error Format

When input validation fails (400 or 422), include per-field details:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed.",
    "details": [
      { "field": "email", "message": "Email is required." },
      { "field": "password", "message": "Password must be at least 8 characters." }
    ]
  }
}
```

---

## Common Error Codes

| Code                    | HTTP Status | Meaning                       |
| ----------------------- | ----------- | ----------------------------- |
| `VALIDATION_ERROR`      | 400 / 422   | Input failed validation       |
| `UNAUTHORIZED`          | 401         | Missing or invalid auth token |
| `FORBIDDEN`             | 403         | Authenticated but not allowed |
| `RESOURCE_NOT_FOUND`    | 404         | Resource does not exist       |
| `CONFLICT`              | 409         | Duplicate resource            |
| `RATE_LIMIT_EXCEEDED`   | 429         | Too many requests             |
| `INTERNAL_SERVER_ERROR` | 500         | Unexpected server failure     |

---

## Rules

- **Never** return a stack trace or raw exception message to the client in production.
- **Always log** the full error (with stack trace) on the server side for debugging.
- **Distinguish** between client errors (4xx) and server errors (5xx) — different handling, different logging levels.
- For 5xx errors, return a **generic message** to the client (`"An unexpected error occurred."`), not the internal error message.
- Handle errors **centrally** via a single middleware or exception filter — do not scatter try/catch error responses across every handler.

---

## Error Handling Lifecycle

```
Request
  → Validate Input           — return 400/422 if invalid
  → Authenticate             — return 401 if no/bad token
  → Authorize               — return 403 if no permission
  → Execute Business Logic  — return 404/409 if domain rule fails
  → Return Success          — 200/201/204
  → Catch All Errors        — centralized handler returns 500
```
