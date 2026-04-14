---
name: java-oop
description: "Java object-oriented programming — classes, interfaces, abstract classes, inheritance, composition, encapsulation, polymorphism, design patterns, SOLID principles, and sealed classes. Use when: designing class hierarchies; choosing composition vs inheritance; implementing design patterns; applying SOLID principles. DO NOT USE FOR: generics (use java-generics); collections (use java-collections); modern Java syntax (use java-modern-java)."
---

# Java OOP

## 1. Classes

```java
public class User {
    // Fields (prefer private + final)
    private final Long id;
    private final String name;
    private String email;

    // Constructor
    public User(Long id, String name, String email) {
        this.id = id;
        this.name = name;
        this.email = email;
    }

    // Getters
    public Long getId() { return id; }
    public String getName() { return name; }
    public String getEmail() { return email; }

    // Setter (only for mutable fields)
    public void setEmail(String email) { this.email = email; }

    // equals, hashCode, toString
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof User user)) return false;
        return Objects.equals(id, user.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return "User{id=%d, name='%s', email='%s'}".formatted(id, name, email);
    }
}
```

---

## 2. Interfaces

```java
// Define contracts
public interface UserRepository {
    Optional<User> findById(Long id);
    List<User> findAll();
    User save(User user);
    void deleteById(Long id);
}

// Default methods (Java 8+)
public interface Loggable {
    default void log(String message) {
        System.out.println("[%s] %s".formatted(getClass().getSimpleName(), message));
    }
}

// Static methods
public interface Validator<T> {
    boolean isValid(T value);

    static <T> Validator<T> combine(Validator<T>... validators) {
        return value -> Arrays.stream(validators).allMatch(v -> v.isValid(value));
    }
}

// Private methods (Java 9+)
public interface DataProcessor {
    default void processAll(List<String> items) {
        items.forEach(this::processItem);
    }

    private void processItem(String item) {
        // shared logic between default methods
    }
}
```

---

## 3. Abstract Classes

```java
// Use when shared state or partial implementation is needed
public abstract class AbstractRepository<T> {
    protected final DataSource dataSource;

    protected AbstractRepository(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    // Template method
    public T findById(Long id) {
        try (var conn = dataSource.getConnection()) {
            return mapRow(executeQuery(conn, id));
        } catch (SQLException e) {
            throw new RepositoryException("Failed to find entity: " + id, e);
        }
    }

    // Subclasses must implement
    protected abstract T mapRow(ResultSet rs) throws SQLException;
    protected abstract String tableName();
}
```

### Interface vs Abstract Class

| Feature          | Interface            | Abstract Class         |
| ---------------- | -------------------- | ---------------------- |
| Multiple inherit | Yes                  | No                     |
| State (fields)   | Constants only       | Yes                    |
| Constructors     | No                   | Yes                    |
| Access modifiers | Public (default/pvt) | Any                    |
| Use when         | Defining contracts   | Sharing implementation |

---

## 4. Inheritance

```java
// ✓ Use inheritance for is-a relationships
public class SavingsAccount extends Account {
    private double interestRate;

    public SavingsAccount(String owner, double balance, double interestRate) {
        super(owner, balance);
        this.interestRate = interestRate;
    }

    @Override
    public void applyMonthlyFee() {
        // Savings accounts earn interest instead
        deposit(getBalance() * interestRate / 12);
    }
}
```

### Rules

- Always use `@Override` annotation
- Call `super()` explicitly when parent has no default constructor
- Prefer `final` classes unless designed for extension
- Follow Liskov Substitution Principle — subtypes must be substitutable

---

## 5. Composition Over Inheritance

```java
// ✗ Inheritance for code reuse (fragile base class problem)
public class LoggingList<E> extends ArrayList<E> {
    @Override
    public boolean add(E e) {
        log("Adding: " + e);
        return super.add(e);    // breaks if ArrayList internals change
    }
}

// ✓ Composition — wrap and delegate
public class LoggingList<E> implements List<E> {
    private final List<E> delegate;
    private final Logger logger;

    public LoggingList(List<E> delegate, Logger logger) {
        this.delegate = delegate;
        this.logger = logger;
    }

    @Override
    public boolean add(E e) {
        logger.info("Adding: {}", e);
        return delegate.add(e);
    }

    // Delegate remaining methods...
}
```

---

## 6. Encapsulation

```java
public class BankAccount {
    private double balance;   // hidden state

    public BankAccount(double initialBalance) {
        if (initialBalance < 0) {
            throw new IllegalArgumentException("Initial balance cannot be negative");
        }
        this.balance = initialBalance;
    }

    // Controlled access
    public double getBalance() {
        return balance;
    }

    public void deposit(double amount) {
        if (amount <= 0) throw new IllegalArgumentException("Amount must be positive");
        balance += amount;
    }

    public void withdraw(double amount) {
        if (amount <= 0) throw new IllegalArgumentException("Amount must be positive");
        if (amount > balance) throw new InsufficientFundsException(balance, amount);
        balance -= amount;
    }
}
```

---

## 7. Polymorphism

```java
// Runtime polymorphism (method overriding)
public interface Shape {
    double area();
    double perimeter();
}

public class Circle implements Shape {
    private final double radius;

    public Circle(double radius) { this.radius = radius; }

    @Override
    public double area() { return Math.PI * radius * radius; }

    @Override
    public double perimeter() { return 2 * Math.PI * radius; }
}

public class Rectangle implements Shape {
    private final double width, height;

    public Rectangle(double width, double height) {
        this.width = width;
        this.height = height;
    }

    @Override
    public double area() { return width * height; }

    @Override
    public double perimeter() { return 2 * (width + height); }
}

// Use via interface
List<Shape> shapes = List.of(new Circle(5), new Rectangle(3, 4));
double totalArea = shapes.stream().mapToDouble(Shape::area).sum();
```

---

## 8. SOLID Principles

### Single Responsibility

```java
// ✗ One class doing too much
public class UserService {
    public void createUser() { }
    public void sendEmail() { }     // not user management
    public void generateReport() { } // not user management
}

// ✓ Separate concerns
public class UserService { public void createUser() { } }
public class EmailService { public void sendEmail() { } }
public class ReportService { public void generateReport() { } }
```

### Open/Closed

```java
// Open for extension, closed for modification
public interface DiscountStrategy {
    double apply(double price);
}

public class PercentageDiscount implements DiscountStrategy {
    private final double percentage;
    public PercentageDiscount(double percentage) { this.percentage = percentage; }
    @Override
    public double apply(double price) { return price * (1 - percentage / 100); }
}

// Add new discounts without modifying existing code
public class BuyOneGetOneFreeDiscount implements DiscountStrategy {
    @Override
    public double apply(double price) { return price / 2; }
}
```

### Dependency Inversion

```java
// ✓ Depend on abstractions, not concrete classes
public class OrderService {
    private final PaymentGateway paymentGateway;  // interface, not implementation
    private final NotificationService notifier;    // interface

    public OrderService(PaymentGateway paymentGateway, NotificationService notifier) {
        this.paymentGateway = paymentGateway;
        this.notifier = notifier;
    }
}
```

---

## 9. Common Design Patterns

### Builder

```java
public class HttpRequest {
    private final String url;
    private final String method;
    private final Map<String, String> headers;
    private final String body;

    private HttpRequest(Builder builder) {
        this.url = builder.url;
        this.method = builder.method;
        this.headers = Map.copyOf(builder.headers);
        this.body = builder.body;
    }

    public static class Builder {
        private final String url;
        private String method = "GET";
        private final Map<String, String> headers = new LinkedHashMap<>();
        private String body;

        public Builder(String url) { this.url = url; }
        public Builder method(String method) { this.method = method; return this; }
        public Builder header(String key, String value) { headers.put(key, value); return this; }
        public Builder body(String body) { this.body = body; return this; }
        public HttpRequest build() { return new HttpRequest(this); }
    }
}

// Usage
var request = new HttpRequest.Builder("https://api.example.com/users")
        .method("POST")
        .header("Content-Type", "application/json")
        .body("{\"name\": \"Alice\"}")
        .build();
```

### Strategy

```java
public interface SortStrategy<T> {
    void sort(List<T> list);
}

public class DataProcessor<T> {
    private SortStrategy<T> sortStrategy;

    public void setSortStrategy(SortStrategy<T> strategy) {
        this.sortStrategy = strategy;
    }

    public void process(List<T> data) {
        sortStrategy.sort(data);
        // ... further processing
    }
}
```

---

## 10. Anti-Patterns

```java
// ✗ God class — does everything
public class ApplicationManager {
    public void handleUser() { }
    public void processOrder() { }
    public void sendNotification() { }
    public void generateInvoice() { }
}

// ✗ Deep inheritance hierarchies
class A { }
class B extends A { }
class C extends B { }
class D extends C { }    // 4 levels — too deep

// ✗ Empty interface (marker interface)
// Use annotations instead
public interface Serializable { }   // Java's own is an exception, don't repeat

// ✗ Mutable static state
public class Config {
    public static String dbUrl = "...";   // globally mutable — thread-unsafe
}

// ✓ Use immutable configuration objects or dependency injection
```
