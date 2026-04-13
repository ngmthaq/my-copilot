---
name: flutter-widget-basics
description: "Flutter widget basics — StatelessWidget vs StatefulWidget, BuildContext, widget lifecycle, Keys, InheritedWidget, ThemeData, common Material and Cupertino widgets, widget composition, and the widget/element/render tree. Use when: building any widget; understanding widget types; using context; customising theme; composing widget trees. DO NOT USE FOR: layout positioning (use flutter-layout-system); state management libraries (use flutter-state-management)."
---

# Flutter Widget Basics

## 1. StatelessWidget

Use when the UI depends only on the configuration passed in (no mutable internal state):

```dart
import 'package:flutter/material.dart';

class GreetingCard extends StatelessWidget {
  final String name;
  final String? subtitle;

  const GreetingCard({
    super.key,
    required this.name,
    this.subtitle,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(name, style: theme.textTheme.headlineSmall),
            if (subtitle != null)
              Text(subtitle!, style: theme.textTheme.bodyMedium),
          ],
        ),
      ),
    );
  }
}
```

---

## 2. StatefulWidget

Use when the widget needs to maintain mutable state that causes rebuilds:

```dart
class CounterWidget extends StatefulWidget {
  final int initialCount;

  const CounterWidget({super.key, this.initialCount = 0});

  @override
  State<CounterWidget> createState() => _CounterWidgetState();
}

class _CounterWidgetState extends State<CounterWidget> {
  late int _count;

  @override
  void initState() {
    super.initState();
    _count = widget.initialCount; // access widget config via `widget`
  }

  @override
  void didUpdateWidget(CounterWidget oldWidget) {
    super.didUpdateWidget(oldWidget);
    // Called when parent rebuilds with new config
    if (oldWidget.initialCount != widget.initialCount) {
      _count = widget.initialCount;
    }
  }

  @override
  void dispose() {
    // Clean up controllers, subscriptions, animation controllers here
    super.dispose();
  }

  void _increment() {
    setState(() => _count++); // triggers rebuild
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text('Count: $_count'),
        ElevatedButton(
          onPressed: _increment,
          child: const Text('Increment'),
        ),
      ],
    );
  }
}
```

### Lifecycle summary

| Method                    | When called                                             |
| ------------------------- | ------------------------------------------------------- |
| `initState()`             | Widget inserted into tree — once only                   |
| `didChangeDependencies()` | After `initState` and when an `InheritedWidget` changes |
| `build()`                 | Initial build + every `setState` call                   |
| `didUpdateWidget()`       | Parent rebuilt with new config for this widget          |
| `deactivate()`            | Widget temporarily removed from tree                    |
| `dispose()`               | Widget permanently removed — clean up here              |

---

## 3. BuildContext

`BuildContext` is a handle to the widget's location in the tree. It is used to read theme, media query, inherited widgets, and to navigate.

```dart
@override
Widget build(BuildContext context) {
  // ✅ Read theme
  final theme = Theme.of(context);
  final colorScheme = theme.colorScheme;

  // ✅ Read media query (screen size, orientation, padding)
  final size        = MediaQuery.sizeOf(context);
  final viewPadding = MediaQuery.viewPaddingOf(context);
  final brightness  = MediaQuery.platformBrightnessOf(context);

  // ✅ Navigate
  Navigator.of(context).push(...);

  // ✅ Show snackbar
  ScaffoldMessenger.of(context).showSnackBar(
    const SnackBar(content: Text('Done!')),
  );

  return Text('Width: ${size.width}');
}

// ⚠️ Never use context across async gaps — the widget may be disposed
Future<void> doAsync(BuildContext context) async {
  await Future.delayed(const Duration(seconds: 1));
  // context might be invalid here!
  if (!context.mounted) return; // ✅ Guard with mounted check
  Navigator.of(context).pop();
}
```

---

## 4. Keys

Keys help Flutter identify widgets across rebuilds — essential when widgets reorder, are added, or removed from lists.

```dart
// ValueKey — identify by a unique value
ListView(
  children: items.map((item) =>
    ListTile(
      key: ValueKey(item.id), // ✅ stable identity for each item
      title: Text(item.name),
    ),
  ).toList(),
);

// GlobalKey — reference State from anywhere
final _formKey = GlobalKey<FormState>();
// ...
Form(key: _formKey, child: ...);
_formKey.currentState?.validate();

// ObjectKey — identity based on object reference
// UniqueKey — new unique key every build (forces recreation)
// PageStorageKey — preserves scroll position

// ✅ Always add keys when:
// - Items can be reordered
// - Items can be inserted/removed from the middle
// - Stateful widgets appear in a List or Row/Column that changes
```

---

## 5. InheritedWidget & `of()` Pattern

The foundation of context-based data access (Theme, MediaQuery, Navigator all use this):

```dart
// Define the InheritedWidget
class AppConfig extends InheritedWidget {
  final String apiBaseUrl;
  final bool isDarkMode;

  const AppConfig({
    super.key,
    required this.apiBaseUrl,
    required this.isDarkMode,
    required super.child,
  });

  // The canonical `of()` lookup
  static AppConfig of(BuildContext context) {
    final result = context.dependOnInheritedWidgetOfExactType<AppConfig>();
    assert(result != null, 'No AppConfig found in context');
    return result!;
  }

  @override
  bool updateShouldNotify(AppConfig oldWidget) =>
      apiBaseUrl != oldWidget.apiBaseUrl || isDarkMode != oldWidget.isDarkMode;
}

// Provide at the root
runApp(
  AppConfig(
    apiBaseUrl: 'https://api.example.com',
    isDarkMode: false,
    child: const MyApp(),
  ),
);

// Consume anywhere below
final config = AppConfig.of(context);
print(config.apiBaseUrl);
```

---

## 6. Theme & ThemeData

```dart
// Define app theme
MaterialApp(
  theme: ThemeData(
    useMaterial3: true,
    colorScheme: ColorScheme.fromSeed(
      seedColor: Colors.indigo,
      brightness: Brightness.light,
    ),
    textTheme: const TextTheme(
      headlineLarge: TextStyle(fontWeight: FontWeight.bold),
    ),
    inputDecorationTheme: const InputDecorationTheme(
      border: OutlineInputBorder(),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        minimumSize: const Size.fromHeight(48),
      ),
    ),
  ),
  darkTheme: ThemeData(
    useMaterial3: true,
    colorScheme: ColorScheme.fromSeed(
      seedColor: Colors.indigo,
      brightness: Brightness.dark,
    ),
  ),
  themeMode: ThemeMode.system, // follow OS setting
  home: const HomePage(),
);

// Consume theme in a widget
Widget build(BuildContext context) {
  final theme  = Theme.of(context);
  final colors = theme.colorScheme;

  return Container(
    color: colors.primaryContainer,
    child: Text(
      'Hello',
      style: theme.textTheme.titleLarge?.copyWith(color: colors.onPrimaryContainer),
    ),
  );
}

// Local theme override — wrap a subtree
Theme(
  data: Theme.of(context).copyWith(
    iconTheme: const IconThemeData(color: Colors.red),
  ),
  child: const Icon(Icons.star),
);
```

---

## 7. Common Material Widgets

```dart
// App shell
Scaffold(
  appBar: AppBar(title: const Text('Home'), actions: [...]),
  body: const Center(child: Text('Content')),
  floatingActionButton: FloatingActionButton(
    onPressed: () {},
    child: const Icon(Icons.add),
  ),
  bottomNavigationBar: BottomNavigationBar(items: [...]),
  drawer: const Drawer(child: ...),
);

// Buttons
ElevatedButton(onPressed: () {}, child: const Text('Elevated'));
FilledButton(onPressed: () {}, child: const Text('Filled'));
OutlinedButton(onPressed: () {}, child: const Text('Outlined'));
TextButton(onPressed: () {}, child: const Text('Text'));
IconButton(icon: const Icon(Icons.edit), onPressed: () {});

// Display
const Text('Hello', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold));
Image.network('https://example.com/image.png', fit: BoxFit.cover);
Image.asset('assets/logo.png');
const Icon(Icons.star, size: 32, color: Colors.amber);
CircleAvatar(backgroundImage: NetworkImage(url), radius: 24);

// Input
TextField(
  controller: TextEditingController(),
  decoration: const InputDecoration(labelText: 'Name', hintText: 'Enter name'),
  keyboardType: TextInputType.emailAddress,
  onChanged: (value) {},
  onSubmitted: (value) {},
);

// Lists
ListView.builder(
  itemCount: items.length,
  itemBuilder: (context, index) => ListTile(
    leading: const Icon(Icons.label),
    title: Text(items[index].name),
    subtitle: Text(items[index].description),
    trailing: const Icon(Icons.chevron_right),
    onTap: () {},
  ),
);

// Cards, Chips, Dividers
Card(elevation: 2, child: const Padding(padding: EdgeInsets.all(16), child: Text('Card')));
Chip(label: const Text('Tag'), onDeleted: () {});
const Divider(thickness: 1, height: 24);

// Dialog and BottomSheet
showDialog<void>(
  context: context,
  builder: (_) => AlertDialog(
    title: const Text('Confirm'),
    content: const Text('Are you sure?'),
    actions: [
      TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
      FilledButton(onPressed: () => Navigator.pop(context, true), child: const Text('OK')),
    ],
  ),
);

showModalBottomSheet<void>(
  context: context,
  builder: (_) => const SizedBox(height: 300, child: Center(child: Text('Sheet'))),
);
```

---

## 8. `const` Widgets

Mark widgets `const` whenever all their properties are compile-time constants — Flutter reuses the same widget object and skips rebuilds:

```dart
// ✅ const — Flutter caches and reuses these instances
const Text('Static label');
const SizedBox(height: 16);
const Icon(Icons.home);
const EdgeInsets.all(16);

// ✅ const constructor in your own widget
const MyWidget(title: 'Hello');

// ❌ Cannot be const — value depends on runtime state
Text(dynamicValue);          // variable
const Text(dynamicValue);    // compile error
```

---

## Anti-Patterns

```dart
// ❌ Heavy computation in build() — runs on every repaint
@override
Widget build(BuildContext context) {
  final sorted = items.sortedBy((e) => e.name); // expensive every build
  return ListView(children: sorted.map(buildItem).toList());
}
// ✅ Compute outside build, or use a selector/provider

// ❌ Using context after async gap without mounted check
Future<void> submit() async {
  await saveData();
  Navigator.of(context).pop(); // context may be stale
}
// ✅
Future<void> submit() async {
  await saveData();
  if (!mounted) return;
  Navigator.of(context).pop();

// ❌ Storing BuildContext in a field
class _MyState extends State<My> {
  late BuildContext _ctx; // ← dangerous — context can become stale
}
// ✅ Pass context as a parameter when needed, or use callbacks

// ❌ Calling setState after dispose
void _onData(String d) {
  setState(() => _data = d); // throws if disposed
}
// ✅
void _onData(String d) {
  if (mounted) setState(() => _data = d);
}
```
