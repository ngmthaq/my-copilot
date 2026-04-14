---
name: spring-boot-graphql-error-handling
description: "Spring Boot GraphQL error handling - exception mapping, extension codes, validation errors, and client-safe failure responses. Use when: standardizing GraphQL errors in Spring APIs. DO NOT USE FOR: REST-specific exception advice design."
---

# Spring Boot GraphQL Error Handling

## 1. Error Model

- Provide stable error `code` in GraphQL extensions.
- Separate user-facing messages from internal diagnostics.
- Keep HTTP 200 semantics with GraphQL error payloads in mind.

## 2. Exception Mapping

- Map domain exceptions to consistent GraphQL error codes.
- Include field/path metadata for validation failures.
- Avoid leaking stack traces in production responses.

## 3. Validation and Input Errors

- Return structured field errors when possible.
- Keep validation messages deterministic for clients.

## 4. Anti-Patterns

- Returning raw exception messages directly.
- Inconsistent error codes across resolvers.
- Mixing transport and domain errors without normalization.
