---
name: dotnet-authentication-authorization
description: "Authentication and authorization guidance for .NET - JWT/cookie auth setup, claims/roles, policy-based authorization, and endpoint protection checks. Use when: securing .NET applications."
---

# Authentication and Authorization

## Procedure

1. Choose authentication scheme per app type (JWT, cookie, external IdP).
2. Define authorization policies by capability, not only by role.
3. Apply `[Authorize]` or endpoint policies explicitly.
4. Return `401` for unauthenticated and `403` for unauthorized access.
5. Add tests for protected and unprotected paths.

## Example

```csharp
builder.Services.AddAuthorization(options =>
{
	options.AddPolicy("Orders.Read", policy =>
		policy.RequireClaim("scope", "orders.read"));
});
```

## Security Rules

- Validate issuer, audience, and token lifetime.
- Avoid coarse role checks when claims/policies are clearer.
- Keep secrets and signing keys out of source code.
- Keep token clock skew small and explicit.
