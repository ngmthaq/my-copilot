---
name: flutter-layout-system
description: "Flutter layout system — constraints, Row, Column, Stack, Expanded, Flexible, SizedBox, Padding, Align, Center, ConstrainedBox, AspectRatio, Wrap, GridView, CustomScrollView/Slivers, SafeArea, LayoutBuilder, and responsive/adaptive layout patterns. Use when: arranging widgets on screen; handling constraints; building responsive or adaptive layouts. DO NOT USE FOR: widget lifecycle (use flutter-widget-basics); state management (use flutter-state-management)."
---

# Flutter Layout System

## 1. The Constraints Model

Flutter follows the **"constraints go down, sizes go up, parent sets position"** rule:

```
Parent → passes tight/loose constraints → Child
Child  → reports its chosen size (within constraints) → Parent
Parent → positions child
```

```dart
// Visualise constraints in DevTools → Layout Explorer
// Or use LayoutBuilder to inspect at runtime
LayoutBuilder(
  builder: (context, constraints) {
    print('max: ${constraints.maxWidth} x ${constraints.maxHeight}');
    print('min: ${constraints.minWidth} x ${constraints.minHeight}');
    return const SizedBox.expand();
  },
);
```

---

## 2. Row & Column

Linear layouts along the main axis:

```dart
// Row — horizontal main axis
Row(
  mainAxisAlignment: MainAxisAlignment.spaceBetween, // along main axis
  crossAxisAlignment: CrossAxisAlignment.center,     // along cross axis
  mainAxisSize: MainAxisSize.max,                    // default
  children: [
    const Icon(Icons.star),
    const Expanded(child: Text('Takes remaining space')),
    const Text('End'),
  ],
);

// Column — vertical main axis
Column(
  mainAxisAlignment: MainAxisAlignment.start,
  crossAxisAlignment: CrossAxisAlignment.stretch, // children fill width
  children: [
    const Text('First'),
    const SizedBox(height: 8),
    const Text('Second'),
  ],
);
```

### MainAxisAlignment values

| Value          | Description                    |
| -------------- | ------------------------------ |
| `start`        | Children packed at the start   |
| `end`          | Children packed at the end     |
| `center`       | Children packed in the centre  |
| `spaceBetween` | Space between children         |
| `spaceAround`  | Space around each child        |
| `spaceEvenly`  | Equal space between and around |

---

## 3. Expanded & Flexible

```dart
Row(
  children: [
    // Expanded — flex-grows to fill remaining space
    Expanded(
      flex: 2,                       // takes 2/3 of available space
      child: Container(color: Colors.red),
    ),
    Expanded(
      flex: 1,                       // takes 1/3 of available space
      child: Container(color: Colors.blue),
    ),
  ],
);

// Flexible — child CAN be smaller than flex share (won't force stretch)
Row(
  children: [
    Flexible(child: Text('Short')),
    Flexible(child: Text('A much longer text that may wrap')),
  ],
);

// ✅ Use Expanded when you want the child to fill all available space
// ✅ Use Flexible when the child should only take what it needs
```

---

## 4. Stack & Positioned

Layer widgets on top of each other:

```dart
Stack(
  alignment: Alignment.center,   // default alignment for non-Positioned children
  fit: StackFit.loose,           // children can be any size ≤ stack size
  children: [
    // Bottom layer
    Image.network(imageUrl, fit: BoxFit.cover, width: double.infinity),

    // Absolute positioning with Positioned
    Positioned(
      bottom: 16,
      right: 16,
      child: FloatingActionButton(onPressed: () {}, child: const Icon(Icons.add)),
    ),

    // Fill the entire stack
    Positioned.fill(
      child: Container(color: Colors.black.withOpacity(0.3)),
    ),

    // Center by default (no Positioned = affected by alignment)
    const Text('Centered', style: TextStyle(color: Colors.white, fontSize: 24)),
  ],
);
```

---

## 5. Sizing Widgets

```dart
// SizedBox — fixed size or spacing
const SizedBox(width: 200, height: 100, child: Text('Fixed'));
const SizedBox(height: 16);           // common vertical spacer
const SizedBox.expand();              // fill all available space
const SizedBox.shrink();              // zero size

// Container — box model (size + padding + margin + decoration)
Container(
  width: 120,
  height: 80,
  margin: const EdgeInsets.all(8),
  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
  decoration: BoxDecoration(
    color: Colors.blue,
    borderRadius: BorderRadius.circular(12),
    boxShadow: [BoxShadow(blurRadius: 4, color: Colors.black26)],
    border: Border.all(color: Colors.blueAccent),
  ),
  child: const Text('Box'),
);

// ConstrainedBox — add min/max constraints
ConstrainedBox(
  constraints: const BoxConstraints(
    minWidth: 100,
    maxWidth: 300,
    minHeight: 48,
  ),
  child: ElevatedButton(onPressed: () {}, child: const Text('Flexible button')),
);

// UnconstrainedBox — remove parent constraints (use carefully)
UnconstrainedBox(child: SizedBox(width: 500, height: 200, child: ...));

// AspectRatio — maintain a ratio
AspectRatio(
  aspectRatio: 16 / 9,
  child: VideoPlayer(...),
);

// FractionallySizedBox — fraction of parent size
FractionallySizedBox(widthFactor: 0.8, child: ElevatedButton(...));
```

---

## 6. Padding & Alignment

```dart
// Padding
Padding(
  padding: const EdgeInsets.all(16),
  child: const Text('Padded'),
);

Padding(
  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
  child: const Text('Symmetric'),
);

Padding(
  padding: const EdgeInsets.only(top: 8, left: 16),
  child: const Text('Custom'),
);

// Align
Align(
  alignment: Alignment.topRight,
  child: const Icon(Icons.close),
);

// Center — equivalent to Align(alignment: Alignment.center)
const Center(child: CircularProgressIndicator());
```

---

## 7. Wrap (Reflow Layout)

Wraps to the next line when space runs out:

```dart
Wrap(
  spacing: 8,           // space between children on same line
  runSpacing: 4,        // space between lines
  alignment: WrapAlignment.start,
  children: [
    for (final tag in tags)
      Chip(label: Text(tag)),
  ],
);
```

---

## 8. Lists & Grids

```dart
// ListView — basic scrollable list
ListView(children: [...]);

// ListView.builder — lazy, efficient for long lists
ListView.builder(
  itemCount: items.length,
  itemExtent: 72,          // optional: fixed height optimisation
  itemBuilder: (context, index) => ListTile(title: Text(items[index])),
);

// ListView.separated — with separators
ListView.separated(
  itemCount: items.length,
  separatorBuilder: (_, __) => const Divider(),
  itemBuilder: (context, index) => ListTile(title: Text(items[index])),
);

// GridView.builder — lazy grid
GridView.builder(
  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
    crossAxisCount: 2,
    childAspectRatio: 3 / 2,
    crossAxisSpacing: 8,
    mainAxisSpacing: 8,
  ),
  itemCount: items.length,
  itemBuilder: (context, index) => ProductCard(item: items[index]),
);

// GridView.extent — max cross-axis extent per item
GridView.extent(
  maxCrossAxisExtent: 200,
  children: [...],
);
```

---

## 9. Slivers & CustomScrollView

For advanced scrolling behaviour (collapsing app bars, mixed list types):

```dart
CustomScrollView(
  slivers: [
    // Collapsing app bar
    SliverAppBar(
      expandedHeight: 200,
      pinned: true,
      flexibleSpace: FlexibleSpaceBar(
        title: const Text('Title'),
        background: Image.network(url, fit: BoxFit.cover),
      ),
    ),

    // Static header section
    SliverToBoxAdapter(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: const Text('Featured', style: TextStyle(fontSize: 18)),
      ),
    ),

    // Horizontal list as a sliver section
    SliverToBoxAdapter(
      child: SizedBox(
        height: 160,
        child: ListView.builder(
          scrollDirection: Axis.horizontal,
          itemBuilder: (_, i) => FeaturedCard(items[i]),
        ),
      ),
    ),

    // Lazy list section
    SliverList(
      delegate: SliverChildBuilderDelegate(
        (context, index) => ListTile(title: Text(items[index])),
        childCount: items.length,
      ),
    ),

    // Lazy grid section
    SliverGrid(
      gridDelegate: const SliverGridDelegateWithMaxCrossAxisExtent(
        maxCrossAxisExtent: 200,
        mainAxisSpacing: 8,
        crossAxisSpacing: 8,
      ),
      delegate: SliverChildBuilderDelegate(
        (context, index) => ProductCard(products[index]),
        childCount: products.length,
      ),
    ),
  ],
);
```

---

## 10. SafeArea & MediaQuery

```dart
// SafeArea — insets content away from system UI (notch, home indicator)
Scaffold(
  body: SafeArea(
    child: Column(children: [...]),
  ),
);

// MediaQuery — access screen size, padding, text scale
Widget build(BuildContext context) {
  final size        = MediaQuery.sizeOf(context);
  final padding     = MediaQuery.paddingOf(context);
  final orientation = MediaQuery.orientationOf(context);
  final textScale   = MediaQuery.textScalerOf(context);

  final isWide = size.width > 600;

  return isWide
      ? const TwoColumnLayout()
      : const SingleColumnLayout();
}
```

---

## 11. Responsive & Adaptive Layouts

```dart
// LayoutBuilder — know parent constraints at build time
LayoutBuilder(
  builder: (context, constraints) {
    if (constraints.maxWidth > 900) return const DesktopLayout();
    if (constraints.maxWidth > 600) return const TabletLayout();
    return const MobileLayout();
  },
);

// OrientationBuilder
OrientationBuilder(
  builder: (context, orientation) {
    return orientation == Orientation.landscape
        ? const LandscapeWidget()
        : const PortraitWidget();
  },
);

// Adaptive widget selection
import 'package:flutter/material.dart';
import 'dart:io' show Platform;

Widget buildButton(BuildContext context) {
  // Use Cupertino on iOS, Material on Android
  return Platform.isIOS
      ? CupertinoButton(onPressed: () {}, child: const Text('OK'))
      : ElevatedButton(onPressed: () {}, child: const Text('OK'));
}

// Breakpoint-based responsive helper
extension BuildContextExtension on BuildContext {
  bool get isMobile  => MediaQuery.sizeOf(this).width < 600;
  bool get isTablet  => MediaQuery.sizeOf(this).width < 900;
  bool get isDesktop => MediaQuery.sizeOf(this).width >= 900;
}
```

---

## Anti-Patterns

```dart
// ❌ Column/Row inside a scrollable without bounded height
SingleChildScrollView(
  child: Column(children: [
    // ❌ Nested ListView inside Column — both try to be unbounded
    ListView.builder(itemBuilder: ...), // hasSize error
  ]),
);
// ✅ Use shrinkWrap: true (but only for small lists!) or CustomScrollView/Slivers

// ❌ Forgetting Expanded inside Row/Column when child would overflow
Row(children: [Text('A very long text that overflows the Row')]); // overflow
// ✅
Row(children: [Expanded(child: Text('Long text that wraps'))]);

// ❌ Using Container just for padding — adds unnecessary layer
Container(padding: const EdgeInsets.all(8), child: Text('Hi'));
// ✅
Padding(padding: const EdgeInsets.all(8), child: const Text('Hi'));

// ❌ Using SizedBox with double.infinity in a context that doesn't constrain it
Row(children: [SizedBox(width: double.infinity, child: Text('X'))]); // unconstrained
// ✅ Use Expanded or FractionallySizedBox inside Row/Column

// ❌ Placing unbounded scrollable inside another unbounded scrollable
ListView(children: [GridView(...)]) // both infinite — error
// ✅ Use Slivers: CustomScrollView with SliverList + SliverGrid
```
