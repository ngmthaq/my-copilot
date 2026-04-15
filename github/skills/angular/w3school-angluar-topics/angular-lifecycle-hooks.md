# Angular Lifecycle Hooks

> Source: https://www.w3schools.com/angular/angular_lifecycle.asp

# Angular Lifecycle Hooks

## Lifecycle Essentials

Lifecycle hooks are methods Angular calls at key moments (init, input changes, view init, destroy).

**Key practices:**

- **Setup**: Use `ngOnInit` after inputs are set.
- **React**: Handle input changes in `ngOnChanges`.
- **DOM ready**: Use `ngAfterViewInit` to access `@ViewChild` refs.
- **Cleanup**: Release timers/subscriptions/listeners in `ngOnDestroy`.

```typescript
import {
  OnInit,
  OnDestroy,
  AfterViewInit,
  ViewChild,
  ElementRef,
} from "@angular/core";

export class Demo implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild("box") box!: ElementRef<HTMLInputElement>;
  intervalId: any;
  ngOnInit() {
    /* setup after inputs */
  }
  ngAfterViewInit() {
    this.box.nativeElement.focus();
  }
  ngOnDestroy() {
    clearInterval(this.intervalId);
  }
}
```

### Example explained

- `ngOnInit`: Run setup that needs inputs already bound.
- `@ViewChild` + `ngAfterViewInit`: Access and focus the input only after the view is initialized.
- `ngOnDestroy`: Clean up timers/listeners to prevent leaks.

## Lifecycle Hooks

**Toggle lifecycle**: Showing a component (e.g., with `*ngIf`) runs `ngOnInit`; hiding it runs `ngOnDestroy`.

**Do/undo work**: Start timers/subscriptions on init, clear/unsubscribe on destroy.

```typescript
export class Child implements OnInit, OnDestroy {
  intervalId: any;
  ngOnInit() {
    this.intervalId = setInterval(() => {
      /* ... */
    }, 1000);
  }
  ngOnDestroy() {
    clearInterval(this.intervalId);
  }
}
```

## OnChanges with @Input

- `@Input()`: The child declares an input `text` that parents can bind to.
- `ngOnChanges(changes)`: Receives `SimpleChanges` with `previousValue` and `currentValue` for each changed input.
- **Immutable updates**: Prefer replacing references over mutating in place to trigger change detection.

**Notes:**

- **Immutable inputs**: Replace arrays/objects instead of mutating to ensure `OnChanges` runs.
- **With OnPush**: Input reference changes trigger checks; in-place mutation may not emit new references from parents.
- **Inspect changes**: Use `SimpleChanges` to handle edge cases (e.g., undefined → value).

## AfterViewInit with ViewChild

```typescript
@ViewChild('box') box!: ElementRef<HTMLInputElement>;
ngAfterViewInit() { this.box.nativeElement.focus(); }
```

- **Don't use DOM in constructor**: The view isn't ready; do DOM operations after `ngAfterViewInit`.
- **Reading too early**: `@ViewChild` is `undefined` before `ngAfterViewInit`—check for existence or defer work.

## AfterViewInit & Cleanup

Access template refs after the view initializes and clean up resources when the component is destroyed.

```typescript
// Example teardown pattern
sub?.unsubscribe?.();
clearInterval(intervalId);
removeListener?.();
```

**Notes:**

- **Focus and measure safely**: Run DOM reads/writes after `ngAfterViewInit` (or inside `setTimeout` to let the view settle).
- **Observers & listeners**: Disconnect `ResizeObserver`/`MutationObserver` and remove manual event listeners in `ngOnDestroy`.
- **Subscriptions**: Use the `async` pipe; if you subscribe manually, unsubscribe on destroy (e.g., `takeUntilDestroyed`).
- **Cleanup required**: Clear intervals/timeouts and unsubscribe in `ngOnDestroy`; Use the `async` pipe when possible.
