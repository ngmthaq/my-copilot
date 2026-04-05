---
name: typescript-decorators
description: "TypeScript decorators — class, method, property, parameter decorators, decorator factories, metadata reflection, and practical patterns for logging, validation, and dependency injection. Use when: using NestJS or similar frameworks; implementing cross-cutting concerns; understanding decorator patterns. DO NOT USE FOR: general OOP (use typescript-object-oriented); class basics (use typescript-basic-types)."
---

# TypeScript Decorators

## 1. Setup

```jsonc
// tsconfig.json
{
  "compilerOptions": {
    "experimentalDecorators": true, // Enable legacy decorators
    "emitDecoratorMetadata": true, // Emit type metadata (for DI)
  },
}
```

```bash
# For reflect-metadata (needed for DI and metadata)
npm install reflect-metadata
```

```typescript
// Import once at entry point
import "reflect-metadata";
```

---

## 2. Class Decorators

```typescript
// A class decorator receives the constructor
function Sealed(constructor: Function) {
  Object.seal(constructor);
  Object.seal(constructor.prototype);
}

@Sealed
class User {
  name: string;
  constructor(name: string) {
    this.name = name;
  }
}

// Decorator factory — returns the decorator (allows params)
function Entity(tableName: string) {
  return function (constructor: Function) {
    Reflect.defineMetadata("tableName", tableName, constructor);
  };
}

@Entity("users")
class User {
  id!: string;
  name!: string;
}

// Read metadata
const table = Reflect.getMetadata("tableName", User); // "users"

// Replace/extend class
function WithTimestamps<T extends { new (...args: any[]): {} }>(Base: T) {
  return class extends Base {
    createdAt = new Date();
    updatedAt = new Date();
  };
}

@WithTimestamps
class Post {
  title: string;
  constructor(title: string) {
    this.title = title;
  }
}
```

---

## 3. Method Decorators

```typescript
// (target, propertyKey, descriptor)
function Log(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const original = descriptor.value;
  descriptor.value = function (...args: any[]) {
    console.log(`Calling ${propertyKey} with`, args);
    const result = original.apply(this, args);
    console.log(`Result:`, result);
    return result;
  };
}

class Calculator {
  @Log
  add(a: number, b: number): number {
    return a + b;
  }
}

// Decorator factory with options
function Retry(attempts: number, delay: number) {
  return function (target: any, key: string, descriptor: PropertyDescriptor) {
    const original = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      for (let i = 0; i <= attempts; i++) {
        try {
          return await original.apply(this, args);
        } catch (err) {
          if (i === attempts) throw err;
          await new Promise((r) => setTimeout(r, delay * 2 ** i));
        }
      }
    };
  };
}

class ApiClient {
  @Retry(3, 1000)
  async fetchData(url: string): Promise<any> {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }
}

// Timing decorator
function Measure(target: any, key: string, descriptor: PropertyDescriptor) {
  const original = descriptor.value;
  descriptor.value = async function (...args: any[]) {
    const start = performance.now();
    const result = await original.apply(this, args);
    const duration = performance.now() - start;
    console.log(`${key} took ${duration.toFixed(2)}ms`);
    return result;
  };
}
```

---

## 4. Property Decorators

```typescript
// (target, propertyKey) — no descriptor for properties
function Column(options: { type: string; nullable?: boolean }) {
  return function (target: any, propertyKey: string) {
    Reflect.defineMetadata("column", options, target, propertyKey);
  };
}

function Required(target: any, propertyKey: string) {
  const requiredFields: string[] = Reflect.getMetadata("required", target) || [];
  requiredFields.push(propertyKey);
  Reflect.defineMetadata("required", requiredFields, target);
}

class User {
  @Column({ type: "uuid" })
  id!: string;

  @Required
  @Column({ type: "varchar" })
  name!: string;

  @Column({ type: "varchar", nullable: true })
  bio?: string;
}

// Read metadata
const nameCol = Reflect.getMetadata("column", User.prototype, "name");
// { type: "varchar" }
const required = Reflect.getMetadata("required", User.prototype);
// ["name"]
```

---

## 5. Parameter Decorators

```typescript
// (target, methodName, parameterIndex)
function Inject(token: string) {
  return function (target: any, methodName: string | undefined, paramIndex: number) {
    const existing: Array<{ index: number; token: string }> = Reflect.getMetadata("inject", target) || [];
    existing.push({ index: paramIndex, token });
    Reflect.defineMetadata("inject", existing, target);
  };
}

class UserController {
  constructor(
    @Inject("UserService") private userService: UserService,
    @Inject("Logger") private logger: Logger,
  ) {}
}
```

---

## 6. Accessor Decorators

```typescript
function Validate(target: any, key: string, descriptor: PropertyDescriptor) {
  const originalSet = descriptor.set!;
  descriptor.set = function (value: any) {
    if (typeof value !== "string" || value.length === 0) {
      throw new Error(`${key} must be a non-empty string`);
    }
    originalSet.call(this, value);
  };
}

class User {
  private _name = "";

  @Validate
  set name(value: string) {
    this._name = value;
  }
  get name() {
    return this._name;
  }
}
```

---

## 7. Decorator Execution Order

```typescript
// Decorators execute bottom-up, inside-out
@A // 4th (class decorator — last)
class Example {
  @B // 1st (property)
  prop!: string;

  @C // 2nd (method — before parameter)
  method(@D param: string) {} // D runs before C

  @E // 3rd (method)
  other() {}
}

// Order: property → parameter → method → class
// Within same type: declaration order (top to bottom)
// Multiple on same target: bottom to top
```

---

## 8. Practical Patterns

### Simple DI Container

```typescript
const container = new Map<string, any>();

function Injectable(target: Function) {
  const params: Function[] = Reflect.getMetadata("design:paramtypes", target) || [];
  const instance = new (target as any)(...params.map((p) => container.get(p.name)));
  container.set(target.name, instance);
}

@Injectable
class Logger {
  info(msg: string) {
    console.log(`[INFO] ${msg}`);
  }
}

@Injectable
class UserService {
  constructor(private logger: Logger) {}
  create(name: string) {
    this.logger.info(`Creating user: ${name}`);
  }
}
```

### Route Decorators (Express-style)

```typescript
function Controller(prefix: string) {
  return function (target: Function) {
    Reflect.defineMetadata("prefix", prefix, target);
  };
}

function Get(path: string) {
  return function (target: any, key: string) {
    Reflect.defineMetadata("route", { method: "get", path }, target, key);
  };
}

function Post(path: string) {
  return function (target: any, key: string) {
    Reflect.defineMetadata("route", { method: "post", path }, target, key);
  };
}

@Controller("/users")
class UserController {
  @Get("/")
  getAll() {
    /* ... */
  }

  @Get("/:id")
  getById() {
    /* ... */
  }

  @Post("/")
  create() {
    /* ... */
  }
}
```

### Caching Decorator

```typescript
function Cache(ttlMs: number) {
  return function (target: any, key: string, descriptor: PropertyDescriptor) {
    const original = descriptor.value;
    const cache = new Map<string, { value: any; expiry: number }>();

    descriptor.value = async function (...args: any[]) {
      const cacheKey = JSON.stringify(args);
      const cached = cache.get(cacheKey);
      if (cached && cached.expiry > Date.now()) return cached.value;

      const result = await original.apply(this, args);
      cache.set(cacheKey, { value: result, expiry: Date.now() + ttlMs });
      return result;
    };
  };
}

class ProductService {
  @Cache(60_000) // 1 minute
  async getById(id: string): Promise<Product> {
    return db.products.findUnique({ where: { id } });
  }
}
```

---

## 9. TC39 Stage 3 Decorators (New Standard)

```typescript
// New syntax — no experimentalDecorators needed in TS 5.0+
function log<T extends (...args: any[]) => any>(originalMethod: T, context: ClassMethodDecoratorContext) {
  return function (this: any, ...args: any[]) {
    console.log(`Calling ${String(context.name)}`);
    return originalMethod.apply(this, args);
  };
}

class Example {
  @log
  greet(name: string) {
    return `Hello, ${name}`;
  }
}

// Key differences from legacy:
// - No need for experimentalDecorators
// - Different function signatures (context object)
// - No parameter decorators (yet)
// - No reflect-metadata by default
```

---

## 10. Best Practices

- **Use decorator factories** — always return a function, even without params, for consistency
- **Keep decorators focused** — one decorator = one concern
- **Don't hide critical logic** in decorators — keep business logic visible
- **Use `reflect-metadata`** for type-aware DI and schema generation
- **Document decorator behavior** — side effects aren't obvious from usage
- **Prefer TC39 decorators** for new projects (TS 5.0+)
- **Use legacy decorators** only for NestJS/Angular (they require them)
- **Test decorated methods** both with and without the decorator
- **Avoid excessive decorator stacking** — 3+ decorators on one target is hard to debug
- **Remember execution order** — bottom-up for multiple decorators on same target
