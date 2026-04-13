---
name: expressjs-convention
description: "Express.js conventions — file naming, folder structure naming, and project-specific patterns. Use when: naming Express files (routers, services, middleware); deciding file suffixes; organizing Express modules."
---

# Express.js Conventions

> **Prerequisite:** Also load [javascript/convention.md](../javascript/convention.md) for base formatting, Prettier, naming, import organization, EditorConfig, and ESLint rules, and [typescript/convention.md](../typescript/convention.md) for TypeScript-specific rules. This file covers Express-specific conventions only.

---

## 1. File Naming

| Context        | Convention                           | Example               |
| -------------- | ------------------------------------ | --------------------- |
| Routers        | `kebab-case.router.ts`               | `user.router.ts`      |
| Controllers    | `kebab-case.controller.ts`           | `user.controller.ts`  |
| Services       | `camelCase.ts`                       | `userService.ts`      |
| Middleware     | `camelCase.ts`                       | `authMiddleware.ts`   |
| Utilities      | `camelCase.ts`                       | `hashPassword.ts`     |
| DTOs / Schemas | `PascalCase.dto.ts`                  | `CreateUserDto.ts`    |
| Config files   | `camelCase.ts`                       | `appConfig.ts`        |
| Test files     | Same name + `.spec.ts` or `.test.ts` | `userService.spec.ts` |

---

## 2. Folder Structure Naming

Use `kebab-case` for all folder names:

```
src/
  modules/
    user/
      user.router.ts
      user.controller.ts
      userService.ts
      dto/
        CreateUserDto.ts
    auth/
      auth.router.ts
      authMiddleware.ts
  common/
    middleware/
    utils/
  config/
```
