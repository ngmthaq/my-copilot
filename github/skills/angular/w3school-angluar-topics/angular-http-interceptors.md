# Angular HTTP Interceptors

> Source: https://www.w3schools.com/angular/angular_http_interceptors.asp

# Angular HTTP Interceptors

## HTTP Interceptors Essentials

HTTP interceptors are functions in the HttpClient pipeline that enable you to inspect or transform requests and responses globally. They run for every request/response and are commonly used for:

- Adding authentication headers
- Handling errors
- Retrying failed requests
- Logging HTTP activity

Basic implementation:

```typescript
import { provideHttpClient, withInterceptors } from "@angular/common/http";

const authInterceptor = (req, next) => {
  const cloned = req.clone({ setHeaders: { Authorization: "Bearer token" } });
  return next(cloned);
};

bootstrapApplication(App, {
  providers: [provideHttpClient(withInterceptors([authInterceptor]))],
});
```

## Writing an Interceptor

A basic logging interceptor:

```typescript
const logInterceptor = (req, next) => {
  console.log(req.method, req.url);
  return next(req);
};

provideHttpClient(withInterceptors([logInterceptor]));
```

For typed interceptors:

```typescript
import { HttpInterceptorFn } from "@angular/common/http";

const typedInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req.clone({ setHeaders: { "X-Trace": "demo" } }));
};

provideHttpClient(withInterceptors([typedInterceptor]));
```

### Complete Example

```typescript
import { bootstrapApplication } from "@angular/platform-browser";
import { Component, inject } from "@angular/core";
import {
  HttpClient,
  provideHttpClient,
  withInterceptors,
  HttpResponse,
  HttpRequest,
  HttpHandlerFn,
} from "@angular/common/http";
import { of } from "rxjs";
import { JsonPipe } from "@angular/common";

const logInterceptor = (req: HttpRequest<any>, next: HttpHandlerFn) => {
  console.log("Request", req.method, req.url);
  return next(req);
};

const mockInterceptor = (req: HttpRequest<any>, next: HttpHandlerFn) => {
  if (
    req.method === "GET" &&
    req.url.includes("jsonplaceholder.typicode.com/todos/1")
  ) {
    const body = { id: 1, title: "Mocked todo", completed: false };
    return of(new HttpResponse({ status: 200, body }));
  }
  return next(req);
};

@Component({
  selector: "app-root",
  standalone: true,
  imports: [JsonPipe],
  template: `
    <h3>HTTP Interceptor</h3>
    <button (click)="load()">Load</button>
    <pre>{{ data | json }}</pre>
  `,
})
class App {
  #http = inject(HttpClient);
  data: any;
  load() {
    this.#http
      .get("https://jsonplaceholder.typicode.com/todos/1")
      .subscribe((r) => (this.data = r));
  }
}

bootstrapApplication(App, {
  providers: [
    provideHttpClient(withInterceptors([mockInterceptor, logInterceptor])),
  ],
});
```

**Important Notes:**

- Requests flow in the order provided; responses unwind in reverse
- Use `req.clone({...})` to modify HttpRequest (immutable)
- Compose focused interceptors with single responsibilities using `withInterceptors([...])`

## Error Handling and Retries

Centralize HTTP error handling within an interceptor to keep components simpler:

```typescript
import { catchError } from "rxjs/operators";
import { throwError } from "rxjs";

const errorInterceptor = (req, next) =>
  next(req).pipe(
    catchError((err) => {
      // map/log/notify
      return throwError(() => err);
    }),
  );

provideHttpClient(withInterceptors([errorInterceptor]));
```

**Guidelines:**

- Use `catchError` in the interceptor to map errors to user-friendly messages
- Retry idempotent requests with `retry` or backoff using `retryWhen`; avoid retrying 4xx errors
- Handle authentication (401) by refreshing tokens or redirecting; keep this logic centralized

## Ordering & Composition

```typescript
const auth = (req, next) =>
  next(req.clone({ setHeaders: { Authorization: "..." } }));
const log = (req, next) => {
  console.log(req.url);
  return next(req);
};

// Request order: auth -> log
// Response order: log -> auth
provideHttpClient(withInterceptors([auth, log]));
```

**Best Practices:**

- Requests flow through interceptors in provided order; responses unwind in reverse
- Keep interceptors focused (auth, logging, error handling)
- Avoid storing mutable state; use pure functions and injected services
- Retry only idempotent methods (GET/HEAD); consider idempotency keys for non-idempotent operations
