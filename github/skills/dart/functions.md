---
name: dart-functions
description: "Dart functions — named functions, anonymous functions, arrow functions, positional/named/optional parameters, default values, closures, higher-order functions, typedef, and tear-offs. Use when: defining any kind of function; working with callbacks, closures, or functional patterns. DO NOT USE FOR: class methods (use dart-oop); async functions (use dart-async-await)."
---

# Dart Functions

## 1. Function Declarations

```dart
// Named function — standard form
int add(int a, int b) {
  return a + b;
}

// Arrow function — single expression
int multiply(int a, int b) => a * b;

// void return type
void greet(String name) {
  print('Hello, $name!');
}

// Inferred return type — valid but avoid in public APIs
add2(int a) => a + 2; // return type inferred as int

// Top-level, class method, local function — all valid
void outer() {
  int inner(int x) => x * 2; // local function
  print(inner(5)); // 10
}
```

---

## 2. Parameters

### Positional Parameters (required, ordered)

```dart
// All positional, all required
String format(String name, int age) {
  return '$name is $age years old';
}

format('Alice', 30); // ✅
// format(30, 'Alice'); // ❌ Type error
```

### Optional Positional Parameters (`[]`)

```dart
// Wrap in [] — must come after required positional params
String greet(String name, [String title = '', int? id]) {
  final prefix = title.isEmpty ? '' : '$title ';
  final suffix = id != null ? ' (#$id)' : '';
  return 'Hello, $prefix$name$suffix';
}

greet('Alice');              // 'Hello, Alice'
greet('Alice', 'Dr.');       // 'Hello, Dr. Alice'
greet('Alice', 'Dr.', 42);   // 'Hello, Dr. Alice (#42)'
```

### Named Parameters (`{}`)

```dart
// Named — can be passed in any order
// Non-nullable named params need either `required` or a default
void createUser({
  required String name,
  required String email,
  int age = 0,
  String? bio,
}) {
  print('$name <$email>, age: $age');
}

createUser(name: 'Alice', email: 'alice@example.com');
createUser(email: 'bob@example.com', name: 'Bob', age: 25);
// createUser(name: 'Alice'); // ❌ email is required
```

### Default Values

```dart
// Default must be a compile-time constant
void connect({String host = 'localhost', int port = 5432}) {
  print('$host:$port');
}

connect();                   // localhost:5432
connect(port: 3306);         // localhost:3306
connect(host: '0.0.0.0', port: 80); // 0.0.0.0:80

// ❌ Cannot use non-const as default
// void bad({DateTime date = DateTime.now()}) {} // Error
// ✅ Use null default + ?? inside
void good({DateTime? date}) {
  final effective = date ?? DateTime.now();
}
```

---

## 3. Anonymous Functions (Lambdas)

```dart
// Multi-line anonymous function
final double Function(double) square = (x) {
  return x * x;
};

// Arrow anonymous function
final cube = (double x) => x * x * x;

// Commonly used with higher-order functions
final numbers = [1, 2, 3, 4, 5];

final doubled = numbers.map((n) => n * 2).toList();
final evens   = numbers.where((n) => n.isEven).toList();
numbers.forEach((n) => print(n));

// Named parameter in anonymous function
final names = ['Bob', 'Alice', 'Charlie'];
names.sort((a, b) => a.compareTo(b)); // ['Alice', 'Bob', 'Charlie']
```

---

## 4. Closures

A closure is a function that captures variables from its enclosing lexical scope:

```dart
// Counter closure — captures `count`
Function makeCounter() {
  int count = 0;
  return () {
    count++;
    return count;
  };
}

final counter = makeCounter();
print(counter()); // 1
print(counter()); // 2
print(counter()); // 3

// Closure captures by reference — not by value
Function makeAdder(int addBy) {
  return (int n) => n + addBy;
}

final add5  = makeAdder(5);
final add10 = makeAdder(10);
print(add5(3));  // 8
print(add10(3)); // 13
```

### ⚠️ Loop Variable Capture Gotcha

```dart
// ❌ All closures share the same `i` variable
final fns = <Function>[];
for (int i = 0; i < 3; i++) {
  fns.add(() => print(i)); // all capture the SAME i
}
fns.forEach((f) => f()); // prints 3, 3, 3

// ✅ Capture per-iteration value by passing to a function
List<Function> makeFns() {
  return List.generate(3, (i) => () => print(i));
}
makeFns().forEach((f) => f()); // prints 0, 1, 2

// ✅ Or use for-in which creates a new binding each iteration
for (final i in [0, 1, 2]) {
  fns.add(() => print(i)); // each closure has its own final i
}
```

---

## 5. Higher-Order Functions

Functions that take or return other functions:

```dart
// Accepts a function as parameter
int applyTwice(int Function(int) fn, int value) {
  return fn(fn(value));
}

print(applyTwice((x) => x + 3, 7)); // 13

// Returns a function
String Function(String) makePrefix(String prefix) {
  return (String s) => '$prefix $s';
}

final formal  = makePrefix('Dear');
final casual  = makePrefix('Hey');
print(formal('Alice'));  // 'Dear Alice'
print(casual('Bob'));    // 'Hey Bob'

// Compose two functions
T Function(S) compose<S, T, U>(
  T Function(U) f,
  U Function(S) g,
) {
  return (S x) => f(g(x));
}

final shoutUpperCase = compose<String, String, String>(
  (s) => '$s!',
  (s) => s.toUpperCase(),
);
print(shoutUpperCase('hello')); // 'HELLO!'
```

---

## 6. Tear-offs

A **tear-off** is a reference to a method/function without calling it — Dart's idiomatic way to pass methods as callbacks:

```dart
// ✅ Tear-off — pass print directly (no wrapper lambda needed)
final words = ['hello', 'world'];
words.forEach(print); // equivalent to worlds.forEach((w) => print(w))

// Tear-off from an instance
final buffer = StringBuffer();
['a', 'b', 'c'].forEach(buffer.write); // writes each char
print(buffer.toString()); // 'abc'

// Tear-off from a class constructor
final parsers = ['1', '2', '3'].map(int.parse).toList(); // [1, 2, 3]

// Tear-off from a static method
final strings = [1, 2, 3].map(DateTime.fromMillisecondsSinceEpoch).toList();
```

---

## 7. `typedef`

Named function types improve readability and reusability:

```dart
// Define a named function type
typedef Predicate<T> = bool Function(T value);
typedef Transformer<S, T> = T Function(S input);
typedef VoidCallback = void Function();
typedef JsonFactory<T> = T Function(Map<String, dynamic> json);

// Use in signatures
List<T> filterList<T>(List<T> items, Predicate<T> predicate) {
  return items.where(predicate).toList();
}

final evens = filterList([1, 2, 3, 4, 5], (n) => n.isEven); // [2, 4]

// Use for callbacks
class Button {
  final String label;
  final VoidCallback onPressed;
  Button({required this.label, required this.onPressed});
}
```

---

## 8. Recursive Functions

```dart
// Simple recursion
int factorial(int n) {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}

// Tail-recursive style (Dart does NOT optimize tail-calls —
// for large n prefer iterative or use a trampoline)
int factIter(int n, [int acc = 1]) {
  if (n <= 1) return acc;
  return factIter(n - 1, n * acc);
}

// Tree traversal
int sumTree(Map<String, dynamic> node) {
  final value = node['value'] as int;
  final children = (node['children'] as List?)
      ?.cast<Map<String, dynamic>>() ?? [];
  return value + children.fold(0, (sum, child) => sum + sumTree(child));
}
```

---

## Anti-Patterns

```dart
// ❌ Wrapping a tearoff in an unnecessary lambda
items.forEach((item) => print(item));  // redundant wrapper
// ✅ Use the tear-off directly
items.forEach(print);

// ❌ Using `dynamic` in function signatures
dynamic process(dynamic input) { ... }
// ✅ Use generics or specific types
T process<T>(T input) { ... }

// ❌ Mixing optional positional and named params
// void bad(int a, [int b = 0], {String? c}) {} // Invalid syntax

// ✅ Use only one style — prefer named for 3+ params
void good(int a, {int b = 0, String? c}) {}

// ❌ Deeply nested anonymous functions — hurts readability
items.map((i) => i.children.map((c) => c.values.map((v) => v * 2)));
// ✅ Extract to named functions
Iterable<int> doubleValues(Item item) =>
    item.children.expand((c) => c.values.map((v) => v * 2));
items.expand(doubleValues);
```
