# Angular HTTP Client

> Source: https://www.w3schools.com/angular/angular_http.asp

# Angular HttpClient

## HTTP Essentials

Key concepts for using HttpClient in Angular:

- **Client**: Use `HttpClient` to fetch and send JSON data
- **Observables**: HTTP methods return Observables; use `subscribe()` or the `async` pipe
- **UX**: Show loading states and clear error messages
- **Provide once**: Register `provideHttpClient()` at bootstrap

```typescript
import { provideHttpClient, HttpClient } from "@angular/common/http";

// Bootstrap
// bootstrapApplication(App, { providers: [provideHttpClient()] });

// Use in a component
// http.get<User[]>('/api/users').subscribe({ next: d => users = d });
```

## GET Requests

Read data with `http.get<T>()`. Track `loading` and `error` state for better UX.

```typescript
loading = true;
error = "";
http.get<User[]>("/api/users").subscribe({
  next: (d) => {
    users = d;
    loading = false;
  },
  error: () => {
    error = "Failed to load";
    loading = false;
  },
});
```

### Example

```typescript
import { bootstrapApplication } from "@angular/platform-browser";
import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { provideHttpClient, HttpClient } from "@angular/common/http";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [CommonModule],
  template: `
    <h3>HttpClient</h3>
    <button (click)="load()">Load Users</button>
    <p *ngIf="loading">Loading...</p>
    <p *ngIf="error" style="color:crimson">{{ error }}</p>
    <ul>
      <li *ngFor="let u of users">{{ u.name }} ({{ u.email }})</li>
    </ul>
  `,
})
export class App {
  http = inject(HttpClient);
  users: any[] = [];
  loading = false;
  error = "";

  load() {
    this.loading = true;
    this.error = "";
    this.http
      .get<any[]>("https://jsonplaceholder.typicode.com/users")
      .subscribe({
        next: (data) => {
          this.users = data;
          this.loading = false;
        },
        error: () => {
          this.error = "Failed to load users";
          this.loading = false;
        },
      });
  }
}

bootstrapApplication(App, { providers: [provideHttpClient()] });
```

## POST Requests

Create data with `http.post<T>()`. Disable the button while sending to prevent duplicates.

```typescript
http.post<Post>("/api/posts", { title, body }).subscribe({
  next: (r) => {
    result = r;
    loading = false;
  },
  error: () => {
    error = "Failed to create";
    loading = false;
  },
});
```

### Example

```typescript
import { bootstrapApplication } from "@angular/platform-browser";
import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { provideHttpClient, HttpClient } from "@angular/common/http";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [CommonModule],
  template: `
    <h3>HttpClient POST</h3>
    <button (click)="createPost()" [disabled]="loading">Create Post</button>
    <p *ngIf="loading">Sending...</p>
    <p *ngIf="error" style="color:crimson">{{ error }}</p>
    <div *ngIf="result">
      <p>Created Post ID: {{ result.id }}</p>
      <p>Title: {{ result.title }}</p>
    </div>
  `,
})
export class App {
  http = inject(HttpClient);
  loading = false;
  error = "";
  result: any = null;

  createPost() {
    this.loading = true;
    this.error = "";
    this.result = null;
    this.http
      .post<any>("https://jsonplaceholder.typicode.com/posts", {
        title: "foo",
        body: "bar",
        userId: 1,
      })
      .subscribe({
        next: (res) => {
          this.result = res;
          this.loading = false;
        },
        error: () => {
          this.error = "Failed to create post";
          this.loading = false;
        },
      });
  }
}

bootstrapApplication(App, { providers: [provideHttpClient()] });
```

## Error Handling

Always show a helpful message and allow retry.

```typescript
error = "";
loading = true;
http.get("/api/data").subscribe({
  next: (r) => {
    data = r;
    loading = false;
  },
  error: (err) => {
    error = `Request failed (status ${err?.status ?? "unknown"})`;
    loading = false;
  },
});
```

## HTTP Interceptors

Run cross-cutting logic on every request/response (e.g., auth headers, logging). Register once at bootstrap with `provideHttpClient(...)`.

```typescript
import {
  HttpInterceptorFn,
  provideHttpClient,
  withInterceptors,
} from "@angular/common/http";

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const cloned = req.clone({
    setHeaders: { Authorization: "Bearer TOKEN" },
  });
  return next(cloned);
};

bootstrapApplication(App, {
  providers: [provideHttpClient(withInterceptors([authInterceptor]))],
});
```
