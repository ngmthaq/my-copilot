---
name: restapi
description: "Unified REST API skill index — covers resource design, HTTP methods, status codes, request/response format, error handling, authentication & authorization, pagination & filtering, versioning, rate limiting, and OpenAPI documentation. Use this as the entry point; it delegates to focused sub-skill files for each domain."
---

# REST API Skill

## Overview

This is the top-level entry point for REST API design and implementation topics. It points to the right sub-skill file based on what you need to do. Each sub-skill file contains clear rules, examples, and patterns for that domain.

---

## Sub-Skills Reference

| Domain                         | File                                                               | When to use                                                                                             |
| ------------------------------ | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| HTTP Methods                   | [http-methods.md](http-methods.md)                                 | Choosing GET, POST, PUT, PATCH, DELETE; understanding idempotency; mapping CRUD to HTTP verbs           |
| Resource Design                | [resource-design.md](resource-design.md)                           | Naming endpoints, structuring URL paths, nested resources, keeping URLs noun-based and consistent       |
| Status Codes                   | [status-codes.md](status-codes.md)                                 | Returning the correct HTTP status for success, creation, errors, auth failures, and not-found responses |
| Request & Response Format      | [request-response-format.md](request-response-format.md)           | Structuring JSON request bodies and response envelopes consistently across all endpoints                |
| Error Handling                 | [error-handling.md](error-handling.md)                             | Returning structured error responses, distinguishing client vs server errors, validation error format   |
| Authentication & Authorization | [authentication-authorization.md](authentication-authorization.md) | Securing endpoints with JWT/Bearer tokens, handling 401 vs 403, RBAC patterns in REST APIs              |
| Pagination & Filtering         | [pagination-filtering.md](pagination-filtering.md)                 | Implementing cursor/offset pagination, sorting, filtering, and search via query parameters              |
| Versioning                     | [versioning.md](versioning.md)                                     | Versioning APIs via URL path or headers, managing breaking changes, deprecation strategies              |
| Rate Limiting                  | [rate-limiting.md](rate-limiting.md)                               | Protecting APIs with rate limits, returning 429 responses, communicating limits via response headers    |
| Documentation / OpenAPI        | [documentation-openapi.md](documentation-openapi.md)               | Writing OpenAPI/Swagger specs, documenting endpoints, schemas, auth, and error responses                |

---

## Quick Decision Guide

```
What are you trying to do?
│
├── Choose the right HTTP verb (GET, POST, PUT, PATCH, DELETE)?
│   └── → http-methods.md
│
├── Design endpoint URLs and resource naming?
│   └── → resource-design.md
│
├── Pick the correct HTTP status code for a response?
│   └── → status-codes.md
│
├── Structure the JSON body of a request or response?
│   └── → request-response-format.md
│
├── Format and return error responses consistently?
│   └── → error-handling.md
│
├── Secure endpoints with tokens or implement role-based access?
│   └── → authentication-authorization.md
│
├── Add pagination, sorting, or filtering to a list endpoint?
│   └── → pagination-filtering.md
│
├── Version an API or manage breaking changes?
│   └── → versioning.md
│
├── Protect an API from abuse with throttling?
│   └── → rate-limiting.md
│
└── Write OpenAPI/Swagger docs for endpoints?
    └── → documentation-openapi.md
```

---

## How to Use This Skill

1. **Identify your goal** using the Quick Decision Guide above.
2. **Load the matching sub-skill file** with `read_file`.
3. **Follow the patterns** in that file to implement or review the API.
4. **Load multiple sub-skill files** when a task spans domains — e.g., building a new list endpoint typically involves `resource-design.md` + `http-methods.md` + `pagination-filtering.md` + `status-codes.md`.
