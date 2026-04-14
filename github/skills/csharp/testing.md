---
name: csharp-testing
description: "C# testing guidance - covers unit, integration, and component testing with xUnit/NUnit/MSTest, mocking, test data setup, and coverage practices. Use when: adding or improving tests in C# projects."
---

# Testing

## Test Pyramid Guidance

- Unit tests: fast, deterministic, isolated.
- Integration tests: verify infrastructure boundaries.
- End-to-end tests: minimal critical-path coverage.

## Unit Testing Rules

- Arrange, Act, Assert structure.
- One behavior focus per test.
- Avoid asserting implementation details.
- Use descriptive test names.

```csharp
[Fact]
public async Task GetUserAsync_ReturnsUser_WhenFound()
{
    var repo = new FakeUserRepository(UserFixture.Alice());
    var service = new UserService(repo);

    var result = await service.GetUserAsync(UserFixture.AliceId, CancellationToken.None);

    Assert.Equal(UserFixture.AliceId, result.Id);
}
```

## Mocking Guidance

- Mock external boundaries (database, network, clock).
- Prefer fakes/stubs for simple behavior-driven tests.
- Do not over-mock pure domain logic.

## Coverage

- Use coverage as a signal, not a target alone.
- Ensure critical error and cancellation paths are tested.
