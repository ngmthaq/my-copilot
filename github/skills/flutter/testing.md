---
name: flutter-testing
description: "Flutter testing — unit tests (dart:test), widget tests (WidgetTester, pumpWidget), integration tests (integration_test), mocking with mocktail, testing Riverpod providers, testing Bloc/Cubit, golden image tests, and CI test execution. Use when: writing or fixing tests; setting up test infrastructure; verifying widget rendering; testing async state changes. DO NOT USE FOR: production code implementation (use the relevant skill); CI pipeline configuration (use the docker or CI skill)."
---

# Flutter Testing

## 1. Unit Tests

```dart
// test/features/cart/cart_service_test.dart
import 'package:test/test.dart';

void main() {
  group('CartService', () {
    late CartService cart;

    setUp(() {
      cart = CartService();
    });

    test('starts empty', () {
      expect(cart.items,    isEmpty);
      expect(cart.total,    equals(0.0));
      expect(cart.itemCount, equals(0));
    });

    test('addItem increases count and total', () {
      cart.addItem(const CartItem(id: '1', name: 'Widget', price: 9.99));
      expect(cart.itemCount, equals(1));
      expect(cart.total,     closeTo(9.99, 0.001));
    });

    test('removeItem decreases count', () {
      cart.addItem(const CartItem(id: '1', name: 'Widget', price: 9.99));
      cart.removeItem('1');
      expect(cart.items, isEmpty);
    });

    test('total rounds to 2 decimal places', () {
      cart.addItem(const CartItem(id: '1', name: 'A', price: 1.005));
      cart.addItem(const CartItem(id: '2', name: 'B', price: 2.005));
      expect(cart.total, closeTo(3.01, 0.001));
    });

    group('discount', () {
      test('applies percentage discount', () {
        cart.addItem(const CartItem(id: '1', name: 'A', price: 100.0));
        cart.applyDiscount(10); // 10%
        expect(cart.total, closeTo(90.0, 0.001));
      });

      test('throws if discount exceeds 100%', () {
        expect(() => cart.applyDiscount(110), throwsArgumentError);
      });
    });
  });
}
```

---

## 2. Mocking with mocktail

```yaml
dev_dependencies:
  mocktail: ^1.0.4
```

```dart
// Mock class — one line
class MockUserRepository extends Mock implements UserRepository {}
class MockDio            extends Mock implements Dio {}

void main() {
  late MockUserRepository mockRepo;
  late UserService        service;

  setUp(() {
    mockRepo = MockUserRepository();
    service  = UserService(mockRepo);
  });

  test('getUser returns user from repository', () async {
    final user = User(id: 1, fullName: 'Alice', email: 'alice@example.com', createdAt: DateTime(2024));

    // Stub the method
    when(() => mockRepo.fetchUser(1)).thenAnswer((_) async => user);

    final result = await service.getUser(1);

    expect(result, equals(user));
    verify(() => mockRepo.fetchUser(1)).called(1);
  });

  test('getUser throws UserNotFoundException on NotFoundException', () async {
    when(() => mockRepo.fetchUser(any())).thenThrow(const NotFoundException());

    expect(service.getUser(99), throwsA(isA<UserNotFoundException>()));
  });

  // Stub a Stream
  test('streams events', () async {
    when(() => mockRepo.watchUser(1)).thenAnswer(
      (_) => Stream.fromIterable([user1, user2]),
    );

    expect(service.watchUser(1), emitsInOrder([user1, user2]));
  });
}
```

---

## 3. Widget Tests

```dart
// test/features/auth/login_page_test.dart
import 'package:flutter_test/flutter_test.dart';

void main() {
  testWidgets('shows validation error when email is empty', (tester) async {
    await tester.pumpWidget(
      const MaterialApp(home: LoginPage()),
    );

    // Tap Submit without filling fields
    await tester.tap(find.text('Sign In'));
    await tester.pump(); // trigger rebuild

    expect(find.text('Email is required'), findsOneWidget);
    expect(find.text('Password is required'), findsOneWidget);
  });

  testWidgets('calls onLogin when form is valid', (tester) async {
    var loginCalled = false;

    await tester.pumpWidget(
      MaterialApp(
        home: LoginPage(
          onLogin: (email, password) async { loginCalled = true; },
        ),
      ),
    );

    await tester.enterText(find.byKey(const Key('email-field')),    'user@example.com');
    await tester.enterText(find.byKey(const Key('password-field')), 'secret123');

    await tester.tap(find.text('Sign In'));
    await tester.pumpAndSettle(); // wait for all animations / async calls

    expect(loginCalled, isTrue);
  });

  testWidgets('shows loading indicator during submission', (tester) async {
    final completer = Completer<void>();

    await tester.pumpWidget(
      MaterialApp(
        home: LoginPage(
          onLogin: (_, __) => completer.future,
        ),
      ),
    );

    await tester.enterText(find.byKey(const Key('email-field')),    'user@example.com');
    await tester.enterText(find.byKey(const Key('password-field')), 'secret123');
    await tester.tap(find.text('Sign In'));

    await tester.pump(); // one frame after tap

    expect(find.byType(CircularProgressIndicator), findsOneWidget);

    completer.complete();
    await tester.pumpAndSettle();

    expect(find.byType(CircularProgressIndicator), findsNothing);
  });
}
```

### Finder Reference

| Finder                                | Locates                     |
| ------------------------------------- | --------------------------- |
| `find.text('Hello')`                  | Widget with exact text      |
| `find.textContaining('Hello')`        | Widget containing text      |
| `find.byType(TextField)`              | All widgets of type         |
| `find.byKey(const Key('id'))`         | Widget with specific key    |
| `find.byIcon(Icons.home)`             | Icon widget                 |
| `find.byWidget(myWidget)`             | Specific widget instance    |
| `find.descendant(of: x, matching: y)` | y that is a descendant of x |
| `find.ancestor(of: x, matching: y)`   | y that is an ancestor of x  |

### Pump Methods

| Method            | Behaviour                                                                      |
| ----------------- | ------------------------------------------------------------------------------ |
| `pump()`          | Trigger one frame (handles `setState`, animations one tick)                    |
| `pump(Duration)`  | Advance clock by duration                                                      |
| `pumpAndSettle()` | Pump until no pending frames (waits for animations and async gaps to complete) |

---

## 4. Testing Riverpod Providers

```yaml
dev_dependencies:
  flutter_riverpod: ^2.5.1 # already in deps
  riverpod: ^2.5.1
```

```dart
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';

class MockUserRepository extends Mock implements UserRepository {}

void main() {
  group('userListNotifierProvider', () {
    late MockUserRepository mockRepo;

    setUp(() {
      mockRepo = MockUserRepository();
    });

    ProviderContainer makeContainer() {
      return ProviderContainer(
        overrides: [
          // Override the repository with a mock
          userRepositoryProvider.overrideWithValue(mockRepo),
        ],
      );
    }

    test('loads users on build', () async {
      when(() => mockRepo.fetchUsers()).thenAnswer((_) async => [alice, bob]);

      final container = makeContainer();
      addTearDown(container.dispose);

      // Start listening
      final notifier = container.read(userListNotifierProvider.notifier);
      await container.read(userListNotifierProvider.future);

      final state = container.read(userListNotifierProvider);
      expect(state.value, equals([alice, bob]));
    });

    test('exposes error on repository failure', () async {
      when(() => mockRepo.fetchUsers()).thenThrow(const NetworkException());

      final container = makeContainer();
      addTearDown(container.dispose);

      await expectLater(
        container.read(userListNotifierProvider.future),
        throwsA(isA<NetworkException>()),
      );

      expect(container.read(userListNotifierProvider).hasError, isTrue);
    });
  });
}

// Widget test with Riverpod override
testWidgets('UserListPage shows users', (tester) async {
  when(() => mockRepo.fetchUsers()).thenAnswer((_) async => [alice]);

  await tester.pumpWidget(
    ProviderScope(
      overrides: [userRepositoryProvider.overrideWithValue(mockRepo)],
      child: const MaterialApp(home: UserListPage()),
    ),
  );

  await tester.pumpAndSettle();
  expect(find.text('Alice'), findsOneWidget);
});
```

---

## 5. Testing Bloc / Cubit

```yaml
dev_dependencies:
  bloc_test: ^9.1.7
```

```dart
import 'package:bloc_test/bloc_test.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('AuthCubit', () {
    late MockAuthRepository mockRepo;

    setUp(() => mockRepo = MockAuthRepository());

    blocTest<AuthCubit, AuthState>(
      'emits [loading, authenticated] on successful login',
      build: () {
        when(() => mockRepo.login(any(), any())).thenAnswer((_) async => fakeToken);
        return AuthCubit(mockRepo);
      },
      act: (cubit) => cubit.login('user@example.com', 'secret123'),
      expect: () => [
        const AuthState.loading(),
        AuthState.authenticated(fakeToken),
      ],
      verify: (_) => verify(() => mockRepo.login('user@example.com', 'secret123')).called(1),
    );

    blocTest<AuthCubit, AuthState>(
      'emits [loading, error] on login failure',
      build: () {
        when(() => mockRepo.login(any(), any())).thenThrow(const UnauthorizedException());
        return AuthCubit(mockRepo);
      },
      act: (cubit) => cubit.login('bad@example.com', 'wrong'),
      expect: () => [
        const AuthState.loading(),
        const AuthState.error('Unauthorised'),
      ],
    );
  });
}
```

---

## 6. Golden Tests (Snapshot Testing)

```yaml
dev_dependencies:
  golden_toolkit: ^0.15.0 # optional helper, or use built-in matchesGoldenFile
```

```dart
void main() {
  testWidgets('ProductCard matches golden', (tester) async {
    await tester.pumpWidget(
      MaterialApp(
        theme: AppTheme.light,
        home: Scaffold(
          body: ProductCard(product: fakeProduct),
        ),
      ),
    );

    await expectLater(
      find.byType(ProductCard),
      matchesGoldenFile('goldens/product_card.png'),
    );
  });
}

// To generate / update golden files:
// flutter test --update-goldens
```

---

## 7. Integration Tests

```yaml
dev_dependencies:
  integration_test: # included with Flutter SDK
    sdk: flutter
  flutter_test:
    sdk: flutter
```

```dart
// integration_test/app_test.dart
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:my_app/main.dart' as app;

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  testWidgets('full login flow', (tester) async {
    app.main();
    await tester.pumpAndSettle();

    // Navigate to login
    await tester.tap(find.text('Sign In'));
    await tester.pumpAndSettle();

    await tester.enterText(find.byKey(const Key('email-field')),    'user@staging.com');
    await tester.enterText(find.byKey(const Key('password-field')), 'testpass');

    await tester.tap(find.text('Sign In'));
    await tester.pumpAndSettle(const Duration(seconds: 5)); // wait for API

    expect(find.text('Welcome'), findsOneWidget);
  });
}

// Run integration tests:
// flutter test integration_test/ -d <device-id>
```

---

## 8. Test File & Folder Conventions

```
test/
  features/
    auth/
      login_page_test.dart
      auth_cubit_test.dart
      auth_repository_test.dart
    cart/
      cart_service_test.dart
      cart_notifier_test.dart
  core/
    network/
      api_exception_test.dart
  utils/
    validators_test.dart
  helpers/
    fake_user.dart         ← shared test data factories
    mock_repositories.dart ← reusable Mock classes
integration_test/
  app_test.dart
goldens/
  product_card.png         ← generated by --update-goldens
```

---

## Anti-Patterns

```dart
// ❌ Using pumpAndSettle for tests that have infinite animations (timers, loops)
// Results in: "timed out waiting for pumpAndSettle to settle"
await tester.pumpAndSettle();
// ✅ Use pump(duration) to advance time manually, or disable animations in test env

// ❌ Creating real HTTP clients in unit/widget tests — slow and non-deterministic
final repo = UserRepositoryImpl(Dio()); // hits real network
// ✅ Mock Dio or the repository with mocktail

// ❌ Testing implementation details instead of behaviour
expect(userService._internalCache.length, 3); // testing private state
// ✅ Test via public API: expect(await userService.fetchUsers(), hasLength(3))

// ❌ Not calling addTearDown(container.dispose) for ProviderContainer
final container = ProviderContainer();
// ✅ Always teardown to prevent test interference
addTearDown(container.dispose);

// ❌ Golden tests checked in with platform-specific rendering
// macOS generates different pixels than Linux CI — tests fail in CI
// ✅ Run golden tests only on one platform (Linux CI) or use golden_toolkit
// with device-agnostic rendering

// ❌ Integration tests against production API
// ✅ Use a separate staging environment or a local mock server for integration tests

// ❌ Putting all tests in one file
// test/app_test.dart — 2000-line file
// ✅ Mirror source structure under test/ as shown in file conventions above
```
