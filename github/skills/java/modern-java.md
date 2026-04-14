---
name: java-modern-java
description: "Modern Java features — records, sealed classes, pattern matching, text blocks, switch expressions, virtual threads, var keyword, helpful NullPointerExceptions, and other features from Java 14+. Use when: using records for data carriers; sealed class hierarchies; pattern matching in instanceof or switch; text blocks; virtual threads. DO NOT USE FOR: basic OOP (use java-oop); pre-Java-14 features (use java-core-fundamentals)."
---

# Modern Java

## 1. Records (Java 16+)

```java
// Immutable data carrier — generates constructor, getters, equals, hashCode, toString
public record User(Long id, String name, String email) { }

// Usage
var user = new User(1L, "Alice", "alice@example.com");
user.name();           // "Alice" (accessor, not getName)
user.toString();       // "User[id=1, name=Alice, email=alice@example.com]"

// Compact constructor (validation)
public record User(Long id, String name, String email) {
    public User {
        Objects.requireNonNull(name, "Name is required");
        Objects.requireNonNull(email, "Email is required");
        name = name.strip();
        email = email.toLowerCase();
    }
}

// Custom methods
public record Point(double x, double y) {
    public double distanceTo(Point other) {
        return Math.sqrt(Math.pow(x - other.x, 2) + Math.pow(y - other.y, 2));
    }

    // Static factory
    public static Point origin() {
        return new Point(0, 0);
    }
}

// Records can implement interfaces
public record UserDto(Long id, String name) implements Serializable { }

// ⚠️ Records CANNOT:
// - extend other classes (implicitly extend Record)
// - be abstract
// - have mutable instance fields (all fields are final)
```

---

## 2. Sealed Classes (Java 17+)

```java
// Restrict which classes can extend/implement
public sealed interface Shape
    permits Circle, Rectangle, Triangle { }

public record Circle(double radius) implements Shape { }
public record Rectangle(double width, double height) implements Shape { }
public final class Triangle implements Shape {
    private final double a, b, c;
    public Triangle(double a, double b, double c) {
        this.a = a; this.b = b; this.c = c;
    }
}

// Subclass options:
// - final    — no further extension
// - sealed   — controlled further extension
// - non-sealed — open for extension

public sealed class Vehicle permits Car, Truck, Motorcycle { }
public final class Car extends Vehicle { }
public sealed class Truck extends Vehicle permits PickupTruck, SemiTruck { }
public non-sealed class Motorcycle extends Vehicle { }  // open
```

---

## 3. Pattern Matching

### instanceof (Java 16+)

```java
// Before
if (obj instanceof String) {
    String s = (String) obj;
    System.out.println(s.length());
}

// After — binding variable
if (obj instanceof String s) {
    System.out.println(s.length());   // s is already cast
}

// With conditions
if (obj instanceof String s && s.length() > 5) {
    process(s);
}
```

### Switch Pattern Matching (Java 21+)

```java
// Type patterns in switch
String describe(Object obj) {
    return switch (obj) {
        case Integer i    -> "Integer: " + i;
        case String s     -> "String: " + s;
        case Double d     -> "Double: " + d;
        case null         -> "null";
        default           -> "Other: " + obj;
    };
}

// Sealed class exhaustive matching (no default needed)
double area(Shape shape) {
    return switch (shape) {
        case Circle c    -> Math.PI * c.radius() * c.radius();
        case Rectangle r -> r.width() * r.height();
        case Triangle t  -> computeTriangleArea(t);
    };  // compiler ensures all permitted types are covered
}

// Guarded patterns
String classify(Object obj) {
    return switch (obj) {
        case Integer i when i < 0  -> "negative";
        case Integer i when i == 0 -> "zero";
        case Integer i             -> "positive";
        case String s when s.isBlank() -> "blank string";
        case String s              -> "string: " + s;
        case null, default         -> "other";
    };
}

// Record deconstruction (Java 21+)
record Point(int x, int y) { }

String describePoint(Object obj) {
    return switch (obj) {
        case Point(int x, int y) when x == 0 && y == 0 -> "origin";
        case Point(int x, int y) when y == 0 -> "on x-axis at " + x;
        case Point(int x, int y) -> "(%d, %d)".formatted(x, y);
        default -> "not a point";
    };
}
```

---

## 4. Text Blocks (Java 15+)

```java
// Multi-line string with indentation handling
String json = """
        {
            "name": "Alice",
            "age": 30,
            "roles": ["admin", "user"]
        }
        """;

// Trailing whitespace is stripped — use \s to preserve
String table = """
        Name   \s
        Alice  \s
        Bob    \s
        """;

// No newline at end — use \ at end of line
String single = """
        This is one \
        long line""";
// → "This is one long line"

// Formatting
String query = """
        SELECT *
        FROM users
        WHERE name = '%s'
        AND age > %d
        """.formatted(name, minAge);
```

---

## 5. Switch Expressions (Java 14+)

```java
// Arrow syntax — no fall-through, returns value
int numDays = switch (month) {
    case JANUARY, MARCH, MAY, JULY, AUGUST, OCTOBER, DECEMBER -> 31;
    case APRIL, JUNE, SEPTEMBER, NOVEMBER -> 30;
    case FEBRUARY -> isLeapYear ? 29 : 28;
};

// Block with yield
String message = switch (status) {
    case SUCCESS -> "Done!";
    case PENDING -> {
        log.info("Still waiting...");
        yield "Please wait";
    }
    case ERROR -> throw new RuntimeException("Failed");
};
```

---

## 6. `var` — Local Variable Type Inference (Java 10+)

```java
// Inferred types
var list = new ArrayList<String>();        // ArrayList<String>
var map = Map.of("key", 1);               // Map<String, Integer>
var stream = list.stream();               // Stream<String>
var entry = map.entrySet().iterator().next();

// Good use cases
var reader = new BufferedReader(new InputStreamReader(System.in));
var response = httpClient.send(request, BodyHandlers.ofString());

// Bad use cases — type not obvious
var result = service.process(input);       // what type is this?
var x = 0;                                 // primitive int, but unclear intent

// Cannot use with:
// var x;                  // no initializer
// var x = null;           // ambiguous
// var x = () -> "hi";     // lambda needs target type
// Fields, parameters, or return types
```

---

## 7. Helpful NullPointerException (Java 14+)

```java
// Before: "NullPointerException" with no detail
user.getAddress().getCity().toUpperCase();

// After: detailed message
// java.lang.NullPointerException:
//   Cannot invoke "Address.getCity()" because the return value of
//   "User.getAddress()" is null
```

---

## 8. Other Notable Features

### Compact Number Formatting (Java 12+)

```java
var fmt = NumberFormat.getCompactNumberInstance(Locale.US, NumberFormat.Style.SHORT);
fmt.format(1_000);      // "1K"
fmt.format(1_000_000);  // "1M"
```

### Stream Enhancements

```java
// toList() — Java 16+
List<String> list = stream.toList();     // unmodifiable

// mapMulti — Java 16+
stream.mapMulti((item, consumer) -> {
    if (item.isValid()) {
        consumer.accept(item.transform());
    }
});

// Gatherers — Java 22+
// stream.gather(Gatherers.windowFixed(3))
```

### String Enhancements

```java
"  hello  ".strip();             // "hello" (Java 11)
"  hello  ".stripLeading();      // "hello  " (Java 11)
"hello".repeat(3);               // "hellohellohello" (Java 11)
"hello\nworld".lines();          // Stream<String> (Java 11)
"  ".isBlank();                  // true (Java 11)
"hello".indent(4);               // "    hello\n" (Java 12)
"hello".transform(s -> s.toUpperCase()); // "HELLO" (Java 12)
```

---

## 9. Migration Tips

```
Java 8  → Java 11: var, List.of, String.strip/isBlank/repeat, HttpClient
Java 11 → Java 17: records, sealed classes, pattern matching instanceof, text blocks, switch expressions
Java 17 → Java 21: virtual threads, pattern matching switch, record deconstruction, sequenced collections
```

---

## 10. Anti-Patterns

```java
// ✗ Using records for mutable entities
public record MutableUser(Long id, String name) { }  // no setters possible

// ✓ Use records for DTOs, value objects, and data carriers
// ✓ Use classes for mutable domain entities

// ✗ Overusing var — hides intent
var x = getValue();                  // unclear type

// ✓ Use var when the type is obvious from the right-hand side
var users = new ArrayList<User>();   // type is clear

// ✗ Not using sealed classes for known hierarchies
public interface Shape { }          // anyone can implement

// ✓ Seal when the set of implementations is fixed
public sealed interface Shape permits Circle, Rectangle, Triangle { }
```
