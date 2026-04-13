---
name: flutter-navigation-routing
description: "Flutter navigation & routing — GoRouter setup, named routes, path parameters, query parameters, redirect guards, nested routes, shell routes (bottom nav), deep links, Navigator.push/pop, passing arguments, and handling back navigation. Use when: navigating between screens; setting up app routes; implementing auth guards; building bottom nav or drawer navigation; handling deep links. DO NOT USE FOR: widget lifecycle (use flutter-widget-basics); state management (use flutter-state-management)."
---

# Flutter Navigation & Routing

## 1. GoRouter Setup (Recommended)

```yaml
# pubspec.yaml
dependencies:
  go_router: ^14.2.0
```

### Basic route definition

```dart
import 'package:go_router/go_router.dart';

final router = GoRouter(
  initialLocation: '/',
  debugLogDiagnostics: true, // logs route changes in debug mode
  routes: [
    GoRoute(
      path: '/',
      name: 'home',
      builder: (context, state) => const HomePage(),
      routes: [
        // Nested route — path: /profile/:id
        GoRoute(
          path: 'profile/:id',
          name: 'profile',
          builder: (context, state) {
            final id = state.pathParameters['id']!;
            return ProfilePage(userId: id);
          },
        ),
      ],
    ),
    GoRoute(
      path: '/settings',
      name: 'settings',
      builder: (context, state) => const SettingsPage(),
    ),
    GoRoute(
      path: '/login',
      name: 'login',
      builder: (context, state) => const LoginPage(),
    ),
  ],
);

// Provide to MaterialApp
void main() => runApp(MaterialApp.router(routerConfig: router));
```

---

## 2. Navigating with GoRouter

```dart
// Push — go to a new route (replaces current stack segment)
context.go('/settings');
context.go('/profile/user-123');

// Named navigation
context.goNamed('profile', pathParameters: {'id': 'user-123'});

// Push on top of current location (adds to stack)
context.push('/settings');
context.pushNamed('settings');

// With query parameters and extra data
context.go('/search?query=dart&page=2');
context.pushNamed(
  'product',
  pathParameters: {'id': '42'},
  queryParameters: {'ref': 'home'},
  extra: const ProductPreviewData(title: 'Dart Book'),
);

// Pop
context.pop();
context.pop(resultValue); // return result to previous page

// Pop until a named route
while (context.canPop()) {
  context.pop();
}
context.go('/home');
```

### Reading route parameters

```dart
GoRoute(
  path: '/search',
  builder: (context, state) {
    // Path params   → state.pathParameters['key']
    // Query params  → state.uri.queryParameters['key']
    // Extra data    → state.extra as MyType
    final query = state.uri.queryParameters['query'] ?? '';
    final extra = state.extra as SearchFilter?;
    return SearchPage(query: query, filter: extra);
  },
);
```

---

## 3. Auth Redirect Guard

```dart
final router = GoRouter(
  initialLocation: '/home',
  redirect: (context, state) {
    final isAuthenticated = context.read<AuthState>().isAuthenticated;
    final isLoginRoute = state.matchedLocation == '/login';

    if (!isAuthenticated && !isLoginRoute) return '/login';
    if (isAuthenticated && isLoginRoute) return '/home';
    return null; // no redirect
  },
  refreshListenable: authStateNotifier, // re-runs redirect when auth changes
  routes: [...],
);

// With Riverpod
final router = GoRouter(
  redirect: (context, state) {
    final authAsync = ProviderScope.containerOf(context).read(authProvider);
    return authAsync.when(
      data: (auth) => auth.isLoggedIn ? null : '/login',
      loading: () => null,
      error: (_, __) => '/login',
    );
  },
  refreshListenable: RouterNotifier(ref), // listens to Riverpod provider
  routes: [...],
);

// RouterNotifier — bridges Riverpod to GoRouter's refreshListenable
class RouterNotifier extends ChangeNotifier {
  final Ref _ref;
  late final ProviderSubscription _sub;

  RouterNotifier(this._ref) {
    _sub = _ref.listen(authProvider, (_, __) => notifyListeners());
  }

  @override
  void dispose() {
    _sub.close();
    super.dispose();
  }
}
```

---

## 4. Shell Routes (Bottom Navigation Bar)

```dart
final router = GoRouter(
  routes: [
    ShellRoute(
      builder: (context, state, child) => AppShell(child: child),
      routes: [
        GoRoute(path: '/home',    builder: (_, __) => const HomeTab()),
        GoRoute(path: '/explore', builder: (_, __) => const ExploreTab()),
        GoRoute(path: '/profile', builder: (_, __) => const ProfileTab()),
      ],
    ),
  ],
);

// AppShell — the persistent scaffold with bottom nav
class AppShell extends StatelessWidget {
  final Widget child;
  const AppShell({super.key, required this.child});

  static const _tabs = ['/home', '/explore', '/profile'];

  @override
  Widget build(BuildContext context) {
    final location = GoRouterState.of(context).matchedLocation;
    final currentIndex = _tabs.indexWhere(location.startsWith);

    return Scaffold(
      body: child,
      bottomNavigationBar: NavigationBar(
        selectedIndex: currentIndex < 0 ? 0 : currentIndex,
        onDestinationSelected: (i) => context.go(_tabs[i]),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.home), label: 'Home'),
          NavigationDestination(icon: Icon(Icons.explore), label: 'Explore'),
          NavigationDestination(icon: Icon(Icons.person), label: 'Profile'),
        ],
      ),
    );
  }
}
```

---

## 5. StatefulShellRoute (Preserve Tab State)

```dart
// Each branch keeps its own navigation stack and scroll position
final router = GoRouter(
  routes: [
    StatefulShellRoute.indexedStack(
      builder: (context, state, navigationShell) {
        return AppScaffold(navigationShell: navigationShell);
      },
      branches: [
        StatefulShellBranch(routes: [
          GoRoute(path: '/home', builder: (_, __) => const HomeTab()),
        ]),
        StatefulShellBranch(routes: [
          GoRoute(path: '/search', builder: (_, __) => const SearchTab()),
        ]),
        StatefulShellBranch(routes: [
          GoRoute(path: '/profile', builder: (_, __) => const ProfileTab()),
        ]),
      ],
    ),
  ],
);

class AppScaffold extends StatelessWidget {
  final StatefulNavigationShell navigationShell;
  const AppScaffold({super.key, required this.navigationShell});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: navigationShell,
      bottomNavigationBar: NavigationBar(
        selectedIndex: navigationShell.currentIndex,
        onDestinationSelected: navigationShell.goBranch,
        destinations: const [...],
      ),
    );
  }
}
```

---

## 6. Page Transitions

```dart
// Custom transition
GoRoute(
  path: '/detail/:id',
  pageBuilder: (context, state) => CustomTransitionPage(
    key: state.pageKey,
    child: DetailPage(id: state.pathParameters['id']!),
    transitionsBuilder: (context, animation, secondaryAnimation, child) {
      return FadeTransition(opacity: animation, child: child);
    },
  ),
);

// Slide transition
return SlideTransition(
  position: Tween<Offset>(
    begin: const Offset(1, 0),
    end: Offset.zero,
  ).animate(animation),
  child: child,
);

// No transition (instant switch)
GoRoute(
  path: '/splash',
  pageBuilder: (context, state) => NoTransitionPage(child: const SplashPage()),
);
```

---

## 7. Imperative Navigator (without GoRouter)

For simple apps or when pushing dialogs/bottom sheets:

```dart
// Push a new route
Navigator.of(context).push<bool>(
  MaterialPageRoute(builder: (_) => const ConfirmPage()),
).then((confirmed) {
  if (confirmed == true) doSomething();
});

// Push named routes (basic setup)
MaterialApp(
  routes: {
    '/': (_) => const HomePage(),
    '/settings': (_) => const SettingsPage(),
  },
);
Navigator.pushNamed(context, '/settings');

// Push and remove until
Navigator.of(context).pushNamedAndRemoveUntil('/home', (_) => false);

// Pop with result
Navigator.of(context).pop(true);

// WillPopScope / PopScope — intercept back button
PopScope(
  canPop: false,
  onPopInvoked: (didPop) async {
    if (didPop) return;
    final confirmed = await showConfirmDialog(context);
    if (confirmed && context.mounted) Navigator.of(context).pop();
  },
  child: const MyForm(),
);
```

---

## 8. Deep Links

```yaml
# Android: android/app/src/main/AndroidManifest.xml (inside <activity>)
# <intent-filter android:autoVerify="true">
#   <action android:name="android.intent.action.VIEW" />
#   <category android:name="android.intent.category.DEFAULT" />
#   <category android:name="android.intent.category.BROWSABLE" />
#   <data android:scheme="https" android:host="example.com" />
# </intent-filter>

# iOS: ios/Runner/Info.plist — add CFBundleURLSchemes or Associated Domains
```

```dart
// GoRouter handles deep links automatically when routes match the URL
// Custom scheme: myapp://profile/user-123
final router = GoRouter(
  routes: [
    GoRoute(path: '/profile/:id', builder: ...),
  ],
);

// For https deep links, configure GoRouter with the base URL
final router = GoRouter(
  initialLocation: '/',
  // GoRouter automatically uses the incoming URL on app start
  routes: [...],
);
```

---

## Anti-Patterns

```dart
// ❌ Using Navigator.push inside GoRouter-managed app — breaks back stack
Navigator.of(context).push(...);     // bypasses GoRouter
// ✅ Always use context.go() or context.push()

// ❌ Hardcoding path strings — typos cause silent failures
context.go('/profle/123'); // typo
// ✅ Use named routes
context.goNamed('profile', pathParameters: {'id': '123'});

// ❌ Accessing route state (pathParameters) outside GoRoute builder
// GoRouterState is not available in arbitrary widget build()
// ✅ Pass parameters as constructor arguments from the builder

// ❌ Blocking the UI thread in redirect function
redirect: (context, state) {
  final user = slowSyncLoad(); // blocks the event loop
  return user == null ? '/login' : null;
},
// ✅ Make auth state synchronously available via a notifier/provider

// ❌ Not disposing GoRouter when using it as a field
class _AppState extends State<App> {
  final _router = GoRouter(routes: [...]);
  // Never disposed!
}
// ✅ Dispose in dispose(), or declare as final at module level
```
