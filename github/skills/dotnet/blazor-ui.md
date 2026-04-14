---
name: dotnet-blazor-ui
description: "Blazor UI guidance - component design, state flow, forms, validation, and rendering performance. Use when: building or refactoring .NET web UI with Blazor."
---

# Blazor UI

## Procedure

1. Break UI into small reusable components.
2. Keep state ownership explicit at page or feature boundary.
3. Validate forms with clear feedback and accessible messaging.
4. Move API calls to scoped services and isolate side effects.
5. Measure rendering hotspots and reduce unnecessary re-renders.

## Example

```razor
<EditForm Model="Model" OnValidSubmit="SaveAsync">
	<DataAnnotationsValidator />
	<ValidationSummary />
	<InputText @bind-Value="Model.DisplayName" />
	<button type="submit">Save</button>
</EditForm>

@code {
	private UserFormModel Model = new();
	private Task SaveAsync() => UserService.SaveAsync(Model);
}
```

## Rules

- Keep component parameters explicit and immutable where possible.
- Avoid business logic directly inside markup-heavy components.
- Test critical components and page flows.
- Use `@key` in repeated lists where identity stability matters.
