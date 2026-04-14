---
name: java-streams-lambdas
description: "Java streams and lambdas — lambda expressions, method references, functional interfaces, Stream API, Optional, and collectors. Use when: functional-style operations on collections; lambda expressions; method references; stream pipelines; Optional handling. DO NOT USE FOR: basic collections usage (use java-collections); concurrency (use java-concurrency)."
---

# Java Streams & Lambdas

## 1. Lambda Expressions

```java
// Syntax: (parameters) -> expression
Comparator<String> byLength = (a, b) -> Integer.compare(a.length(), b.length());

// Block body for multi-line
Comparator<String> byName = (a, b) -> {
    int result = a.compareToIgnoreCase(b);
    return result != 0 ? result : a.compareTo(b);
};

// Single parameter — parentheses optional
list.forEach(item -> System.out.println(item));

// No parameters
Runnable task = () -> System.out.println("Running");

// Effectively final capture
String prefix = "Hello";
Function<String, String> greeter = name -> prefix + " " + name;
// prefix = "Hi";  // Error: must be effectively final
```

---

## 2. Method References

```java
// Four kinds:

// Static method — Class::staticMethod
Function<String, Integer> parser = Integer::parseInt;

// Instance method of a particular object — object::method
String prefix = "Hello";
Function<String, String> greeter = prefix::concat;

// Instance method of an arbitrary object — Class::method
Function<String, String> upper = String::toUpperCase;

// Constructor — Class::new
Supplier<ArrayList<String>> listFactory = ArrayList::new;
Function<String, User> userFactory = User::new;
```

---

## 3. Functional Interfaces

```java
// Built-in (java.util.function)
Function<T, R>        // T → R
BiFunction<T, U, R>   // (T, U) → R
Predicate<T>          // T → boolean
Consumer<T>           // T → void
Supplier<T>           // () → T
UnaryOperator<T>      // T → T (specialization of Function)
BinaryOperator<T>     // (T, T) → T (specialization of BiFunction)

// Usage
Predicate<String> isLong = s -> s.length() > 10;
Function<String, Integer> length = String::length;
Consumer<String> printer = System.out::println;
Supplier<List<String>> listMaker = ArrayList::new;

// Composition
Predicate<String> isShort = isLong.negate();
Predicate<String> isNotEmpty = s -> !s.isEmpty();
Predicate<String> isShortAndNotEmpty = isShort.and(isNotEmpty);

Function<String, String> trim = String::trim;
Function<String, String> upper = String::toUpperCase;
Function<String, String> trimAndUpper = trim.andThen(upper);

// Custom functional interface
@FunctionalInterface
public interface Converter<F, T> {
    T convert(F from);

    // Can have default/static methods
    default <V> Converter<F, V> andThen(Converter<T, V> after) {
        return from -> after.convert(this.convert(from));
    }
}
```

---

## 4. Stream API

### Creating Streams

```java
// From collection
List<String> names = List.of("Alice", "Bob", "Charlie");
Stream<String> stream = names.stream();

// From values
Stream<String> of = Stream.of("a", "b", "c");

// From array
Stream<int[]> arr = Arrays.stream(new int[]{1, 2, 3}).boxed();

// Infinite streams
Stream<Integer> infinite = Stream.iterate(0, n -> n + 1);
Stream<Double> randoms = Stream.generate(Math::random);

// Range
IntStream range = IntStream.range(0, 10);       // [0, 10)
IntStream rangeClosed = IntStream.rangeClosed(1, 10); // [1, 10]
```

### Intermediate Operations (lazy)

```java
stream
    .filter(s -> s.length() > 3)           // keep matching
    .map(String::toUpperCase)              // transform each element
    .flatMap(s -> Arrays.stream(s.split(""))) // flatten nested streams
    .distinct()                             // remove duplicates
    .sorted()                               // natural order
    .sorted(Comparator.reverseOrder())      // custom order
    .peek(System.out::println)              // debug (don't use for side effects)
    .limit(10)                              // take first N
    .skip(5)                                // skip first N
    .takeWhile(s -> s.startsWith("A"))      // take while true (Java 9+)
    .dropWhile(s -> s.startsWith("A"))      // drop while true (Java 9+)
```

### Terminal Operations (trigger execution)

```java
// Collect to collection
List<String> list = stream.collect(Collectors.toList());
List<String> list2 = stream.toList();                    // Java 16+
Set<String> set = stream.collect(Collectors.toSet());

// Reduce
Optional<String> longest = names.stream()
        .reduce((a, b) -> a.length() >= b.length() ? a : b);

int sum = IntStream.of(1, 2, 3, 4, 5).sum();
OptionalInt max = IntStream.of(1, 2, 3).max();

// Find
Optional<String> first = stream.findFirst();
Optional<String> any = stream.findAny();      // for parallel streams

// Match
boolean allLong = names.stream().allMatch(s -> s.length() > 2);
boolean anyLong = names.stream().anyMatch(s -> s.length() > 5);
boolean noneLong = names.stream().noneMatch(s -> s.length() > 10);

// Count
long count = stream.count();

// ForEach
stream.forEach(System.out::println);
```

---

## 5. Collectors

```java
import java.util.stream.Collectors;

// Grouping
Map<String, List<User>> byCity = users.stream()
        .collect(Collectors.groupingBy(User::getCity));

// Grouping with downstream collector
Map<String, Long> countByCity = users.stream()
        .collect(Collectors.groupingBy(User::getCity, Collectors.counting()));

Map<String, Double> avgAgeByCity = users.stream()
        .collect(Collectors.groupingBy(
                User::getCity,
                Collectors.averagingInt(User::getAge)));

// Partitioning (boolean split)
Map<Boolean, List<User>> partitioned = users.stream()
        .collect(Collectors.partitioningBy(User::isActive));

// Joining
String csv = names.stream().collect(Collectors.joining(", "));
String formatted = names.stream()
        .collect(Collectors.joining(", ", "[", "]"));  // [Alice, Bob, Charlie]

// To Map
Map<Long, User> byId = users.stream()
        .collect(Collectors.toMap(User::getId, Function.identity()));

// Handle duplicate keys
Map<String, User> byName = users.stream()
        .collect(Collectors.toMap(User::getName, Function.identity(),
                (existing, replacement) -> existing));  // keep first

// Summarizing
IntSummaryStatistics stats = users.stream()
        .collect(Collectors.summarizingInt(User::getAge));
stats.getAverage();
stats.getMax();
stats.getCount();

// Unmodifiable collectors (Java 10+)
List<String> unmodifiable = names.stream()
        .collect(Collectors.toUnmodifiableList());
```

---

## 6. Optional

```java
// Creating
Optional<String> present = Optional.of("hello");
Optional<String> empty = Optional.empty();
Optional<String> nullable = Optional.ofNullable(getValue()); // may be null

// Unwrapping
String value = optional.orElse("default");
String value2 = optional.orElseGet(() -> computeDefault());
String value3 = optional.orElseThrow();                      // NoSuchElementException
String value4 = optional.orElseThrow(() -> new NotFoundException("Not found"));

// Transforming
Optional<Integer> length = optional.map(String::length);
Optional<String> nested = optional.flatMap(this::findByName);
Optional<String> filtered = optional.filter(s -> s.length() > 3);

// Conditional execution
optional.ifPresent(System.out::println);
optional.ifPresentOrElse(                                    // Java 9+
        System.out::println,
        () -> System.out.println("Empty"));

// Stream integration (Java 9+)
List<String> presentValues = optionals.stream()
        .flatMap(Optional::stream)
        .toList();

// Chaining (Java 9+)
Optional<String> result = findInCache(key)
        .or(() -> findInDb(key))
        .or(() -> findRemotely(key));
```

---

## 7. Parallel Streams

```java
// Create parallel stream
List<String> results = names.parallelStream()
        .filter(s -> s.length() > 3)
        .map(String::toUpperCase)
        .toList();

// Convert existing stream to parallel
names.stream().parallel()
        .forEach(System.out::println);

// ⚠️ When to use parallel streams:
// ✓ Large data sets (>10k elements)
// ✓ CPU-intensive operations per element
// ✓ Stateless, non-interfering operations
// ✗ Small collections (overhead > benefit)
// ✗ I/O-bound operations (use async/threading instead)
// ✗ Order-dependent operations
// ✗ Shared mutable state
```

---

## 8. Anti-Patterns

```java
// ✗ Using streams for simple iteration
names.stream().forEach(System.out::println);

// ✓ Use enhanced for-loop or Iterable.forEach
names.forEach(System.out::println);

// ✗ Modifying external state in stream operations
List<String> results = new ArrayList<>();
names.stream().map(String::toUpperCase).forEach(results::add);  // not thread-safe

// ✓ Collect into result
List<String> results = names.stream().map(String::toUpperCase).toList();

// ✗ Optional as method parameter or field
public void process(Optional<String> name) { }  // forces wrapping

// ✓ Use overloads or nullable
public void process(String name) { }
public void process() { process(null); }

// ✗ Using get() without check
optional.get();                                  // NoSuchElementException risk

// ✓ Use orElse, orElseThrow, or ifPresent
optional.orElseThrow(() -> new NotFoundException("Not found"));

// ✗ Nested streams that should be flatMap
names.stream().map(name -> name.chars().boxed().toList());  // List<List<Integer>>

// ✓ Use flatMap
names.stream().flatMap(name -> name.chars().boxed());       // Stream<Integer>
```
