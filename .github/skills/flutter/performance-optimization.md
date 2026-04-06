---
name: flutter-performance-optimization
description: "Flutter performance optimization — const widgets, ListView.builder, RepaintBoundary, image caching (cached_network_image), compute() for heavy work, avoiding unnecessary rebuilds (select, riverpod scoping), DevTools profiling, and frame budget analysis. Use when: diagnosing jank or slow frames; reducing rebuild counts; optimising scrolling lists; offloading CPU work. DO NOT USE FOR: state management architecture (use flutter-state-management); animations (use flutter-animations)."
---

# Flutter Performance Optimization

## 1. const Widgets

`const` constructors are evaluated at compile time. Flutter reuses the same widget instance, skipping rebuild entirely.

```dart
// ❌ Rebuilt on every parent rebuild
Padding(
  padding: EdgeInsets.all(16),
  child: Icon(Icons.home, size: 24, color: Colors.grey),
)

// ✅ Compiled once, never rebuilt
const Padding(
  padding: EdgeInsets.all(16),
  child: Icon(Icons.home, size: 24, color: Colors.grey),
)

// ✅ Mark widget constructors const whenever possible
class MyLabel extends StatelessWidget {
  const MyLabel(this.text, {super.key}); // ← const constructor
  final String text;

  @override
  Widget build(BuildContext context) {
    return Text(text, style: const TextStyle(fontSize: 14)); // inner const
  }
}

// ✅ Enable the lint rule
// analysis_options.yaml
// linter:
//   rules:
//     - prefer_const_constructors
//     - prefer_const_literals_to_create_immutables
```

---

## 2. List Performance with ListView.builder

```dart
// ❌ ListView allocates all children at once
ListView(
  children: items.map((e) => ItemTile(item: e)).toList(),
)

// ✅ ListView.builder builds only visible items (lazy)
ListView.builder(
  itemCount: items.length,
  itemExtent: 72,           // fixed height removes layout cost (optional but powerful)
  itemBuilder: (context, index) {
    return ItemTile(item: items[index]);
  },
)

// ✅ ListView.separated for dividers — more efficient than inserting Dividers manually
ListView.separated(
  itemCount:     items.length,
  separatorBuilder: (_, __) => const Divider(height: 1),
  itemBuilder: (context, index) => ItemTile(item: items[index]),
)

// ✅ GridView.builder for grids
GridView.builder(
  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
    crossAxisCount:  2,
    childAspectRatio: 0.75,
  ),
  itemCount:   items.length,
  itemBuilder: (context, index) => ProductCard(product: items[index]),
)

// ✅ For very large lists with expensive items, use itemExtent for O(1) scroll offset calculation
ListView.builder(
  itemCount:  1000,
  itemExtent: 56,  // all items the same height
  itemBuilder: (_, i) => ListTile(title: Text('Item $i')),
)
```

---

## 3. RepaintBoundary

Isolates a widget subtree into its own render layer so it doesn't trigger repaints in the rest of the tree.

```dart
// Use when a child animates/changes frequently but the rest of the tree is static
RepaintBoundary(
  child: AnimatedLoadingSpinner(), // spinner repaints every frame
)

// Useful before complex CustomPainter widgets
RepaintBoundary(
  child: CustomPaint(
    painter: ChartPainter(data: _chartData),
    size: const Size(double.infinity, 200),
  ),
)

// In lists — wrap heavy items that have their own animation
ListView.builder(
  itemBuilder: (_, i) => RepaintBoundary(
    child: ProductCard(product: items[i]),
  ),
)
```

---

## 4. Avoiding Unnecessary Rebuilds

### Riverpod `.select()`

```dart
// ❌ Entire widget rebuilds whenever any part of UserState changes
final user = ref.watch(userProvider);
return Text(user.name);

// ✅ Only rebuilds when user.name changes
final name = ref.watch(userProvider.select((u) => u.name));
return Text(name);

// ✅ Watch only a boolean flag
final isLoading = ref.watch(userProvider.select((u) => u.isLoading));
```

### Extracting Widgets

```dart
// ❌ Giant build() method — any state change rebuilds everything
Widget build(BuildContext context) {
  return Column(children: [
    Header(),          // rebuilt even when only footer changes
    ExpensiveContent(),
    Footer(count: _count), // changes often
  ]);
}

// ✅ Extract to const StatelessWidgets — only Footer rebuilds
Widget build(BuildContext context) {
  return Column(children: [
    const Header(),
    const ExpensiveContent(),
    Footer(count: _count),
  ]);
}
```

### Bloc / BlocBuilder Condition

```dart
BlocBuilder<CartBloc, CartState>(
  buildWhen: (previous, current) =>
      previous.itemCount != current.itemCount, // skip rebuild if count hasn't changed
  builder: (context, state) => CartBadge(count: state.itemCount),
)
```

---

## 5. Image Performance

```yaml
dependencies:
  cached_network_image: ^3.3.1
```

```dart
// ✅ Caches images on disk and in memory automatically
CachedNetworkImage(
  imageUrl:    user.avatarUrl,
  width:       48,
  height:      48,
  fit:         BoxFit.cover,
  placeholder: (_, __) => const CircleAvatar(child: Icon(Icons.person)),
  errorWidget: (_, __, ___) => const Icon(Icons.broken_image),
)

// ✅ Pre-cache frequently used images in initState
@override
void initState() {
  super.initState();
  precacheImage(NetworkImage(product.imageUrl), context);
}

// ✅ Cache sizing — decode images at display size, not full resolution
Image.network(
  url,
  width:     80,
  height:    80,
  cacheWidth:  80,  // decode at this pixel width (reduces memory)
  cacheHeight: 80,
  fit: BoxFit.cover,
)

// ✅ For asset images always include cacheWidth/cacheHeight on large images
Image.asset('assets/banner.png', cacheWidth: 800)
```

---

## 6. compute() — Offload Heavy Work to Another Isolate

```dart
// ❌ Parsing large JSON on the UI thread causes frame drops
final users = (jsonDecode(responseBody) as List)
    .map((e) => User.fromJson(e as Map<String, dynamic>))
    .toList();

// ✅ compute() runs in a background isolate and returns the result
List<User> _parseUsers(String body) {
  return (jsonDecode(body) as List)
      .map((e) => User.fromJson(e as Map<String, dynamic>))
      .toList();
}

final users = await compute(_parseUsers, responseBody);

// For Riverpod — call from AsyncNotifier.build
@override
Future<List<User>> build() async {
  final response = await ref.read(dioProvider).get<String>('/users');
  return compute(_parseUsers, response.data!);
}
```

---

## 7. Slivers for Mixed Scrollable Layouts

```dart
// ✅ CustomScrollView + Slivers avoid double-wrapping ScrollViews
CustomScrollView(
  slivers: [
    const SliverAppBar(floating: true, title: Text('Products')),

    SliverToBoxAdapter(         // single non-list widget inside a scroll
      child: CategoryChips(),
    ),

    SliverList.builder(         // lazy-building list
      itemCount: products.length,
      itemBuilder: (_, i) => ProductTile(product: products[i]),
    ),
  ],
)
```

---

## 8. Flutter DevTools Profiling

```bash
# Launch with DevTools
flutter run --profile   # profile mode — real performance, no debug overhead
```

**Key DevTools panels:**

| Panel           | What to look for                                  |
| --------------- | ------------------------------------------------- |
| Performance     | Frame chart — red/yellow frames > 16 ms budget    |
| Widget Rebuilds | Widgets highlighted in colour show rebuild counts |
| CPU Profiler    | Flame chart — identify expensive functions        |
| Memory          | Heap growth, image cache size                     |
| Network         | Request timing, payload sizes                     |

```dart
// Mark sections of code in the DevTools timeline
import 'dart:developer';

Timeline.startSync('Parse Users');
final users = _parseUsers(body);
Timeline.finishSync();

// Add a custom event
debugPrint('Items rendered: ${items.length}');
```

---

## 9. Build Method Best Practices

```dart
// ❌ Calling expensive functions inside build
Widget build(BuildContext context) {
  final sorted = items.sort(...).toList(); // re-sorted every frame
  return ListView.builder(...);
}

// ✅ Cache computed values, re-compute only when source data changes
List<Item> _sortedItems = [];

@override
void didUpdateWidget(covariant MyWidget oldWidget) {
  super.didUpdateWidget(oldWidget);
  if (oldWidget.items != widget.items) {
    _sortedItems = widget.items.sorted(...);
  }
}

// ❌ Instantiating objects inside build
Widget build(BuildContext context) {
  return Container(decoration: BoxDecoration(gradient: LinearGradient(...))); // new every frame
}

// ✅ Make them static constants if possible
static const _gradient = LinearGradient(colors: [Colors.blue, Colors.purple]);

Widget build(BuildContext context) {
  return Container(decoration: const BoxDecoration(gradient: _gradient));
}
```

---

## Anti-Patterns

```dart
// ❌ Wrapping everything in RepaintBoundary
// Extra layers add compositor overhead when the item doesn't change
RepaintBoundary(child: Text('Hello')); // no benefit, extra layer
// ✅ Only wrap subtrees that animate or repaint independently of their siblings

// ❌ Using MediaQuery.of(context) deep inside a large subtree
// Any screen-size change (keyboard open) rebuilds the entire listening widget
final size = MediaQuery.of(context).size;
// ✅ Use MediaQuery.sizeOf(context) (Flutter 3.10+) — more granular rebuild

// ❌ Using setState in AnimationController listener
_ctrl.addListener(() => setState(() {})); // rebuilds entire State on every frame
// ✅ Use AnimatedBuilder — rebuilds only the builder subtree

// ❌ Loading full-resolution images when displaying thumbnails
Image.network('https://cdn.example.com/photo-8000x6000.jpg', width: 50, height: 50)
// ✅ Request appropriately sized thumbnail from the API or use cacheWidth/cacheHeight

// ❌ Creating streams / futures inside build
StreamBuilder(stream: fetchData(), ...) // new stream on every rebuild
// ✅ Create stream in initState or in the provider; store in a field

// ❌ Long synchronous operations in initState
@override
void initState() {
  super.initState();
  _data = loadHugeFile(); // blocks UI thread during first frame
}
// ✅ Use Future and show a loading indicator, or compute() for CPU-heavy work
```
