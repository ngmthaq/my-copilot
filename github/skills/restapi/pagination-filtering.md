# Pagination & Filtering

## Core Rule

Never return unbounded lists. Always paginate collection endpoints.

---

## Pagination Strategies

### 1. Offset Pagination (simple, most common)

Use `page` and `limit` query parameters.

```
GET /users?page=2&limit=10
```

Response:

```json
{
  "success": true,
  "data": [ ... ],
  "meta": {
    "total": 100,
    "page": 2,
    "limit": 10,
    "totalPages": 10
  }
}
```

**When to use:** Admin dashboards, simple list views, any list where users jump to a specific page.

**Drawback:** Inconsistent results if data changes between pages (rows inserted/deleted shift pages).

---

### 2. Cursor Pagination (stable, scalable)

Use a `cursor` that points to the last item in the previous page.

```
GET /posts?cursor=eyJpZCI6NTB9&limit=10
```

Response:

```json
{
  "success": true,
  "data": [ ... ],
  "meta": {
    "nextCursor": "eyJpZCI6NjB9",
    "hasMore": true
  }
}
```

**When to use:** Infinite scroll, real-time feeds, large datasets.

---

## Filtering

Filters are passed as query parameters:

```
GET /users?role=admin&isActive=true
GET /orders?status=pending&createdAfter=2026-01-01
```

**Rules:**

- Use exact field names from the resource schema.
- Date filters: use ISO 8601 values (`createdAfter`, `createdBefore`).
- Multiple values for one field: `?status=pending&status=processing` (comma-separated is also acceptable: `?status=pending,processing`).

---

## Sorting

```
GET /users?sort=createdAt&order=desc
GET /products?sort=price&order=asc
```

| Parameter | Default     | Values             |
| --------- | ----------- | ------------------ |
| `sort`    | `createdAt` | any sortable field |
| `order`   | `desc`      | `asc` or `desc`    |

---

## Search

For simple text search, use a `q` or `search` query parameter:

```
GET /products?q=laptop
GET /users?search=alice
```

---

## Combining Everything

```
GET /products?q=laptop&category=electronics&sort=price&order=asc&page=1&limit=20
```

---

## Defaults & Limits

- Default `limit`: `10` or `20`
- Maximum `limit`: `100` (enforce server-side, ignore larger values or return 400)
- Default `sort`: `createdAt desc`
