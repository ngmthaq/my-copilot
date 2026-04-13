# Authentication & Authorization

## Core Concepts

- **Authentication**: Who are you? (identity) → verified via a token or credentials
- **Authorization**: What can you do? (permission) → checked after authentication

---

## Standard Approach: Bearer Token (JWT)

All protected endpoints require an `Authorization` header:

```
Authorization: Bearer <jwt-token>
```

---

## Authentication Flow

```
Client                              Server
  ├── POST /auth/login {•••}  ────────► Validate credentials
  └── 200 { accessToken, refreshToken } ◄─ Sign & return tokens

  ├── GET /users (Authorization: Bearer ...) ► Verify token
  └── 200 { data: [...] } ◄────────────────── Return data

  ├── POST /auth/refresh { refreshToken } ─► Validate refresh token
  └── 200 { accessToken } ◄─────────────────── Issue new access token
```

---

## Auth Endpoints Convention

| Action           | Method | URL                       |
| ---------------- | ------ | ------------------------- |
| Login            | POST   | `/auth/login`             |
| Register         | POST   | `/auth/register`          |
| Refresh token    | POST   | `/auth/refresh`           |
| Logout           | POST   | `/auth/logout`            |
| Get current user | GET    | `/auth/me` or `/users/me` |

---

## Status Codes for Auth

| Situation                  | Code | Reason          |
| -------------------------- | ---- | --------------- |
| No token provided          | 401  | Unauthenticated |
| Token expired or invalid   | 401  | Unauthenticated |
| Token valid, no permission | 403  | Forbidden       |

---

## Role-Based Access Control (RBAC)

Embed the user's role(s) in the JWT payload:

```json
{
  "sub": "42",
  "role": "admin",
  "iat": 1712300000,
  "exp": 1712386400
}
```

Check role in the auth middleware/guard before the handler runs.

**Common roles:**

```
guest      — unauthenticated
user       — standard authenticated user
mod        — moderator with elevated access
admin      — full access
```

---

## Rules

- **Never** store sensitive data (passwords, secrets) in the JWT payload.
- **Always** use HTTPS — tokens sent over HTTP can be intercepted.
- **Access tokens** should be short-lived (15 min – 1 hour).
- **Refresh tokens** should be long-lived (7–30 days) and stored securely (HttpOnly cookie or secure storage).
- Do **not** return the refresh token in the same response body as user data.
- Invalidate refresh tokens on logout.
- On 401, the client should attempt a token refresh. On second 401, redirect to login.
