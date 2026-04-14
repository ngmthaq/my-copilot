---
name: cpp-error-handling
description: "C++ error handling — exceptions, try/catch/throw, exception safety guarantees (basic, strong, nothrow), noexcept, RAII for cleanup, custom exception classes, std::optional, std::expected (C++23), and error propagation patterns. Use when: implementing exception handling; noexcept specifications; exception safety guarantees; RAII cleanup; custom exceptions; std::optional for nullable values; std::expected for error-or-value. DO NOT USE FOR: RAII ownership patterns (use cpp-memory-management); C-style errno (use c-error-handling)."
---

# C++ Error Handling

## 1. Exceptions

### Basic try/catch/throw

```cpp
#include <stdexcept>
#include <iostream>

double divide(double a, double b) {
    if (b == 0.0) {
        throw std::invalid_argument("Division by zero");
    }
    return a / b;
}

void example() {
    try {
        double result = divide(10.0, 0.0);
        std::cout << result << '\n';
    } catch (const std::invalid_argument& e) {
        std::cerr << "Invalid argument: " << e.what() << '\n';
    } catch (const std::exception& e) {
        std::cerr << "Error: " << e.what() << '\n';
    } catch (...) {
        std::cerr << "Unknown error\n";
    }
}
```

### Standard Exception Hierarchy

```cpp
// std::exception (base)
//   ├── std::logic_error
//   │   ├── std::invalid_argument
//   │   ├── std::domain_error
//   │   ├── std::length_error
//   │   ├── std::out_of_range
//   │   └── std::future_error
//   └── std::runtime_error
//       ├── std::range_error
//       ├── std::overflow_error
//       ├── std::underflow_error
//       └── std::system_error

// Use logic_error for programmer mistakes (precondition violations)
throw std::invalid_argument("Negative size not allowed");
throw std::out_of_range("Index " + std::to_string(i) + " out of range");

// Use runtime_error for external failures
throw std::runtime_error("Database connection failed");
throw std::system_error(errno, std::generic_category(), "open()");
```

### Custom Exceptions

```cpp
class AppError : public std::runtime_error {
public:
    enum class Code { NotFound, Unauthorized, Timeout, Internal };

    AppError(Code code, const std::string& message)
        : std::runtime_error(message), code_(code) {}

    [[nodiscard]] Code code() const noexcept { return code_; }

private:
    Code code_;
};

class NotFoundError : public AppError {
public:
    explicit NotFoundError(const std::string& resource)
        : AppError(Code::NotFound, "Not found: " + resource) {}
};

// Usage
void findUser(int id) {
    // ...
    throw NotFoundError("User with id " + std::to_string(id));
}

try {
    findUser(42);
} catch (const NotFoundError& e) {
    std::cerr << e.what() << " (code: " << static_cast<int>(e.code()) << ")\n";
} catch (const AppError& e) {
    std::cerr << "App error: " << e.what() << '\n';
}
```

---

## 2. Exception Safety Guarantees

### Three Guarantee Levels

```cpp
// 1. NOTHROW guarantee — operation never throws
// Use for: destructors, move operations, swap, cleanup
void cleanup() noexcept {
    // guaranteed not to throw
}

// 2. STRONG guarantee — if exception thrown, state is unchanged (rollback)
// Use for: operations that modify state
void addUser(const User& user) {
    auto backup = users_;          // copy current state
    try {
        users_.push_back(user);    // might throw (bad_alloc)
        db_.insert(user);          // might throw (DB error)
    } catch (...) {
        users_ = std::move(backup); // rollback
        throw;                      // re-throw
    }
}

// 3. BASIC guarantee — invariants preserved, no leaks, state may change
// Use for: most operations (default minimum)
void processFile(const std::string& path) {
    auto file = std::ifstream(path);  // RAII — won't leak
    // if exception here, file state is valid but modified
}
```

### Copy-and-Swap for Strong Guarantee

```cpp
class Database {
public:
    void update(const Record& record) {
        Database temp(*this);       // copy
        temp.applyUpdate(record);   // modify copy (might throw)
        swap(*this, temp);          // swap is noexcept — commit
    }

    friend void swap(Database& a, Database& b) noexcept;
};
```

---

## 3. noexcept

```cpp
// noexcept specifier — function promises not to throw
void safeOperation() noexcept {
    // if this throws, std::terminate() is called
}

// Conditional noexcept
template <typename T>
void process(T& obj) noexcept(std::is_nothrow_move_constructible_v<T>) {
    // noexcept only if T's move constructor is noexcept
}

// What MUST be noexcept:
// - Destructors (implicitly noexcept)
// - Move constructors and move assignment operators
// - swap functions
// - Memory deallocation (operator delete)

class Widget {
public:
    Widget(Widget&& other) noexcept;             // ✓ move ctor
    Widget& operator=(Widget&& other) noexcept;  // ✓ move assign
    ~Widget() noexcept;                           // ✓ (implicit)
    friend void swap(Widget& a, Widget& b) noexcept;  // ✓ swap
};

// noexcept operator — check if expression is noexcept
static_assert(noexcept(Widget(std::declval<Widget&&>())));
```

---

## 4. RAII for Exception-Safe Cleanup

```cpp
// RAII ensures cleanup even when exceptions occur

void processData() {
    auto file = std::fstream("data.txt");          // RAII: auto-closed
    auto lock = std::lock_guard(mutex_);           // RAII: auto-unlocked
    auto ptr = std::make_unique<Buffer>(1024);     // RAII: auto-freed
    auto conn = DatabaseConnection::open("db");    // RAII: auto-closed

    // If any line below throws, ALL resources above are cleaned up
    // via stack unwinding — destructors called in reverse order
    doRiskyOperation();
}

// Scope guard pattern (C++17 with structured bindings)
class ScopeGuard {
public:
    explicit ScopeGuard(std::function<void()> cleanup)
        : cleanup_(std::move(cleanup)), active_(true) {}

    ~ScopeGuard() {
        if (active_) cleanup_();
    }

    void dismiss() { active_ = false; }

    ScopeGuard(const ScopeGuard&) = delete;
    ScopeGuard& operator=(const ScopeGuard&) = delete;

private:
    std::function<void()> cleanup_;
    bool active_;
};

void transactionalUpdate() {
    beginTransaction();
    ScopeGuard rollback([&] { rollbackTransaction(); });

    updateTable1();
    updateTable2();

    commitTransaction();
    rollback.dismiss();  // success — don't rollback
}
```

---

## 5. std::optional (C++17)

```cpp
#include <optional>

// Represents a value that may or may not be present
std::optional<User> findUser(int id) {
    if (auto it = users_.find(id); it != users_.end()) {
        return it->second;
    }
    return std::nullopt;  // no value
}

// Usage
if (auto user = findUser(42)) {
    std::cout << user->name << '\n';    // dereference like pointer
} else {
    std::cout << "User not found\n";
}

// Value access
auto opt = findUser(42);
opt.has_value();          // true or false
opt.value();              // throws std::bad_optional_access if empty
opt.value_or(default_user); // returns default if empty
*opt;                     // UB if empty — check first!

// Monadic operations (C++23)
auto name = findUser(42)
    .transform([](const User& u) { return u.name; })  // map
    .or_else([]() -> std::optional<std::string> {
        return "Unknown";
    });
```

---

## 6. std::expected (C++23)

```cpp
#include <expected>

// Represents either a value OR an error
enum class ParseError { InvalidFormat, OutOfRange, Empty };

std::expected<int, ParseError> parseInt(std::string_view str) {
    if (str.empty()) {
        return std::unexpected(ParseError::Empty);
    }
    try {
        int val = std::stoi(std::string(str));
        return val;
    } catch (const std::invalid_argument&) {
        return std::unexpected(ParseError::InvalidFormat);
    } catch (const std::out_of_range&) {
        return std::unexpected(ParseError::OutOfRange);
    }
}

// Usage
auto result = parseInt("42");
if (result) {
    std::cout << "Value: " << *result << '\n';
} else {
    std::cout << "Error: " << static_cast<int>(result.error()) << '\n';
}

// Monadic operations
auto doubled = parseInt("21")
    .transform([](int v) { return v * 2; })
    .or_else([](ParseError e) -> std::expected<int, ParseError> {
        return 0;  // default on error
    });
```

---

## 7. Error Handling Strategy Guide

```
What kind of error is this?
│
├─ Programmer bug (precondition violated)
│   └─▶ assert() or throw std::logic_error
│
├─ Recoverable failure (file not found, network timeout)
│   ├─ Error is expected/common → std::optional or std::expected
│   └─ Error is exceptional → throw std::runtime_error
│
├─ Unrecoverable failure (out of memory, corruption)
│   └─▶ throw or std::terminate
│
└─ Performance-critical path (no exceptions allowed)
    └─▶ return error codes, std::expected, or std::optional
```

### Anti-Patterns

```cpp
// ✗ Catching by value — slices derived exceptions
try { /*...*/ }
catch (std::exception e) { }  // SLICED!

// ✓ Catch by const reference
try { /*...*/ }
catch (const std::exception& e) { }  // ✓ correct

// ✗ Catching everything and ignoring
try { riskyOp(); }
catch (...) { }  // SWALLOWED — bugs become invisible

// ✗ Using exceptions for control flow
try {
    return std::stoi(input);  // ✗ don't use exception for "not a number"
} catch (...) {
    return 0;
}

// ✓ Check before throwing
if (isValidNumber(input)) {
    return std::stoi(input);
}
return std::nullopt;  // or expected with error
```
