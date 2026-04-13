---
name: dart-error-handling
description: "Dart error handling — try/catch/on/finally, Exception vs Error hierarchy, custom exceptions, propagation, async error handling in Futures and Streams, Result pattern, and Zone-based global error catching. Use when: catching or throwing exceptions; defining custom error types; handling async errors; building robust error propagation strategies. DO NOT USE FOR: general async patterns (use dart-async-await); stream error handling only (use dart-streams)."
---

# Dart Error Handling

## 1. Exception vs Error

Dart has two distinct hierarchies:

| Base Type   | When to use                                             | Examples                                                      |
| ----------- | ------------------------------------------------------- | ------------------------------------------------------------- |
| `Exception` | Expected failure conditions the caller can recover from | `FormatException`, `IOException`, custom domain exceptions    |
| `Error`     | Programming mistakes — bugs that should NOT be caught   | `ArgumentError`, `StateError`, `RangeError`, `AssertionError` |

```dart
// ✅ Throw Exception for recoverable domain failures
throw FormatException('Invalid email format');
throw HttpException('Service unavailable');

// ✅ Throw Error (or subclass) for programming bugs
throw ArgumentError.notNull('userId');
throw StateError('Cannot call close() twice');
throw RangeError.range(index, 0, length - 1, 'index');

// ✅ Throw custom exceptions for domain-specific failures (see section 3)
throw UserNotFoundException(userId);
```

---

## 2. `try` / `catch` / `on` / `finally`

```dart
// Catch any object with catch
try {
  final result = int.parse(input);
  print(result);
} catch (e) {
  print('Error: $e');
}

// Catch with stack trace
try {
  await fetchData();
} catch (e, stackTrace) {
  print('Error: $e');
  print('Stack: $stackTrace');
}

// on — catch a specific type
try {
  final n = int.parse(userInput);
} on FormatException catch (e) {
  print('Not a number: ${e.message}');
} on RangeError catch (e) {
  print('Out of range: $e');
} catch (e, st) {
  // catch-all — for truly unexpected errors
  print('Unexpected: $e\n$st');
  rethrow; // ✅ rethrow instead of re-creating the exception
} finally {
  cleanup(); // always runs, even if an exception was thrown
}
```

### `rethrow` vs `throw`

```dart
// ✅ rethrow — preserves original stack trace
try {
  await dangerousOp();
} catch (e) {
  logger.error('Failed', e);
  rethrow; // same exception + original stack trace
}

// ❌ throw e — creates a new stack frame — loses original trace
try {
  await dangerousOp();
} catch (e) {
  throw e; // ← new stack trace starting here
}
```

---

## 3. Custom Exceptions

```dart
// Base application exception
class AppException implements Exception {
  final String message;
  final String code;
  final Object? cause;

  const AppException(this.message, {required this.code, this.cause});

  @override
  String toString() => 'AppException[$code]: $message';
}

// Domain exceptions
class NotFoundException extends AppException {
  final String resource;
  final String id;

  NotFoundException(this.resource, this.id)
      : super('$resource with id "$id" not found', code: 'NOT_FOUND');
}

class ValidationException extends AppException {
  final Map<String, List<String>> errors;

  ValidationException(this.errors)
      : super('Validation failed', code: 'VALIDATION_ERROR');

  @override
  String toString() =>
      'ValidationException: ${errors.entries.map((e) => '${e.key}: ${e.value.join(", ")}').join("; ")}';
}

class UnauthorizedException extends AppException {
  UnauthorizedException([String message = 'Unauthorized'])
      : super(message, code: 'UNAUTHORIZED');
}

class ConflictException extends AppException {
  ConflictException(String message)
      : super(message, code: 'CONFLICT');
}

// Usage
try {
  final user = await userRepo.findById(userId);
  if (user == null) throw NotFoundException('User', userId);
} on NotFoundException catch (e) {
  print(e); // AppException[NOT_FOUND]: User with id "123" not found
}
```

---

## 4. Error Propagation Patterns

### Propagate up the call stack

```dart
// Service calls repo — repo throws, service lets it propagate
class UserService {
  Future<User> getUser(String id) async {
    // No try/catch — NotFoundException propagates to caller
    return await _repo.findById(id)
        ?? (throw NotFoundException('User', id));
  }
}

// Controller catches and responds
class UserController {
  Future<void> getUser(String id) async {
    try {
      final user = await _service.getUser(id);
      respond(200, user.toJson());
    } on NotFoundException catch (e) {
      respond(404, {'error': e.message});
    } on AppException catch (e) {
      respond(400, {'error': e.message, 'code': e.code});
    } catch (e, st) {
      logger.error('Unhandled', e, st);
      respond(500, {'error': 'Internal error'});
    }
  }
}
```

### Wrap and re-throw with context

```dart
Future<List<User>> listUsers() async {
  try {
    return await _db.query('SELECT * FROM users');
  } on DatabaseException catch (e) {
    throw AppException(
      'Failed to list users',
      code: 'DB_ERROR',
      cause: e,
    );
  }
}
```

---

## 5. Async Error Handling

```dart
// async/await — use try/catch normally
Future<void> run() async {
  try {
    final data = await fetch();
    await process(data);
  } on NetworkException catch (e) {
    print('Network error: $e');
  } catch (e, st) {
    print('Unexpected: $e');
    rethrow;
  }
}

// Future chain — .catchError()
fetchData()
    .then(processData)
    .catchError(
      (Object e) => handleNetworkError(e),
      test: (e) => e is NetworkException,
    )
    .catchError((Object e) => handleGenericError(e));

// ✅ Prefer async/await over then/catchError for complex logic

// Handling errors in Future.wait — partial failures
final results = await Future.wait(
  [fetchA(), fetchB(), fetchC()],
  eagerError: false, // wait for all, even if some fail
);
// Results contains completed values; errors must be tracked separately

// ✅ Use a helper to collect results without throwing
Future<List<Object?>> waitTolerant(List<Future<Object?>> futures) {
  return Future.wait(
    futures.map((f) => f.catchError((e) => e as Object?)),
  );
}
```

---

## 6. Result Pattern (No Exceptions)

Prefer `Result<T, E>` when callers must always handle both success and failure:

```dart
sealed class Result<T> {
  const Result();
}

final class Ok<T> extends Result<T> {
  final T value;
  const Ok(this.value);
}

final class Err<T> extends Result<T> {
  final Object error;
  final StackTrace? stackTrace;
  const Err(this.error, [this.stackTrace]);
}

// Helper constructors
Result<T> ok<T>(T value) => Ok(value);
Result<T> err<T>(Object error, [StackTrace? st]) => Err(error, st);

// Usage in a service
Future<Result<User>> findUser(String id) async {
  try {
    final user = await _repo.findById(id);
    return user != null ? ok(user) : err(NotFoundException('User', id));
  } catch (e, st) {
    return err(e, st);
  }
}

// Caller exhaustively handles both cases (Dart 3 pattern matching)
final result = await findUser(id);
switch (result) {
  case Ok(:final value):
    print('Found: ${value.name}');
  case Err(:final error):
    print('Error: $error');
}
```

---

## 7. Zone-Based Global Error Handling

```dart
import 'dart:async';

void main() {
  runZonedGuarded(
    () async {
      // All unhandled async errors in this zone are caught below
      await myApp();
    },
    (Object error, StackTrace stack) {
      // Global fallback handler
      print('🔥 Unhandled error: $error');
      print(stack);
      // Log to monitoring service
    },
  );
}
```

---

## 8. Common Built-in Errors & Exceptions

| Type                      | When thrown                                               |
| ------------------------- | --------------------------------------------------------- |
| `ArgumentError`           | Argument has an invalid value                             |
| `RangeError`              | Value is outside of an allowed range                      |
| `StateError`              | Object is in an invalid state for the requested operation |
| `UnsupportedError`        | Operation is not supported                                |
| `UnimplementedError`      | Method/feature is not yet implemented                     |
| `TypeError`               | Type cast fails at runtime                                |
| `FormatException`         | String cannot be parsed into the expected format          |
| `IOException`             | I/O operation fails (file, network)                       |
| `AssertionError`          | `assert()` condition evaluates to `false` in debug mode   |
| `LateInitializationError` | `late` field accessed before being assigned               |
| `NullThrownError`         | `null` was thrown as an exception                         |
| `StackOverflowError`      | Stack overflow due to deep recursion                      |
| `OutOfMemoryError`        | Memory allocation failed                                  |

---

## Anti-Patterns

```dart
// ❌ Catching Error — errors are bugs, not recoverable conditions
try {
  doSomething();
} on Error catch (e) {
  // silently swallows programming bugs
}

// ✅ Only catch Exception (recoverable); let Error crash
try {
  doSomething();
} on AppException catch (e) {
  handleGracefully(e);
}

// ❌ Swallowing exceptions silently
try {
  await riskyOp();
} catch (_) {} // ← loss of observability

// ✅ At minimum, log before swallowing
try {
  await riskyOp();
} catch (e, st) {
  logger.warning('Non-critical failure, continuing', e, st);
}

// ❌ throw e — loses original stack trace
catch (e) { throw e; }
// ✅ rethrow — preserves it
catch (e) { rethrow; }

// ❌ Throwing strings
throw 'something went wrong'; // untyped, hard to catch
// ✅ Always throw typed exceptions
throw AppException('Something went wrong', code: 'UNKNOWN');

// ❌ Using on Error to catch RangeError / ArgumentError —
// these indicate bugs and should propagate
// ✅ Fix the bug; if truly expected, validate before the operation
if (index < 0 || index >= list.length) {
  throw RangeError.range(index, 0, list.length - 1, 'index');
}
```
