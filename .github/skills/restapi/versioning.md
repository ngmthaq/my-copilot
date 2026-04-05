# API Versioning

## Core Rule

Version your API from day one. Never make breaking changes to an existing version.

---

## What Is a Breaking Change?

A breaking change forces existing clients to update their code. Examples:

| Breaking                           | Non-breaking                       |
| ---------------------------------- | ---------------------------------- |
| Removing a field from the response | Adding a new optional field        |
| Renaming a field                   | Adding a new endpoint              |
| Changing a field's type            | Adding an optional query parameter |
| Changing the URL structure         | Adding a new status code           |
| Making an optional field required  | Improving error messages           |

---

## Versioning Strategies

### 1. URL Path Versioning (recommended)

Include the version in the URL:

```
/v1/users
/v2/users
```

**Pros:** Easy to read, easy to test in a browser, clear to consumers.  
**Cons:** Every version change creates new URLs.

---

### 2. Header Versioning

Pass the version via a custom header:

```
GET /users
Accept: application/vnd.myapp.v2+json
```

or a custom header:

```
GET /users
API-Version: 2
```

**Pros:** Clean URLs.  
**Cons:** Not visible in browser, harder to test and document.

---

## Recommended Approach: URL Path

```
https://api.example.com/v1/users
https://api.example.com/v2/users
```

Folder structure:

```
src/
  routes/
    v1/
      users.routes.ts
    v2/
      users.routes.ts
```

---

## Deprecation Strategy

1. **Announce** the deprecation at least 3–6 months before end-of-life.
2. **Add a deprecation header** to responses of the old version:
   ```
   Deprecation: true
   Sunset: Sat, 01 Jan 2027 00:00:00 GMT
   ```
3. **Keep old versions running** until the sunset date.
4. **Communicate** the migration path clearly in docs.

---

## Rules

- Start at `v1`. Do not use `v0` in production.
- Only increment major version for **breaking changes**.
- Non-breaking changes can be added to the current version without incrementing.
- Avoid versioning individual endpoints (e.g., `/users/v2`) — version the whole API.
- Always maintain at least the **current and previous** version simultaneously.
