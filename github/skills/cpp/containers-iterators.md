---
name: cpp-containers-iterators
description: "C++ STL containers and iterators — vector, array, deque, list, forward_list, map, unordered_map, set, unordered_set, stack, queue, priority_queue, span (C++20), iterator categories, custom iterators, and container selection guide. Use when: choosing the right container; using STL containers; working with iterators; custom container implementation. DO NOT USE FOR: algorithms on containers (use cpp-stl-algorithms); memory management patterns (use cpp-memory-management)."
---

# C++ STL Containers & Iterators

## 1. Container Selection Guide

```
What access pattern do you need?
│
├─ Random access by index
│   ├─ Fixed size at compile time → std::array
│   ├─ Dynamic size, grow at back → std::vector (default choice)
│   └─ Grow at both ends → std::deque
│
├─ Frequent insert/remove in middle
│   ├─ Bidirectional traversal → std::list
│   └─ Forward-only traversal → std::forward_list
│
├─ Key-value lookup
│   ├─ Ordered keys → std::map
│   ├─ Fast lookup (O(1) average) → std::unordered_map
│   ├─ Duplicate keys → std::multimap / std::unordered_multimap
│   └─ Read-only view of contiguous data → std::span (C++20)
│
├─ Unique elements (set)
│   ├─ Ordered → std::set
│   └─ Fast lookup → std::unordered_set
│
└─ Adapter (LIFO/FIFO)
    ├─ LIFO → std::stack
    ├─ FIFO → std::queue
    └─ Priority → std::priority_queue
```

---

## 2. Sequence Containers

### std::vector (Default Choice)

```cpp
#include <vector>

// Construction
std::vector<int> v1;                    // empty
std::vector<int> v2(10);               // 10 elements, value-initialized (0)
std::vector<int> v3(10, 42);           // 10 elements, all 42
std::vector<int> v4{1, 2, 3, 4, 5};   // initializer list
std::vector<int> v5(v4.begin(), v4.end());  // range

// Access
v4[0];           // unchecked access
v4.at(0);        // bounds-checked (throws std::out_of_range)
v4.front();      // first element
v4.back();       // last element
v4.data();       // raw pointer to underlying array

// Modification
v4.push_back(6);                // add to end
v4.emplace_back(7);             // construct in-place (more efficient)
v4.pop_back();                  // remove last
v4.insert(v4.begin() + 2, 99); // insert at position
v4.erase(v4.begin() + 2);      // erase at position
v4.clear();                      // remove all

// Size and capacity
v4.size();       // number of elements
v4.capacity();   // allocated storage
v4.empty();      // true if empty
v4.reserve(100); // pre-allocate (avoids reallocations)
v4.shrink_to_fit(); // release unused capacity
```

### std::array (Fixed Size)

```cpp
#include <array>

std::array<int, 5> arr{1, 2, 3, 4, 5};
arr[0];
arr.at(0);
arr.size();     // always 5 (constexpr)
arr.data();     // raw pointer
arr.fill(0);    // set all to 0

// Compile-time size — can be used in template parameters
constexpr auto size = arr.size();
```

### std::deque (Double-Ended Queue)

```cpp
#include <deque>

std::deque<int> dq{1, 2, 3};
dq.push_back(4);    // add to back
dq.push_front(0);   // add to front — not possible with vector
dq.pop_back();
dq.pop_front();
dq[2];               // random access supported
```

### std::list (Doubly Linked List)

```cpp
#include <list>

std::list<int> lst{3, 1, 4, 1, 5};
lst.push_back(9);
lst.push_front(2);
lst.sort();           // O(N log N) — list has its own sort
lst.unique();         // remove consecutive duplicates
lst.reverse();
lst.remove(1);        // remove all elements equal to 1
lst.splice(lst.end(), other_list);  // move elements from another list
// ✗ No random access: lst[0] is not available
```

---

## 3. Associative Containers

### std::map (Ordered Key-Value)

```cpp
#include <map>

std::map<std::string, int> scores;

// Insert
scores["Alice"] = 95;
scores.emplace("Bob", 87);
scores.insert({"Charlie", 92});
scores.insert_or_assign("Alice", 96);  // C++17 — update if exists

// Access
scores["Alice"];       // returns ref, inserts default if missing!
scores.at("Alice");    // throws if missing — safer

// Lookup
if (auto it = scores.find("Bob"); it != scores.end()) {
    std::cout << it->first << ": " << it->second << '\n';
}

if (scores.contains("Bob")) {  // C++20
    // exists
}

// Iteration — ordered by key
for (const auto& [name, score] : scores) {
    std::cout << name << ": " << score << '\n';
}

// Erase
scores.erase("Charlie");
scores.erase(scores.find("Bob"));
```

### std::unordered_map (Hash Table)

```cpp
#include <unordered_map>

std::unordered_map<std::string, int> cache;
cache["key1"] = 100;
cache.emplace("key2", 200);

// Same API as std::map, but:
// - O(1) average lookup (vs O(log N) for map)
// - Not ordered
// - Requires hashable keys (std::string, int, etc.)

// Custom hash for user-defined types
struct Point { int x, y; };

struct PointHash {
    std::size_t operator()(const Point& p) const {
        auto h1 = std::hash<int>{}(p.x);
        auto h2 = std::hash<int>{}(p.y);
        return h1 ^ (h2 << 1);
    }
};

std::unordered_map<Point, std::string, PointHash> point_map;
```

### std::set / std::unordered_set

```cpp
#include <set>
#include <unordered_set>

std::set<int> ordered_set{3, 1, 4, 1, 5};  // {1, 3, 4, 5} — sorted, unique
std::unordered_set<int> hash_set{3, 1, 4, 1, 5};  // unique, unordered

ordered_set.insert(2);
ordered_set.erase(3);
ordered_set.contains(4);  // C++20, true

// Set operations
std::set<int> a{1, 2, 3, 4};
std::set<int> b{3, 4, 5, 6};
std::set<int> result;

std::set_intersection(a.begin(), a.end(), b.begin(), b.end(),
                      std::inserter(result, result.begin()));
// result: {3, 4}
```

---

## 4. Container Adapters

```cpp
#include <stack>
#include <queue>

// Stack — LIFO
std::stack<int> stk;
stk.push(1);
stk.push(2);
stk.top();     // 2
stk.pop();     // removes top

// Queue — FIFO
std::queue<int> q;
q.push(1);
q.push(2);
q.front();     // 1
q.back();      // 2
q.pop();       // removes front

// Priority Queue — max-heap by default
std::priority_queue<int> pq;
pq.push(3);
pq.push(1);
pq.push(4);
pq.top();      // 4 (largest)
pq.pop();

// Min-heap
std::priority_queue<int, std::vector<int>, std::greater<>> min_pq;
```

---

## 5. std::span (C++20)

```cpp
#include <span>

// Non-owning view of contiguous memory
void process(std::span<const int> data) {
    for (int val : data) {
        std::cout << val << ' ';
    }
}

std::vector<int> vec{1, 2, 3, 4, 5};
std::array<int, 5> arr{1, 2, 3, 4, 5};
int raw[] = {1, 2, 3, 4, 5};

process(vec);   // works with vector
process(arr);   // works with array
process(raw);   // works with C-array

// Subviews
auto first3 = std::span(vec).first(3);
auto last2 = std::span(vec).last(2);
auto mid = std::span(vec).subspan(1, 3);
```

---

## 6. Iterators

### Iterator Categories

```
Input Iterator      → read forward once (istream)
Output Iterator     → write forward once (ostream)
Forward Iterator    → read/write forward multiple times (forward_list)
Bidirectional       → + backward (list, map, set)
Random Access       → + jump anywhere (vector, deque, array)
Contiguous (C++20)  → + guaranteed contiguous memory (vector, array, span)
```

### Common Iterator Operations

```cpp
std::vector<int> v{10, 20, 30, 40, 50};

auto it = v.begin();     // points to first element
auto end = v.end();      // past-the-end
auto rit = v.rbegin();   // reverse: points to last element

// Advance
std::advance(it, 2);     // move forward 2 positions
auto it2 = std::next(v.begin(), 3);  // non-mutating advance
auto it3 = std::prev(v.end());       // non-mutating backward

// Distance
auto dist = std::distance(v.begin(), v.end());  // 5

// Const iterators
auto cit = v.cbegin();   // const_iterator — cannot modify elements
```

### Iterator Invalidation

```cpp
// vector: insert/erase invalidates iterators at/after the point
// map/set: only erased iterator is invalidated
// unordered_map/set: rehash invalidates all iterators

// Safe erase pattern for map/set
for (auto it = m.begin(); it != m.end(); ) {
    if (shouldRemove(it->second)) {
        it = m.erase(it);  // returns next valid iterator
    } else {
        ++it;
    }
}

// Safe erase pattern for vector (erase-remove idiom)
v.erase(std::remove_if(v.begin(), v.end(),
    [](int x) { return x < 0; }), v.end());

// C++20 — simpler
std::erase_if(v, [](int x) { return x < 0; });
```

---

## 7. Performance Characteristics

| Container       | Access   | Insert (end) | Insert (mid) | Find     | Memory          |
| --------------- | -------- | ------------ | ------------ | -------- | --------------- |
| `vector`        | O(1)     | O(1)\*       | O(n)         | O(n)     | Contiguous      |
| `deque`         | O(1)     | O(1)         | O(n)         | O(n)     | Chunked         |
| `list`          | O(n)     | O(1)         | O(1)\*\*     | O(n)     | Per-node        |
| `map`           | O(log n) | O(log n)     | O(log n)     | O(log n) | Per-node (tree) |
| `unordered_map` | O(1) avg | O(1) avg     | O(1) avg     | O(1) avg | Hash table      |
| `set`           | —        | O(log n)     | O(log n)     | O(log n) | Per-node (tree) |
| `unordered_set` | —        | O(1) avg     | O(1) avg     | O(1) avg | Hash table      |

\* Amortized. \*\* If you already have an iterator to the position.
