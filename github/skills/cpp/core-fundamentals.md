---
name: cpp-core-fundamentals
description: "C++ core fundamentals — data types, auto type deduction, references, constexpr, consteval, structured bindings, range-based for, initializer lists, type aliases, namespaces, and basic control flow. Use when: explaining C++ type system; auto deduction; references vs pointers; constexpr usage; structured bindings; range-based for loops. DO NOT USE FOR: classes and OOP (use cpp-oop); templates (use cpp-templates); smart pointers (use cpp-memory-management)."
---

# C++ Core Fundamentals

## 1. Data Types

### Basic Types

```cpp
#include <cstdint>
#include <cstddef>
#include <string>

// Fundamental types (same as C, but with additions)
bool flag = true;          // true or false
char c = 'A';              // at least 8 bits
int i = 42;                // at least 16 bits, typically 32
long l = 100000L;          // at least 32 bits
long long ll = 100000LL;   // at least 64 bits

// Fixed-width integers (preferred)
int8_t   i8  = -128;
uint8_t  u8  = 255;
int16_t  i16 = -32768;
uint16_t u16 = 65535;
int32_t  i32 = 0;
uint32_t u32 = 0U;
int64_t  i64 = 0LL;
uint64_t u64 = 0ULL;

// Floating point
float f = 3.14f;
double d = 3.14159265;
long double ld = 3.14L;

// Size types
std::size_t length = 100;   // unsigned, for sizes and indices
std::ptrdiff_t diff = 0;    // signed, for pointer differences

// String types
std::string name = "Alice";
std::string_view sv = "read-only view";  // C++17, non-owning
```

### Uniform Initialization (C++11)

```cpp
// Brace initialization — prevents narrowing conversions
int x{42};
double d{3.14};
std::string name{"Alice"};
std::vector<int> nums{1, 2, 3, 4, 5};

// Prevents narrowing (compile error)
int narrow{3.14};  // ✗ ERROR: narrowing conversion

// Value initialization (zero)
int zero{};          // 0
double dzero{};      // 0.0
std::string empty{}; // ""

// Direct initialization
int a(42);           // OK but allows narrowing
int b = 42;          // copy initialization
int c{42};           // ✓ preferred — brace initialization
```

---

## 2. auto Type Deduction

```cpp
// auto deduces the type from the initializer
auto x = 42;                          // int
auto d = 3.14;                        // double
auto name = std::string("Alice");     // std::string
auto ptr = std::make_unique<Widget>(); // std::unique_ptr<Widget>

// auto with references — must be explicit
auto val = container[0];              // copies
auto& ref = container[0];            // reference (no copy)
const auto& cref = container[0];     // const reference

// auto with iterators
auto it = vec.begin();               // std::vector<int>::iterator
auto cit = vec.cbegin();             // std::vector<int>::const_iterator

// Return type deduction (C++14)
auto add(int a, int b) {
    return a + b;  // deduced as int
}

// Trailing return type (C++11)
auto divide(double a, double b) -> double {
    return a / b;
}

// decltype — deduce type from expression
int x = 10;
decltype(x) y = 20;                  // int
decltype(auto) ref = (x);            // int& (preserves reference)
```

### auto Best Practices

```cpp
// ✓ Use auto when type is clear from context
auto widget = std::make_unique<Widget>();
auto it = map.find(key);
auto [key, value] = *it;

// ✗ Avoid auto when type is unclear
auto result = compute();  // What type? Reader must check compute()

// ✓ Always use auto for lambda storage
auto comparator = [](int a, int b) { return a < b; };

// ✓ Use auto in range-based for
for (const auto& item : container) { ... }
```

---

## 3. References

### Lvalue References

```cpp
int x = 42;
int& ref = x;        // ref is an alias for x
ref = 100;            // modifies x
// int& bad;          // ✗ ERROR: references must be initialized

// const reference — can bind to rvalues
const int& cref = x;      // OK
const int& rval = 42;     // OK — extends lifetime of temporary
// cref = 100;            // ✗ ERROR: cannot modify through const ref

// Reference parameters — prefer const ref for read-only
void print(const std::string& text) {
    std::cout << text << '\n';
}

// Non-const ref for output parameters (prefer return instead)
void getValues(int& out_x, int& out_y) {
    out_x = 10;
    out_y = 20;
}
```

### References vs Pointers

```cpp
// Use references when:
// - The target always exists (never null)
// - Rebinding is not needed
// - Cleaner syntax is desired
void process(const Widget& w);

// Use pointers when:
// - Null is a valid state (optional parameter)
// - Rebinding to different objects is needed
// - Working with polymorphic ownership
void process(Widget* w);  // w can be nullptr
```

---

## 4. constexpr and consteval

### constexpr (C++11/14)

```cpp
// constexpr variables — computed at compile time
constexpr int kMaxSize = 1024;
constexpr double kPi = 3.14159265358979;

// constexpr functions — can be evaluated at compile time
constexpr int factorial(int n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}

constexpr int fact5 = factorial(5);  // computed at compile time: 120

// constexpr with arrays
constexpr std::array<int, 3> values = {1, 2, 3};

// constexpr if (C++17) — compile-time branch
template <typename T>
auto getValue(T t) {
    if constexpr (std::is_pointer_v<T>) {
        return *t;
    } else {
        return t;
    }
}
```

### consteval (C++20)

```cpp
// consteval — MUST be evaluated at compile time
consteval int compileTimeOnly(int x) {
    return x * x;
}

constexpr int a = compileTimeOnly(5);  // OK: compile-time
// int b = compileTimeOnly(runtime_val);  // ✗ ERROR: not compile-time
```

### constinit (C++20)

```cpp
// constinit — initialized at compile time, but mutable at runtime
constinit int global_counter = 0;  // no static initialization order fiasco
```

---

## 5. Structured Bindings (C++17)

```cpp
#include <map>
#include <tuple>

// With std::pair / std::tuple
auto [x, y] = std::make_pair(1, 2);
auto [a, b, c] = std::make_tuple(1, "hello", 3.14);

// With std::map iteration
std::map<std::string, int> scores = {{"Alice", 95}, {"Bob", 87}};
for (const auto& [name, score] : scores) {
    std::cout << name << ": " << score << '\n';
}

// With structs
struct Point { double x; double y; };
Point p{3.0, 4.0};
auto [px, py] = p;

// With arrays
int arr[] = {1, 2, 3};
auto [first, second, third] = arr;

// Mutable bindings
auto& [key, value] = *map.begin();
value = 42;  // modifies the map entry
```

---

## 6. Range-Based For Loops

```cpp
std::vector<int> nums = {1, 2, 3, 4, 5};

// Read-only — const reference
for (const auto& n : nums) {
    std::cout << n << ' ';
}

// Modify elements — non-const reference
for (auto& n : nums) {
    n *= 2;
}

// Copy (usually not desired for complex types)
for (auto n : nums) {
    // n is a copy
}

// With initializer (C++20)
for (auto v = getVector(); const auto& item : v) {
    process(item);
}
```

---

## 7. Type Aliases

```cpp
// using (preferred over typedef)
using StringVector = std::vector<std::string>;
using Callback = std::function<void(int)>;
using StringMap = std::unordered_map<std::string, std::string>;

// Template aliases
template <typename T>
using Vec = std::vector<T>;

template <typename T>
using UniquePtr = std::unique_ptr<T>;

Vec<int> numbers;           // std::vector<int>
UniquePtr<Widget> widget;   // std::unique_ptr<Widget>

// Avoid typedef — using is clearer and supports templates
typedef std::vector<std::string> StringVector;  // ✗ old style
```

---

## 8. Namespaces

```cpp
// Namespace declaration
namespace myapp {

class Config { /* ... */ };
void initialize();

}  // namespace myapp

// Nested namespaces (C++17)
namespace myapp::net::http {

class Client { /* ... */ };

}  // namespace myapp::net::http

// Using declarations — prefer specific over global
using std::string;
using std::vector;

// ✗ Never use 'using namespace' in headers
// using namespace std;  // BAD — pollutes global namespace

// Inline namespaces — for API versioning
namespace mylib {
inline namespace v2 {
    void process();  // mylib::process() resolves to v2
}
namespace v1 {
    void process();  // mylib::v1::process() for old version
}
}

// Anonymous namespace — internal linkage (replaces static)
namespace {
    int internal_helper() { return 42; }  // file-scoped
}
```

---

## 9. Enumerations

```cpp
// Scoped enums (C++11) — strongly typed, no implicit conversion
enum class Color { Red, Green, Blue };
enum class LogLevel : uint8_t { Debug = 0, Info, Warning, Error, Fatal };

Color c = Color::Red;
// int x = c;              // ✗ ERROR: no implicit conversion
int x = static_cast<int>(c);  // explicit conversion

// Switch on enums
switch (c) {
    case Color::Red:   break;
    case Color::Green: break;
    case Color::Blue:  break;
    // compiler warns about missing cases
}

// ✗ Avoid unscoped enums in new code
enum OldColor { RED, GREEN, BLUE };  // pollutes namespace
```

---

## 10. Literal Suffixes

```cpp
// Integer literals
auto a = 42;          // int
auto b = 42L;         // long
auto c = 42LL;        // long long
auto d = 42U;         // unsigned int
auto e = 42ULL;       // unsigned long long

// Floating-point literals
auto f = 3.14f;       // float
auto g = 3.14;        // double
auto h = 3.14L;       // long double

// String literals
auto s1 = "hello";               // const char*
auto s2 = "hello"s;              // std::string (C++14, needs using namespace std::literals)
auto s3 = u8"hello";             // UTF-8 string
auto s4 = R"(raw "string" \n)";  // raw string — no escaping

// Binary and hex literals
auto bin = 0b1010;        // 10 in binary (C++14)
auto hex = 0xFF;          // 255 in hex

// Digit separators (C++14)
auto big = 1'000'000;            // 1000000
auto precise = 3.141'592'653;   // 3.141592653
auto flags = 0b1111'0000;       // 0xF0
```
