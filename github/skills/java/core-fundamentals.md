---
name: java-core-fundamentals
description: "Java core fundamentals — primitive types, wrapper classes, operators, control flow, scope, strings, arrays, and type casting. Use when: explaining Java type system; debugging variable scope; understanding primitives vs wrappers; working with operators and control flow. DO NOT USE FOR: OOP design (use java-oop); collections (use java-collections); generics (use java-generics)."
---

# Java Core Fundamentals

## 1. Primitive Types

```java
// 8 primitive types
byte    b = 127;              // 8-bit  [-128, 127]
short   s = 32767;            // 16-bit [-32768, 32767]
int     i = 2_147_483_647;    // 32-bit (use _ for readability)
long    l = 9_223_372_036_854_775_807L;  // 64-bit (suffix L)
float   f = 3.14f;            // 32-bit IEEE 754 (suffix f)
double  d = 3.141592653589793; // 64-bit IEEE 754
boolean active = true;         // true or false
char    c = 'A';              // 16-bit Unicode character
```

### Wrapper Classes (Autoboxing)

```java
Integer boxed = 42;           // autoboxing: int → Integer
int unboxed = boxed;          // unboxing: Integer → int

// ⚠️ Pitfall: null unboxing throws NullPointerException
Integer nullable = null;
int value = nullable;         // NullPointerException!

// ⚠️ Pitfall: == on wrappers checks identity, not value
Integer a = 200;
Integer b = 200;
a == b;                       // false (different objects for values > 127)
a.equals(b);                  // true (correct way)

// Integer cache: -128 to 127 are cached
Integer x = 100;
Integer y = 100;
x == y;                       // true (cached)
```

### Type Conversions

```java
// Widening (implicit) — no data loss
int i = 42;
long l = i;                   // int → long
double d = i;                 // int → double

// Narrowing (explicit) — possible data loss
double pi = 3.14;
int truncated = (int) pi;    // 3 (decimal lost)
long big = 100_000_000_000L;
int overflow = (int) big;     // overflows silently

// String conversions
String s = String.valueOf(42);
int parsed = Integer.parseInt("42");
double pd = Double.parseDouble("3.14");
```

---

## 2. Variables and Scope

```java
public class Example {
    // Instance variable — belongs to object
    private int instanceVar = 10;

    // Class/static variable — belongs to class
    private static int classVar = 20;

    public void method() {
        // Local variable — must be initialized before use
        int localVar = 30;

        // Effectively final (required for lambda capture)
        int captured = 42;
        Runnable r = () -> System.out.println(captured);
        // captured = 43;  // Error: captured must be effectively final
    }
}
```

### `var` (Local Variable Type Inference, Java 10+)

```java
var list = new ArrayList<String>();   // inferred: ArrayList<String>
var map = Map.of("key", "value");     // inferred: Map<String, String>
var count = 0;                        // inferred: int

// ✗ Cannot use var for
// var field = 10;        // fields
// var param             // method parameters
// var result = null;    // null (ambiguous type)
```

---

## 3. Operators

### Arithmetic

```java
10 + 3      // 13
10 - 3      // 7
10 * 3      // 30
10 / 3      // 3 (integer division)
10.0 / 3    // 3.333... (floating-point division)
10 % 3      // 1 (modulo)
```

### Comparison

```java
a == b      // equality (primitives: value; objects: reference)
a != b      // inequality
a.equals(b) // object value equality (always use for objects)
a < b       // less than
a instanceof Type  // type check
```

### Logical

```java
a && b      // short-circuit AND
a || b      // short-circuit OR
!a          // negation
a & b       // non-short-circuit AND (evaluates both sides)
a | b       // non-short-circuit OR
a ^ b       // XOR
```

### Ternary

```java
String status = score >= 60 ? "pass" : "fail";
```

---

## 4. Control Flow

### Conditionals

```java
if (score >= 90) {
    grade = "A";
} else if (score >= 80) {
    grade = "B";
} else {
    grade = "F";
}
```

### Switch (Classic)

```java
switch (day) {
    case MONDAY:
    case FRIDAY:
        System.out.println("Work hard");
        break;
    case SATURDAY:
    case SUNDAY:
        System.out.println("Rest");
        break;
    default:
        System.out.println("Midweek");
}
```

### Switch Expressions (Java 14+)

```java
String result = switch (day) {
    case MONDAY, FRIDAY -> "Work hard";
    case SATURDAY, SUNDAY -> "Rest";
    default -> "Midweek";
};

// Multi-line with yield
int numLetters = switch (day) {
    case MONDAY, FRIDAY, SUNDAY -> 6;
    case TUESDAY -> 7;
    default -> {
        String s = day.toString();
        yield s.length();
    }
};
```

### Loops

```java
// for loop
for (int i = 0; i < items.size(); i++) {
    process(items.get(i));
}

// enhanced for-each
for (String item : items) {
    process(item);
}

// while
while (condition) {
    doSomething();
}

// do-while (executes at least once)
do {
    result = attempt();
} while (!result.isSuccess());

// labeled break
outer:
for (int i = 0; i < rows; i++) {
    for (int j = 0; j < cols; j++) {
        if (matrix[i][j] == target) {
            found = true;
            break outer;
        }
    }
}
```

---

## 5. Strings

```java
// String is immutable
String s = "hello";
String upper = s.toUpperCase();   // "HELLO" — s is still "hello"

// Common methods
s.length();                        // 5
s.charAt(0);                       // 'h'
s.substring(1, 3);                 // "el"
s.contains("ell");                 // true
s.startsWith("he");                // true
s.indexOf("l");                    // 2
s.replace("l", "r");              // "herro"
s.trim();                          // removes leading/trailing whitespace
s.strip();                         // Unicode-aware trim (Java 11+)
s.isBlank();                       // true for whitespace-only (Java 11+)
s.repeat(3);                       // "hellohellohello" (Java 11+)

// String formatting
String.format("Hello, %s! Age: %d", name, age);
"Hello, %s!".formatted(name);     // Java 15+

// Text blocks (Java 15+)
String json = """
        {
            "name": "%s",
            "age": %d
        }
        """.formatted(name, age);

// StringBuilder for concatenation in loops
var sb = new StringBuilder();
for (String item : items) {
    sb.append(item).append(", ");
}
String result = sb.toString();

// String.join
String csv = String.join(", ", items);
```

---

## 6. Arrays

```java
// Declaration and initialization
int[] numbers = new int[5];           // [0, 0, 0, 0, 0]
int[] primes = {2, 3, 5, 7, 11};
String[] names = new String[]{"Alice", "Bob"};

// Access
int first = primes[0];               // 2
primes.length;                        // 5

// Multi-dimensional
int[][] matrix = {
    {1, 2, 3},
    {4, 5, 6},
    {7, 8, 9}
};

// Arrays utility class
Arrays.sort(numbers);
Arrays.fill(numbers, 0);
int idx = Arrays.binarySearch(primes, 5);
int[] copy = Arrays.copyOf(primes, 10);
boolean eq = Arrays.equals(a, b);
String str = Arrays.toString(primes); // "[2, 3, 5, 7, 11]"
```

---

## 7. Anti-Patterns

```java
// ✗ Using == for String comparison
if (name == "admin")             // compares references

// ✓ Use equals
if ("admin".equals(name))        // null-safe (constant first)

// ✗ Comparing wrapper types with ==
if (count == Integer.valueOf(5)) // identity check

// ✓ Use equals or unbox
if (count.equals(5))
if (count.intValue() == 5)

// ✗ Concatenating strings in loops
String result = "";
for (String s : items) {
    result += s;                 // O(n²) — creates new String each time
}

// ✓ Use StringBuilder
var sb = new StringBuilder();
for (String s : items) {
    sb.append(s);
}

// ✗ Catching generic Exception
catch (Exception e) { }

// ✓ Catch specific exceptions
catch (IOException | ParseException e) { }

// ✗ Ignoring return value of immutable operations
name.trim();                      // does nothing — String is immutable

// ✓ Assign the result
name = name.trim();
```
