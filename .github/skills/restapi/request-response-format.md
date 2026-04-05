# Request & Response Format

## Core Rule

Be **consistent**. Every endpoint should follow the same shape for both requests and responses. Predictability reduces integration errors.

---

## Request Format

### Headers (required for all authenticated or body-bearing requests)

```
Content-Type: application/json
Authorization: Bearer <token>
Accept: application/json
```

### Request Body (POST / PUT / PATCH)

Use a flat JSON object. Avoid deeply nested structures unless the domain requires them.

```json
{
  "name": "Alice Smith",
  "email": "alice@example.com",
  "role": "admin"
}
```

---

## Response Format

Use a consistent envelope for **all** responses.

### Success Response

```json
{
  "success": true,
  "data": {
    "id": 42,
    "name": "Alice Smith",
    "email": "alice@example.com"
  }
}
```

### Success Response (list / paginated)

```json
{
  "success": true,
  "data": [
    { "id": 1, "name": "Alice" },
    { "id": 2, "name": "Bob" }
  ],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [{ "field": "email", "message": "Email is required" }]
  }
}
```

---

## Rules

- Always set `Content-Type: application/json` in responses.
- Always use `camelCase` for JSON field names.
- Never return raw strings or arrays as the root response body — always wrap in an object.
- Dates must be in **ISO 8601** format: `"2026-04-05T10:00:00Z"`.
- Do not expose internal fields like database IDs in a different format, stack traces, or internal error messages in production.
- The `data` field is `null` on error. The `error` field is `null` on success.

---

## Field Naming

| Format      | Rule                                               |
| ----------- | -------------------------------------------------- |
| `camelCase` | Use for all JSON fields (`userId`, `createdAt`)    |
| ISO 8601    | Use for all date/time fields                       |
| Booleans    | Use positive names (`isActive`, not `isNotActive`) |
