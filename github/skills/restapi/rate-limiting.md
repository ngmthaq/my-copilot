# Rate Limiting

## Core Rule

Protect your API from abuse and overload by limiting how many requests a client can make in a time window.

---

## How It Works

1. Track requests per **identifier** (IP address, API key, or user ID) within a **time window** (e.g., 1 minute).
2. If the limit is exceeded, return `429 Too Many Requests`.
3. Inform the client **when they can retry** via response headers.

---

## Rate Limit Response Headers

Always include these headers in every response (not just on 429):

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 42
X-RateLimit-Reset: 1712300060
Retry-After: 30
```

| Header                  | Meaning                                          |
| ----------------------- | ------------------------------------------------ |
| `X-RateLimit-Limit`     | Maximum requests allowed in the window           |
| `X-RateLimit-Remaining` | How many requests are left in the current window |
| `X-RateLimit-Reset`     | Unix timestamp when the window resets            |
| `Retry-After`           | Seconds to wait before retrying (only on 429)    |

---

## 429 Response Body

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again in 30 seconds.",
    "details": []
  }
}
```

---

## Rate Limit Tiers (Example)

| Endpoint Type                      | Limit                  |
| ---------------------------------- | ---------------------- |
| Public endpoints (unauthenticated) | 30 req / min per IP    |
| Authenticated endpoints            | 100 req / min per user |
| Auth endpoints (login, register)   | 10 req / 15 min per IP |
| Sensitive actions (password reset) | 5 req / hour per IP    |

---

## Storage Backend

| Backend                     | When to use                            |
| --------------------------- | -------------------------------------- |
| In-memory (single instance) | Development or single-server apps      |
| Redis                       | Production, multi-instance deployments |

---

## Rules

- Apply **stricter limits** to auth endpoints to prevent brute-force attacks.
- Identify clients by **user ID** (when authenticated) or **IP** (when public).
- Always include rate limit headers so clients can adapt without hitting 429.
- On 429, always include `Retry-After` so clients know when to retry.
- Do **not** silently drop requests — always return 429 with a clear message.
