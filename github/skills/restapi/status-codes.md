# Status Codes

## Core Rule

Always return a status code that accurately reflects what happened. Do not always return `200 OK`.

---

## Status Code Groups

| Range | Meaning                                           |
| ----- | ------------------------------------------------- |
| 2xx   | Success                                           |
| 3xx   | Redirect                                          |
| 4xx   | Client error (the caller made a mistake)          |
| 5xx   | Server error (something went wrong on the server) |

---

## Common Status Codes

### Success (2xx)

| Code | Name       | When to use                              |
| ---- | ---------- | ---------------------------------------- |
| 200  | OK         | General success for GET, PATCH, PUT      |
| 201  | Created    | Resource was successfully created (POST) |
| 204  | No Content | Success but no body to return (DELETE)   |

### Client Errors (4xx)

| Code | Name                 | When to use                                            |
| ---- | -------------------- | ------------------------------------------------------ |
| 400  | Bad Request          | Invalid input, missing required fields, malformed JSON |
| 401  | Unauthorized         | No auth token or token is invalid/expired              |
| 403  | Forbidden            | Token is valid, but user lacks permission              |
| 404  | Not Found            | Resource does not exist                                |
| 409  | Conflict             | Resource already exists (e.g., duplicate email)        |
| 422  | Unprocessable Entity | Input is valid JSON but fails business validation      |
| 429  | Too Many Requests    | Rate limit exceeded                                    |

### Server Errors (5xx)

| Code | Name                  | When to use                                   |
| ---- | --------------------- | --------------------------------------------- |
| 500  | Internal Server Error | Unexpected server-side failure                |
| 502  | Bad Gateway           | Upstream service returned an invalid response |
| 503  | Service Unavailable   | Server is down or overloaded                  |

---

## Decision Guide

```
Did the request succeed?
├── Yes
│   ├── Created a new resource? → 201
│   ├── No body to return? → 204
│   └── Everything else → 200
└── No
    ├── Is it the client's fault?
    │   ├── Missing/invalid token? → 401
    │   ├── No permission? → 403
    │   ├── Resource not found? → 404
    │   ├── Duplicate resource? → 409
    │   ├── Bad input/validation failed? → 400 or 422
    │   └── Too many requests? → 429
    └── Is it a server fault? → 500
```

---

## 401 vs 403 — Key Distinction

- **401 Unauthorized** — "Who are you?" The user is not authenticated.
- **403 Forbidden** — "I know who you are, but you can't do this." The user is authenticated but lacks permission.

---

## 400 vs 422 — When to use each

- **400** — Malformed request (bad JSON, missing required header, invalid type).
- **422** — Well-formed request but fails domain validation (e.g., start date is after end date).
