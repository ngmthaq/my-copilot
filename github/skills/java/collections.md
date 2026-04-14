---
name: java-collections
description: "Java collections framework — List, Set, Map, Queue, Deque, choosing the right collection, iteration patterns, Collections utility class, and immutable collections. Use when: working with List, Set, Map, Queue; choosing the right collection; iteration patterns; sorting and searching. DO NOT USE FOR: Stream API (use java-streams-lambdas); generics internals (use java-generics)."
---

# Java Collections

## 1. Collection Hierarchy

```
Iterable
└── Collection
    ├── List          — ordered, allows duplicates
    │   ├── ArrayList     — O(1) random access, O(n) insert/remove middle
    │   ├── LinkedList    — O(n) access, O(1) insert/remove at ends
    │   └── CopyOnWriteArrayList — thread-safe reads
    ├── Set           — no duplicates
    │   ├── HashSet       — O(1) add/remove/contains, unordered
    │   ├── LinkedHashSet — insertion-ordered HashSet
    │   ├── TreeSet       — sorted, O(log n)
    │   └── EnumSet       — optimized for enums
    └── Queue         — FIFO
        ├── PriorityQueue — sorted by priority
        ├── ArrayDeque    — double-ended, faster than Stack/LinkedList
        └── LinkedList    — also implements Deque

Map               — key-value pairs (not a Collection)
├── HashMap           — O(1) get/put, unordered
├── LinkedHashMap     — insertion-ordered HashMap
├── TreeMap           — sorted by keys, O(log n)
├── EnumMap           — optimized for enum keys
└── ConcurrentHashMap — thread-safe
```

---

## 2. List

```java
// Creation
List<String> mutable = new ArrayList<>(List.of("a", "b", "c"));
List<String> immutable = List.of("a", "b", "c");           // Java 9+
List<String> unmodifiable = Collections.unmodifiableList(mutable);

// Common operations
list.add("d");                    // append
list.add(0, "first");            // insert at index
list.get(2);                      // access by index
list.set(0, "updated");          // replace
list.remove("a");                 // remove by value
list.remove(0);                   // remove by index
list.contains("b");              // check membership
list.indexOf("b");               // find index
list.size();                      // count
list.isEmpty();                   // check empty
list.subList(1, 3);              // view [1, 3)

// Sorting
list.sort(Comparator.naturalOrder());
list.sort(Comparator.comparing(String::length).reversed());
```

### ArrayList vs LinkedList

| Operation       | ArrayList | LinkedList  |
| --------------- | --------- | ----------- |
| `get(index)`    | O(1)      | O(n)        |
| `add(end)`      | O(1)\*    | O(1)        |
| `add(index)`    | O(n)      | O(1)\*\*    |
| `remove(index)` | O(n)      | O(1)\*\*    |
| Memory          | Compact   | 2x per node |

\* amortized. \*\* after positioning iterator.

**Default choice: `ArrayList`** — better cache locality, lower memory, faster for most workloads.

---

## 3. Set

```java
// Creation
Set<String> mutable = new HashSet<>(Set.of("a", "b", "c"));
Set<String> immutable = Set.of("a", "b", "c");             // Java 9+

// Common operations
set.add("d");                     // add (returns false if duplicate)
set.remove("a");                  // remove
set.contains("b");               // O(1) lookup
set.size();

// Set operations
Set<String> union = new HashSet<>(setA);
union.addAll(setB);

Set<String> intersection = new HashSet<>(setA);
intersection.retainAll(setB);

Set<String> difference = new HashSet<>(setA);
difference.removeAll(setB);

// When to use which Set
// HashSet     — default, unordered, O(1)
// LinkedHashSet — need insertion order
// TreeSet     — need sorted order
// EnumSet     — only enum values (most efficient)
```

---

## 4. Map

```java
// Creation
Map<String, Integer> mutable = new HashMap<>(Map.of("a", 1, "b", 2));
Map<String, Integer> immutable = Map.of("a", 1, "b", 2);   // Java 9+
Map<String, Integer> entries = Map.ofEntries(
    Map.entry("a", 1),
    Map.entry("b", 2)
);

// Common operations
map.put("c", 3);                  // add or replace
map.get("a");                     // get (returns null if absent)
map.getOrDefault("z", 0);        // get with default
map.containsKey("a");            // check key
map.containsValue(1);            // check value (O(n))
map.remove("a");                  // remove
map.size();

// Compute methods
map.putIfAbsent("d", 4);
map.computeIfAbsent("d", key -> expensiveCompute(key));
map.computeIfPresent("a", (key, val) -> val + 1);
map.merge("a", 1, Integer::sum); // merge with existing value

// Iteration
for (Map.Entry<String, Integer> entry : map.entrySet()) {
    System.out.println(entry.getKey() + " = " + entry.getValue());
}
map.forEach((key, value) -> System.out.println(key + " = " + value));

// Grouping pattern
Map<String, List<User>> byCity = new HashMap<>();
for (User user : users) {
    byCity.computeIfAbsent(user.getCity(), k -> new ArrayList<>()).add(user);
}
```

---

## 5. Queue & Deque

```java
// Queue (FIFO)
Queue<String> queue = new ArrayDeque<>();
queue.offer("a");                 // add to tail
queue.offer("b");
queue.peek();                     // view head ("a"), no removal
queue.poll();                     // remove head ("a")

// Deque (double-ended)
Deque<String> deque = new ArrayDeque<>();
deque.offerFirst("a");            // add to front
deque.offerLast("b");             // add to back
deque.peekFirst();                // view front
deque.peekLast();                 // view back
deque.pollFirst();                // remove front
deque.pollLast();                 // remove back

// Use as stack (LIFO) — prefer ArrayDeque over Stack
Deque<String> stack = new ArrayDeque<>();
stack.push("a");                  // push to top
stack.push("b");
stack.peek();                     // view top ("b")
stack.pop();                      // remove top ("b")

// PriorityQueue (min-heap by default)
Queue<Integer> pq = new PriorityQueue<>();
pq.offer(3);
pq.offer(1);
pq.offer(2);
pq.poll();                        // 1 (smallest first)

// Max-heap
Queue<Integer> maxPq = new PriorityQueue<>(Comparator.reverseOrder());
```

---

## 6. Immutable Collections (Java 9+)

```java
// Factory methods — return unmodifiable collections
List<String> list = List.of("a", "b", "c");
Set<String> set = Set.of("a", "b", "c");
Map<String, Integer> map = Map.of("a", 1, "b", 2);

// Cannot add, remove, or modify
list.add("d");                    // UnsupportedOperationException

// Defensive copy pattern
public class Config {
    private final List<String> hosts;

    public Config(List<String> hosts) {
        this.hosts = List.copyOf(hosts);   // defensive copy
    }

    public List<String> getHosts() {
        return hosts;                       // already unmodifiable
    }
}
```

---

## 7. Choosing the Right Collection

```
Need ordered elements with duplicates?
├─ Yes → Need random access by index?
│   ├─ Yes → ArrayList
│   └─ No → LinkedList (only if frequent insert/remove at head)
│
Need unique elements?
├─ Yes → Need sorted order?
│   ├─ Yes → TreeSet
│   └─ No → Need insertion order?
│       ├─ Yes → LinkedHashSet
│       └─ No → HashSet
│
Need key-value pairs?
├─ Yes → Need sorted by key?
│   ├─ Yes → TreeMap
│   └─ No → Need insertion order?
│       ├─ Yes → LinkedHashMap
│       └─ No → HashMap
│
Need FIFO processing?
├─ Yes → ArrayDeque (or LinkedList)
│
Need priority ordering?
└─ Yes → PriorityQueue
```

---

## 8. Collections Utility Class

```java
// Sorting
Collections.sort(list);
Collections.sort(list, Comparator.reverseOrder());

// Searching
int idx = Collections.binarySearch(sortedList, key);

// Min/Max
String min = Collections.min(list);
String max = Collections.max(list, Comparator.comparing(String::length));

// Frequency & disjoint
int count = Collections.frequency(list, "target");
boolean noOverlap = Collections.disjoint(list1, list2);

// Transformations
Collections.reverse(list);
Collections.shuffle(list);
Collections.swap(list, 0, 1);
Collections.rotate(list, 2);

// Thread-safe wrappers (prefer ConcurrentHashMap for maps)
List<String> syncList = Collections.synchronizedList(new ArrayList<>());
```

---

## 9. Anti-Patterns

```java
// ✗ Using Vector or Hashtable — legacy synchronized collections
Vector<String> v = new Vector<>();      // use ArrayList + external sync
Hashtable<String, Integer> ht = new Hashtable<>();  // use ConcurrentHashMap

// ✗ Using Stack class
Stack<String> stack = new Stack<>();    // use ArrayDeque

// ✗ Checking size before accessing
if (list.size() > 0) { }               // verbose

// ✓ Use isEmpty
if (!list.isEmpty()) { }

// ✗ Modifying collection during enhanced for-loop
for (String item : list) {
    if (item.equals("remove")) {
        list.remove(item);              // ConcurrentModificationException
    }
}

// ✓ Use Iterator.remove or removeIf
list.removeIf(item -> item.equals("remove"));

// ✗ Using raw types
List rawList = new ArrayList();

// ✓ Always parameterize
List<String> typedList = new ArrayList<>();

// ✗ Returning null instead of empty collection
public List<User> findUsers() {
    return null;                        // forces null checks everywhere
}

// ✓ Return empty collection
public List<User> findUsers() {
    return Collections.emptyList();     // or List.of()
}
```
