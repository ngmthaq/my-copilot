---
name: nestjs-convention
description: "NestJS conventions — file naming, folder structure naming, and project-specific patterns. Use when: naming NestJS files (modules, controllers, services, DTOs, guards, pipes); deciding file suffixes; organizing NestJS modules."
---

# NestJS Conventions

> **Prerequisite:** Also load [javascript/convention.md](../javascript/convention.md) for base formatting, Prettier, naming, import organization, EditorConfig, and ESLint rules, and [typescript/convention.md](../typescript/convention.md) for TypeScript-specific rules. This file covers NestJS-specific conventions only.

---

## 1. File Naming

| Context           | Convention                           | Example                    |
| ----------------- | ------------------------------------ | -------------------------- |
| Modules           | `kebab-case.module.ts`               | `auth.module.ts`           |
| Controllers       | `kebab-case.controller.ts`           | `user.controller.ts`       |
| Services          | `kebab-case.service.ts`              | `user.service.ts`          |
| Guards            | `kebab-case.guard.ts`                | `jwt-auth.guard.ts`        |
| Pipes             | `kebab-case.pipe.ts`                 | `parse-int.pipe.ts`        |
| Interceptors      | `kebab-case.interceptor.ts`          | `logging.interceptor.ts`   |
| Filters           | `kebab-case.filter.ts`               | `http-exception.filter.ts` |
| DTOs              | `PascalCase.dto.ts`                  | `CreateUserDto.ts`         |
| Entities / Models | `kebab-case.entity.ts`               | `user.entity.ts`           |
| Interfaces        | `kebab-case.interface.ts`            | `user.interface.ts`        |
| Test files        | Same name + `.spec.ts` or `.test.ts` | `user.service.spec.ts`     |

---

## 2. Folder Structure Naming

Use `kebab-case` for all folder names. Follow NestJS CLI conventions:

```
src/
  modules/
    user/
      user.module.ts
      user.controller.ts
      user.service.ts
      dto/
        CreateUserDto.ts
      entities/
        user.entity.ts
    auth/
      auth.module.ts
      auth.controller.ts
      auth.service.ts
      guards/
        jwt-auth.guard.ts
  common/
    filters/
    interceptors/
    pipes/
    decorators/
  config/
```
