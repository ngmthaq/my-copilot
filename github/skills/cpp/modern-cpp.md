---
name: cpp-modern-cpp
description: "Modern C++ features — C++17 (std::optional, std::variant, std::any, std::filesystem, structured bindings, if-init, fold expressions), C++20 (concepts, ranges, coroutines, modules, std::format, three-way comparison, std::span), C++23 (std::expected, std::print, deducing this, std::generator, std::mdspan). Use when: using modern C++ features; std::optional; std::variant; std::any; coroutines; modules; std::format; std::expected; choosing the right C++ standard. DO NOT USE FOR: templates and concepts in depth (use cpp-templates); ranges in depth (use cpp-stl-algorithms); smart pointers (use cpp-memory-management)."
---

# Modern C++ Features

## 1. C++17 Features

### std::optional

```cpp
#include <optional>

// Replaces "return null pointer" or "return sentinel value" patterns
std::optional<int> findIndex(const std::vector<int>& v, int target) {
    for (std::size_t i = 0; i < v.size(); ++i) {
        if (v[i] == target) return static_cast<int>(i);
    }
    return std::nullopt;
}

auto idx = findIndex(v, 42);
if (idx) {
    std::cout << "Found at " << *idx << '\n';
}

// Value access
idx.value();                  // throws bad_optional_access if empty
idx.value_or(-1);             // returns -1 if empty
*idx;                         // UB if empty
```

### std::variant

```cpp
#include <variant>

// Type-safe union
using Value = std::variant<int, double, std::string>;

Value v = 42;
v = "hello";       // now holds string
v = 3.14;          // now holds double

// Visit — apply function based on active type
std::visit([](auto&& arg) {
    using T = std::decay_t<decltype(arg)>;
    if constexpr (std::is_same_v<T, int>) {
        std::cout << "int: " << arg << '\n';
    } else if constexpr (std::is_same_v<T, double>) {
        std::cout << "double: " << arg << '\n';
    } else if constexpr (std::is_same_v<T, std::string>) {
        std::cout << "string: " << arg << '\n';
    }
}, v);

// Check and get
if (std::holds_alternative<int>(v)) {
    int val = std::get<int>(v);
}

// get_if — returns pointer or nullptr
if (auto* p = std::get_if<int>(&v)) {
    std::cout << *p << '\n';
}

// Overloaded visitor pattern
template <typename... Ts> struct overloaded : Ts... { using Ts::operator()...; };
template <typename... Ts> overloaded(Ts...) -> overloaded<Ts...>;

std::visit(overloaded{
    [](int i) { std::cout << "int: " << i << '\n'; },
    [](double d) { std::cout << "double: " << d << '\n'; },
    [](const std::string& s) { std::cout << "string: " << s << '\n'; },
}, v);
```

### std::any

```cpp
#include <any>

// Type-erased container for any single value
std::any a = 42;
a = std::string("hello");
a = 3.14;

// Access
try {
    auto val = std::any_cast<double>(a);  // 3.14
} catch (const std::bad_any_cast& e) {
    // wrong type
}

// Check type
if (a.type() == typeid(double)) {
    auto val = std::any_cast<double>(a);
}

// Pointer version (no throw)
if (auto* p = std::any_cast<double>(&a)) {
    std::cout << *p << '\n';
}

// Prefer std::variant when types are known at compile time
```

### std::filesystem

```cpp
#include <filesystem>
namespace fs = std::filesystem;

// Path operations
fs::path p = "/home/user/documents/file.txt";
p.filename();     // "file.txt"
p.stem();         // "file"
p.extension();    // ".txt"
p.parent_path();  // "/home/user/documents"

// Check existence
if (fs::exists(p)) { /* ... */ }
if (fs::is_regular_file(p)) { /* ... */ }
if (fs::is_directory(p)) { /* ... */ }

// File size
auto size = fs::file_size(p);

// Create directories
fs::create_directory("output");
fs::create_directories("a/b/c");  // creates entire path

// Copy, rename, remove
fs::copy("src.txt", "dst.txt");
fs::rename("old.txt", "new.txt");
fs::remove("file.txt");
fs::remove_all("directory/");  // recursive

// Directory iteration
for (const auto& entry : fs::directory_iterator(".")) {
    std::cout << entry.path() << '\n';
}

// Recursive directory iteration
for (const auto& entry : fs::recursive_directory_iterator("src")) {
    if (entry.is_regular_file() && entry.path().extension() == ".cpp") {
        std::cout << entry.path() << '\n';
    }
}
```

### if/switch with Initializer

```cpp
// if with init statement
if (auto it = map.find(key); it != map.end()) {
    process(it->second);
}
// 'it' is scoped to the if statement

// switch with init statement
switch (auto status = getStatus(); status) {
    case Status::Ok: break;
    case Status::Error: handleError(status); break;
}
```

### std::string_view

```cpp
#include <string_view>

// Non-owning read-only view of a string
void process(std::string_view sv) {
    // no allocation, no copy
    sv.substr(0, 5);
    sv.find("hello");
    sv.starts_with("he");  // C++20
    sv.ends_with("lo");    // C++20
}

process("literal");              // no std::string created
process(std::string("hello"));   // views the string
process(std::string_view("hi")); // views the literal

// ⚠ Lifetime: string_view does NOT own the data
// std::string_view dangling() {
//     std::string s = "hello";
//     return s;  // ✗ DANGLING — s destroyed, view invalid
// }
```

---

## 2. C++20 Features

### Concepts

```cpp
#include <concepts>

// See cpp-templates.md for detailed coverage
template <std::integral T>
T add(T a, T b) { return a + b; }

auto square(std::floating_point auto x) { return x * x; }
```

### Ranges and Views

```cpp
#include <ranges>

// See cpp-stl-algorithms.md for detailed coverage
auto result = vec
    | std::views::filter([](int x) { return x > 0; })
    | std::views::transform([](int x) { return x * 2; })
    | std::views::take(5);
```

### std::format

```cpp
#include <format>

// Python-style string formatting
std::string s = std::format("Hello, {}!", "world");
std::string s2 = std::format("{0} + {1} = {2}", 1, 2, 3);
std::string s3 = std::format("{:.2f}", 3.14159);    // "3.14"
std::string s4 = std::format("{:>10}", "right");     // "     right"
std::string s5 = std::format("{:06d}", 42);           // "000042"
std::string s6 = std::format("{:#x}", 255);           // "0xff"

// Format to output
std::cout << std::format("Result: {}\n", 42);

// Custom formatter
template <>
struct std::formatter<Point> {
    constexpr auto parse(std::format_parse_context& ctx) {
        return ctx.begin();
    }

    auto format(const Point& p, std::format_context& ctx) const {
        return std::format_to(ctx.out(), "({}, {})", p.x, p.y);
    }
};

std::cout << std::format("Point: {}\n", Point{3, 4});
```

### Three-Way Comparison (Spaceship Operator)

```cpp
#include <compare>

class Version {
public:
    int major, minor, patch;

    // Generates ==, !=, <, >, <=, >= automatically
    auto operator<=>(const Version&) const = default;
};

Version v1{1, 2, 3};
Version v2{1, 3, 0};
if (v1 < v2) { /* ... */ }   // works
if (v1 == v2) { /* ... */ }   // works
```

### std::span

```cpp
#include <span>

// See cpp-containers-iterators.md for detailed coverage
void process(std::span<const int> data) {
    for (int val : data) { /* ... */ }
}
```

### Coroutines

```cpp
#include <coroutine>

// Generator coroutine (simplified — full implementation requires a promise type)
// C++23 provides std::generator

// Concept: functions that can suspend and resume
// Key keywords: co_yield, co_return, co_await

// co_yield — produce a value and suspend
// co_return — return final value and finish
// co_await — suspend until an awaitable completes

// Example with C++23 std::generator
#include <generator>  // C++23

std::generator<int> fibonacci() {
    int a = 0, b = 1;
    while (true) {
        co_yield a;
        auto temp = a;
        a = b;
        b = temp + b;
    }
}

// Usage
for (int val : fibonacci() | std::views::take(10)) {
    std::cout << val << ' ';  // 0 1 1 2 3 5 8 13 21 34
}
```

### Modules (C++20)

```cpp
// math.cppm — module interface
export module math;

export int add(int a, int b) {
    return a + b;
}

export class Calculator {
public:
    int multiply(int a, int b) { return a * b; }
};

// main.cpp — import module
import math;

int main() {
    auto result = add(3, 4);
    Calculator calc;
    auto product = calc.multiply(5, 6);
}

// Benefits:
// - Faster compilation (no header re-parsing)
// - No include guards needed
// - No macro leakage
// - Explicit export control
// ⚠ Compiler support still maturing
```

### Designated Initializers

```cpp
struct Config {
    std::string host = "localhost";
    int port = 8080;
    bool debug = false;
    int max_connections = 100;
};

// Initialize specific fields by name
Config cfg{
    .host = "example.com",
    .port = 443,
    .debug = true,
    // .max_connections uses default (100)
};
```

### constexpr Enhancements

```cpp
// constexpr virtual functions (C++20)
struct Base {
    constexpr virtual int value() const { return 0; }
};

struct Derived : Base {
    constexpr int value() const override { return 42; }
};

// constexpr std::vector and std::string (C++20)
constexpr auto makeVec() {
    std::vector<int> v{1, 2, 3};
    v.push_back(4);
    return v.size();  // 4, computed at compile time
}
static_assert(makeVec() == 4);

// constexpr dynamic allocation (C++20)
// allocation and deallocation must happen within the same constexpr evaluation
```

---

## 3. C++23 Features

### std::expected

```cpp
#include <expected>

// See cpp-error-handling.md for detailed coverage
std::expected<int, std::string> parseInt(std::string_view s);
```

### std::print / std::println

```cpp
#include <print>

// Direct console output with formatting
std::print("Hello, {}!\n", "world");
std::println("Value: {}", 42);       // adds newline
std::println("{:.3f}", 3.14159);     // "3.142\n"
```

### Deducing this (Explicit Object Parameter)

```cpp
// Deduce the type of 'this' — eliminates const/non-const overload duplication
class Widget {
    std::vector<int> data_;

public:
    // Before C++23: two overloads needed
    // const std::vector<int>& getData() const { return data_; }
    // std::vector<int>& getData() { return data_; }

    // C++23: single definition handles both
    auto&& getData(this auto&& self) {
        return std::forward<decltype(self)>(self).data_;
    }

    // Recursive lambdas
    auto factorial(this const Widget& self, int n) -> int {
        return (n <= 1) ? 1 : n * self.factorial(n - 1);
    }
};
```

### std::mdspan (Multidimensional Span)

```cpp
#include <mdspan>

// Non-owning multidimensional view
std::vector<double> data(12);
std::mdspan matrix(data.data(), 3, 4);  // 3x4 matrix

matrix[1, 2] = 3.14;  // row 1, col 2
// Multidimensional subscript operator (C++23)
```

### std::flat_map / std::flat_set

```cpp
#include <flat_map>
#include <flat_set>

// Sorted container backed by contiguous storage (vector)
// Better cache performance than std::map for small-medium sizes
std::flat_map<std::string, int> scores;
scores["Alice"] = 95;
scores["Bob"] = 87;
```

### if consteval

```cpp
constexpr int compute(int x) {
    if consteval {
        // compile-time path
        return x * x;
    } else {
        // runtime path — can use non-constexpr functions
        return expensiveCompute(x);
    }
}
```

---

## 4. C++ Standard Selection Guide

```
Which C++ standard should I use?
│
├─ New project with modern compilers
│   └─▶ C++20 (best balance of features and compiler support)
│
├─ Need std::expected, std::print, deducing this
│   └─▶ C++23 (check compiler support)
│
├─ Existing project, gradual modernization
│   └─▶ C++17 (widely supported, substantial improvements)
│
└─ Legacy constraints or embedded
    └─▶ C++14 or C++11 (widely supported everywhere)
```
