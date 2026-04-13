---
name: dart-oop
description: "Dart OOP — classes, constructors (generative, named, factory, const), inheritance, interfaces (implements), abstract classes, mixins, extension methods, generics, operator overloading, and enums. Use when: designing classes; using inheritance or composition; implementing interfaces or mixins; writing generic data structures. DO NOT USE FOR: basic function definitions (use dart-functions); async patterns (use dart-async-await)."
---

# Dart Object-Oriented Programming

## 1. Classes & Constructors

```dart
class Point {
  // Instance fields
  final double x;
  final double y;

  // Generative constructor with initializing formals
  Point(this.x, this.y);

  // Named constructor
  Point.origin() : x = 0, y = 0;
  Point.fromMap(Map<String, double> map)
      : x = map['x'] ?? 0,
        y = map['y'] ?? 0;

  // Computed property
  double get distanceFromOrigin => (x * x + y * y).abs();

  // Instance method
  Point translate(double dx, double dy) => Point(x + dx, y + dy);

  @override
  String toString() => 'Point($x, $y)';

  @override
  bool operator ==(Object other) =>
      other is Point && other.x == x && other.y == y;

  @override
  int get hashCode => Object.hash(x, y);
}

void main() {
  final p1 = Point(3, 4);
  final p2 = Point.origin();
  final p3 = Point.fromMap({'x': 1.0, 'y': 2.0});
  print(p1.distanceFromOrigin); // 25.0
  print(p1 == Point(3, 4));     // true
}
```

---

## 2. Const Constructors

```dart
class Color {
  final int r, g, b;

  // const constructor — all fields must be final
  const Color(this.r, this.g, this.b);

  static const red   = Color(255, 0, 0);
  static const green = Color(0, 255, 0);
  static const blue  = Color(0, 0, 255);
}

// Compile-time constant — same reference for identical values
const c1 = Color(255, 0, 0);
const c2 = Color(255, 0, 0);
print(identical(c1, c2)); // true — canonicalized by the runtime
```

---

## 3. Factory Constructors

```dart
// Use factory when:
// 1. You might return a cached / existing instance
// 2. You want to return a subtype
// 3. You need async initialization logic is NOT possible (use static method for async)

class Logger {
  final String name;
  static final _cache = <String, Logger>{};

  Logger._internal(this.name);

  // Factory — returns cached instance
  factory Logger(String name) {
    return _cache.putIfAbsent(name, () => Logger._internal(name));
  }

  void log(String message) => print('[$name] $message');
}

final a = Logger('http');
final b = Logger('http');
print(identical(a, b)); // true — same instance

// Factory returning a subtype
abstract class Shape {
  factory Shape(String type) {
    return switch (type) {
      'circle' => Circle(),
      'square' => Square(),
      _ => throw ArgumentError('Unknown shape: $type'),
    };
  }
  double area();
}
```

---

## 4. Getters & Setters

```dart
class Temperature {
  double _celsius;

  Temperature(this._celsius);

  // Getter
  double get celsius    => _celsius;
  double get fahrenheit => _celsius * 9 / 5 + 32;

  // Setter with validation
  set celsius(double value) {
    if (value < -273.15) throw ArgumentError('Below absolute zero');
    _celsius = value;
  }
}

final t = Temperature(100);
print(t.fahrenheit);  // 212.0
t.celsius = -10;
print(t.celsius);     // -10.0
```

---

## 5. Inheritance

```dart
class Animal {
  final String name;
  Animal(this.name);

  // Can be overridden
  String speak() => '...';

  @override
  String toString() => '$name says: ${speak()}';
}

class Dog extends Animal {
  final String breed;

  // Forward to super constructor
  Dog(super.name, this.breed);

  @override
  String speak() => 'Woof!';

  // Extend parent behavior
  String fetch(String item) => '$name fetches the $item!';
}

class Cat extends Animal {
  Cat(super.name);

  @override
  String speak() => 'Meow!';
}

void main() {
  final animals = <Animal>[Dog('Rex', 'Labrador'), Cat('Whiskers')];
  animals.forEach(print);
  // Rex says: Woof!
  // Whiskers says: Meow!
}
```

### Calling `super`

```dart
class Vehicle {
  int speed;
  Vehicle(this.speed);

  void accelerate(int delta) {
    speed += delta;
  }
}

class ElectricCar extends Vehicle {
  int batteryLevel;
  ElectricCar(super.speed, this.batteryLevel);

  @override
  void accelerate(int delta) {
    if (batteryLevel > 0) {
      super.accelerate(delta); // call parent
      batteryLevel -= delta ~/ 10;
    }
  }
}
```

---

## 6. Abstract Classes & Interfaces

Dart does **not** have a separate `interface` keyword — every class implicitly defines an interface. Use `implements` to satisfy the interface contract.

```dart
// Abstract class — cannot be instantiated
abstract class Repository<T> {
  Future<T?> findById(String id);
  Future<List<T>> findAll();
  Future<T> save(T entity);
  Future<void> delete(String id);
}

// Concrete implementation
class InMemoryUserRepository implements Repository<User> {
  final _store = <String, User>{};

  @override
  Future<User?> findById(String id) async => _store[id];

  @override
  Future<List<User>> findAll() async => _store.values.toList();

  @override
  Future<User> save(User user) async {
    _store[user.id] = user;
    return user;
  }

  @override
  Future<void> delete(String id) async => _store.remove(id);
}

// implements multiple interfaces
class AdminUser implements User, Comparable<AdminUser> {
  @override
  int compareTo(AdminUser other) => name.compareTo(other.name);
  // ... implement all User fields/methods
}
```

---

## 7. Mixins

Mixins add reusable behavior to classes without inheritance:

```dart
mixin Serializable {
  Map<String, dynamic> toJson();

  String toJsonString() => jsonEncode(toJson());
}

mixin Validatable {
  List<String> validate();

  bool get isValid => validate().isEmpty;
}

mixin Timestamped {
  final createdAt = DateTime.now();
  DateTime? updatedAt;

  void touch() => updatedAt = DateTime.now();
}

// Apply multiple mixins with `with`
class Product with Serializable, Validatable, Timestamped {
  final String id;
  final String name;
  final double price;

  Product({required this.id, required this.name, required this.price});

  @override
  Map<String, dynamic> toJson() => {'id': id, 'name': name, 'price': price};

  @override
  List<String> validate() {
    final errors = <String>[];
    if (name.isEmpty) errors.add('Name is required');
    if (price < 0)    errors.add('Price must be non-negative');
    return errors;
  }
}

// Restrict mixin to a class hierarchy
mixin Swimming on Animal {
  String swim() => '$name is swimming!';
}
// class Fish extends Animal with Swimming {} // ✅
// class Rock with Swimming {} // ❌ Rock doesn't extend Animal
```

---

## 8. Generics

```dart
// Generic class
class Box<T> {
  T value;
  Box(this.value);

  Box<R> map<R>(R Function(T) transform) => Box(transform(value));

  @override
  String toString() => 'Box<$T>($value)';
}

// Bounded generics — T must be Comparable
class SortedList<T extends Comparable<T>> {
  final _items = <T>[];

  void add(T item) {
    _items.add(item);
    _items.sort();
  }

  T get min => _items.first;
  T get max => _items.last;
}

// Generic function
T first<T>(List<T> items) {
  if (items.isEmpty) throw StateError('List is empty');
  return items.first;
}

// Type aliases (Dart 2.13+)
typedef Predicate<T> = bool Function(T);
typedef JsonMap = Map<String, dynamic>;
typedef AsyncMapper<T, R> = Future<R> Function(T);
```

---

## 9. Extension Methods

Add methods to existing types without subclassing:

```dart
extension StringExtension on String {
  String capitalize() =>
      isEmpty ? '' : '${this[0].toUpperCase()}${substring(1)}';

  bool get isPalindrome => this == split('').reversed.join();

  List<String> words() => trim().split(RegExp(r'\s+'));
}

extension IntExtension on int {
  bool get isEven => this % 2 == 0;

  List<int> range([int step = 1]) =>
      List.generate((this / step).ceil(), (i) => i * step);
}

extension ListExtension<T> on List<T> {
  List<T> distinct() => toSet().toList();
}

// Usage
print('hello world'.capitalize()); // 'Hello world'
print('racecar'.isPalindrome);     // true
print(5.range());                  // [0, 1, 2, 3, 4]
print([1, 2, 2, 3].distinct());    // [1, 2, 3]
```

---

## 10. Enums (Dart 2.17 Enhanced)

```dart
// Simple enum
enum Direction { north, south, east, west }

// Enhanced enum — with fields, constructors, methods
enum Planet {
  mercury(3.7),
  venus(8.87),
  earth(9.81),
  mars(3.72);

  final double gravity; // m/s²

  const Planet(this.gravity);

  double weightOn(double earthWeight) => earthWeight / 9.81 * gravity;

  bool get isInnerPlanet =>
      index <= Planet.mars.index;
}

// Usage
print(Planet.earth.gravity);             // 9.81
print(Planet.mars.weightOn(70));         // ~26.5

// Pattern matching (Dart 3)
String describe(Direction d) => switch (d) {
  Direction.north => 'Going north',
  Direction.south => 'Going south',
  Direction.east  => 'Going east',
  Direction.west  => 'Going west',
};

// Enum values and names
print(Direction.values);         // [Direction.north, ...]
print(Direction.north.name);     // 'north'
print(Direction.values.byName('east')); // Direction.east
```

---

## 11. Operator Overloading

```dart
class Vector {
  final double x, y;
  const Vector(this.x, this.y);

  Vector operator +(Vector other) => Vector(x + other.x, y + other.y);
  Vector operator -(Vector other) => Vector(x - other.x, y - other.y);
  Vector operator *(double scalar) => Vector(x * scalar, y * scalar);
  Vector operator -() => Vector(-x, -y); // unary minus

  @override
  bool operator ==(Object other) =>
      other is Vector && other.x == x && other.y == y;

  @override
  int get hashCode => Object.hash(x, y);

  @override
  String toString() => 'Vector($x, $y)';
}

final v1 = Vector(1, 2);
final v2 = Vector(3, 4);
print(v1 + v2);  // Vector(4.0, 6.0)
print(v1 * 3);   // Vector(3.0, 6.0)
print(-v1);      // Vector(-1.0, -2.0)
```

---

## Anti-Patterns

```dart
// ❌ Mutating state from outside — breaks encapsulation
class Counter {
  int count = 0; // public mutable
}
counter.count = -1; // allowed — invalid state

// ✅ Expose state through controlled interface
class Counter {
  int _count = 0;
  int get count => _count;
  void increment() => _count++;
  void reset() => _count = 0;
}

// ❌ Deep inheritance chains — prefer composition
class A extends B extends C extends D {} // hard to reason about

// ✅ Use mixins or composition
class A with BehaviorX, BehaviorY {}

// ❌ Abusing factory constructor for async — can't await in factory
factory MyService() async { ... } // ❌ invalid

// ✅ Use a static async factory method
class MyService {
  MyService._();
  static Future<MyService> create() async {
    final s = MyService._();
    await s._init();
    return s;
  }
  Future<void> _init() async { ... }
}
```
