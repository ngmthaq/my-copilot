---
name: dart-basic-syntax
description: "Dart basic syntax — variables (var, final, const), built-in types, operators, string interpolation, control flow (if/else, for, while, switch), comments, and the main() entry point. Use when: declaring variables; writing loops or conditionals; understanding Dart type system basics. DO NOT USE FOR: null safety (use dart-null-safety); classes and OOP (use dart-oop); collections transformations (use dart-collections)."
---

# Dart Basic Syntax

## 1. Entry Point

Every Dart program starts with a top-level `main()` function:

```dart
void main() {
  print('Hello, Dart!');
}

// With command-line arguments
void main(List<String> args) {
  print('Args: $args');
}
```

---

## 2. Variables

```dart
// var — inferred, can be reassigned
var name = 'Alice';
var age = 30;

// final — runtime constant, assigned once
final city = 'Hanoi';
final now = DateTime.now();

// const — compile-time constant
const pi = 3.14159;
const appName = 'MyApp';

// Explicit type annotations
String greeting = 'Hello';
int count = 0;
double ratio = 0.75;
bool isActive = true;

// Dynamic — type can change at runtime (avoid when possible)
dynamic value = 42;
value = 'now a string'; // allowed but unsafe
```

### Variable Rules

| Keyword   | Reassignable | Evaluated at    | Use for                              |
| --------- | ------------ | --------------- | ------------------------------------ |
| `var`     | Yes          | Runtime         | Mutable local variables              |
| `final`   | No           | Runtime         | Values set once, computed at runtime |
| `const`   | No           | Compile time    | Truly constant values and objects    |
| `dynamic` | Yes          | N/A (no checks) | When type is truly unknown (rare)    |

---

## 3. Built-in Types

```dart
// Numbers
int x = 10;
double d = 3.14;
num n = 5;      // parent type of int and double

// Strings
String s = 'single quotes';
String s2 = "double quotes";
String multiLine = '''
  This is a
  multi-line string
''';

// Booleans
bool flag = true;
bool empty = false;

// Runes and Symbols
var heart = '\u2665';        // Unicode rune
Symbol sym = #mySymbol;      // Symbol literal

// Object — supertype of all Dart objects (except null)
Object obj = 42;

// null (only valid for nullable types in sound null safety)
```

---

## 4. String Interpolation

```dart
final name = 'Dart';
final version = 3;

// Simple interpolation
print('Hello, $name!');               // Hello, Dart!

// Expression interpolation
print('Version: ${version + 1}');     // Version: 4
print('Length: ${name.length}');      // Length: 4

// Raw strings — no interpolation or escape processing
final path = r'C:\Users\Alice';       // keeps backslashes literal
```

---

## 5. Operators

```dart
// Arithmetic
int a = 10, b = 3;
print(a + b);   // 13
print(a - b);   // 7
print(a * b);   // 30
print(a / b);   // 3.3333... (double)
print(a ~/ b);  // 3 (integer division)
print(a % b);   // 1 (modulo)

// Comparison
print(a == b);  // false
print(a != b);  // true
print(a > b);   // true
print(a <= b);  // false

// Logical
print(true && false); // false
print(true || false); // true
print(!true);         // false

// Assignment
var n = 5;
n += 3;   // n = 8
n -= 2;   // n = 6
n *= 4;   // n = 24
n ~/= 5;  // n = 4

// Null-aware (see null-safety.md for details)
String? maybeNull;
print(maybeNull ?? 'default');  // default
maybeNull ??= 'assigned';       // assigns only if null

// Cascade (..) — call multiple methods on same object
final list = <int>[]
  ..add(1)
  ..add(2)
  ..add(3);

// Type test
print(42 is int);        // true
print('hi' is! int);     // true
print(42 as num);        // 42 (cast)
```

---

## 6. Control Flow

### if / else

```dart
int score = 85;

if (score >= 90) {
  print('A');
} else if (score >= 80) {
  print('B');
} else {
  print('C');
}

// Single-expression (no braces) — avoid for readability
if (score > 0) print('Positive');
```

### Ternary & if-null

```dart
final label = score >= 60 ? 'Pass' : 'Fail';
final value = someNullable ?? 'fallback';
```

### for Loops

```dart
// Standard for
for (int i = 0; i < 5; i++) {
  print(i);
}

// for-in — iterate over an iterable
final fruits = ['apple', 'banana', 'cherry'];
for (final fruit in fruits) {
  print(fruit);
}

// forEach — callback style
fruits.forEach(print);
```

### while / do-while

```dart
int i = 0;
while (i < 3) {
  print(i);
  i++;
}

int j = 0;
do {
  print(j);
  j++;
} while (j < 3);
```

### switch / case

```dart
final day = 'Monday';

switch (day) {
  case 'Monday':
  case 'Tuesday':
    print('Weekday');
    break;
  case 'Saturday':
  case 'Sunday':
    print('Weekend');
    break;
  default:
    print('Other');
}

// Dart 3 — enhanced switch expression
final type = switch (day) {
  'Saturday' || 'Sunday' => 'Weekend',
  _ => 'Weekday',
};
```

### break / continue

```dart
for (int i = 0; i < 10; i++) {
  if (i == 5) break;       // exits the loop
  if (i % 2 == 0) continue; // skips to next iteration
  print(i); // prints 1, 3
}
```

### assert

```dart
// Only active in debug mode — documents assumptions
assert(score >= 0, 'Score must be non-negative');
assert(name.isNotEmpty);
```

---

## 7. Comments

````dart
// Single-line comment

/*
  Multi-line
  comment
*/

/// Documentation comment — shown in IDEs and dart doc
/// Use [ClassName] or [methodName] to link to symbols.
///
/// Example:
/// ```dart
/// final user = User('Alice');
/// ```
class User {
  /// The display name of the user.
  final String name;
  User(this.name);
}
````

---

## 8. Type Conversion

```dart
// String → int / double
int n = int.parse('42');
double d = double.parse('3.14');

// int / double → String
String s1 = 42.toString();
String s2 = 3.14.toStringAsFixed(2); // '3.14'

// int ↔ double
double fromInt = 10.toDouble();  // 10.0
int fromDouble = 3.9.toInt();    // 3 (truncates)
int rounded = 3.9.round();       // 4

// Safe parse (returns null on failure)
int? safe = int.tryParse('abc'); // null
```

---

## Anti-Patterns

```dart
// ❌ Avoid dynamic — loses type safety
dynamic x = getValue();
x.doSomething(); // no compile-time check

// ✅ Use specific types or Object with type checks
Object x = getValue();
if (x is String) x.toUpperCase();

// ❌ Avoid deep == null checks — use null safety operators
if (user != null && user.name != null) {}

// ✅ Use ?. and ?? operators
print(user?.name ?? 'unknown');

// ❌ Don't use var when the type is non-obvious
var result = compute(); // what type is result?

// ✅ Be explicit when it aids readability
List<String> result = compute();
```
