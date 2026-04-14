---
name: cpp-oop
description: "C++ OOP — classes, constructors, destructors, inheritance, polymorphism, virtual functions, abstract classes, operator overloading, friend functions, SOLID principles, rule of zero/three/five, and design patterns. Use when: designing classes; inheritance hierarchies; polymorphism; virtual functions; abstract classes; operator overloading; SOLID principles. DO NOT USE FOR: templates and generic programming (use cpp-templates); smart pointers (use cpp-memory-management); move semantics in depth (use cpp-move-semantics)."
---

# C++ Object-Oriented Programming

## 1. Class Basics

### Declaration

```cpp
// header: user.h
#pragma once
#include <string>

class User {
public:
    // Constructors
    User() = default;
    explicit User(std::string name, int age);

    // Accessors (const-qualified)
    [[nodiscard]] const std::string& getName() const { return name_; }
    [[nodiscard]] int getAge() const { return age_; }

    // Mutators
    void setName(std::string name);
    void setAge(int age);

    // Methods
    [[nodiscard]] std::string toString() const;

private:
    std::string name_;
    int age_ = 0;
};
```

### Definition

```cpp
// source: user.cpp
#include "user.h"
#include <stdexcept>

User::User(std::string name, int age)
    : name_(std::move(name)), age_(age) {
    if (age_ < 0) {
        throw std::invalid_argument("Age cannot be negative");
    }
}

void User::setName(std::string name) {
    name_ = std::move(name);
}

void User::setAge(int age) {
    if (age < 0) {
        throw std::invalid_argument("Age cannot be negative");
    }
    age_ = age;
}

std::string User::toString() const {
    return name_ + " (age " + std::to_string(age_) + ")";
}
```

---

## 2. Constructors and Initialization

### Constructor Types

```cpp
class Widget {
public:
    // Default constructor
    Widget() = default;

    // Parameterized constructor — use explicit for single-arg
    explicit Widget(int size);

    // Constructor with initializer list — PREFERRED
    Widget(int width, int height)
        : width_(width), height_(height), area_(width * height) {}

    // Copy constructor
    Widget(const Widget& other) = default;

    // Move constructor
    Widget(Widget&& other) noexcept = default;

    // Copy assignment
    Widget& operator=(const Widget& other) = default;

    // Move assignment
    Widget& operator=(Widget&& other) noexcept = default;

    // Destructor
    ~Widget() = default;

private:
    int width_ = 0;
    int height_ = 0;
    int area_ = 0;
};
```

### Member Initializer List

```cpp
// ✓ ALWAYS use member initializer lists — more efficient
class Connection {
public:
    Connection(std::string host, int port)
        : host_(std::move(host))   // initialized directly
        , port_(port)
        , socket_(-1) {}

private:
    std::string host_;
    int port_;
    int socket_;
};

// ✗ Avoid assignment in constructor body
Connection(std::string host, int port) {
    host_ = host;   // default-constructed then assigned — wasteful
    port_ = port;
}
```

### Delegating Constructors (C++11)

```cpp
class Logger {
public:
    Logger() : Logger("default.log", LogLevel::Info) {}
    Logger(std::string filename) : Logger(std::move(filename), LogLevel::Info) {}
    Logger(std::string filename, LogLevel level)
        : filename_(std::move(filename)), level_(level) {
        openFile();
    }

private:
    std::string filename_;
    LogLevel level_;
};
```

---

## 3. Rule of Zero / Three / Five

### Rule of Zero (Preferred)

```cpp
// If you don't manage resources directly, don't declare any special members
class UserProfile {
    std::string name_;
    std::vector<std::string> tags_;
    std::unique_ptr<Avatar> avatar_;
    // Compiler generates correct copy/move/destructor automatically
};
```

### Rule of Five

```cpp
// If you manage a resource, declare ALL five special members
class Buffer {
public:
    explicit Buffer(std::size_t size)
        : data_(new uint8_t[size]), size_(size) {}

    ~Buffer() { delete[] data_; }

    // Copy constructor
    Buffer(const Buffer& other)
        : data_(new uint8_t[other.size_]), size_(other.size_) {
        std::memcpy(data_, other.data_, size_);
    }

    // Copy assignment (copy-and-swap idiom)
    Buffer& operator=(Buffer other) noexcept {
        swap(*this, other);
        return *this;
    }

    // Move constructor
    Buffer(Buffer&& other) noexcept
        : data_(other.data_), size_(other.size_) {
        other.data_ = nullptr;
        other.size_ = 0;
    }

    // Move assignment
    Buffer& operator=(Buffer&& other) noexcept {
        if (this != &other) {
            delete[] data_;
            data_ = other.data_;
            size_ = other.size_;
            other.data_ = nullptr;
            other.size_ = 0;
        }
        return *this;
    }

    friend void swap(Buffer& a, Buffer& b) noexcept {
        using std::swap;
        swap(a.data_, b.data_);
        swap(a.size_, b.size_);
    }

private:
    uint8_t* data_;
    std::size_t size_;
};
```

---

## 4. Inheritance

### Basic Inheritance

```cpp
class Shape {
public:
    virtual ~Shape() = default;  // ✓ Always virtual destructor in base class

    [[nodiscard]] virtual double area() const = 0;      // pure virtual
    [[nodiscard]] virtual std::string name() const = 0;

    void printInfo() const {
        std::cout << name() << ": area = " << area() << '\n';
    }
};

class Circle : public Shape {
public:
    explicit Circle(double radius) : radius_(radius) {}

    [[nodiscard]] double area() const override {
        return 3.14159265 * radius_ * radius_;
    }

    [[nodiscard]] std::string name() const override {
        return "Circle";
    }

private:
    double radius_;
};

class Rectangle : public Shape {
public:
    Rectangle(double width, double height)
        : width_(width), height_(height) {}

    [[nodiscard]] double area() const override {
        return width_ * height_;
    }

    [[nodiscard]] std::string name() const override {
        return "Rectangle";
    }

private:
    double width_;
    double height_;
};
```

### Inheritance Keywords

```cpp
class Base {
public:
    virtual void process() = 0;
    virtual void update();
    virtual void render() final;  // cannot be overridden
};

class Derived : public Base {
public:
    void process() override;       // ✓ override — compiler checks signature
    void update() override;        // ✓ override
    // void render() override;     // ✗ ERROR: render() is final
};

// Prevent further inheritance
class FinalClass final : public Base {
    void process() override;
};
// class BadChild : public FinalClass {};  // ✗ ERROR: FinalClass is final
```

### Access Specifiers

```cpp
class Base {
public:     // accessible everywhere
    void publicMethod();
protected:  // accessible in derived classes
    int protectedData_;
private:    // accessible only in this class
    int privateData_;
};

// public inheritance (most common) — preserves access levels
class Derived : public Base { };

// protected inheritance — public → protected
class Derived : protected Base { };

// private inheritance — everything becomes private (is-implemented-in-terms-of)
class Derived : private Base { };
```

---

## 5. Polymorphism

### Virtual Functions and Dynamic Dispatch

```cpp
void processShapes(const std::vector<std::unique_ptr<Shape>>& shapes) {
    for (const auto& shape : shapes) {
        shape->printInfo();  // dynamic dispatch to correct override
    }
}

// Usage
std::vector<std::unique_ptr<Shape>> shapes;
shapes.push_back(std::make_unique<Circle>(5.0));
shapes.push_back(std::make_unique<Rectangle>(3.0, 4.0));
processShapes(shapes);
```

### Abstract Classes (Interfaces)

```cpp
// Pure interface — all pure virtual, no data members
class Serializable {
public:
    virtual ~Serializable() = default;
    [[nodiscard]] virtual std::string serialize() const = 0;
    virtual void deserialize(const std::string& data) = 0;
};

class Printable {
public:
    virtual ~Printable() = default;
    virtual void print(std::ostream& os) const = 0;
};

// Multiple interface inheritance
class Document : public Serializable, public Printable {
public:
    std::string serialize() const override { /* ... */ }
    void deserialize(const std::string& data) override { /* ... */ }
    void print(std::ostream& os) const override { /* ... */ }
};
```

### RTTI and dynamic_cast

```cpp
void handleShape(Shape* shape) {
    // dynamic_cast for safe downcasting
    if (auto* circle = dynamic_cast<Circle*>(shape)) {
        std::cout << "Radius: " << circle->getRadius() << '\n';
    } else if (auto* rect = dynamic_cast<Rectangle*>(shape)) {
        std::cout << "Width: " << rect->getWidth() << '\n';
    }

    // typeid for type information
    std::cout << "Type: " << typeid(*shape).name() << '\n';
}

// Prefer virtual functions over dynamic_cast when possible
```

---

## 6. Operator Overloading

```cpp
class Vector2D {
public:
    Vector2D(double x = 0, double y = 0) : x_(x), y_(y) {}

    // Arithmetic operators — return by value
    Vector2D operator+(const Vector2D& rhs) const {
        return {x_ + rhs.x_, y_ + rhs.y_};
    }

    Vector2D operator-(const Vector2D& rhs) const {
        return {x_ - rhs.x_, y_ - rhs.y_};
    }

    Vector2D operator*(double scalar) const {
        return {x_ * scalar, y_ * scalar};
    }

    // Compound assignment — return by reference
    Vector2D& operator+=(const Vector2D& rhs) {
        x_ += rhs.x_;
        y_ += rhs.y_;
        return *this;
    }

    // Comparison operators
    bool operator==(const Vector2D& rhs) const {
        return x_ == rhs.x_ && y_ == rhs.y_;
    }

    // Spaceship operator (C++20) — generates all comparison operators
    auto operator<=>(const Vector2D& rhs) const = default;

    // Stream insertion — as friend
    friend std::ostream& operator<<(std::ostream& os, const Vector2D& v) {
        return os << "(" << v.x_ << ", " << v.y_ << ")";
    }

private:
    double x_;
    double y_;
};

// Non-member operator for commutative scalar multiplication
Vector2D operator*(double scalar, const Vector2D& v) {
    return v * scalar;
}
```

### Subscript and Function Call Operators

```cpp
class Matrix {
public:
    // Subscript operator
    double& operator()(std::size_t row, std::size_t col) {
        return data_[row * cols_ + col];
    }

    const double& operator()(std::size_t row, std::size_t col) const {
        return data_[row * cols_ + col];
    }

private:
    std::vector<double> data_;
    std::size_t cols_;
};
```

---

## 7. Friend Functions and Classes

```cpp
class Account {
    friend class Auditor;              // Auditor can access private members
    friend void transfer(Account& from, Account& to, double amount);

public:
    explicit Account(double balance) : balance_(balance) {}
    [[nodiscard]] double getBalance() const { return balance_; }

private:
    double balance_;
};

void transfer(Account& from, Account& to, double amount) {
    from.balance_ -= amount;  // Can access private members
    to.balance_ += amount;
}
```

---

## 8. SOLID Principles in C++

### Single Responsibility

```cpp
// ✓ Each class has one job
class UserRepository {
public:
    User findById(int id);
    void save(const User& user);
};

class UserValidator {
public:
    [[nodiscard]] bool validate(const User& user) const;
};

// ✗ Avoid god classes
class UserManager {
    // Handles validation, persistence, notification, rendering...
};
```

### Open/Closed — Open for extension, closed for modification

```cpp
// ✓ Extend via new derived classes, not modifying existing code
class PaymentProcessor {
public:
    virtual ~PaymentProcessor() = default;
    virtual void process(const Payment& payment) = 0;
};

class CreditCardProcessor : public PaymentProcessor { /* ... */ };
class PayPalProcessor : public PaymentProcessor { /* ... */ };
// Adding new payment types doesn't modify existing code
```

### Liskov Substitution

```cpp
// ✓ Derived classes must be substitutable for base
void renderAll(const std::vector<std::unique_ptr<Shape>>& shapes) {
    for (const auto& s : shapes) {
        s->draw();  // works correctly for any Shape subclass
    }
}
```

### Interface Segregation

```cpp
// ✓ Small, focused interfaces
class Readable {
public:
    virtual ~Readable() = default;
    virtual std::string read() = 0;
};

class Writable {
public:
    virtual ~Writable() = default;
    virtual void write(const std::string& data) = 0;
};

// Implement only what's needed
class ReadOnlyFile : public Readable { /* ... */ };
class ReadWriteFile : public Readable, public Writable { /* ... */ };
```

### Dependency Inversion

```cpp
// ✓ Depend on abstractions, not implementations
class Logger {
public:
    virtual ~Logger() = default;
    virtual void log(const std::string& message) = 0;
};

class Service {
public:
    explicit Service(std::unique_ptr<Logger> logger)
        : logger_(std::move(logger)) {}

private:
    std::unique_ptr<Logger> logger_;  // depends on abstraction
};
```
