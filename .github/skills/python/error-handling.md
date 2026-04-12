---
name: python-error-handling
description: "Python error handling — try/except/else/finally, custom exceptions, exception chaining, context managers, logging errors, and defensive programming. Use when: implementing try/except; creating custom exceptions; exception chaining; context managers for cleanup; logging errors. DO NOT USE FOR: async error patterns (use python-async-programming); testing error scenarios (use python-testing)."
---

# Python Error Handling

## 1. try / except / else / finally

```python
try:
    result = perform_operation()
except ValueError as exc:
    # Handle specific exception
    logger.error("Invalid value: %s", exc)
    result = default_value
except (TypeError, KeyError) as exc:
    # Handle multiple exception types
    logger.error("Data error: %s", exc)
    raise
except Exception as exc:
    # Catch-all for unexpected errors (use sparingly)
    logger.exception("Unexpected error")
    raise
else:
    # Runs ONLY if no exception was raised
    save_result(result)
finally:
    # ALWAYS runs (cleanup)
    cleanup_resources()
```

### When to Use Each Block

| Block     | Purpose                                    |
| --------- | ------------------------------------------ |
| `try`     | Code that might raise an exception         |
| `except`  | Handle specific known error cases          |
| `else`    | Success path — runs only if no exception   |
| `finally` | Cleanup — always runs, even after `return` |

---

## 2. Exception Hierarchy

```
BaseException
├── SystemExit
├── KeyboardInterrupt
├── GeneratorExit
└── Exception
    ├── StopIteration
    ├── ArithmeticError
    │   ├── ZeroDivisionError
    │   └── OverflowError
    ├── LookupError
    │   ├── IndexError
    │   └── KeyError
    ├── AttributeError
    ├── OSError
    │   ├── FileNotFoundError
    │   ├── PermissionError
    │   └── ConnectionError
    ├── TypeError
    ├── ValueError
    └── RuntimeError
```

### Catch Rules

```python
# ✓ Catch specific exceptions
except FileNotFoundError:

# ✓ Catch a group of related exceptions
except (ValueError, TypeError):

# ✓ Catch Exception for unexpected cases (log and re-raise)
except Exception:
    logger.exception("Unexpected error")
    raise

# ✗ NEVER catch BaseException (swallows KeyboardInterrupt, SystemExit)
except BaseException:  # DON'T
    pass
```

---

## 3. Custom Exceptions

```python
class AppError(Exception):
    """Base exception for the application."""

    def __init__(self, message: str, code: str | None = None) -> None:
        super().__init__(message)
        self.code = code

class NotFoundError(AppError):
    """Resource not found."""

    def __init__(self, resource: str, resource_id: int | str) -> None:
        super().__init__(
            f"{resource} with id {resource_id} not found",
            code="NOT_FOUND",
        )
        self.resource = resource
        self.resource_id = resource_id

class ValidationError(AppError):
    """Input validation failed."""

    def __init__(self, field: str, message: str) -> None:
        super().__init__(f"Validation error on '{field}': {message}", code="VALIDATION")
        self.field = field

class AuthenticationError(AppError):
    """Authentication failed."""
    pass

# Usage
def get_user(user_id: int) -> User:
    user = db.query(User).get(user_id)
    if user is None:
        raise NotFoundError("User", user_id)
    return user
```

---

## 4. Exception Chaining

```python
# Implicit chaining — preserves original traceback
try:
    data = json.loads(raw_text)
except json.JSONDecodeError as exc:
    raise ValidationError("body", "Invalid JSON") from exc
    # Shows: "The above exception was the direct cause of..."

# Suppress original context
try:
    result = int(value)
except ValueError:
    raise AppError("Invalid number") from None
    # Hides the original ValueError

# Access the chain
try:
    process()
except AppError as exc:
    print(exc.__cause__)      # explicit cause (from exc)
    print(exc.__context__)    # implicit context
```

---

## 5. Context Managers for Cleanup

```python
# Using contextlib
from contextlib import contextmanager

@contextmanager
def managed_resource(name: str):
    """Acquire and release a resource safely."""
    resource = acquire(name)
    try:
        yield resource
    except Exception:
        resource.rollback()
        raise
    else:
        resource.commit()
    finally:
        resource.close()

# Usage
with managed_resource("db") as conn:
    conn.execute(query)

# Suppress specific exceptions
from contextlib import suppress

with suppress(FileNotFoundError):
    os.remove("temp.txt")  # no error if file doesn't exist

# Multiple context managers
with (
    open("input.txt") as infile,
    open("output.txt", "w") as outfile,
):
    outfile.write(infile.read())
```

---

## 6. Exception Groups (Python 3.11+)

```python
# Raise multiple exceptions at once
async def process_batch(items):
    errors = []
    results = []
    for item in items:
        try:
            results.append(await process(item))
        except Exception as exc:
            errors.append(exc)
    if errors:
        raise ExceptionGroup("Batch processing failed", errors)

# Catch with except*
try:
    await process_batch(items)
except* ValueError as eg:
    print(f"{len(eg.exceptions)} validation errors")
except* ConnectionError as eg:
    print(f"{len(eg.exceptions)} connection errors")
```

---

## 7. Logging Errors

```python
import logging

logger = logging.getLogger(__name__)

# Log with exception info
try:
    process_data()
except Exception:
    logger.exception("Failed to process data")  # includes traceback
    raise

# Log without re-raising
try:
    optional_operation()
except SomeError:
    logger.warning("Optional operation failed", exc_info=True)

# Structured logging context
try:
    process_order(order_id)
except AppError as exc:
    logger.error(
        "Order processing failed",
        extra={"order_id": order_id, "error_code": exc.code},
    )
    raise
```

---

## 8. Defensive Patterns

### LBYL vs EAFP

```python
# LBYL — Look Before You Leap (C-style)
if key in dictionary:
    value = dictionary[key]
else:
    value = default

# EAFP — Easier to Ask Forgiveness (Pythonic)
try:
    value = dictionary[key]
except KeyError:
    value = default

# Best: use dict.get()
value = dictionary.get(key, default)
```

### Guard Clauses

```python
def process_order(order: Order) -> Receipt:
    if order is None:
        raise ValueError("Order cannot be None")
    if not order.items:
        raise ValueError("Order has no items")
    if order.is_cancelled:
        raise OrderCancelledError(order.id)
    # Happy path at base indentation
    return calculate_receipt(order)
```

### Error Boundaries

```python
def api_handler(request):
    """Top-level error boundary for API requests."""
    try:
        return process_request(request)
    except NotFoundError as exc:
        return error_response(404, exc)
    except ValidationError as exc:
        return error_response(422, exc)
    except AuthenticationError as exc:
        return error_response(401, exc)
    except AppError as exc:
        return error_response(500, exc)
    except Exception:
        logger.exception("Unhandled error in API handler")
        return error_response(500, "Internal server error")
```

---

## 9. Anti-Patterns

```python
# ✗ Bare except
try:
    risky()
except:
    pass  # swallows KeyboardInterrupt, SystemExit!

# ✗ Catching too broadly
try:
    user = users[user_id]
    name = user.name.upper()
except Exception:  # hides bugs like AttributeError
    name = "unknown"

# ✓ Catch specifically
try:
    user = users[user_id]
except KeyError:
    name = "unknown"
else:
    name = user.name.upper()

# ✗ Using exceptions for control flow
try:
    value = int(input_str)
    is_number = True
except ValueError:
    is_number = False

# ✓ Use string methods or regex for validation
is_number = input_str.isdigit()

# ✗ Ignoring return value from finally
def bad_function():
    try:
        return 1
    finally:
        return 2  # silently overrides return value!

# ✗ Catching and re-raising without context
except SomeError:
    raise SomeOtherError("failed")  # lost original traceback!

# ✓ Chain exceptions
except SomeError as exc:
    raise SomeOtherError("failed") from exc
```
