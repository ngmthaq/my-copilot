---
name: dart-null-safety
description: "Dart null safety — nullable vs non-nullable types, ?, !, ??, ?.  operators, late variables, required named parameters, null safety migration, and sound null safety guarantees. Use when: writing null-safe code; working with optional values; using late initialization; migrating from pre-null-safety Dart. DO NOT USE FOR: basic variable declarations (use dart-basic-syntax); collection operations (use dart-collections)."
---

# Dart Null Safety

## 1. Core Concept

Dart has **sound null safety** — the type system guarantees that a non-nullable variable can never be `null` at runtime. If it compiles, it won't throw a `Null check operator used on a null value` error from a non-nullable variable.

```dart
// Non-nullable — CANNOT be null
String name = 'Alice';
// name = null; // ❌ Compile error

// Nullable — CAN be null
String? city;            // defaults to null
city = 'Hanoi';
city = null;             // ✅ Allowed
```

---

## 2. Nullable Type Operators

### `?` — Nullable type declaration

```dart
int? age;          // nullable int
String? email;     // nullable String
List<int>? items;  // nullable list

// Function return types
String? findUser(int id) {
  if (id == 0) return null;
  return 'Alice';
}
```

### `?.` — Null-aware member access

```dart
String? name = getName();

// ❌ Unsafe — throws if name is null
print(name.length);

// ✅ Safe — short-circuits to null if name is null
print(name?.length);       // null or int
print(name?.toUpperCase()); // null or String

// Chaining
print(user?.address?.city); // null if any step is null
```

### `??` — Null coalescing (default value)

```dart
String? city;
String label = city ?? 'Unknown';   // 'Unknown'

int? count;
int total = count ?? 0;             // 0

// Chaining ??
String result = a ?? b ?? c ?? 'fallback';
```

### `??=` — Null-aware assignment

```dart
String? cached;

// Assigns ONLY if cached is currently null
cached ??= fetchFromServer();       // fetches once

// Equivalent to:
cached = cached ?? fetchFromServer();
```

### `!` — Null assertion operator

```dart
String? maybeNull = 'definitely not null here';

// Tells the analyzer: "trust me, it's not null"
String definite = maybeNull!;  // throws if null at runtime

// ✅ Only use ! when you are CERTAIN the value is non-null
// ❌ Never use ! blindly — prefer null checks or ?? instead
```

---

## 3. Null Checks and Promotion

The Dart analyzer **promotes** nullable types to non-nullable after a null check:

```dart
String? name = maybeGetName();

// if check — promotes inside the if block
if (name != null) {
  print(name.length); // name is String (non-nullable) here
}

// Early return pattern (guard clause)
String processName(String? name) {
  if (name == null) return 'anonymous';
  // name is now String from here on
  return name.trim().toUpperCase();
}

// is check also promotes
Object? raw = getObject();
if (raw is String) {
  print(raw.length); // raw is String here
}
```

---

## 4. The `late` Keyword

Use `late` when a non-nullable variable is **initialized after declaration** but before first use:

```dart
// Lazy initialization — initialized on first access
late final String config = loadConfig(); // runs only when accessed

// Field that is set in a lifecycle method
class MyWidget {
  late final Database db;

  void init() {
    db = Database.connect(); // set before any method calls db
  }

  void query() {
    db.select('users'); // safe after init()
  }
}

// ⚠️ Accessing a late variable before assignment throws LateInitializationError
late int value;
print(value); // ❌ LateInitializationError at runtime
```

### When to use `late`

| Scenario                                      | Use `late`?        |
| --------------------------------------------- | ------------------ |
| Field set in constructor body                 | Yes                |
| Field set in `initState` or lifecycle method  | Yes                |
| Circular dependency / deferred initialization | Yes                |
| Value computed lazily from another field      | Yes (`late final`) |
| Value that might genuinely be null at runtime | No — use `?`       |

---

## 5. `required` Named Parameters

In null-safe Dart, named parameters are optional by default. Use `required` to enforce the caller to provide them:

```dart
// Named params are optional by default
void greet({String? name, int? age}) {
  print('Hello, ${name ?? 'stranger'}, age ${age ?? '?'}');
}

// required — caller MUST provide value
void createUser({
  required String name,
  required String email,
  int age = 0,             // has default — not required
  String? bio,             // nullable — not required
}) {
  // name and email are non-nullable here
}

createUser(name: 'Alice', email: 'alice@example.com');
// createUser(name: 'Alice'); // ❌ Compile error: email is required
```

---

## 6. Null Safety in Collections

```dart
// ✅ Non-nullable list of non-nullable items
List<String> names = ['Alice', 'Bob'];

// ✅ Nullable list — the list itself might be null
List<String>? optionalList;

// ✅ Non-nullable list of nullable items
List<String?> withNulls = ['Alice', null, 'Charlie'];

// ✅ Nullable list of nullable items
List<String?>? fullyNullable;

// Filtering nulls out with whereType
final mixed = <String?>['a', null, 'b', null, 'c'];
final clean = mixed.whereType<String>().toList(); // ['a', 'b', 'c']

// Using ?? in collections
final values = <int?>[1, null, 3];
final result = values.map((v) => v ?? 0).toList(); // [1, 0, 3]
```

---

## 7. Null Safety in Async Code

```dart
// Futures can be nullable
Future<String?> fetchName(int id) async {
  if (id < 0) return null;
  return await api.getName(id);
}

// Await and handle null
final name = await fetchName(userId);
if (name == null) {
  print('Not found');
  return;
}
print(name.toUpperCase()); // name is String (promoted)

// Null-aware await pattern
final label = (await fetchName(id)) ?? 'unknown';
```

---

## 8. Working with Legacy APIs

When calling code that pre-dates null safety or returns `dynamic`:

```dart
dynamic legacyResult = legacyApi.getUser();

// ❌ Dangerous — bypasses null safety
String name = legacyResult['name'];

// ✅ Cast carefully with null coalescing
final name = (legacyResult['name'] as String?) ?? 'unknown';

// ✅ Use tryParse for strings from external sources
final age = int.tryParse(legacyResult['age']?.toString() ?? '') ?? 0;
```

---

## Anti-Patterns

```dart
// ❌ Overusing ! — hides actual bugs
final result = maybeNull!.doSomething(); // can throw

// ✅ Use null checks or ?? instead
final result = maybeNull?.doSomething() ?? defaultValue;

// ❌ Using late for values that can genuinely be null
late String? name; // pointless — just use String? name;

// ❌ Making everything nullable to "play it safe"
String? name = 'Alice'; // name will never be null — drop the ?

// ✅ Be precise — nullable only when null is a valid state
String name = 'Alice';
String? optionalLabel; // null means "no label"

// ❌ Ignoring promotion — re-checking after a guard
if (name == null) return;
if (name != null) print(name.length); // redundant second check

// ✅ Trust the promoted type
if (name == null) return;
print(name.length); // name is String here
```
