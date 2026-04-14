---
name: java-generics
description: "Java generics — generic classes, methods, bounded types, wildcards, type erasure, and generic patterns. Use when: writing type-safe reusable code; constraining generic parameters; understanding wildcards and bounds; dealing with type erasure. DO NOT USE FOR: collections usage (use java-collections); basic types (use java-core-fundamentals)."
---

# Java Generics

## 1. Generic Classes

```java
public class Box<T> {
    private T value;

    public Box(T value) { this.value = value; }
    public T getValue() { return value; }
    public void setValue(T value) { this.value = value; }
}

// Usage — type is inferred (diamond operator)
Box<String> stringBox = new Box<>("hello");
Box<Integer> intBox = new Box<>(42);

// Multiple type parameters
public class Pair<K, V> {
    private final K key;
    private final V value;

    public Pair(K key, V value) {
        this.key = key;
        this.value = value;
    }

    public K getKey() { return key; }
    public V getValue() { return value; }
}
```

---

## 2. Generic Methods

```java
public class Utils {
    // Type parameter declared before return type
    public static <T> List<T> listOf(T... items) {
        return Arrays.asList(items);
    }

    public static <T extends Comparable<T>> T max(T a, T b) {
        return a.compareTo(b) >= 0 ? a : b;
    }

    // Multiple type parameters
    public static <K, V> Map<K, V> mapOf(K key, V value) {
        return Map.of(key, value);
    }
}

// Type inference at call site
List<String> names = Utils.listOf("Alice", "Bob");
String maxName = Utils.max("Alice", "Bob");  // "Bob"
```

---

## 3. Bounded Types

### Upper Bound (`extends`)

```java
// T must be Number or subclass of Number
public static <T extends Number> double sum(List<T> numbers) {
    return numbers.stream().mapToDouble(Number::doubleValue).sum();
}

sum(List.of(1, 2, 3));       // works: Integer extends Number
sum(List.of(1.5, 2.5));      // works: Double extends Number
sum(List.of("a", "b"));      // compile error: String doesn't extend Number
```

### Multiple Bounds

```java
// T must extend Comparable AND be Serializable
public static <T extends Comparable<T> & Serializable> T max(List<T> list) {
    return list.stream().max(Comparable::compareTo).orElseThrow();
}
// Note: class bound must come first, then interfaces
```

---

## 4. Wildcards

### Upper-bounded Wildcard (`? extends T`) — Read-Only

```java
// Can read as Number, but cannot add (except null)
public static double sum(List<? extends Number> numbers) {
    double total = 0;
    for (Number n : numbers) {
        total += n.doubleValue();
    }
    return total;
}

sum(List.of(1, 2, 3));       // List<Integer> — OK
sum(List.of(1.5, 2.5));      // List<Double> — OK
```

### Lower-bounded Wildcard (`? super T`) — Write-Only

```java
// Can add Integer and subtypes, but reads come back as Object
public static void addNumbers(List<? super Integer> list) {
    list.add(1);
    list.add(2);
    list.add(3);
}

addNumbers(new ArrayList<Integer>());  // OK
addNumbers(new ArrayList<Number>());   // OK
addNumbers(new ArrayList<Object>());   // OK
```

### PECS: Producer Extends, Consumer Super

```java
// Producer (reads from source) → extends
// Consumer (writes to dest) → super
public static <T> void copy(List<? extends T> source, List<? super T> dest) {
    for (T item : source) {
        dest.add(item);
    }
}
```

### Unbounded Wildcard (`?`)

```java
// When you only need Object methods
public static void printAll(List<?> list) {
    for (Object item : list) {
        System.out.println(item);
    }
}
```

---

## 5. Type Erasure

```java
// At compile time:
List<String> strings = new ArrayList<>();
List<Integer> ints = new ArrayList<>();

// At runtime (after erasure):
// Both are just ArrayList — generic types are removed
strings.getClass() == ints.getClass();  // true

// Consequences:
// ✗ Cannot create generic arrays
// T[] array = new T[10];              // compile error

// ✗ Cannot use instanceof with generic types
// if (obj instanceof List<String>)    // compile error

// ✓ Use unbounded wildcard
if (obj instanceof List<?> list) {
    // OK — but elements are Object
}

// ✗ Cannot create instances of type parameters
// T item = new T();                   // compile error

// ✓ Use Supplier or Class token
public static <T> T create(Supplier<T> factory) {
    return factory.get();
}
```

---

## 6. Generic Interfaces

```java
public interface Repository<T, ID> {
    Optional<T> findById(ID id);
    List<T> findAll();
    T save(T entity);
    void deleteById(ID id);
}

// Concrete implementation fixes the type parameters
public class UserRepository implements Repository<User, Long> {
    @Override
    public Optional<User> findById(Long id) { /* ... */ }

    @Override
    public List<User> findAll() { /* ... */ }

    @Override
    public User save(User entity) { /* ... */ }

    @Override
    public void deleteById(Long id) { /* ... */ }
}
```

---

## 7. Recursive Type Bounds

```java
// T must be comparable to itself
public interface Comparable<T> {
    int compareTo(T other);
}

// Self-referential generic (fluent builder pattern)
public abstract class Builder<T extends Builder<T>> {
    protected String name;

    @SuppressWarnings("unchecked")
    protected T self() { return (T) this; }

    public T name(String name) {
        this.name = name;
        return self();
    }
}

public class UserBuilder extends Builder<UserBuilder> {
    private String email;

    public UserBuilder email(String email) {
        this.email = email;
        return self();
    }

    public User build() { return new User(name, email); }
}

// Fluent chain works with correct return type
User user = new UserBuilder().name("Alice").email("alice@example.com").build();
```

---

## 8. Best Practices

- **Use bounded types** to restrict what types are accepted — `<T extends Comparable<T>>` not just `<T>`
- **Follow PECS** — Producer `extends`, Consumer `super`
- **Prefer generic methods** over raw types — never use `List` without type parameter
- **Avoid raw types** — `List` instead of `List<Object>` loses all type safety
- **Use `@SuppressWarnings("unchecked")`** only when you have verified type safety, and scope it narrowly
- **Name type parameters** conventionally: `T` (type), `E` (element), `K` (key), `V` (value), `R` (return)

---

## 9. Anti-Patterns

```java
// ✗ Raw types — loses type safety
List rawList = new ArrayList();
rawList.add("hello");
rawList.add(42);              // no compile error, ClassCastException at runtime

// ✓ Always parameterize
List<String> typedList = new ArrayList<>();

// ✗ Unnecessary wildcards in return types
public List<? extends Number> getNumbers() { }  // caller can't add

// ✓ Use concrete type in return
public List<Number> getNumbers() { }

// ✗ Overusing Object instead of generics
public Object transform(Object input) { }

// ✓ Use generics
public <T, R> R transform(T input, Function<T, R> mapper) { }
```
