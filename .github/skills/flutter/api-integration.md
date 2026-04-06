---
name: flutter-api-integration
description: "Flutter API integration — HTTP requests with Dio and http, JSON serialization (json_serializable / freezed), authentication headers, interceptors, error handling, caching, Riverpod + AsyncNotifier patterns, and retry logic. Use when: calling REST APIs; handling auth tokens; parsing JSON responses; managing loading/error/data states. DO NOT USE FOR: state management architecture (use flutter-state-management); form submission UI (use flutter-forms-validation)."
---

# Flutter API Integration

## 1. Dio Setup & Configuration

```dart
// lib/core/network/dio_client.dart
import 'package:dio/dio.dart';

class DioClient {
  DioClient._();
  static Dio? _instance;

  static Dio get instance {
    _instance ??= _createDio();
    return _instance!;
  }

  static Dio _createDio() {
    final dio = Dio(BaseOptions(
      baseUrl:         'https://api.example.com/v1',
      connectTimeout:  const Duration(seconds: 10),
      receiveTimeout:  const Duration(seconds: 30),
      headers: const {
        'Content-Type': 'application/json',
        'Accept':        'application/json',
      },
    ));

    dio.interceptors.addAll([
      AuthInterceptor(),
      LogInterceptor(requestBody: true, responseBody: true),
      RetryInterceptor(dio: dio, retries: 2),
    ]);

    return dio;
  }
}
```

---

## 2. Auth Interceptor (Bearer Token)

```dart
class AuthInterceptor extends Interceptor {
  @override
  void onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    final token = await TokenStorage.read();
    if (token != null) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    handler.next(options);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) async {
    if (err.response?.statusCode == 401) {
      try {
        final newToken = await _refreshToken();
        await TokenStorage.write(newToken);

        // Retry the original request with the new token
        final opts = err.requestOptions;
        opts.headers['Authorization'] = 'Bearer $newToken';
        final response = await DioClient.instance.fetch(opts);
        handler.resolve(response);
        return;
      } catch (_) {
        // Refresh failed — log out the user
        await AuthService.logout();
      }
    }
    handler.next(err);
  }

  Future<String> _refreshToken() async {
    final refreshToken = await TokenStorage.readRefresh();
    final response = await Dio().post(
      'https://api.example.com/v1/auth/refresh',
      data: {'refresh_token': refreshToken},
    );
    return response.data['access_token'] as String;
  }
}
```

---

## 3. JSON Serialization with json_serializable

```yaml
# pubspec.yaml
dependencies:
  json_annotation: ^4.9.0

dev_dependencies:
  build_runner: ^2.4.9
  json_serializable: ^6.8.0
```

```dart
// lib/features/users/data/user_dto.dart
import 'package:json_annotation/json_annotation.dart';

part 'user_dto.g.dart';

@JsonSerializable(explicitToJson: true)
class UserDto {
  @JsonKey(name: 'id')
  final int id;

  @JsonKey(name: 'full_name')
  final String fullName;

  @JsonKey(name: 'email')
  final String email;

  @JsonKey(name: 'avatar_url', includeIfNull: false)
  final String? avatarUrl;

  @JsonKey(name: 'created_at')
  final DateTime createdAt;

  const UserDto({
    required this.id,
    required this.fullName,
    required this.email,
    this.avatarUrl,
    required this.createdAt,
  });

  factory UserDto.fromJson(Map<String, dynamic> json) =>
      _$UserDtoFromJson(json);

  Map<String, dynamic> toJson() => _$UserDtoToJson(this);
}

// Run: flutter pub run build_runner build --delete-conflicting-outputs
```

---

## 4. freezed + json_serializable (Recommended)

```yaml
dependencies:
  freezed_annotation: ^2.4.4
  json_annotation: ^4.9.0

dev_dependencies:
  build_runner: ^2.4.9
  freezed: ^2.5.7
  json_serializable: ^6.8.0
```

```dart
import 'package:freezed_annotation/freezed_annotation.dart';

part 'user.freezed.dart';
part 'user.g.dart';

@freezed
class User with _$User {
  const factory User({
    required int     id,
    required String  fullName,
    required String  email,
    String?          avatarUrl,
    required DateTime createdAt,
  }) = _User;

  factory User.fromJson(Map<String, dynamic> json) => _$UserFromJson(json);
}

// copyWith, ==, hashCode, toString all generated for free
final updated = user.copyWith(fullName: 'Jane Doe');
```

---

## 5. Repository Pattern

```dart
// lib/features/users/data/user_repository.dart
abstract interface class UserRepository {
  Future<User>       fetchUser(int id);
  Future<List<User>> fetchUsers({int page = 1, int limit = 20});
  Future<User>       updateUser(int id, UpdateUserDto dto);
}

class UserRepositoryImpl implements UserRepository {
  UserRepositoryImpl(this._dio);
  final Dio _dio;

  @override
  Future<User> fetchUser(int id) async {
    final response = await _dio.get<Map<String, dynamic>>('/users/$id');
    return User.fromJson(response.data!);
  }

  @override
  Future<List<User>> fetchUsers({int page = 1, int limit = 20}) async {
    final response = await _dio.get<Map<String, dynamic>>(
      '/users',
      queryParameters: {'page': page, 'limit': limit},
    );
    final items = response.data!['data'] as List<dynamic>;
    return items
        .map((e) => User.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  @override
  Future<User> updateUser(int id, UpdateUserDto dto) async {
    final response = await _dio.patch<Map<String, dynamic>>(
      '/users/$id',
      data: dto.toJson(),
    );
    return User.fromJson(response.data!);
  }
}
```

---

## 6. API Error Handling

```dart
// lib/core/network/api_exception.dart
sealed class ApiException implements Exception {
  const ApiException(this.message);
  final String message;
}

class NetworkException   extends ApiException { const NetworkException()    : super('No internet connection'); }
class UnauthorizedException extends ApiException { const UnauthorizedException() : super('Unauthorised'); }
class NotFoundException  extends ApiException { const NotFoundException()   : super('Resource not found'); }
class ServerException    extends ApiException { const ServerException([String m = 'Server error']) : super(m); }

// Convert DioException to domain exception
ApiException mapDioException(DioException e) {
  if (e.type == DioExceptionType.connectionError ||
      e.type == DioExceptionType.unknown) {
    return const NetworkException();
  }
  return switch (e.response?.statusCode) {
    401 => const UnauthorizedException(),
    404 => const NotFoundException(),
    _   => ServerException(e.response?.data?['message'] as String? ?? 'Unknown error'),
  };
}
```

---

## 7. Riverpod + AsyncNotifier (Full Stack)

```dart
// Provider for Dio
@riverpod
Dio dio(DioRef ref) => DioClient.instance;

// Provider for repository
@riverpod
UserRepository userRepository(UserRepositoryRef ref) =>
    UserRepositoryImpl(ref.watch(dioProvider));

// AsyncNotifier for user list with pagination
@riverpod
class UserListNotifier extends _$UserListNotifier {
  int _page = 1;
  bool _hasMore = true;
  final List<User> _users = [];

  @override
  Future<List<User>> build() async {
    _page = 1;
    _hasMore = true;
    _users.clear();
    return _fetchPage();
  }

  Future<List<User>> _fetchPage() async {
    try {
      final repo = ref.read(userRepositoryProvider);
      final newUsers = await repo.fetchUsers(page: _page);
      if (newUsers.length < 20) _hasMore = false;
      _users.addAll(newUsers);
      return List.from(_users);
    } on DioException catch (e) {
      throw mapDioException(e);
    }
  }

  Future<void> loadMore() async {
    if (!_hasMore || state.isLoading) return;
    _page++;
    state = await AsyncValue.guard(_fetchPage);
  }

  Future<void> refresh() async {
    state = const AsyncValue.loading();
    _page = 1;
    _hasMore = true;
    _users.clear();
    state = await AsyncValue.guard(_fetchPage);
  }
}

// UI — consume async state
class UserListPage extends ConsumerWidget {
  const UserListPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final usersAsync = ref.watch(userListNotifierProvider);

    return usersAsync.when(
      loading: () => const Center(child: CircularProgressIndicator()),
      error:   (err, _) => Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(err is ApiException ? err.message : 'An error occurred'),
            FilledButton(
              onPressed: () => ref.refresh(userListNotifierProvider),
              child: const Text('Retry'),
            ),
          ],
        ),
      ),
      data: (users) => ListView.builder(
        itemCount: users.length,
        itemBuilder: (_, i) => ListTile(title: Text(users[i].fullName)),
      ),
    );
  }
}
```

---

## 8. Retry Interceptor

```dart
class RetryInterceptor extends Interceptor {
  RetryInterceptor({required this.dio, this.retries = 2, this.retryDelays = const [
    Duration(seconds: 1),
    Duration(seconds: 2),
  ]});

  final Dio  dio;
  final int  retries;
  final List<Duration> retryDelays;

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) async {
    final retriesLeft = err.requestOptions.extra['retriesLeft'] as int? ?? retries;

    final isNetworkError =
        err.type == DioExceptionType.connectionError ||
        err.type == DioExceptionType.receiveTimeout;

    if (!isNetworkError || retriesLeft <= 0) {
      return handler.next(err);
    }

    final delayIndex = retries - retriesLeft;
    final delay = delayIndex < retryDelays.length ? retryDelays[delayIndex] : retryDelays.last;

    await Future.delayed(delay);

    final options = err.requestOptions
      ..extra['retriesLeft'] = retriesLeft - 1;

    try {
      final response = await dio.fetch(options);
      handler.resolve(response);
    } catch (e) {
      handler.next(err);
    }
  }
}
```

---

## 9. File Upload & multipart/form-data

```dart
Future<String> uploadAvatar(int userId, String filePath) async {
  final file = await MultipartFile.fromFile(
    filePath,
    filename: path.basename(filePath),
    contentType: DioMediaType('image', 'jpeg'),
  );

  final formData = FormData.fromMap({
    'user_id': userId,
    'avatar':  file,
  });

  final response = await DioClient.instance.post<Map<String, dynamic>>(
    '/users/$userId/avatar',
    data: formData,
    onSendProgress: (sent, total) {
      print('Upload progress: ${(sent / total * 100).toStringAsFixed(0)}%');
    },
  );

  return response.data!['avatar_url'] as String;
}
```

---

## Anti-Patterns

```dart
// ❌ Creating a new Dio instance on every request — no interceptors, no config reuse
Future<User> getUser(int id) async {
  final dio = Dio(); // ← new instance every call
  final r   = await dio.get('/users/$id');
  return User.fromJson(r.data);
}
// ✅ Use a singleton DioClient.instance

// ❌ Catching DioException globally and swallowing errors silently
try {
  final r = await dio.get('/users');
} catch (_) {
  // silent — UI has no idea what happened
}
// ✅ Map to domain exceptions and expose to UI via AsyncValue.error

// ❌ Parsing JSON inside a widget
class UserPage extends ConsumerWidget {
  Widget build(BuildContext context, WidgetRef ref) {
    final raw = ref.watch(rawJsonProvider);
    final user = User.fromJson(raw); // parsing in build — runs on every rebuild
    return Text(user.fullName);
  }
}
// ✅ Parse in the repository or provider, expose typed models

// ❌ Storing access tokens in SharedPreferences without encryption
await prefs.setString('token', accessToken);
// ✅ Use flutter_secure_storage for tokens

// ❌ Hardcoding base URL in every request
await dio.get('https://api.example.com/v1/users'); // duplicated everywhere
// ✅ Set baseUrl in BaseOptions once in DioClient

// ❌ Ignoring 4xx errors that are not 401
// ✅ Map all HTTP error codes to meaningful domain exceptions in the interceptor
```
