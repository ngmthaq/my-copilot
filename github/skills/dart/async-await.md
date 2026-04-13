---
name: dart-async-await
description: "Dart async/await — Future, async functions, await, then/catchError/whenComplete, Future.wait/any/delayed, Completer, the Dart event loop and microtask queue, and Isolates for parallelism. Use when: writing asynchronous code; handling API calls; running operations concurrently; computing in background Isolates. DO NOT USE FOR: Streams (use dart-streams); error handling strategies (use dart-error-handling)."
---

# Dart Async / Await

## 1. Future Basics

`Future<T>` represents a value (or error) available at some point in the future. It has three states: uncompleted, completed with a value, or completed with an error.

```dart
// A Future that completes with a String
Future<String> fetchName() async {
  await Future.delayed(Duration(seconds: 1));
  return 'Alice';
}

// A Future that may fail
Future<int> divide(int a, int b) async {
  if (b == 0) throw ArgumentError('Cannot divide by zero');
  return a ~/ b;
}
```

---

## 2. `async` / `await`

Mark a function `async` to use `await` inside it. The return type is automatically wrapped in `Future<T>`.

```dart
Future<void> loadData() async {
  print('Fetching...');
  final name = await fetchName();   // suspends until resolved
  print('Got: $name');
  print('Done');
}

// Dart infers the return type
Future<String> greet() async {
  final name = await fetchName();
  return 'Hello, $name!';           // return type is Future<String>
}

// void main can be async
void main() async {
  await loadData();
  print(await greet());
}
```

### Execution Order

```dart
void main() async {
  print('1 - start');
  final result = await Future.delayed(
    Duration(milliseconds: 100),
    () => 'done',
  );
  print('2 - $result');   // runs after 100ms
  print('3 - end');
}
// Output: 1 → 2 → 3 (sequential)
```

---

## 3. Error Handling in Async Code

```dart
// try/catch works with await
Future<void> run() async {
  try {
    final result = await divide(10, 0);
    print(result);
  } on ArgumentError catch (e) {
    print('Argument error: $e');
  } catch (e, stackTrace) {
    print('Unexpected: $e\n$stackTrace');
  } finally {
    print('Cleanup');
  }
}

// .then() / .catchError() — callback style (less preferred)
fetchName()
    .then((name) => print('Got: $name'))
    .catchError((Object e) => print('Error: $e'))
    .whenComplete(() => print('Done'));

// ✅ Prefer async/await over .then() for readability
```

---

## 4. Running Futures Concurrently

### `Future.wait` — run all, wait for all

```dart
Future<void> loadAll() async {
  // ✅ Started concurrently — faster than sequential await
  final results = await Future.wait([
    fetchUserProfile(userId),
    fetchUserPosts(userId),
    fetchUserSettings(userId),
  ]);

  final [profile, posts, settings] = results; // destructure (Dart 3)
  print('Profile: $profile, Posts: $posts, Settings: $settings');
}

// With error handling — if any future fails, Future.wait fails
// Use eagerError: false to wait for ALL to complete (some may fail)
Future.wait(futures, eagerError: false);
```

### `Future.any` — first to complete wins

```dart
// Returns the first future that completes (success or error)
final result = await Future.any([
  fetchFromPrimary(),
  Future.delayed(Duration(seconds: 5), fetchFromFallback),
]);
```

### `Future.delayed` — time-delayed value

```dart
await Future.delayed(Duration(seconds: 2));            // pause
final value = await Future.delayed(Duration(seconds: 1), () => 42);
```

### `Future.microtask` & `Future.value`

```dart
// Completes in the next microtask (higher priority than event queue)
await Future.microtask(() => compute());

// Immediately completed future
final f = Future.value(42); // Future<int> that is already done

// Immediately failed future
final failed = Future.error(Exception('oops'));
```

---

## 5. Sequential vs Concurrent `await`

```dart
// ❌ Sequential — total time = sum of all durations
Future<void> sequential() async {
  final a = await stepA(); // wait for A
  final b = await stepB(); // then wait for B
  final c = await stepC(); // then wait for C
  process(a, b, c);
}

// ✅ Concurrent — total time = max of all durations
Future<void> concurrent() async {
  final [a, b, c] = await Future.wait([stepA(), stepB(), stepC()]);
  process(a, b, c);
}

// ⚠️ Don't start futures inside Future.wait — start them before
// ❌ This starts them one by one
await Future.wait([await stepA(), await stepB()]); // wrong

// ✅ Start them, then wait
final fa = stepA();
final fb = stepB();
await Future.wait([fa, fb]);
```

---

## 6. Completer — manual Future control

```dart
import 'dart:async';

// Create a Future you control manually
class DataLoader {
  final _completer = Completer<String>();

  Future<String> get result => _completer.future;

  void onDataReceived(String data) {
    if (!_completer.isCompleted) {
      _completer.complete(data);        // resolve
    }
  }

  void onError(Object error) {
    if (!_completer.isCompleted) {
      _completer.completeError(error);  // reject
    }
  }
}

// Usage
final loader = DataLoader();
loader.result.then(print);
loader.onDataReceived('Hello!'); // prints Hello!
```

---

## 7. The Dart Event Loop

Dart is single-threaded with a two-queue event system:

```
┌────────────────────────────────┐
│         Dart Isolate           │
│                                │
│  ┌──────────────────────────┐  │
│  │   Microtask Queue (FIFO) │  │  ← scheduleMicrotask(), Future.microtask()
│  └──────────────────────────┘  │    runs BEFORE next event
│  ┌──────────────────────────┐  │
│  │    Event Queue (FIFO)    │  │  ← I/O, timers, user events, Future.value()
│  └──────────────────────────┘  │    processed one at a time
└────────────────────────────────┘
```

```dart
import 'dart:async';

void main() {
  print('1');
  Future.microtask(() => print('2 - microtask'));
  Future.value(null).then((_) => print('3 - then (microtask)'));
  Future.delayed(Duration.zero, () => print('4 - delayed (event)'));
  scheduleMicrotask(() => print('5 - scheduleMicrotask'));
  print('6');
}
// Output: 1, 6, 2, 5, 3, 4
// Microtasks drain completely before next event is processed
```

---

## 8. Isolates (True Parallelism)

Dart Isolates are independent workers with their own heap — they communicate via message passing. Use for CPU-intensive tasks.

```dart
import 'dart:isolate';

// Simple isolate spawn
void heavyTask(SendPort sendPort) {
  // This runs in a separate isolate
  int result = 0;
  for (int i = 0; i < 1000000000; i++) result += i;
  sendPort.send(result);
}

Future<void> main() async {
  final receivePort = ReceivePort();
  await Isolate.spawn(heavyTask, receivePort.sendPort);
  final result = await receivePort.first;
  print('Result: $result');
  receivePort.close();
}

// ✅ Simpler: Isolate.run (Dart 2.19+) — compute helper
import 'dart:isolate';

Future<void> simpleIsolate() async {
  // Runs the closure in a new isolate and returns the result
  final result = await Isolate.run(() {
    int sum = 0;
    for (int i = 0; i < 1000000000; i++) sum += i;
    return sum;
  });
  print('Sum: $result');
}
```

### What can be passed between Isolates

| Allowed                          | Not Allowed                   |
| -------------------------------- | ----------------------------- |
| Primitives (int, double, String) | Closures                      |
| Null                             | Class instances (generally)   |
| `bool`                           | SendPort copies (use spawn)   |
| `List`, `Map` of primitives      | Database connections, sockets |
| `TransferableTypedData`          |                               |
| `SendPort`, `Capability`         |                               |

---

## 9. unawaited & Ignoring Futures

```dart
import 'package:meta/meta.dart'; // for @unawaited annotation

// Explicitly fire-and-forget — suppresses linter warnings
unawaited(sendAnalyticsEvent('login'));  // from 'dart:async' since Dart 3

// ❌ Ignoring a Future silently — linter will warn
fireAndForget(); // if fireAndForget returns Future — may miss errors

// ✅ Explicitly ignore with unawaited
unawaited(fireAndForget());
```

---

## Anti-Patterns

```dart
// ❌ Blocking the event loop with synchronous heavy work
int compute() {
  int sum = 0;
  for (int i = 0; i < 1_000_000_000; i++) sum += i;
  return sum; // blocks UI / other events
}
// ✅ Use Isolate.run for CPU-heavy code
final result = await Isolate.run(compute);

// ❌ await inside Future.wait argument list
await Future.wait([await fetchA(), await fetchB()]); // sequential!
// ✅ Start futures first
final [a, b] = await Future.wait([fetchA(), fetchB()]);

// ❌ Not awaiting an async function
Future<void> save() async { ... }
save(); // fire-and-forget — errors are silently swallowed
// ✅ await it or explicitly unawaited()
await save();

// ❌ Using then() chains with complex logic — hard to read
future.then((a) => step2(a)).then((b) => step3(b)).catchError(handleError);
// ✅ async/await is cleaner
try {
  final a = await future;
  final b = await step2(a);
  await step3(b);
} catch (e) {
  handleError(e);
}
```
