---
name: cpp-memory-management
description: "C++ memory management — smart pointers (unique_ptr, shared_ptr, weak_ptr), RAII pattern, new/delete, custom allocators, memory safety, ownership semantics, and allocator-aware containers. Use when: working with smart pointers; RAII; preventing memory leaks; choosing ownership models; custom allocators; memory safety. DO NOT USE FOR: move semantics in depth (use cpp-move-semantics); C-style malloc/free (use c-pointers-memory); STL containers (use cpp-containers-iterators)."
---

# C++ Memory Management

## 1. RAII (Resource Acquisition Is Initialization)

```cpp
// RAII — the most important C++ idiom
// Resources are acquired in the constructor and released in the destructor
// Stack unwinding guarantees cleanup even during exceptions

class FileHandle {
public:
    explicit FileHandle(const std::string& path)
        : file_(std::fopen(path.c_str(), "r")) {
        if (!file_) {
            throw std::runtime_error("Cannot open file: " + path);
        }
    }

    ~FileHandle() {
        if (file_) {
            std::fclose(file_);
        }
    }

    // Non-copyable — single ownership
    FileHandle(const FileHandle&) = delete;
    FileHandle& operator=(const FileHandle&) = delete;

    // Movable
    FileHandle(FileHandle&& other) noexcept : file_(other.file_) {
        other.file_ = nullptr;
    }

    FileHandle& operator=(FileHandle&& other) noexcept {
        if (this != &other) {
            if (file_) std::fclose(file_);
            file_ = other.file_;
            other.file_ = nullptr;
        }
        return *this;
    }

    FILE* get() const { return file_; }

private:
    FILE* file_;
};

// Usage — automatic cleanup, even with exceptions
void processFile(const std::string& path) {
    FileHandle file(path);      // resource acquired
    // ... use file.get() ...
}  // file automatically closed here
```

---

## 2. std::unique_ptr (Exclusive Ownership)

### Basic Usage

```cpp
#include <memory>

// Create with make_unique (preferred)
auto widget = std::make_unique<Widget>(42, "hello");

// Access
widget->doSomething();
Widget& ref = *widget;

// Check
if (widget) {
    // widget is not null
}

// Release ownership (returns raw pointer, unique_ptr becomes null)
Widget* raw = widget.release();
delete raw;  // now you must manage it

// Reset (deletes current object, optionally takes new one)
widget.reset();              // delete and set to null
widget.reset(new Widget());  // delete old, take new
```

### unique_ptr with Arrays

```cpp
auto arr = std::make_unique<int[]>(100);  // array of 100 ints
arr[0] = 42;
```

### Ownership Transfer

```cpp
// unique_ptr is move-only — cannot be copied
auto ptr = std::make_unique<Widget>(42);

// Transfer ownership
auto ptr2 = std::move(ptr);  // ptr is now null
// auto ptr3 = ptr2;         // ✗ ERROR: cannot copy

// Function that takes ownership
void consume(std::unique_ptr<Widget> w) {
    // w is destroyed at end of function
}
consume(std::move(ptr2));

// Factory function — returns ownership
std::unique_ptr<Widget> createWidget(int value) {
    return std::make_unique<Widget>(value);
}
```

### Custom Deleter

```cpp
// Custom deleter with function pointer
auto file = std::unique_ptr<FILE, decltype(&std::fclose)>(
    std::fopen("data.txt", "r"), &std::fclose);

// Custom deleter with lambda
auto handle = std::unique_ptr<Handle, decltype([](Handle* h) {
    closeHandle(h);
})>(openHandle());
```

---

## 3. std::shared_ptr (Shared Ownership)

### Basic Usage

```cpp
#include <memory>

// Create with make_shared (preferred — single allocation)
auto config = std::make_shared<Config>("app.conf");

// Copy shares ownership — reference count increases
auto config2 = config;       // ref count: 2
auto config3 = config;       // ref count: 3

config.use_count();           // 3 (for debugging only)

// Last shared_ptr destroyed triggers deletion
```

### shared_ptr with Polymorphism

```cpp
class Shape {
public:
    virtual ~Shape() = default;
    virtual double area() const = 0;
};

class Circle : public Shape {
public:
    explicit Circle(double r) : radius_(r) {}
    double area() const override { return 3.14159 * radius_ * radius_; }
private:
    double radius_;
};

// Shared ownership of polymorphic objects
std::vector<std::shared_ptr<Shape>> shapes;
shapes.push_back(std::make_shared<Circle>(5.0));

// Implicit conversion from shared_ptr<Derived> to shared_ptr<Base>
std::shared_ptr<Shape> s = std::make_shared<Circle>(3.0);
```

### shared_ptr Anti-Patterns

```cpp
// ✗ NEVER create shared_ptr from raw pointer that's already managed
auto p1 = std::make_shared<Widget>(42);
auto p2 = std::shared_ptr<Widget>(p1.get());  // ✗ DOUBLE DELETE!

// ✗ NEVER create shared_ptr from this inside a method (use enable_shared_from_this)

// ✗ Avoid circular references — use weak_ptr to break cycles
struct Node {
    std::shared_ptr<Node> next;     // ✗ circular if A->B->A
    std::weak_ptr<Node> parent;     // ✓ weak_ptr breaks cycle
};
```

---

## 4. std::weak_ptr (Non-Owning Observer)

```cpp
#include <memory>

auto shared = std::make_shared<Widget>(42);
std::weak_ptr<Widget> weak = shared;  // does not increase ref count

// Check if the object still exists
if (auto locked = weak.lock()) {
    // locked is a shared_ptr — object is alive
    locked->doSomething();
} else {
    // object has been destroyed
}

// Check without locking
if (!weak.expired()) {
    // object exists, but might be destroyed before you use it
    // prefer lock() for thread safety
}
```

### Breaking Circular References

```cpp
class Node : public std::enable_shared_from_this<Node> {
public:
    void addChild(std::shared_ptr<Node> child) {
        child->parent_ = shared_from_this();  // weak back-reference
        children_.push_back(std::move(child));
    }

private:
    std::vector<std::shared_ptr<Node>> children_;  // owning
    std::weak_ptr<Node> parent_;                    // non-owning
};
```

### Observer Pattern with weak_ptr

```cpp
class EventEmitter {
public:
    void subscribe(std::weak_ptr<Listener> listener) {
        listeners_.push_back(listener);
    }

    void emit(const Event& event) {
        // Clean up expired listeners and notify active ones
        listeners_.erase(
            std::remove_if(listeners_.begin(), listeners_.end(),
                [](const auto& w) { return w.expired(); }),
            listeners_.end());

        for (auto& weak : listeners_) {
            if (auto listener = weak.lock()) {
                listener->onEvent(event);
            }
        }
    }

private:
    std::vector<std::weak_ptr<Listener>> listeners_;
};
```

---

## 5. Ownership Guidelines

### When to Use Which Smart Pointer

```
Who owns this object?
│
├─ Single owner, clear lifetime
│   └─▶ std::unique_ptr (default choice)
│
├─ Multiple owners, shared lifetime
│   └─▶ std::shared_ptr
│
├─ Non-owning reference, object might be destroyed
│   └─▶ std::weak_ptr
│
├─ Non-owning reference, object guaranteed alive
│   └─▶ raw pointer or reference
│
└─ Legacy API requires raw pointer
    └─▶ raw pointer (borrowing, not owning)
```

### Function Parameter Guidelines

```cpp
// Observed / borrowed — doesn't affect lifetime
void process(const Widget& w);            // ✓ reference (never null)
void process(const Widget* w);            // ✓ pointer (nullable)

// Takes ownership — consumes the object
void consume(std::unique_ptr<Widget> w);  // ✓ transfer ownership

// Shares ownership — extends lifetime
void share(std::shared_ptr<Widget> w);    // ✓ bumps ref count

// ✗ Avoid passing smart pointers when you don't affect ownership
void bad(const std::unique_ptr<Widget>& w);  // ✗ use const Widget& instead
void bad(const std::shared_ptr<Widget>& w);  // ✗ use const Widget& instead
```

---

## 6. new/delete (Avoid in Modern C++)

```cpp
// ✗ Avoid raw new/delete
Widget* w = new Widget(42);
delete w;

Widget* arr = new Widget[10];
delete[] arr;

// ✓ Use make_unique / make_shared
auto w = std::make_unique<Widget>(42);
auto arr = std::make_unique<Widget[]>(10);

// ✓ Use containers for dynamic arrays
std::vector<Widget> widgets(10);
```

---

## 7. enable_shared_from_this

```cpp
class Session : public std::enable_shared_from_this<Session> {
public:
    void start() {
        // Safe: creates shared_ptr that shares ownership with existing one
        auto self = shared_from_this();
        asyncRead([self](auto data) {
            self->handleData(data);
        });
    }

    // ✗ NEVER call shared_from_this if no shared_ptr owns this object
    // auto s = Session();
    // s.start();  // UNDEFINED BEHAVIOR — no shared_ptr exists

    // ✓ Always create via make_shared
    static std::shared_ptr<Session> create() {
        return std::make_shared<Session>();
    }

private:
    void handleData(const Data& data);
};
```
