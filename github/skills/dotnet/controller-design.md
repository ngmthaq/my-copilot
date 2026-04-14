---
name: dotnet-controller-design
description: "ASP.NET controller design guidance - route modeling, action contracts, status code semantics, and thin handler patterns. Use when: implementing REST controllers."
---

# Controller Design

## Procedure

1. Define explicit request/response DTO contracts.
2. Keep controller actions thin and delegate to services.
3. Return accurate HTTP status codes and consistent payloads.
4. Add cancellation token support for async actions.
5. Cover success and failure paths with API tests.

## Example

```csharp
[ApiController]
[Route("api/users")]
public sealed class UsersController : ControllerBase
{
	[HttpGet("{id:guid}")]
	public async Task<ActionResult<UserResponse>> GetById(
		Guid id,
		[FromServices] IUserService service,
		CancellationToken ct)
	{
		var user = await service.FindAsync(id, ct);
		return user is null ? NotFound() : Ok(user);
	}
}
```

## Rules

- Do not expose entities directly from controllers.
- Keep route and action naming resource-oriented.
- Avoid business logic in controllers.
- Keep controller constructors small by injecting one orchestrating service when possible.
