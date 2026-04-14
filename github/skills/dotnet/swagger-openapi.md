---
name: dotnet-swagger-openapi
description: "Dotnet Swagger/OpenAPI guidance - endpoint metadata, schema generation, versioning, and API discoverability. Use when: documenting ASP.NET Core APIs."
---

# Swagger and OpenAPI

## Procedure

1. Configure OpenAPI generation at startup.
2. Annotate endpoints with summary/response metadata.
3. Ensure request/response DTOs are fully represented.
4. Separate docs by API version when relevant.
5. Validate generated spec in CI or pre-release checks.

## Example

```csharp
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

if (app.Environment.IsDevelopment())
{
	app.UseSwagger();
	app.UseSwaggerUI();
}
```

## Rules

- Keep docs aligned with actual runtime behavior.
- Document auth requirements and error shapes.
- Avoid ambiguous schema names and duplicate models.
- Add examples for common request/response models in public APIs.
