---
name: dotnet-exception-handling-filters
description: "Dotnet exception handling guidance - global exception middleware/filters, domain error mapping, and consistent problem responses. Use when: standardizing API error behavior."
---

# Exception Handling and Filters

## Procedure

1. Define canonical error response shape (for example RFC 7807 style).
2. Map known exception categories to stable status codes.
3. Configure global exception middleware or filters.
4. Log exceptions with correlation context.
5. Verify error contracts with tests.

## Example

```csharp
app.UseExceptionHandler(errorApp =>
{
	errorApp.Run(async context =>
	{
		var problem = new ProblemDetails
		{
			Title = "Unexpected error",
			Status = StatusCodes.Status500InternalServerError,
			Detail = "An unexpected error occurred."
		};
		context.Response.StatusCode = problem.Status.Value;
		await context.Response.WriteAsJsonAsync(problem);
	});
});
```

## Rules

- Never expose stack traces or sensitive internals.
- Preserve actionable details for client-side handling.
- Keep exception-to-status mapping documented.
- Keep correlation IDs in error responses when your platform policy allows it.
