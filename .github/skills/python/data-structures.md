---
name: python-data-structures
description: "Python data structures — lists, tuples, dicts, sets, comprehensions, collections module, and choosing the right structure. Use when: working with lists, dicts, sets, tuples; writing comprehensions; using collections module (defaultdict, Counter, deque, namedtuple); choosing the right data structure. DO NOT USE FOR: core type system (use python-core-fundamentals); class design (use python-oop)."
---

# Python Data Structures

## 1. Lists

```python
# Creation
items = [1, 2, 3]
items = list(range(10))
items = [0] * 5                # [0, 0, 0, 0, 0]

# Access
items[0]                       # first element
items[-1]                      # last element
items[1:3]                     # slice [1, 2]
items[::2]                     # every other [0, 2, 4, ...]
items[::-1]                    # reversed

# Modification
items.append(4)                # add to end
items.insert(0, "first")       # insert at index
items.extend([5, 6])           # add multiple
items.remove("first")          # remove first occurrence
items.pop()                    # remove and return last
items.pop(0)                   # remove and return at index
del items[1:3]                 # delete slice
items.sort()                   # in-place sort
items.sort(key=len, reverse=True)
sorted_items = sorted(items)   # returns new sorted list
items.reverse()                # in-place reverse
items.clear()                  # remove all

# Searching
3 in items                     # O(n) membership
items.index(3)                 # first index of value
items.count(3)                 # count occurrences
```

---

## 2. Tuples

```python
# Creation
point = (1, 2)
single = (42,)                 # note the trailing comma
empty = ()
coords = tuple([1, 2, 3])

# Access (same as list, but immutable)
point[0]                       # 1
x, y = point                   # unpacking

# Use cases
# - Return multiple values from functions
# - Dictionary keys (hashable)
# - Immutable sequences (data integrity)
# - Named tuples for readable structs
```

---

## 3. Dictionaries

```python
# Creation
user = {"name": "Alice", "age": 30}
user = dict(name="Alice", age=30)
from_pairs = dict([("a", 1), ("b", 2)])
merged = {**dict1, **dict2}          # merge (3.5+)
merged = dict1 | dict2               # merge (3.9+)

# Access
user["name"]                         # KeyError if missing
user.get("name")                     # None if missing
user.get("role", "viewer")           # default if missing

# Modification
user["email"] = "alice@example.com"  # add/update
user.update({"age": 31, "city": "NYC"})
user.setdefault("role", "viewer")    # set only if missing
user.pop("city")                     # remove and return
del user["age"]                      # remove

# Iteration
for key in user:                     # keys
    print(key)
for key, value in user.items():      # key-value pairs
    print(f"{key}: {value}")
for value in user.values():          # values only
    print(value)

# Useful patterns
keys = user.keys()                   # view object
values = user.values()               # view object
items = user.items()                 # view object
```

---

## 4. Sets

```python
# Creation
colors = {"red", "green", "blue"}
colors = set(["red", "green", "red"])  # {"red", "green"}
empty = set()                          # NOT {} (that's a dict)

# Operations
colors.add("yellow")
colors.remove("red")             # KeyError if missing
colors.discard("red")            # no error if missing
colors.pop()                     # remove arbitrary element

# Set algebra
a = {1, 2, 3}
b = {2, 3, 4}
a | b               # union: {1, 2, 3, 4}
a & b               # intersection: {2, 3}
a - b               # difference: {1}
a ^ b               # symmetric difference: {1, 4}
a <= b              # subset check
a >= b              # superset check
a.isdisjoint(b)     # no common elements?

# Frozen set (immutable, hashable — can be dict key)
fs = frozenset([1, 2, 3])
```

---

## 5. Comprehensions

```python
# List comprehension
squares = [x**2 for x in range(10)]
evens = [x for x in range(20) if x % 2 == 0]
flat = [x for row in matrix for x in row]

# Dict comprehension
word_lengths = {word: len(word) for word in words}
filtered = {k: v for k, v in data.items() if v is not None}

# Set comprehension
unique_lengths = {len(word) for word in words}

# Generator expression (lazy — no brackets)
total = sum(x**2 for x in range(1000000))
first_match = next(x for x in items if x > 100)

# Nested comprehension (keep readable)
# ✓ OK
pairs = [(x, y) for x in range(3) for y in range(3)]

# ✗ Too complex — use a regular loop
result = [
    transform(x, y, z)
    for x in range(10)
    for y in range(10)
    if condition(x, y)
    for z in range(10)
    if another_condition(y, z)
]
```

---

## 6. Collections Module

### defaultdict

```python
from collections import defaultdict

# Group items
groups = defaultdict(list)
for item in items:
    groups[item.category].append(item)

# Count manually
counts = defaultdict(int)
for char in text:
    counts[char] += 1
```

### Counter

```python
from collections import Counter

word_counts = Counter(words)
char_counts = Counter("mississippi")
# Counter({'s': 4, 'i': 4, 'p': 2, 'm': 1})

word_counts.most_common(3)      # top 3
word_counts.total()             # sum of counts (3.10+)
combined = counter1 + counter2  # add counts
```

### deque

```python
from collections import deque

# Efficient append/pop from both ends — O(1)
dq = deque([1, 2, 3])
dq.appendleft(0)     # [0, 1, 2, 3]
dq.popleft()          # 0
dq.append(4)          # [1, 2, 3, 4]
dq.rotate(1)          # [4, 1, 2, 3]

# Fixed-size buffer
recent = deque(maxlen=5)
for item in stream:
    recent.append(item)  # oldest auto-removed
```

### namedtuple

```python
from collections import namedtuple

Point = namedtuple("Point", ["x", "y"])
p = Point(1, 2)
p.x               # 1
p._asdict()        # {"x": 1, "y": 2}
p._replace(x=10)   # Point(x=10, y=2) — returns new

# Prefer dataclasses for new code (see oop.md)
```

### OrderedDict

```python
from collections import OrderedDict

# Regular dicts maintain insertion order since Python 3.7
# Use OrderedDict only when:
# - You need order-aware equality: OrderedDict(a=1, b=2) != OrderedDict(b=2, a=1)
# - You need move_to_end()
od = OrderedDict()
od["a"] = 1
od.move_to_end("a")          # move to end
od.move_to_end("a", last=False)  # move to beginning
```

---

## 7. Choosing the Right Structure

| Need                                 | Use                                       |
| ------------------------------------ | ----------------------------------------- |
| Ordered, mutable sequence            | `list`                                    |
| Immutable sequence / dict key        | `tuple`                                   |
| Key-value mapping                    | `dict`                                    |
| Unique elements, set operations      | `set`                                     |
| Fast membership testing              | `set` or `frozenset`                      |
| Count occurrences                    | `Counter`                                 |
| Group by key                         | `defaultdict(list)`                       |
| FIFO queue / sliding window          | `deque`                                   |
| Lightweight record with named fields | `namedtuple` or dataclass                 |
| Sorted collection                    | `list` + `bisect` or `SortedList`         |
| Sparse matrix / graph adjacency      | `defaultdict(dict)` or `defaultdict(set)` |

---

## 8. Anti-Patterns

```python
# ✗ Using list when set is appropriate for lookups
if item in big_list:   # O(n)

# ✓ Use set for O(1) lookups
allowed = set(big_list)
if item in allowed:    # O(1)

# ✗ Building dict with repeated key checks
result = {}
for item in items:
    if item.key not in result:
        result[item.key] = []
    result[item.key].append(item)

# ✓ Use defaultdict
result = defaultdict(list)
for item in items:
    result[item.key].append(item)

# ✗ Mutating list while iterating
for item in items:
    if should_remove(item):
        items.remove(item)  # skips elements!

# ✓ Build new list or iterate over copy
items = [item for item in items if not should_remove(item)]
```
