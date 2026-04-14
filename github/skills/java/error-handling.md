---
name: java-error-handling
description: "Java error handling — checked vs unchecked exceptions, try-catch-finally, try-with-resources, custom exceptions, exception chaining, multi-catch, and exception design patterns. Use when: implementing error handling; creating custom exceptions; using try-with-resources; designing exception hierarchies. DO NOT USE FOR: basic control flow (use java-core-fundamentals)."
---

# Java Error Handling

## 1. Exception Hierarchy

```
Throwable
├── Error                     — JVM errors (don't catch)
│   ├── OutOfMemoryError
│   ├── StackOverflowError
│   └── VirtualMachineError
└── Exception                 — recoverable errors
    ├── IOException           — checked
    ├── SQLException          — checked
    ├── ParseException        — checked
    └── RuntimeException      — unchecked
        ├── NullPointerException
        ├── IllegalArgumentException
        ├── IllegalStateException
        ├── IndexOutOfBoundsException
        ├── UnsupportedOperationException
        └── ConcurrentModificationException
```

### Checked vs Unchecked

| Aspect       | Checked                   | Unchecked (Runtime)     |
| ------------ | ------------------------- | ----------------------- |
| Must declare | Yes (`throws`)            | No                      |
| Must catch   | Yes (or propagate)        | No                      |
| Use for      | Recoverable conditions    | Programming errors      |
| Examples     | IOException, SQLException | NPE, IllegalArgumentExc |

---

## 2. Try-Catch-Finally

```java
try {
    String content = Files.readString(Path.of("config.json"));
    Config config = parseConfig(content);
} catch (NoSuchFileException e) {
    // Specific exception first
    log.warn("Config file not found, using defaults");
    config = Config.defaults();
} catch (IOException e) {
    // Broader exception after
    throw new ConfigException("Failed to read config", e);
} finally {
    // Always runs (cleanup)
    cleanup();
}
```

### Multi-catch (Java 7+)

```java
try {
    processData(input);
} catch (IOException | ParseException e) {
    // Handle both the same way — e is effectively final
    log.error("Processing failed: {}", e.getMessage());
    throw new ProcessingException("Failed to process input", e);
}
```

---

## 3. Try-With-Resources (Java 7+)

```java
// AutoCloseable resources are automatically closed
try (var reader = new BufferedReader(new FileReader("data.txt"));
     var writer = new BufferedWriter(new FileWriter("output.txt"))) {
    String line;
    while ((line = reader.readLine()) != null) {
        writer.write(line.toUpperCase());
        writer.newLine();
    }
} catch (IOException e) {
    log.error("File processing failed", e);
}
// reader and writer are closed even if an exception occurs

// Effectively final variables (Java 9+)
BufferedReader reader = new BufferedReader(new FileReader("data.txt"));
try (reader) {  // no need to redeclare
    return reader.readLine();
}

// Custom AutoCloseable
public class DatabaseConnection implements AutoCloseable {
    private final Connection connection;

    public DatabaseConnection(String url) throws SQLException {
        this.connection = DriverManager.getConnection(url);
    }

    @Override
    public void close() throws SQLException {
        if (connection != null && !connection.isClosed()) {
            connection.close();
        }
    }
}
```

---

## 4. Custom Exceptions

```java
// Unchecked (extends RuntimeException) — for programming errors
public class EntityNotFoundException extends RuntimeException {
    private final String entityType;
    private final Object entityId;

    public EntityNotFoundException(String entityType, Object entityId) {
        super("%s not found with id: %s".formatted(entityType, entityId));
        this.entityType = entityType;
        this.entityId = entityId;
    }

    public String getEntityType() { return entityType; }
    public Object getEntityId() { return entityId; }
}

// Checked (extends Exception) — for recoverable conditions
public class InsufficientFundsException extends Exception {
    private final double balance;
    private final double amount;

    public InsufficientFundsException(double balance, double amount) {
        super("Insufficient funds: balance=%.2f, requested=%.2f".formatted(balance, amount));
        this.balance = balance;
        this.amount = amount;
    }

    public double getBalance() { return balance; }
    public double getAmount() { return amount; }
}

// Usage
public User findById(Long id) {
    return userRepository.findById(id)
        .orElseThrow(() -> new EntityNotFoundException("User", id));
}
```

---

## 5. Exception Chaining

```java
// Wrap lower-level exceptions to preserve the cause chain
try {
    return objectMapper.readValue(json, User.class);
} catch (JsonProcessingException e) {
    // Wrap in domain exception — root cause preserved in chain
    throw new DeserializationException("Failed to deserialize User from JSON", e);
}

// Access the chain
catch (DeserializationException e) {
    Throwable root = e.getCause();        // JsonProcessingException
    log.error("Root cause: {}", root.getMessage());
}
```

---

## 6. Exception Design Patterns

### Domain Exception Hierarchy

```java
// Base domain exception
public abstract class DomainException extends RuntimeException {
    private final String errorCode;

    protected DomainException(String errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
    }

    protected DomainException(String errorCode, String message, Throwable cause) {
        super(message, cause);
        this.errorCode = errorCode;
    }

    public String getErrorCode() { return errorCode; }
}

// Specific exceptions
public class EntityNotFoundException extends DomainException {
    public EntityNotFoundException(String entity, Object id) {
        super("NOT_FOUND", "%s not found: %s".formatted(entity, id));
    }
}

public class BusinessRuleViolationException extends DomainException {
    public BusinessRuleViolationException(String rule) {
        super("BUSINESS_RULE_VIOLATION", "Business rule violated: " + rule);
    }
}

public class ConflictException extends DomainException {
    public ConflictException(String message) {
        super("CONFLICT", message);
    }
}
```

### Guard Clauses (Validate Early)

```java
public void transferMoney(Account from, Account to, double amount) {
    // Validate at the boundary
    Objects.requireNonNull(from, "Source account must not be null");
    Objects.requireNonNull(to, "Target account must not be null");
    if (amount <= 0) {
        throw new IllegalArgumentException("Amount must be positive: " + amount);
    }
    if (from.equals(to)) {
        throw new IllegalArgumentException("Cannot transfer to the same account");
    }
    if (from.getBalance() < amount) {
        throw new InsufficientFundsException(from.getBalance(), amount);
    }

    // Business logic — no more validation needed
    from.debit(amount);
    to.credit(amount);
}
```

---

## 7. Suppressed Exceptions

```java
// Try-with-resources captures suppressed exceptions
try (var resource = new MyResource()) {
    resource.doWork();     // throws WorkException
}
// If close() also throws, it's added as suppressed

// Access suppressed exceptions
catch (WorkException e) {
    Throwable[] suppressed = e.getSuppressed();
    for (Throwable s : suppressed) {
        log.warn("Suppressed: {}", s.getMessage());
    }
}

// Manually add suppressed exceptions
public void processBatch(List<Item> items) {
    Exception primary = null;
    for (Item item : items) {
        try {
            process(item);
        } catch (Exception e) {
            if (primary == null) {
                primary = e;
            } else {
                primary.addSuppressed(e);
            }
        }
    }
    if (primary != null) throw new BatchProcessingException(primary);
}
```

---

## 8. Anti-Patterns

```java
// ✗ Catching and ignoring (swallowing exceptions)
try {
    riskyOperation();
} catch (Exception e) {
    // empty — the error silently disappears
}

// ✓ At minimum, log it
catch (Exception e) {
    log.error("Operation failed", e);
}

// ✗ Catching generic Exception everywhere
catch (Exception e) { }

// ✓ Catch specific exceptions
catch (IOException | ParseException e) { }

// ✗ Using exceptions for control flow
try {
    int value = Integer.parseInt(input);
} catch (NumberFormatException e) {
    // expected case — slow
}

// ✓ Validate before parsing
if (input.matches("-?\\d+")) {
    int value = Integer.parseInt(input);
}

// ✗ Losing the original cause
catch (IOException e) {
    throw new ServiceException("Failed");        // cause lost!
}

// ✓ Chain the cause
catch (IOException e) {
    throw new ServiceException("Failed", e);     // cause preserved
}

// ✗ Throwing in finally — overwrites original exception
finally {
    connection.close();  // if this throws, original exception is lost
}

// ✓ Use try-with-resources instead

// ✗ Using checked exceptions for unrecoverable errors
public void validate(String input) throws ValidationException { }

// ✓ Use unchecked for things the caller can't reasonably recover from
public void validate(String input) {
    if (input == null) throw new IllegalArgumentException("Input required");
}

// ✗ Logging and rethrowing (double-logging)
catch (IOException e) {
    log.error("Failed", e);
    throw e;                    // will be logged again at the catch boundary
}

// ✓ Either log OR rethrow, not both
catch (IOException e) {
    throw new ServiceException("Failed to read data", e);
}
```
