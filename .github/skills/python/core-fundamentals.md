---
name: python-core-fundamentals
description: "Python core fundamentals — data types, variables, mutability, operators, control flow, scope, and string operations. Use when: explaining Python type system; debugging variable scope; understanding mutability; working with operators and control flow. DO NOT USE FOR: data structures in depth (use python-data-structures); functions/decorators (use python-functions); OOP (use python-oop)."
---

# Python Core Fundamentals

## 1. Data Types

### Built-in Types

```python
# Numeric
x = 42              # int — arbitrary precision
y = 3.14            # float — IEEE 754 double
z = 2 + 3j          # complex
big = 10**100        # Python handles big integers natively

# Text
name = "hello"       # str — immutable sequence of Unicode
raw = r"no\escape"   # raw string
multi = """line1
line2"""              # multi-line string

# Boolean
active = True        # bool — subclass of int
flag = False
bool(0)              # False
bool("")             # False
bool([])             # False
bool(None)           # False
# Everything else is truthy

# None
result = None        # NoneType — singleton
```

### Type Checking

```python
type(42)                    # <class 'int'>
isinstance(42, int)         # True
isinstance(42, (int, float))  # True — check multiple types
isinstance(True, int)       # True — bool is subclass of int
```

### Type Conversions

```python
int("42")           # 42
float("3.14")       # 3.14
str(42)             # "42"
bool(0)             # False
list("abc")         # ["a", "b", "c"]
tuple([1, 2, 3])    # (1, 2, 3)
set([1, 2, 2])      # {1, 2}
```

---

## 2. Variables and Assignment

### Assignment

```python
# Simple
x = 10

# Multiple assignment
a, b, c = 1, 2, 3

# Swap
a, b = b, a

# Unpacking
first, *rest = [1, 2, 3, 4]    # first=1, rest=[2, 3, 4]
first, *_, last = [1, 2, 3, 4]  # first=1, last=4

# Augmented assignment
x += 1    # x = x + 1
x *= 2    # x = x * 2
x //= 3   # x = x // 3
```

### Mutability

```python
# Immutable: int, float, str, tuple, frozenset, bytes
a = "hello"
b = a
a += " world"  # creates NEW string, b is still "hello"

# Mutable: list, dict, set, bytearray
a = [1, 2, 3]
b = a           # b references the SAME list
a.append(4)     # b is now [1, 2, 3, 4] too

# To copy mutable objects
import copy
b = a.copy()           # shallow copy
b = list(a)            # shallow copy
b = a[:]               # shallow copy (lists)
b = copy.deepcopy(a)   # deep copy (nested structures)
```

---

## 3. Operators

### Arithmetic

```python
10 + 3     # 13  — addition
10 - 3     # 7   — subtraction
10 * 3     # 30  — multiplication
10 / 3     # 3.333... — true division (always float)
10 // 3    # 3   — floor division
10 % 3     # 1   — modulo
10 ** 3    # 1000 — exponentiation
```

### Comparison

```python
a == b     # equality (value)
a != b     # inequality
a is b     # identity (same object)
a is not b # not same object
a < b      # less than
a <= b     # less or equal
# Chained comparisons
0 < x < 100           # equivalent to 0 < x and x < 100
a == b == c            # all equal
```

### Logical

```python
a and b    # short-circuits: returns a if falsy, else b
a or b     # short-circuits: returns a if truthy, else b
not a      # boolean negation

# Short-circuit patterns
name = user_name or "Anonymous"          # default value
result = connection and connection.query()  # safe access
```

### Walrus Operator (`:=`, Python 3.8+)

```python
# Assign and use in one expression
if (n := len(items)) > 10:
    print(f"Too many items: {n}")

# In while loops
while chunk := file.read(8192):
    process(chunk)

# In comprehensions
results = [y for x in data if (y := transform(x)) is not None]
```

---

## 4. Control Flow

### Conditionals

```python
if score >= 90:
    grade = "A"
elif score >= 80:
    grade = "B"
elif score >= 70:
    grade = "C"
else:
    grade = "F"

# Ternary expression
status = "pass" if score >= 60 else "fail"
```

### Match Statement (Python 3.10+)

```python
match command:
    case "quit":
        sys.exit(0)
    case "hello" | "hi":
        print("Hello!")
    case str(s) if s.startswith("/"):
        handle_path(s)
    case _:
        print(f"Unknown: {command}")

# Structural pattern matching
match point:
    case (0, 0):
        print("Origin")
    case (x, 0):
        print(f"X-axis at {x}")
    case (0, y):
        print(f"Y-axis at {y}")
    case (x, y):
        print(f"Point at ({x}, {y})")
```

### Loops

```python
# for loop
for item in items:
    process(item)

# for with index
for i, item in enumerate(items):
    print(f"{i}: {item}")

# for with zip
for name, score in zip(names, scores):
    print(f"{name}: {score}")

# while loop
while condition:
    do_something()
    if should_stop:
        break
    if should_skip:
        continue

# else clause (runs when loop completes without break)
for item in items:
    if item.matches(target):
        result = item
        break
else:
    result = None  # no break occurred
```

---

## 5. Scope (LEGB Rule)

```python
# L — Local: inside current function
# E — Enclosing: inside enclosing function (closures)
# G — Global: module level
# B — Built-in: Python builtins

x = "global"

def outer():
    x = "enclosing"

    def inner():
        x = "local"
        print(x)  # "local"

    inner()
    print(x)  # "enclosing"

print(x)  # "global"
```

### `global` and `nonlocal`

```python
counter = 0

def increment():
    global counter      # modify module-level variable
    counter += 1

def make_counter():
    count = 0
    def increment():
        nonlocal count  # modify enclosing variable
        count += 1
        return count
    return increment
```

---

## 6. String Operations

```python
# f-strings (preferred)
name = "World"
f"Hello, {name}!"
f"{price:.2f}"          # "3.14" — format spec
f"{items!r}"            # repr() of items
f"{value:>10}"          # right-align in 10 chars
f"{value:0>5}"          # zero-pad to 5 chars

# Common methods
"hello world".split()           # ["hello", "world"]
"a,b,c".split(",")             # ["a", "b", "c"]
", ".join(["a", "b", "c"])     # "a, b, c"
"  hello  ".strip()            # "hello"
"hello".upper()                # "HELLO"
"Hello".lower()                # "hello"
"hello world".title()          # "Hello World"
"hello world".replace("world", "Python")  # "hello Python"
"hello".startswith("he")       # True
"hello".endswith("lo")         # True
"hello" in "hello world"      # True
"42".isdigit()                 # True
"abc".isalpha()                # True
```

---

## 7. Anti-Patterns

```python
# ✗ Using == for None checks
if x == None:      # can be overridden by __eq__

# ✓ Use identity check
if x is None:

# ✗ Comparing to True/False explicitly
if active == True:

# ✓ Pythonic boolean check
if active:
if not active:

# ✗ Building strings with concatenation in loops
result = ""
for item in items:
    result += str(item) + ", "  # O(n²) string creation

# ✓ Use join
result = ", ".join(str(item) for item in items)

# ✗ Using range(len()) for iteration
for i in range(len(items)):
    print(items[i])

# ✓ Direct iteration
for item in items:
    print(item)

# ✓ When you need the index
for i, item in enumerate(items):
    print(i, item)
```
