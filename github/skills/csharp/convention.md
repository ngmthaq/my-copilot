---
name: csharp-convention
description: "C# coding convention - covers formatting, naming, .editorconfig, file layout, namespace organization, and documentation style. Use when: formatting or refactoring C# code; reviewing style consistency; setting up conventions for new projects. DO NOT USE FOR: runtime performance tuning (use csharp-memory-performance); async correctness (use csharp-async-concurrency)."
---

# C# Convention

## When to Use

- Formatting or refactoring C# code
- Enforcing naming consistency in a code review
- Creating or updating .editorconfig rules
- Standardizing project and folder structure

## Baseline Rules

| Rule                     | Preferred value                           |
| ------------------------ | ----------------------------------------- |
| Indentation              | 4 spaces                                  |
| Max line length          | 100-120 chars                             |
| Braces                   | New line for types/methods/control blocks |
| Nullable reference types | Enabled                                   |
| Implicit usings          | Enabled for app projects                  |
| Warnings as errors       | Enabled in CI                             |

## Naming Conventions

| Element                  | Convention                     | Example               |
| ------------------------ | ------------------------------ | --------------------- |
| Class/Record/Struct      | PascalCase                     | OrderService, UserDto |
| Interface                | I + PascalCase                 | IRepository           |
| Method/Property/Event    | PascalCase                     | CalculateTotal        |
| Local variable/parameter | camelCase                      | userId                |
| Private field            | \_camelCase                    | \_clock               |
| Constant                 | PascalCase or UPPER_SNAKE_CASE | MaxRetries            |
| Async method             | Suffix Async                   | LoadUserAsync         |

## .editorconfig Starter

```ini
root = true

[*.cs]
indent_style = space
indent_size = 4
charset = utf-8
end_of_line = lf
insert_final_newline = true

dotnet_style_qualification_for_field = false:suggestion
dotnet_style_qualification_for_property = false:suggestion
dotnet_style_qualification_for_method = false:suggestion
dotnet_style_qualification_for_event = false:suggestion

dotnet_style_prefer_var_for_built_in_types = true:suggestion
dotnet_style_prefer_var_when_type_is_apparent = true:suggestion
dotnet_style_prefer_var_elsewhere = false:suggestion

csharp_style_var_for_built_in_types = true:suggestion
csharp_style_var_when_type_is_apparent = true:suggestion
csharp_style_var_elsewhere = false:suggestion
```

## Practical Guidance

- Keep one public type per file.
- Match file name to type name.
- Keep constructor parameter order consistent with field order.
- Place guard clauses early for readability.
- Prefer expression-bodied members only when they improve clarity.
