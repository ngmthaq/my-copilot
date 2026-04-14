---
name: dotnet-service-layer
description: "Dotnet service layer guidance - business orchestration, transaction boundaries, and use-case focused services. Use when: moving logic out of controllers and into application services."
---

# Service Layer

## Scope

- Encapsulate use-case logic and orchestration.
- Coordinate repositories, external clients, and domain rules.
- Keep service interfaces focused on business outcomes.

## Procedure

1. Model one service method per use case.
2. Validate invariants before side effects.
3. Wrap multi-step writes in transaction boundaries where required.
4. Map domain errors to application-level results.
5. Add unit tests with boundary mocks/fakes.

## Example

```csharp
public sealed class UserService : IUserService
{
	private readonly IUserRepository _users;

	public UserService(IUserRepository users) => _users = users;

	public async Task<UserResponse> CreateAsync(CreateUserRequest request, CancellationToken ct)
	{
		if (await _users.ExistsByEmailAsync(request.Email, ct))
			throw new DomainConflictException("Email already in use");

		var user = User.Create(request.Email, request.DisplayName);
		await _users.AddAsync(user, ct);
		return new UserResponse(user.Id, user.Email, user.DisplayName);
	}
}
```
