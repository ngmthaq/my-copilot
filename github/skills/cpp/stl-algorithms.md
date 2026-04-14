---
name: cpp-stl-algorithms
description: "C++ STL algorithms and ranges — sorting, searching, transforming, accumulating, partitioning, lambda expressions, custom comparators, ranges (C++20), views, and algorithm composition. Use when: using STL algorithms (sort, find, transform); writing lambdas; using ranges and views (C++20); custom comparators; functional-style data processing. DO NOT USE FOR: container basics (use cpp-containers-iterators); template metaprogramming (use cpp-templates)."
---

# C++ STL Algorithms

## 1. Lambda Expressions

### Basic Syntax

```cpp
// [capture](parameters) -> return_type { body }
auto square = [](int x) { return x * x; };
square(5);  // 25

// Capture modes
int factor = 3;
auto multiply = [factor](int x) { return x * factor; };    // capture by value
auto addTo = [&factor](int x) { factor += x; };            // capture by reference
auto all_val = [=](int x) { return x * factor; };          // capture all by value
auto all_ref = [&](int x) { factor += x; };                // capture all by reference

// Mutable lambda (modify captured-by-value variables)
auto counter = [n = 0]() mutable { return ++n; };
counter();  // 1
counter();  // 2

// Generic lambda (C++14)
auto add = [](auto a, auto b) { return a + b; };
add(1, 2);      // int
add(1.5, 2.5);  // double

// Lambda with explicit template (C++20)
auto cast = []<typename T>(auto value) { return static_cast<T>(value); };
```

### Immediately Invoked Lambda

```cpp
// Useful for complex initialization
const auto config = [&] {
    Config c;
    c.host = getEnv("HOST");
    c.port = std::stoi(getEnv("PORT"));
    c.debug = getEnv("DEBUG") == "1";
    return c;
}();  // note the () — immediately invoked
```

---

## 2. Non-Modifying Algorithms

### Searching

```cpp
#include <algorithm>

std::vector<int> v{3, 1, 4, 1, 5, 9, 2, 6};

// Find element
auto it = std::find(v.begin(), v.end(), 5);
if (it != v.end()) {
    std::cout << "Found at index: " << std::distance(v.begin(), it) << '\n';
}

// Find with predicate
auto it2 = std::find_if(v.begin(), v.end(), [](int x) { return x > 5; });

// Find if not
auto it3 = std::find_if_not(v.begin(), v.end(), [](int x) { return x > 0; });

// Count
int count = std::count(v.begin(), v.end(), 1);
int count_if = std::count_if(v.begin(), v.end(), [](int x) { return x % 2 == 0; });

// Binary search (requires sorted range)
std::sort(v.begin(), v.end());
bool found = std::binary_search(v.begin(), v.end(), 4);
auto lower = std::lower_bound(v.begin(), v.end(), 4);  // first >= 4
auto upper = std::upper_bound(v.begin(), v.end(), 4);  // first > 4
auto [lo, hi] = std::equal_range(v.begin(), v.end(), 4);
```

### Checking Conditions

```cpp
std::vector<int> v{2, 4, 6, 8};

bool allEven = std::all_of(v.begin(), v.end(), [](int x) { return x % 2 == 0; });
bool anyOdd = std::any_of(v.begin(), v.end(), [](int x) { return x % 2 != 0; });
bool noneNeg = std::none_of(v.begin(), v.end(), [](int x) { return x < 0; });
```

### Comparing

```cpp
std::vector<int> a{1, 2, 3};
std::vector<int> b{1, 2, 3};

bool equal = std::equal(a.begin(), a.end(), b.begin());
auto [it1, it2] = std::mismatch(a.begin(), a.end(), b.begin());
```

---

## 3. Modifying Algorithms

### Transforming

```cpp
std::vector<int> src{1, 2, 3, 4, 5};
std::vector<int> dst(src.size());

// Transform — apply function to each element
std::transform(src.begin(), src.end(), dst.begin(),
    [](int x) { return x * x; });
// dst: {1, 4, 9, 16, 25}

// Transform with two ranges
std::vector<int> a{1, 2, 3};
std::vector<int> b{10, 20, 30};
std::vector<int> result(3);
std::transform(a.begin(), a.end(), b.begin(), result.begin(),
    [](int x, int y) { return x + y; });
// result: {11, 22, 33}
```

### For Each

```cpp
std::for_each(v.begin(), v.end(), [](int& x) { x *= 2; });

// C++20: for_each_n
std::for_each_n(v.begin(), 3, [](int& x) { x *= 2; });
```

### Filling and Generating

```cpp
std::vector<int> v(10);

std::fill(v.begin(), v.end(), 42);           // all 42
std::iota(v.begin(), v.end(), 0);            // 0, 1, 2, ..., 9
std::generate(v.begin(), v.end(), [n = 0]() mutable { return n++; });

// Fill N elements
std::fill_n(v.begin(), 5, 99);
```

### Copying and Moving

```cpp
std::vector<int> src{1, 2, 3, 4, 5};
std::vector<int> dst(5);

std::copy(src.begin(), src.end(), dst.begin());
std::copy_if(src.begin(), src.end(), std::back_inserter(dst),
    [](int x) { return x > 2; });
std::copy_n(src.begin(), 3, dst.begin());

// Move elements
std::vector<std::string> strings{"a", "b", "c"};
std::vector<std::string> moved(3);
std::move(strings.begin(), strings.end(), moved.begin());
```

### Removing (Erase-Remove Idiom)

```cpp
std::vector<int> v{1, 2, 3, 2, 4, 2, 5};

// std::remove doesn't erase — it moves unwanted elements to end
auto new_end = std::remove(v.begin(), v.end(), 2);
v.erase(new_end, v.end());  // actually remove them
// v: {1, 3, 4, 5}

// remove_if
v.erase(std::remove_if(v.begin(), v.end(),
    [](int x) { return x < 3; }), v.end());

// C++20 — simpler
std::erase(v, 2);
std::erase_if(v, [](int x) { return x < 3; });
```

### Replacing

```cpp
std::replace(v.begin(), v.end(), 2, 99);  // 2 → 99
std::replace_if(v.begin(), v.end(),
    [](int x) { return x < 0; }, 0);      // negative → 0
```

---

## 4. Sorting and Ordering

```cpp
std::vector<int> v{3, 1, 4, 1, 5, 9, 2, 6};

// Sort ascending (default)
std::sort(v.begin(), v.end());

// Sort descending
std::sort(v.begin(), v.end(), std::greater<>());

// Sort with custom comparator
struct Person { std::string name; int age; };
std::vector<Person> people = { {"Alice", 30}, {"Bob", 25}, {"Charlie", 35} };
std::sort(people.begin(), people.end(),
    [](const Person& a, const Person& b) { return a.age < b.age; });

// Stable sort — preserves relative order of equal elements
std::stable_sort(v.begin(), v.end());

// Partial sort — sort first N elements
std::partial_sort(v.begin(), v.begin() + 3, v.end());

// Nth element — put nth element in its sorted position
std::nth_element(v.begin(), v.begin() + v.size()/2, v.end());
// v[v.size()/2] is the median

// Check if sorted
bool sorted = std::is_sorted(v.begin(), v.end());
```

### Partitioning

```cpp
std::vector<int> v{1, 8, 3, 6, 2, 7, 4, 5};

// Partition: elements satisfying predicate come first
auto pivot = std::partition(v.begin(), v.end(),
    [](int x) { return x % 2 == 0; });
// even elements before pivot, odd after

// Stable partition — preserves relative order within groups
std::stable_partition(v.begin(), v.end(),
    [](int x) { return x % 2 == 0; });
```

---

## 5. Numeric Algorithms

```cpp
#include <numeric>

std::vector<int> v{1, 2, 3, 4, 5};

// Accumulate (fold left)
int sum = std::accumulate(v.begin(), v.end(), 0);  // 15
int product = std::accumulate(v.begin(), v.end(), 1, std::multiplies<>());

// Reduce (C++17, parallelizable)
int sum2 = std::reduce(v.begin(), v.end());

// Inner product
std::vector<int> a{1, 2, 3};
std::vector<int> b{4, 5, 6};
int dot = std::inner_product(a.begin(), a.end(), b.begin(), 0);  // 32

// Partial sum (prefix sum)
std::vector<int> prefix(v.size());
std::partial_sum(v.begin(), v.end(), prefix.begin());
// prefix: {1, 3, 6, 10, 15}

// Adjacent difference
std::vector<int> diff(v.size());
std::adjacent_difference(v.begin(), v.end(), diff.begin());
```

---

## 6. Ranges (C++20)

### Basic Range Algorithms

```cpp
#include <ranges>
#include <algorithm>

std::vector<int> v{3, 1, 4, 1, 5, 9, 2, 6};

// Range versions — pass the container directly (no begin/end)
std::ranges::sort(v);
std::ranges::reverse(v);
auto it = std::ranges::find(v, 5);
bool has = std::ranges::contains(v, 5);  // C++23
int n = std::ranges::count_if(v, [](int x) { return x > 3; });
```

### Views (Lazy Evaluation)

```cpp
#include <ranges>

std::vector<int> v{1, 2, 3, 4, 5, 6, 7, 8, 9, 10};

// Filter and transform — evaluated lazily
auto result = v
    | std::views::filter([](int x) { return x % 2 == 0; })  // keep even
    | std::views::transform([](int x) { return x * x; });   // square

for (int val : result) {
    std::cout << val << ' ';  // 4 16 36 64 100
}

// Common views
auto first5 = v | std::views::take(5);        // first 5 elements
auto after3 = v | std::views::drop(3);        // skip first 3
auto rev = v | std::views::reverse;            // reversed
auto keys = map | std::views::keys;            // keys of a map
auto vals = map | std::views::values;          // values of a map

// Iota view — generate sequence
for (int i : std::views::iota(0, 10)) {
    // 0, 1, 2, ..., 9
}

// Enumerate (C++23)
for (auto [idx, val] : v | std::views::enumerate) {
    std::cout << idx << ": " << val << '\n';
}

// Zip (C++23)
std::vector<std::string> names{"Alice", "Bob"};
std::vector<int> ages{30, 25};
for (auto [name, age] : std::views::zip(names, ages)) {
    std::cout << name << " is " << age << '\n';
}
```

### Composing Views

```cpp
// Views compose via pipe operator — no intermediate containers
auto pipeline = std::views::iota(1, 100)
    | std::views::filter([](int x) { return x % 3 == 0; })
    | std::views::transform([](int x) { return x * x; })
    | std::views::take(5);

// Collect into a container
auto vec = pipeline | std::ranges::to<std::vector>();  // C++23
// Or manually:
std::vector<int> vec(pipeline.begin(), pipeline.end());
```

---

## 7. Algorithm Best Practices

```cpp
// ✓ Prefer STL algorithms over raw loops
// BAD
bool found = false;
for (const auto& item : v) {
    if (item > threshold) { found = true; break; }
}

// GOOD
bool found = std::any_of(v.begin(), v.end(),
    [&](const auto& item) { return item > threshold; });

// ✓ Use ranges (C++20) for cleaner syntax
bool found = std::ranges::any_of(v, [&](auto x) { return x > threshold; });

// ✓ Use std::back_inserter when output size is unknown
std::vector<int> result;
std::copy_if(v.begin(), v.end(), std::back_inserter(result),
    [](int x) { return x > 0; });

// ✓ Use execution policies for parallel algorithms (C++17)
#include <execution>
std::sort(std::execution::par, v.begin(), v.end());
std::for_each(std::execution::par_unseq, v.begin(), v.end(),
    [](auto& x) { x *= 2; });
```
