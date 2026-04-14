---
name: dotnet-input-validation
description: "Dotnet input validation guidance - request validation, model binding constraints, and standardized validation responses. Use when: validating API inputs and enforcing contracts."
---

# Input Validation

## Procedure

1. Define validation rules on request DTOs.
2. Validate route/query/body input consistently.
3. Return predictable validation error payloads.
4. Reject unknown/unsafe payload shape when needed.
5. Add tests for invalid edge-case inputs.

## Example

```csharp
public sealed class CreateUserRequestValidator : AbstractValidator<CreateUserRequest>
{
	public CreateUserRequestValidator()
	{
		RuleFor(x => x.Email).NotEmpty().EmailAddress();
		RuleFor(x => x.DisplayName).NotEmpty().MaximumLength(100);
	}
}
```

## Rules

- Fail fast on invalid input.
- Keep validation logic declarative where possible.
- Avoid duplicate rules across controller and service layers.
- Validate both syntactic constraints and critical business preconditions.
