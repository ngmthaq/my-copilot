---
name: dotnet-testing
description: "Dotnet testing guidance - unit and integration testing strategy, API tests, test doubles, and reliability checks. Use when: adding or improving .NET tests."
---

# Testing

## Test Pyramid

- Unit tests for business logic and invariants.
- Integration tests for data and infrastructure boundaries.
- API/contract tests for externally visible behavior.

## Procedure

1. Identify changed behaviors and edge cases.
2. Add unit tests first for deterministic rules.
3. Add integration tests for persistence/serialization/auth flows.
4. Ensure cancellation, timeout, and failure paths are covered.
5. Run tests in CI-compatible mode and keep fixtures isolated.

## Example

```csharp
[Fact]
public async Task CreateUser_ReturnsConflict_WhenEmailExists()
{
	var service = new UserService(new FakeUserRepository(existingEmail: "a@b.com"));
	await Assert.ThrowsAsync<DomainConflictException>(() =>
		service.CreateAsync(new CreateUserRequest("a@b.com", "Alice"), CancellationToken.None));
}
```

## Rules

- Use descriptive names based on behavior.
- Avoid asserting internal implementation details.
- Keep tests deterministic and independent.
- Test cancellation and timeout behavior for async operations.
