---
name: dart-collections
description: "Dart collections — List, Set, Map, Iterable; spread operators; collection-if and collection-for; functional operators (map, where, fold, reduce, expand); sorting; growable vs fixed-length; unmodifiable views. Use when: creating or transforming collections; filtering or aggregating data; working with iterables. DO NOT USE FOR: async streams (use dart-streams); null-safety in collections (use dart-null-safety)."
---

# Dart Collections

## 1. List

An ordered, indexed collection that allows duplicates.

```dart
// List literal
final fruits = ['apple', 'banana', 'cherry'];

// Explicit type
final scores = <int>[95, 87, 72];

// Empty growable list
final items = <String>[];

// Fixed-length list — length cannot change
final fixed = List<int>.filled(3, 0); // [0, 0, 0]

// Generated list
final squares = List<int>.generate(5, (i) => i * i); // [0, 1, 4, 9, 16]

// Unmodifiable view
final readOnly = List<String>.unmodifiable(fruits);
// readOnly.add('mango'); // ❌ throws UnsupportedError
```

### Common List Operations

```dart
final list = <int>[1, 2, 3, 4, 5];

// Access
print(list[0]);           // 1
print(list.first);        // 1
print(list.last);         // 5
print(list.length);       // 5
print(list.isEmpty);      // false

// Mutation
list.add(6);              // [1, 2, 3, 4, 5, 6]
list.addAll([7, 8]);      // [1..8]
list.insert(0, 0);        // [0, 1..8]
list.remove(4);           // removes first occurrence of 4
list.removeAt(0);         // removes element at index 0
list.removeLast();        // removes last element
list.clear();             // []

// Search
list.contains(3);         // true
list.indexOf(3);          // index or -1
list.indexWhere((e) => e > 3); // first index matching

// Sublist
final sub = list.sublist(1, 3); // elements at index 1 and 2
```

---

## 2. Set

An unordered collection of **unique** values. Duplicate insertions are silently ignored.

```dart
// Set literal — must have at least one element or explicit type
final colors = {'red', 'green', 'blue'};

// Explicit typed empty set — NOT {} (that creates a Map)
final empty = <String>{};

// LinkedHashSet (default) — insertion-ordered
// Add package:collection for SplayTreeSet (sorted)
```

### Common Set Operations

```dart
final a = {1, 2, 3, 4};
final b = {3, 4, 5, 6};

a.add(5);          // {1, 2, 3, 4, 5}
a.remove(1);       // {2, 3, 4, 5}
a.contains(3);     // true
a.length;          // 4

// Set algebra
a.union(b);        // {1, 2, 3, 4, 5, 6}
a.intersection(b); // {3, 4}
a.difference(b);   // {1, 2}

// Convert to/from list
final list = a.toList();
final fromList = list.toSet(); // removes duplicates
```

---

## 3. Map

A collection of key-value pairs. Keys are unique.

```dart
// Map literal
final user = {
  'name': 'Alice',
  'email': 'alice@example.com',
  'age': 30,
};

// Typed map
final scores = <String, int>{
  'Alice': 95,
  'Bob': 87,
};

// Empty typed map
final cache = <String, dynamic>{};
```

### Common Map Operations

```dart
final map = <String, int>{'a': 1, 'b': 2, 'c': 3};

// Access
print(map['a']);             // 1
print(map['z']);             // null (missing key returns null)
print(map['z'] ?? 0);        // 0 (safe default)
map.containsKey('b');        // true
map.containsValue(2);        // true

// Mutation
map['d'] = 4;                // add or update
map.putIfAbsent('e', () => 5); // add only if key absent
map.update('a', (v) => v + 10); // update using old value
map.remove('c');             // removes key 'c'
map.clear();                 // {}

// Iteration
for (final entry in map.entries) {
  print('${entry.key}: ${entry.value}');
}
map.forEach((key, value) => print('$key = $value'));

// Views
final keys = map.keys.toList();
final values = map.values.toList();

// Transform
final doubled = map.map((k, v) => MapEntry(k, v * 2));
```

---

## 4. Collection Literals: Spread, if, for

```dart
final extra = [4, 5, 6];
final combined = [1, 2, 3, ...extra]; // [1, 2, 3, 4, 5, 6]

// Null-aware spread
List<int>? optional;
final safe = [1, 2, ...?optional, 3]; // [1, 2, 3] — skips if null

// collection-if
bool showExtra = true;
final items = [
  'base',
  if (showExtra) 'extra',
  if (showExtra) ...<String>['a', 'b'],
];

// collection-for
final squares = [
  for (int i = 1; i <= 5; i++) i * i, // [1, 4, 9, 16, 25]
];

// Map spread
final base = {'a': 1};
final extended = {...base, 'b': 2}; // {'a': 1, 'b': 2}

// Set spread
final merged = {...{1, 2}, ...{2, 3}}; // {1, 2, 3}
```

---

## 5. Iterable Transformations

All of these are **lazy** — they do not process elements until iterated (e.g., `.toList()` triggers evaluation).

```dart
final numbers = [1, 2, 3, 4, 5, 6];

// map — transform each element
final doubled = numbers.map((n) => n * 2); // Iterable: 2, 4, 6, 8, 10

// where — filter elements
final evens = numbers.where((n) => n.isEven); // Iterable: 2, 4, 6

// expand — flatten / one-to-many
final nested = [[1, 2], [3, 4], [5]];
final flat = nested.expand((l) => l); // Iterable: 1, 2, 3, 4, 5

// firstWhere / lastWhere — find element
final first = numbers.firstWhere((n) => n > 3); // 4
final none = numbers.firstWhere((n) => n > 10, orElse: () => -1); // -1

// any / every — test predicate
print(numbers.any((n) => n > 5));    // true
print(numbers.every((n) => n > 0));  // true

// fold — accumulate to a single value
final sum = numbers.fold<int>(0, (acc, n) => acc + n); // 21
final product = numbers.fold<int>(1, (acc, n) => acc * n); // 720

// reduce — fold without initial value (requires non-empty)
final total = numbers.reduce((a, b) => a + b); // 21

// take / skip
final first3 = numbers.take(3).toList(); // [1, 2, 3]
final after2 = numbers.skip(2).toList(); // [3, 4, 5, 6]

// takeWhile / skipWhile
final prefix = numbers.takeWhile((n) => n < 4).toList(); // [1, 2, 3]
final rest   = numbers.skipWhile((n) => n < 4).toList(); // [4, 5, 6]

// Chain transformations
final result = numbers
    .where((n) => n.isOdd)
    .map((n) => n * n)
    .toList(); // [1, 9, 25]
```

---

## 6. Sorting

```dart
final nums = [3, 1, 4, 1, 5, 9, 2, 6];

// In-place sort (ascending)
nums.sort();                            // [1, 1, 2, 3, 4, 5, 6, 9]

// Custom comparator
nums.sort((a, b) => b.compareTo(a));    // descending: [9, 6, 5, 4, 3, 2, 1, 1]

// Sort by field
final words = ['banana', 'apple', 'cherry'];
words.sort((a, b) => a.length.compareTo(b.length)); // by length

// Stable sort preserving original order for equal elements
// Dart's List.sort() is guaranteed stable (Dart 2.18+)

// Sorted copy (non-mutating)
final sorted = [...nums]..sort();
```

---

## 7. Converting Between Collection Types

```dart
final list  = [1, 2, 2, 3, 4];
final set   = list.toSet();           // {1, 2, 3, 4} — removes duplicates
final back  = set.toList();           // [1, 2, 3, 4] — order not guaranteed

// Iterable → List
final iter = [1, 2, 3].where((n) => n > 1);
final filtered = iter.toList();       // [2, 3]

// Map → List of entries
final map = {'a': 1, 'b': 2};
final entries = map.entries.toList(); // [MapEntry(a,1), MapEntry(b,2)]

// List of pairs → Map
final pairs = [['a', 1], ['b', 2]];
final fromPairs = Map.fromEntries(
  pairs.map((p) => MapEntry(p[0] as String, p[1] as int)),
);
```

---

## 8. Unmodifiable Collections

```dart
import 'package:collection/collection.dart'; // optional extra utilities

// Unmodifiable wrappers
final unmodList = List<String>.unmodifiable(['a', 'b']);
final unmodMap  = Map<String, int>.unmodifiable({'x': 1});
final unmodSet  = Set<int>.unmodifiable({1, 2, 3});

// const collections — compile-time constant, always unmodifiable
const constList = [1, 2, 3];
const constMap  = {'key': 'value'};
const constSet  = {1, 2, 3};
```

---

## Anti-Patterns

```dart
// ❌ Using {} for an empty Set — Dart infers Map<dynamic, dynamic>
var empty = {};          // Map, not Set!
// ✅ Always specify type for empty set
var emptySet = <String>{};

// ❌ Eagerly materializing when lazy is sufficient
final all = items.map((i) => i.name).toList().where((n) => n.startsWith('A'));

// ✅ Stay lazy until you need a concrete list
final result = items.map((i) => i.name).where((n) => n.startsWith('A')).toList();

// ❌ for-loop mutation while iterating
for (final item in list) {
  list.remove(item); // ConcurrentModificationError
}
// ✅ Collect and remove separately
final toRemove = list.where((i) => shouldRemove(i)).toList();
list.removeWhere((i) => toRemove.contains(i));
// or simply:
list.removeWhere(shouldRemove);

// ❌ Repeated contains() on List (O(n) each call)
if (largeList.contains(item)) { ... }
// ✅ Convert to Set for O(1) lookups
final lookup = largeList.toSet();
if (lookup.contains(item)) { ... }
```
