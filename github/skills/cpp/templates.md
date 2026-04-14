---
name: cpp-templates
description: "C++ templates — function templates, class templates, variadic templates, template specialization, SFINAE, type traits, concepts (C++20), constrained templates, and template metaprogramming. Use when: writing generic/reusable code; function/class templates; variadic templates; SFINAE; concepts; template specialization. DO NOT USE FOR: OOP patterns without templates (use cpp-oop); STL container usage (use cpp-containers-iterators); STL algorithms (use cpp-stl-algorithms)."
---

# C++ Templates

## 1. Function Templates

### Basic Syntax

```cpp
// Template function — works with any comparable type
template <typename T>
T maxValue(T a, T b) {
    return (a > b) ? a : b;
}

// Usage — type deduced from arguments
int m1 = maxValue(3, 7);          // T = int
double m2 = maxValue(3.14, 2.71); // T = double

// Explicit template argument
auto m3 = maxValue<double>(3, 2.71);  // force T = double
```

### Multiple Template Parameters

```cpp
template <typename T, typename U>
auto add(T a, U b) -> decltype(a + b) {
    return a + b;
}

// C++14: trailing return type not needed
template <typename T, typename U>
auto add(T a, U b) {
    return a + b;
}

auto result = add(3, 2.5);  // T=int, U=double, returns double
```

### Non-Type Template Parameters

```cpp
template <typename T, std::size_t N>
class FixedArray {
public:
    T& operator[](std::size_t index) { return data_[index]; }
    const T& operator[](std::size_t index) const { return data_[index]; }
    [[nodiscard]] constexpr std::size_t size() const { return N; }

private:
    T data_[N];
};

FixedArray<int, 10> arr;
arr[0] = 42;
```

---

## 2. Class Templates

### Basic Class Template

```cpp
template <typename T>
class Stack {
public:
    void push(const T& value) {
        data_.push_back(value);
    }

    void push(T&& value) {
        data_.push_back(std::move(value));
    }

    [[nodiscard]] T& top() {
        if (data_.empty()) {
            throw std::runtime_error("Stack is empty");
        }
        return data_.back();
    }

    void pop() {
        if (data_.empty()) {
            throw std::runtime_error("Stack is empty");
        }
        data_.pop_back();
    }

    [[nodiscard]] bool empty() const { return data_.empty(); }
    [[nodiscard]] std::size_t size() const { return data_.size(); }

private:
    std::vector<T> data_;
};

// Usage
Stack<int> intStack;
intStack.push(42);

Stack<std::string> strStack;
strStack.push("hello");
```

### Template with Default Arguments

```cpp
template <typename T, typename Container = std::vector<T>>
class Queue {
public:
    void enqueue(const T& value) { data_.push_back(value); }
    T dequeue() {
        T front = std::move(data_.front());
        data_.erase(data_.begin());
        return front;
    }

private:
    Container data_;
};

Queue<int> q1;                        // uses std::vector<int>
Queue<int, std::deque<int>> q2;       // uses std::deque<int>
```

---

## 3. Template Specialization

### Full Specialization

```cpp
// Primary template
template <typename T>
class Serializer {
public:
    static std::string serialize(const T& value) {
        // generic implementation using to_string
        return std::to_string(value);
    }
};

// Full specialization for std::string
template <>
class Serializer<std::string> {
public:
    static std::string serialize(const std::string& value) {
        return "\"" + value + "\"";
    }
};

// Full specialization for bool
template <>
class Serializer<bool> {
public:
    static std::string serialize(bool value) {
        return value ? "true" : "false";
    }
};
```

### Partial Specialization

```cpp
// Primary template
template <typename T, typename U>
class Pair {
public:
    T first;
    U second;
};

// Partial specialization — both types are the same
template <typename T>
class Pair<T, T> {
public:
    T first;
    T second;
    T sum() const { return first + second; }
};

// Partial specialization — second type is a pointer
template <typename T, typename U>
class Pair<T, U*> {
public:
    T first;
    U* second;
    // special handling for pointer second member
};
```

### Function Template Overloading (instead of specialization)

```cpp
// Prefer overloading over function template specialization
template <typename T>
std::string toString(const T& value) {
    return std::to_string(value);
}

// Overload for std::string — not a specialization
std::string toString(const std::string& value) {
    return value;
}

// Overload for const char*
std::string toString(const char* value) {
    return std::string(value);
}
```

---

## 4. Variadic Templates

### Basic Variadic Template

```cpp
// Base case
void print() {
    std::cout << '\n';
}

// Recursive case
template <typename T, typename... Args>
void print(const T& first, const Args&... rest) {
    std::cout << first;
    if constexpr (sizeof...(rest) > 0) {
        std::cout << ", ";
    }
    print(rest...);
}

print(1, "hello", 3.14, true);  // "1, hello, 3.14, 1\n"
```

### Fold Expressions (C++17)

```cpp
// Sum all arguments
template <typename... Args>
auto sum(Args... args) {
    return (args + ...);  // unary right fold
}

// Print all arguments
template <typename... Args>
void printAll(const Args&... args) {
    ((std::cout << args << ' '), ...);  // comma fold
    std::cout << '\n';
}

// Check if all arguments satisfy a predicate
template <typename... Args>
bool allPositive(Args... args) {
    return ((args > 0) && ...);  // unary right fold with &&
}

sum(1, 2, 3, 4);           // 10
printAll("a", "b", "c");   // a b c
allPositive(1, 2, 3);      // true
allPositive(1, -2, 3);     // false
```

### Perfect Forwarding with Variadic Templates

```cpp
template <typename T, typename... Args>
std::unique_ptr<T> makeUnique(Args&&... args) {
    return std::unique_ptr<T>(new T(std::forward<Args>(args)...));
}

auto ptr = makeUnique<Widget>(42, "hello");
```

---

## 5. SFINAE (Substitution Failure Is Not An Error)

### std::enable_if

```cpp
#include <type_traits>

// Enable only for integral types
template <typename T>
typename std::enable_if_t<std::is_integral_v<T>, T>
safeAdd(T a, T b) {
    // check overflow for signed types
    if constexpr (std::is_signed_v<T>) {
        if (b > 0 && a > std::numeric_limits<T>::max() - b) {
            throw std::overflow_error("Integer overflow");
        }
    }
    return a + b;
}

// Enable only for floating-point types
template <typename T>
typename std::enable_if_t<std::is_floating_point_v<T>, T>
safeAdd(T a, T b) {
    return a + b;
}
```

### Type Traits

```cpp
#include <type_traits>

// Common type traits
static_assert(std::is_integral_v<int>);
static_assert(std::is_floating_point_v<double>);
static_assert(std::is_same_v<int, int>);
static_assert(std::is_base_of_v<Shape, Circle>);
static_assert(std::is_constructible_v<Widget, int>);
static_assert(std::is_move_constructible_v<Widget>);
static_assert(std::is_trivially_copyable_v<int>);

// Conditional types
using ResultType = std::conditional_t<sizeof(int) >= 4, int, long>;

// Remove qualifiers
using Bare = std::remove_cvref_t<const int&>;  // int (C++20)
using NoPtr = std::remove_pointer_t<int*>;      // int
```

---

## 6. Concepts (C++20)

### Defining Concepts

```cpp
#include <concepts>

// Simple concept
template <typename T>
concept Numeric = std::is_arithmetic_v<T>;

// Compound concept
template <typename T>
concept Addable = requires(T a, T b) {
    { a + b } -> std::convertible_to<T>;
};

// Concept with multiple requirements
template <typename T>
concept Printable = requires(T t, std::ostream& os) {
    { os << t } -> std::same_as<std::ostream&>;
};

// Concept using existing concepts
template <typename T>
concept Sortable = std::totally_ordered<T> && std::movable<T>;
```

### Using Concepts

```cpp
// Constrained template — requires clause
template <Numeric T>
T add(T a, T b) {
    return a + b;
}

// Alternative syntax — requires clause after template
template <typename T>
    requires Numeric<T>
T multiply(T a, T b) {
    return a * b;
}

// Abbreviated function template (C++20)
auto square(Numeric auto x) {
    return x * x;
}

// Constrained auto
Numeric auto result = add(3, 4);
```

### Standard Library Concepts

```cpp
#include <concepts>

// Common standard concepts
template <std::integral T>       // integer types
void processInt(T val);

template <std::floating_point T> // float/double
void processFloat(T val);

template <std::movable T>        // has move operations
void transfer(T&& val);

template <std::copyable T>       // has copy operations
void duplicate(const T& val);

template <std::equality_comparable T>  // supports ==
bool isEqual(const T& a, const T& b);

template <std::totally_ordered T>      // supports <, >, <=, >=
T findMax(const T& a, const T& b);

template <std::invocable<int> F>       // callable with int
void apply(F&& func, int val);

template <std::ranges::range R>        // is a range
void process(R&& range);
```

---

## 7. Template Best Practices

```cpp
// ✓ Prefer concepts (C++20) over SFINAE
template <std::integral T>
T safeIncrement(T value) { return value + 1; }

// ✗ Avoid complex SFINAE in new code when concepts are available
template <typename T, std::enable_if_t<std::is_integral_v<T>, int> = 0>
T safeIncrement(T value) { return value + 1; }

// ✓ Use if constexpr for compile-time branching
template <typename T>
auto process(T value) {
    if constexpr (std::is_integral_v<T>) {
        return value * 2;
    } else if constexpr (std::is_floating_point_v<T>) {
        return value * 2.0;
    } else {
        static_assert(false, "Unsupported type");
    }
}

// ✓ Use static_assert for clear error messages
template <typename T>
class Container {
    static_assert(std::is_default_constructible_v<T>,
                  "Container requires default-constructible types");
};

// ✓ Separate declaration and definition in headers for templates
// (Templates must be visible at instantiation point)

// ✗ Don't over-templatize — use templates only when multiple types are needed
```
