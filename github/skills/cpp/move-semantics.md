---
name: cpp-move-semantics
description: "C++ move semantics — rvalue references, std::move, std::forward, perfect forwarding, move constructors, move assignment, rule of five, return value optimization (RVO/NRVO), and value categories. Use when: implementing move constructors/assignment; understanding rvalue references; perfect forwarding; std::move; return value optimization; transfer of ownership. DO NOT USE FOR: smart pointer patterns (use cpp-memory-management); OOP basics (use cpp-oop); template patterns without forwarding (use cpp-templates)."
---

# C++ Move Semantics

## 1. Value Categories

```cpp
// Lvalue — has identity, can take address
int x = 42;           // x is an lvalue
std::string s = "hi"; // s is an lvalue

// Rvalue — temporary, about to be destroyed
42                     // prvalue (pure rvalue)
std::string("temp")    // prvalue
x + 1                  // prvalue
std::move(x)           // xvalue (expiring value)

// Key insight: rvalues can be "stolen from" safely because
// they're about to be destroyed anyway
```

---

## 2. Rvalue References

```cpp
// Lvalue reference (binds to lvalues)
int x = 42;
int& lref = x;        // OK
// int& bad = 42;     // ✗ ERROR: can't bind lvalue ref to rvalue

// Rvalue reference (binds to rvalues)
int&& rref = 42;      // OK
// int&& bad = x;     // ✗ ERROR: can't bind rvalue ref to lvalue

// const lvalue reference (binds to both)
const int& cref = x;  // OK — lvalue
const int& cref2 = 42; // OK — rvalue (extends lifetime)
```

---

## 3. std::move

```cpp
#include <utility>

// std::move doesn't move — it casts to rvalue reference
// It signals "I'm done with this, you can steal its resources"

std::string source = "hello world";
std::string dest = std::move(source);
// source is now in a valid but unspecified state (likely empty)
// dest owns the string data

// Common use: transfer ownership
std::vector<std::string> names;
std::string name = "Alice";
names.push_back(std::move(name));  // moves instead of copies
// name is now empty (moved-from)
```

### std::move Rules

```cpp
// ✓ Use std::move when you won't use the variable again
void takeName(std::string name) { /* ... */ }
std::string n = "Bob";
takeName(std::move(n));
// don't use n after this

// ✗ Don't move const objects — falls back to copy
const std::string s = "hello";
auto s2 = std::move(s);  // COPIES, not moves (const can't be moved from)

// ✗ Don't move return values — prevents RVO
std::string getName() {
    std::string result = "Alice";
    return result;          // ✓ RVO applies
    // return std::move(result);  // ✗ prevents RVO!
}

// ✓ Move in constructors/assignment for efficiency
class Builder {
public:
    void setName(std::string name) {
        name_ = std::move(name);  // move from parameter
    }
private:
    std::string name_;
};
```

---

## 4. Move Constructor and Move Assignment

```cpp
class Buffer {
public:
    explicit Buffer(std::size_t size)
        : data_(new char[size]), size_(size) {}

    // Move constructor — steal resources from source
    Buffer(Buffer&& other) noexcept
        : data_(other.data_), size_(other.size_) {
        other.data_ = nullptr;  // leave source in valid state
        other.size_ = 0;
    }

    // Move assignment — release own resources, steal from source
    Buffer& operator=(Buffer&& other) noexcept {
        if (this != &other) {
            delete[] data_;          // release own resources
            data_ = other.data_;     // steal from source
            size_ = other.size_;
            other.data_ = nullptr;   // leave source in valid state
            other.size_ = 0;
        }
        return *this;
    }

    ~Buffer() { delete[] data_; }

    // Copy operations
    Buffer(const Buffer& other)
        : data_(new char[other.size_]), size_(other.size_) {
        std::memcpy(data_, other.data_, size_);
    }

    Buffer& operator=(const Buffer& other) {
        if (this != &other) {
            auto* new_data = new char[other.size_];
            std::memcpy(new_data, other.data_, other.size_);
            delete[] data_;
            data_ = new_data;
            size_ = other.size_;
        }
        return *this;
    }

private:
    char* data_;
    std::size_t size_;
};
```

### noexcept is Critical

```cpp
// ✓ ALWAYS mark move operations noexcept
Buffer(Buffer&& other) noexcept;
Buffer& operator=(Buffer&& other) noexcept;

// WHY: STL containers (vector) only use move if it's noexcept
// If move can throw, vector falls back to copy during reallocation
// This kills the performance benefit of move semantics

// Check at compile time
static_assert(std::is_nothrow_move_constructible_v<Buffer>);
static_assert(std::is_nothrow_move_assignable_v<Buffer>);
```

---

## 5. Copy-and-Swap Idiom

```cpp
class Resource {
public:
    Resource() : data_(nullptr), size_(0) {}

    explicit Resource(std::size_t size)
        : data_(new int[size]), size_(size) {}

    ~Resource() { delete[] data_; }

    // Copy constructor
    Resource(const Resource& other)
        : data_(new int[other.size_]), size_(other.size_) {
        std::copy(other.data_, other.data_ + size_, data_);
    }

    // Move constructor
    Resource(Resource&& other) noexcept
        : data_(other.data_), size_(other.size_) {
        other.data_ = nullptr;
        other.size_ = 0;
    }

    // Unified assignment — takes by VALUE (handles copy and move)
    Resource& operator=(Resource other) noexcept {
        swap(*this, other);
        return *this;
    }

    friend void swap(Resource& a, Resource& b) noexcept {
        using std::swap;
        swap(a.data_, b.data_);
        swap(a.size_, b.size_);
    }

private:
    int* data_;
    std::size_t size_;
};
```

---

## 6. Perfect Forwarding

### The Forwarding Problem

```cpp
// Without forwarding — always copies
template <typename T>
void wrapper(T arg) {
    target(arg);  // always passes lvalue (even if rvalue was given)
}

// With perfect forwarding — preserves value category
template <typename T>
void wrapper(T&& arg) {
    target(std::forward<T>(arg));  // forwards lvalue as lvalue, rvalue as rvalue
}

// How it works:
// - If called with lvalue: T = Widget&, T&& = Widget& (reference collapsing)
// - If called with rvalue: T = Widget, T&& = Widget&&
```

### Forwarding Reference (Universal Reference)

```cpp
// T&& is a forwarding reference ONLY when T is a deduced template parameter
template <typename T>
void process(T&& arg) {      // ✓ forwarding reference
    doWork(std::forward<T>(arg));
}

// These are NOT forwarding references:
void func(Widget&& w);       // ✗ rvalue reference (Widget is concrete)
void func(std::vector<int>&& v);  // ✗ rvalue reference

// auto&& is also a forwarding reference
auto&& x = getValue();       // ✓ forwarding reference
for (auto&& item : container) {  // ✓ forwarding reference
    process(std::forward<decltype(item)>(item));
}
```

### Factory Pattern with Perfect Forwarding

```cpp
template <typename T, typename... Args>
std::unique_ptr<T> create(Args&&... args) {
    return std::make_unique<T>(std::forward<Args>(args)...);
}

auto widget = create<Widget>(42, "hello");  // forwards args to Widget constructor
```

---

## 7. Return Value Optimization (RVO / NRVO)

```cpp
// Copy elision — compiler eliminates unnecessary copies/moves

// Return Value Optimization (RVO) — guaranteed in C++17
Widget createWidget() {
    return Widget(42);  // constructed directly in caller's space
}

// Named RVO (NRVO) — compiler optimization, not guaranteed
Widget createWidget() {
    Widget w(42);
    w.configure();
    return w;  // usually optimized (no copy/move)
}

// ✗ Don't interfere with RVO
Widget createWidget() {
    Widget w(42);
    return std::move(w);  // ✗ PREVENTS RVO! Don't do this.
}

// When NRVO can't apply (multiple return paths with different objects)
Widget createWidget(bool flag) {
    Widget a(1);
    Widget b(2);
    if (flag) return a;  // can't apply NRVO (which one?)
    return b;            // falls back to move
}
```

---

## 8. Moved-From State

```cpp
// After std::move, objects are in a "valid but unspecified state"
// You can ONLY:
// 1. Destroy them
// 2. Assign new values to them
// 3. Call functions with no preconditions

std::string s = "hello";
auto s2 = std::move(s);

// ✓ Safe operations on moved-from string
s = "new value";        // assign
s.clear();              // no preconditions
s.empty();              // no preconditions
// s is usable again after assignment

// ✗ Don't assume specific state
// s.size() == 0  // might or might not be true
// s == ""        // might or might not be true
```
