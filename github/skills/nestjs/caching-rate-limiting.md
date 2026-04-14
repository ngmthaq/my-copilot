---
name: nestjs-caching-rate-limiting
description: "NestJS caching and rate limiting - CacheModule, Redis-backed caching, cache key strategies, cache invalidation, and throttling guards. Use when: improving API performance and protecting endpoints from abuse. DO NOT USE FOR: authentication strategy internals or persistence schema design."
---

# NestJS Caching and Rate Limiting

## 1. CacheModule Setup

```typescript
@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: () => ({
        ttl: 30_000,
        max: 10_000,
      }),
    }),
  ],
})
export class AppModule {}
```

- Use global cache only when most modules benefit.
- Prefer explicit cache keys for stability.

## 2. Cache Interceptor on Read Endpoints

```typescript
@Controller("products")
@UseInterceptors(CacheInterceptor)
export class ProductsController {
  @Get(":id")
  @CacheTTL(120)
  @CacheKey("product:detail")
  getById(@Param("id") id: string) {
    return this.productsService.getById(id);
  }
}
```

- Cache only idempotent read endpoints.
- Avoid caching user-specific data with shared keys.

## 3. Programmatic Cache Access

```typescript
@Injectable()
export class ProductsService {
  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

  async getById(id: string) {
    const key = `product:${id}`;
    const cached = await this.cache.get<ProductDto>(key);
    if (cached) return cached;

    const product = await this.productsRepository.findById(id);
    await this.cache.set(key, product, 60_000);
    return product;
  }

  async update(id: string, patch: UpdateProductDto) {
    const updated = await this.productsRepository.update(id, patch);
    await this.cache.del(`product:${id}`);
    return updated;
  }
}
```

- Invalidate write-related keys immediately after mutation.

## 4. Redis Store

```typescript
CacheModule.registerAsync({
  isGlobal: true,
  useFactory: async () => ({
    store: await redisStore({
      socket: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
      },
    }),
    ttl: 60,
  }),
});
```

- Use Redis for multi-instance deployments.
- Keep cache TTLs short for volatile data.

## 5. Rate Limiting with Throttler

```typescript
@Module({
  imports: [ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }])],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
```

```typescript
@Controller("auth")
export class AuthController {
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  @Post("login")
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}
```

- Apply tighter throttles to login, OTP, and reset endpoints.

## 6. Anti-Patterns

- Caching mutable resources without invalidation.
- Global throttling that blocks internal service traffic.
- Shared cache keys that leak tenant/user data.
- Extremely long TTL for business-critical data.
