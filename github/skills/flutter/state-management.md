---
name: flutter-state-management
description: "Flutter state management — Riverpod (providers, notifiers, async state), Bloc/Cubit, Provider, ValueNotifier/ChangeNotifier, setState, InheritedWidget, and choosing the right approach. Use when: managing shared or asynchronous UI state; choosing a state solution; structuring state across the widget tree. DO NOT USE FOR: widget basics and lifecycle (use flutter-widget-basics); API calls in isolation (use flutter-api-integration)."
---

# Flutter State Management

## 1. Choosing the Right Approach

| Scenario                                | Recommended                                |
| --------------------------------------- | ------------------------------------------ |
| Tiny local state (toggle, counter)      | `setState` inside `StatefulWidget`         |
| Single widget needs to react to a value | `ValueListenableBuilder` + `ValueNotifier` |
| Simple shared state, small app          | `Provider` + `ChangeNotifier`              |
| Medium-large app, reactive, testable    | **Riverpod** (recommended default)         |
| Complex event-driven flows, audit trail | **Bloc / Cubit**                           |

---

## 2. `setState` — Local Widget State

```dart
class ToggleButton extends StatefulWidget {
  const ToggleButton({super.key});
  @override
  State<ToggleButton> createState() => _ToggleButtonState();
}

class _ToggleButtonState extends State<ToggleButton> {
  bool _isOn = false;

  @override
  Widget build(BuildContext context) {
    return Switch(
      value: _isOn,
      onChanged: (v) => setState(() => _isOn = v),
    );
  }
}
```

---

## 3. ValueNotifier & ValueListenableBuilder

For lightweight reactive values without a full provider setup:

```dart
// Declare
final counterNotifier = ValueNotifier<int>(0);

// Mutate
counterNotifier.value++;

// Observe — rebuilds only when value changes
ValueListenableBuilder<int>(
  valueListenable: counterNotifier,
  builder: (context, count, child) {
    return Column(children: [
      Text('Count: $count'),
      child!, // static subtree — won't rebuild
    ]);
  },
  child: const Icon(Icons.star), // built once
);

// Dispose when done (e.g., in State.dispose)
counterNotifier.dispose();
```

---

## 4. Riverpod (Recommended)

### Setup

```yaml
# pubspec.yaml
dependencies:
  flutter_riverpod: ^2.5.1
  riverpod_annotation: ^2.3.5
dev_dependencies:
  riverpod_generator: ^2.4.0
  build_runner: ^2.4.9
```

```dart
// main.dart — wrap the app
void main() {
  runApp(const ProviderScope(child: MyApp()));
}
```

### Provider types

```dart
import 'package:riverpod_annotation/riverpod_annotation.dart';
part 'providers.g.dart';

// Simple synchronous value
@riverpod
String greeting(GreetingRef ref) => 'Hello, World!';

// Async provider — for futures (API calls, DB reads)
@riverpod
Future<List<User>> userList(UserListRef ref) async {
  final repo = ref.watch(userRepositoryProvider);
  return repo.getAll();
}

// Stream provider — for real-time data
@riverpod
Stream<int> ticker(TickerRef ref) {
  return Stream.periodic(const Duration(seconds: 1), (i) => i);
}

// StateNotifier replacement (Riverpod 2) — AutoDisposeNotifier
@riverpod
class Counter extends _$Counter {
  @override
  int build() => 0; // initial state

  void increment() => state++;
  void decrement() => state--;
  void reset()     => state = 0;
}

// Async Notifier — manage async state with mutations
@riverpod
class UserDetail extends _$UserDetail {
  @override
  Future<User> build(String userId) async {
    final repo = ref.watch(userRepositoryProvider);
    return repo.findById(userId);
  }

  Future<void> updateName(String name) async {
    final current = await future;               // wait for current state
    state = AsyncData(current.copyWith(name: name));
    await ref.read(userRepositoryProvider).updateName(current.id, name);
  }
}
```

### Consuming providers in widgets

```dart
// ConsumerWidget — lightweight alternative to StatelessWidget
class HomePage extends ConsumerWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final greeting = ref.watch(greetingProvider);
    final counter  = ref.watch(counterProvider);

    return Column(children: [
      Text(greeting),
      Text('$counter'),
      ElevatedButton(
        onPressed: () => ref.read(counterProvider.notifier).increment(),
        child: const Text('Increment'),
      ),
    ]);
  }
}

// ConsumerStatefulWidget — when you also need State lifecycle
class SearchPage extends ConsumerStatefulWidget {
  const SearchPage({super.key});
  @override
  ConsumerState<SearchPage> createState() => _SearchPageState();
}

class _SearchPageState extends ConsumerState<SearchPage> {
  final _ctrl = TextEditingController();

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final results = ref.watch(searchResultsProvider(_ctrl.text));
    return Column(children: [...]);
  }
}
```

### Handling async state

```dart
Widget build(BuildContext context, WidgetRef ref) {
  final usersAsync = ref.watch(userListProvider);

  return usersAsync.when(
    loading: () => const CircularProgressIndicator(),
    error:   (e, st) => Text('Error: $e'),
    data:    (users) => ListView.builder(
      itemCount: users.length,
      itemBuilder: (_, i) => ListTile(title: Text(users[i].name)),
    ),
  );
}
```

### Provider modifiers

```dart
// keepAlive — don't auto-dispose when no listeners
@Riverpod(keepAlive: true)
UserRepository userRepository(UserRepositoryRef ref) => UserRepository();

// Family — parameterised providers
@riverpod
Future<User> user(UserRef ref, String id) async {
  return ref.watch(userRepositoryProvider).findById(id);
}

// Usage with family
ref.watch(userProvider('user-123'));

// Invalidate — force refresh
ref.invalidate(userListProvider);
ref.invalidate(userProvider('user-123'));
```

---

## 5. Bloc / Cubit

### Cubit — simple state machine without explicit events

```dart
// pubspec: flutter_bloc: ^8.1.5

// State
class CounterState {
  final int count;
  const CounterState(this.count);
}

// Cubit
class CounterCubit extends Cubit<CounterState> {
  CounterCubit() : super(const CounterState(0));

  void increment() => emit(CounterState(state.count + 1));
  void decrement() => emit(CounterState(state.count - 1));
}

// ✅ Use Cubit when: no explicit events needed, simple state transitions
```

### Bloc — explicit events → state transitions

```dart
// Events
sealed class AuthEvent {}
class LoginRequested extends AuthEvent {
  final String email, password;
  LoginRequested(this.email, this.password);
}
class LogoutRequested extends AuthEvent {}

// State
sealed class AuthState {}
class AuthInitial    extends AuthState {}
class AuthLoading    extends AuthState {}
class AuthAuthenticated extends AuthState { final User user; AuthAuthenticated(this.user); }
class AuthError      extends AuthState { final String message; AuthError(this.message); }

// Bloc
class AuthBloc extends Bloc<AuthEvent, AuthState> {
  final AuthRepository _repo;

  AuthBloc(this._repo) : super(AuthInitial()) {
    on<LoginRequested>(_onLoginRequested);
    on<LogoutRequested>(_onLogoutRequested);
  }

  Future<void> _onLoginRequested(
    LoginRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(AuthLoading());
    try {
      final user = await _repo.login(event.email, event.password);
      emit(AuthAuthenticated(user));
    } catch (e) {
      emit(AuthError(e.toString()));
    }
  }

  Future<void> _onLogoutRequested(
    LogoutRequested event,
    Emitter<AuthState> emit,
  ) async {
    await _repo.logout();
    emit(AuthInitial());
  }
}
```

### Providing and consuming Bloc

```dart
// Provide
BlocProvider<AuthBloc>(
  create: (context) => AuthBloc(context.read<AuthRepository>()),
  child: const LoginPage(),
);

// Multiple providers
MultiBlocProvider(
  providers: [
    BlocProvider(create: (_) => AuthBloc(...)),
    BlocProvider(create: (_) => CartBloc(...)),
  ],
  child: const App(),
);

// Consume
BlocBuilder<AuthBloc, AuthState>(
  builder: (context, state) {
    return switch (state) {
      AuthLoading()         => const CircularProgressIndicator(),
      AuthAuthenticated(user: final u) => Text('Welcome, ${u.name}'),
      AuthError(message: final m)      => Text('Error: $m'),
      _                     => const LoginForm(),
    };
  },
);

// BlocListener — side-effects only (no UI)
BlocListener<AuthBloc, AuthState>(
  listener: (context, state) {
    if (state is AuthAuthenticated) {
      context.go('/home');
    }
    if (state is AuthError) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(state.message)),
      );
    }
  },
  child: const LoginForm(),
);

// BlocConsumer — builder + listener combined
BlocConsumer<AuthBloc, AuthState>(
  listener: (context, state) { /* side-effects */ },
  builder:  (context, state) { /* UI */ return Container(); },
);
```

---

## 6. ChangeNotifier + Provider

Simple option for small-to-medium apps:

```dart
// State class (model)
class CartModel extends ChangeNotifier {
  final List<CartItem> _items = [];
  List<CartItem> get items => List.unmodifiable(_items);
  int get count => _items.length;
  double get total => _items.fold(0, (s, i) => s + i.price * i.quantity);

  void add(CartItem item) {
    _items.add(item);
    notifyListeners(); // triggers rebuild in listening widgets
  }

  void remove(String id) {
    _items.removeWhere((i) => i.id == id);
    notifyListeners();
  }
}

// Provide
ChangeNotifierProvider<CartModel>(
  create: (_) => CartModel(),
  child: const App(),
);

// Consume — watch (rebuild on change)
final cart = context.watch<CartModel>();
Text('${cart.count} items');

// Consume — read (no rebuild — for callbacks)
context.read<CartModel>().add(item);

// Consume — select (rebuild only when selected value changes)
final count = context.select<CartModel, int>((c) => c.count);
```

---

## Anti-Patterns

```dart
// ❌ Calling setState inside initState directly — use Future.microtask or addPostFrameCallback
@override
void initState() {
  super.initState();
  setState(() => _value = compute()); // fine for sync
  // ❌ avoid if triggering async or context lookups
}
// ✅
@override
void initState() {
  super.initState();
  WidgetsBinding.instance.addPostFrameCallback((_) {
    setState(() => _value = context.read<MyModel>().value);
  });
}

// ❌ Using ref.watch inside a callback — watch must only be called in build
ElevatedButton(
  onPressed: () {
    final x = ref.watch(someProvider); // ❌ throws at runtime
  },
);
// ✅ Use ref.read in callbacks
ElevatedButton(
  onPressed: () {
    final x = ref.read(someProvider);
  },
);

// ❌ Storing state in a static variable — breaks hot reload & testability
static int _count = 0;

// ❌ Putting all app state into one giant Notifier — hard to reason about
class AppState extends ChangeNotifier { /* 50 fields */ }

// ✅ Split by domain — CartModel, AuthModel, UserModel
```
