---
name: dart-streams
description: "Dart Streams — Stream, StreamController, single-subscription vs broadcast streams, stream transformations (map, where, expand), async generators (async*, yield, yield*), StreamSubscription, and common stream patterns. Use when: working with continuous data sequences; listening to events; processing data pipelines; using async generators. DO NOT USE FOR: single async operations (use dart-async-await); UI streams in Flutter (use Flutter skill)."
---

# Dart Streams

## 1. What is a Stream?

A `Stream<T>` is an asynchronous sequence of events (values or errors) over time — the async counterpart of an `Iterable<T>`.

```
Iterable:  [1, 2, 3, 4, 5]              — synchronous, pull-based
Stream:    1 → (wait) → 2 → (wait) → 3 — asynchronous, push-based
```

A Stream can emit:

- **Data events** — values of type `T`
- **Error events** — exceptions, with optional stack trace
- **Done event** — signals the stream has closed

---

## 2. Creating Streams

### From literals / factory constructors

```dart
// From a single value
final s1 = Stream.value(42);

// From an iterable
final s2 = Stream.fromIterable([1, 2, 3, 4, 5]);

// From a Future
final s3 = Stream.fromFuture(fetchData());

// From multiple Futures
final s4 = Stream.fromFutures([fetch1(), fetch2(), fetch3()]);

// Periodic stream — emits every interval
final ticker = Stream<int>.periodic(
  Duration(seconds: 1),
  (count) => count,
).take(5); // emit 5 times then close

// Empty stream
final empty = Stream<int>.empty();
```

### Using `async*` generators

```dart
// async generator — suspendable function that yields values
Stream<int> countTo(int n) async* {
  for (int i = 1; i <= n; i++) {
    await Future.delayed(Duration(milliseconds: 200));
    yield i;              // emit value
  }
}

// yield* delegates to another stream/iterable
Stream<int> merged() async* {
  yield* countTo(3);      // yields 1, 2, 3
  yield* countTo(3);      // then 1, 2, 3 again
  yield 99;               // then 99
}

void main() async {
  await for (final value in countTo(5)) {
    print(value); // 1, 2, 3, 4, 5
  }
}
```

---

## 3. Consuming Streams

### `await for` — idiomatic async iteration

```dart
Future<void> process() async {
  await for (final event in myStream) {
    print('Received: $event');
  }
  print('Stream closed');
}
```

### `listen()` — callback style

```dart
final subscription = myStream.listen(
  (data)  => print('Data: $data'),
  onError: (Object e, StackTrace st) => print('Error: $e'),
  onDone: ()  => print('Done'),
  cancelOnError: false, // continue after errors (default: false)
);

// Control the subscription
subscription.pause();     // pause receiving events
subscription.resume();    // resume
subscription.cancel();    // stop and release resources
```

### `StreamSubscription` management

```dart
class MyService {
  StreamSubscription<String>? _sub;

  void start(Stream<String> stream) {
    _sub = stream.listen((data) => handleData(data));
  }

  void stop() {
    _sub?.cancel();
    _sub = null;
  }
}
```

---

## 4. Single-Subscription vs Broadcast Streams

| Feature          | Single-Subscription      | Broadcast                      |
| ---------------- | ------------------------ | ------------------------------ |
| Max listeners    | 1                        | Unlimited                      |
| Late subscribers | Gets all buffered events | Misses past events             |
| Created by       | `StreamController()`     | `StreamController.broadcast()` |
| Use case         | File I/O, HTTP response  | UI events, pub/sub patterns    |

```dart
import 'dart:async';

// Single-subscription controller
final sc = StreamController<int>();
sc.stream.listen((v) => print('Got: $v'));
sc.add(1);
sc.add(2);
sc.close();

// Broadcast controller — multiple listeners allowed
final bc = StreamController<String>.broadcast();

bc.stream.listen((v) => print('Listener A: $v'));
bc.stream.listen((v) => print('Listener B: $v'));

bc.add('hello');
// Listener A: hello
// Listener B: hello

bc.close();

// Convert single-subscription to broadcast
final source = Stream.fromIterable([1, 2, 3]);
final broadcast = source.asBroadcastStream();
```

---

## 5. StreamController — Full Control

```dart
import 'dart:async';

class EventBus<T> {
  final _controller = StreamController<T>.broadcast();

  Stream<T> get stream => _controller.stream;

  void emit(T event) {
    if (!_controller.isClosed) _controller.add(event);
  }

  void emitError(Object error) {
    if (!_controller.isClosed) _controller.addError(error);
  }

  Future<void> dispose() => _controller.close();
}

// Usage
final bus = EventBus<String>();
bus.stream.listen(print);
bus.emit('hello');
bus.emit('world');
await bus.dispose();
```

### Backpressure with `onListen` / `onPause` / `onResume` / `onCancel`

```dart
StreamController<int> timedController() {
  Timer? timer;

  return StreamController<int>(
    onListen: () {
      int count = 0;
      timer = Timer.periodic(Duration(seconds: 1), (t) {
        controller.add(count++);
      });
    },
    onPause:  () => timer?.cancel(),
    onResume: () { /* restart timer */ },
    onCancel: () => timer?.cancel(),
  );
}
```

---

## 6. Stream Transformations

All transformations return a new `Stream` — they are lazy.

```dart
final numbers = Stream.fromIterable([1, 2, 3, 4, 5, 6]);

// map — transform each element
numbers.map((n) => n * 2);               // 2, 4, 6, 8, 10, 12

// where — filter elements
numbers.where((n) => n.isOdd);           // 1, 3, 5

// expand — one-to-many (flatMap)
numbers.expand((n) => [n, n * 10]);      // 1, 10, 2, 20, ...

// take / skip
numbers.take(3);                         // 1, 2, 3
numbers.skip(2);                         // 3, 4, 5, 6

// takeWhile / skipWhile
numbers.takeWhile((n) => n < 4);         // 1, 2, 3
numbers.skipWhile((n) => n < 4);         // 4, 5, 6

// distinct — skip consecutive duplicates
Stream.fromIterable([1, 1, 2, 3, 3, 3]).distinct(); // 1, 2, 3

// asyncMap — async transformation
numbers.asyncMap((n) async {
  await Future.delayed(Duration(milliseconds: 100));
  return n * n;
}); // 1, 4, 9, 16, 25, 36

// asyncExpand — async one-to-many
numbers.asyncExpand((n) async* {
  yield n;
  yield n * 2;
}); // 1, 2, 2, 4, 3, 6, ...

// handleError — recover from errors mid-stream
stream.handleError(
  (Object e) => print('Recovered: $e'),
  test: (e) => e is FormatException,
);

// transform — apply a full StreamTransformer
stream.transform(utf8.decoder);
```

---

## 7. Converting Stream → Future

```dart
final numbers = Stream.fromIterable([1, 2, 3, 4, 5]);

// Collect all events into a list
final list = await numbers.toList();            // [1, 2, 3, 4, 5]

// Reduce to a single value
final sum  = await numbers.reduce((a, b) => a + b); // 15
final fold = await numbers.fold<int>(0, (acc, n) => acc + n); // 15

// Get the first / last element
final first = await numbers.first;              // 1
final last  = await numbers.last;               // 5

// Check membership
final any  = await numbers.any((n) => n > 4);  // true
final every= await numbers.every((n) => n > 0); // true
final has  = await numbers.contains(3);         // true

// Count elements
final count = await numbers.length;             // 5
```

---

## 8. `StreamTransformer`

```dart
// Custom reusable transformer
class ThrottleTransformer<T> extends StreamTransformerBase<T, T> {
  final Duration duration;
  ThrottleTransformer(this.duration);

  @override
  Stream<T> bind(Stream<T> stream) async* {
    DateTime? lastEmit;
    await for (final event in stream) {
      final now = DateTime.now();
      if (lastEmit == null || now.difference(lastEmit) >= duration) {
        lastEmit = now;
        yield event;
      }
    }
  }
}

final throttled = fastStream.transform(ThrottleTransformer(Duration(milliseconds: 500)));
```

---

## 9. Error Handling in Streams

```dart
// Errors inside async* propagate as stream error events
Stream<int> riskyStream() async* {
  yield 1;
  yield 2;
  throw Exception('Something went wrong');
  yield 3; // never reached
}

// Catch with listen
riskyStream().listen(
  print,
  onError: (e) => print('Error: $e'),
);

// Catch with await for
try {
  await for (final v in riskyStream()) {
    print(v);
  }
} catch (e) {
  print('Caught: $e');
}

// handleError — transform errors into events or ignore
riskyStream()
    .handleError((e) => print('Handled: $e'))
    .listen(print);
```

---

## Anti-Patterns

```dart
// ❌ Forgetting to cancel a StreamSubscription — causes memory leaks
final sub = stream.listen(handler);
// ... never cancelled

// ✅ Always cancel in dispose/cleanup
sub.cancel();

// ❌ Listening to a single-subscription stream twice
final s = Stream.fromIterable([1, 2, 3]);
s.listen(print);
s.listen(print); // ❌ StateError: Stream has already been listened to

// ✅ Use asBroadcastStream() or a broadcast controller
final broadcast = s.asBroadcastStream();
broadcast.listen(print);
broadcast.listen(print);

// ❌ Blocking inside a stream listener
stream.listen((event) {
  final result = heavySync(event); // blocks the event loop
});

// ✅ Use asyncMap for async work
stream.asyncMap((event) => heavyAsync(event)).listen(print);

// ❌ Using await for inside async functions that never close
// This hangs forever if the stream never closes
await for (final _ in infiniteStream) { ... }

// ✅ Use take() to limit, or handle cancellation explicitly
await for (final v in infiniteStream.take(10)) { ... }
```
