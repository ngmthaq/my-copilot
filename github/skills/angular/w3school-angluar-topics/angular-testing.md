# Angular Testing

> Source: https://www.w3schools.com/angular/angular_testing.asp

# Angular Testing

Testing verifies components and services with lightweight setups.

## Testing Essentials

- **Component & services**: Test with DOM-style checks and lightweight setups (no NgModules needed).
- **TestBed (lite)**: Create components with their providers efficiently.
- **Pure logic**: Keep logic in pure functions for easy testing.
- **Mocks**: Mock HTTP and the router as needed.

```typescript
// Disable animations in tests for stability
import { provideNoopAnimations } from "@angular/platform-browser/animations";

bootstrapApplication(App, { providers: [provideNoopAnimations()] });
```

## Component Smoke Test

```typescript
@Component({ standalone: true, template: `<p>{{ add(2, 3) }}</p>` })
class App {
  add(a: number, b: number) {
    return a + b;
  }
}
```

### Example

```typescript
import { bootstrapApplication } from "@angular/platform-browser";
import { Component } from "@angular/core";

function add(a: number, b: number) {
  return a + b;
}

@Component({
  selector: "app-root",
  standalone: true,
  template: `
    <h3>Testing Smoke</h3>
    <p>2 + 3 = {{ add(2, 3) }} (expect 5)</p>
  `,
})
class App {
  add = add;
}

bootstrapApplication(App);
```

### Example explained

- **Interpolation {{ expression }}**: Angular evaluates the expression against the component and inserts the result as text in the DOM.
- **"expect 5"**: The phrase in the template is explanatory text for the reader, not a test assertion.
- **Real assertions**: In unit tests, use `expect(actual).toBe(expected)` (or `toEqual(expected)`) to verify results.

**Tips:**

- Disable animations in tests with `provideNoopAnimations()` for stable timing.
- Drive the DOM via component state; avoid manual DOM calls.
- Trigger change detection only when needed (e.g., after updating inputs).

## Test Strategies

- Unit test pure functions directly for fast feedback.
- Use shallow component tests for template behavior.
- Add integration tests where behavior spans components.

### Async testing example

```typescript
import { fakeAsync, tick } from "@angular/core/testing";

it("waits for async work", fakeAsync(() => {
  let done = false;
  setTimeout(() => (done = true), 10);
  tick(10);
  expect(done).toBeTrue();
}));
```

### Example explained

- **expect(actual)**: Creates an assertion with the actual value under test. Use `toBe(expected)` for strict equality (===), `toEqual(expected)` for deep structural equality, and `toBeTrue()`/`toBeFalse()` for boolean checks.
- **fakeAsync(testFn)**: Runs testFn in a fake async zone so time can be advanced deterministically.
- **tick(ms)**: Advances the virtual clock by ms milliseconds to flush pending timers and microtasks.
- **Alternatives**: `waitForAsync(testFn)` completes the test after pending async work; `whenStable()` resolves when no tasks remain.

### HTTP testing (conceptual)

```typescript
// HTTP testing (conceptual)
import { TestBed } from "@angular/core/testing";
import { HttpClient } from "@angular/common/http";
import {
  HttpClientTestingModule,
  HttpTestingController,
} from "@angular/common/http/testing";

TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
const http = TestBed.inject(HttpClient);
const httpMock = TestBed.inject(HttpTestingController);

http.get("/api/todos/1").subscribe((data) => expect(data).toBeTruthy());
httpMock.expectOne("/api/todos/1").flush({ id: 1, title: "Test" });
httpMock.verify();
```

**Guidelines:**

- HTTP: Use `HttpClientTestingModule` and `HttpTestingController` to mock requests.
- Router: Use the router testing utilities to avoid real navigation.
- Async: Use `fakeAsync`/`tick` or `waitForAsync`/`whenStable` instead of timers.
- Queries: Use stable selectors and role/text queries over brittle CSS when possible.
