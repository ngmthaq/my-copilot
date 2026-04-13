---
name: flutter-platform-integration
description: "Flutter platform integration — MethodChannel, EventChannel, camera & media, permissions (permission_handler), dart:io for file access, platform-specific adaptations, responsive/adaptive layouts for mobile/tablet/desktop, and sharing/URL launching. Use when: calling native iOS/Android APIs; handling device permissions; reading or writing files; adapting UI for different platforms. DO NOT USE FOR: pure Dart code (use dart skill); API HTTP calls (use flutter-api-integration)."
---

# Flutter Platform Integration

## 1. MethodChannel — Calling Native Code

Use `MethodChannel` to invoke platform-specific code (Swift/Kotlin) from Dart.

### Dart side

```dart
// lib/core/platform/battery_service.dart
class BatteryService {
  static const _channel = MethodChannel('com.example.app/battery');

  Future<int> getBatteryLevel() async {
    try {
      final level = await _channel.invokeMethod<int>('getBatteryLevel');
      return level ?? -1;
    } on PlatformException catch (e) {
      // Native side threw an error
      throw Exception('Failed to get battery level: ${e.message}');
    } on MissingPluginException {
      // Channel not registered — running on unsupported platform
      return -1;
    }
  }
}
```

### Android side (Kotlin)

```kotlin
// android/app/src/main/kotlin/com/example/app/MainActivity.kt
class MainActivity : FlutterActivity() {
  private val CHANNEL = "com.example.app/battery"

  override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
    super.configureFlutterEngine(flutterEngine)

    MethodChannel(flutterEngine.dartExecutor.binaryMessenger, CHANNEL)
      .setMethodCallHandler { call, result ->
        when (call.method) {
          "getBatteryLevel" -> {
            val batteryLevel = getBatteryLevel()
            if (batteryLevel != -1) result.success(batteryLevel)
            else result.error("UNAVAILABLE", "Battery level not available", null)
          }
          else -> result.notImplemented()
        }
      }
  }

  private fun getBatteryLevel(): Int {
    val batteryManager = getSystemService(Context.BATTERY_SERVICE) as BatteryManager
    return batteryManager.getIntProperty(BatteryManager.BATTERY_PROPERTY_CAPACITY)
  }
}
```

### iOS side (Swift)

```swift
// ios/Runner/AppDelegate.swift
@UIApplicationMain
@objc class AppDelegate: FlutterAppDelegate {
  override func application(_ application: UIApplication,
      didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {

    let controller = window?.rootViewController as! FlutterViewController
    let channel = FlutterMethodChannel(
      name: "com.example.app/battery",
      binaryMessenger: controller.binaryMessenger
    )

    channel.setMethodCallHandler { call, result in
      guard call.method == "getBatteryLevel" else {
        result(FlutterMethodNotImplemented)
        return
      }
      UIDevice.current.isBatteryMonitoringEnabled = true
      let level = Int(UIDevice.current.batteryLevel * 100)
      result(level)
    }

    return super.application(application, didFinishLaunchingWithOptions: launchOptions)
  }
}
```

---

## 2. EventChannel — Native-to-Dart Streams

```dart
// Dart
class SensorService {
  static const _channel = EventChannel('com.example.app/accelerometer');

  Stream<Map<String, double>> get accelerometerStream {
    return _channel.receiveBroadcastStream().map((event) {
      final data = Map<String, dynamic>.from(event as Map);
      return {
        'x': (data['x'] as num).toDouble(),
        'y': (data['y'] as num).toDouble(),
        'z': (data['z'] as num).toDouble(),
      };
    });
  }
}

// Usage in widget
StreamBuilder<Map<String, double>>(
  stream: SensorService().accelerometerStream,
  builder: (context, snap) {
    if (!snap.hasData) return const CircularProgressIndicator();
    final data = snap.data!;
    return Text('x=${data['x']?.toStringAsFixed(2)}');
  },
)
```

---

## 3. Permissions with permission_handler

```yaml
dependencies:
  permission_handler: ^11.3.1
```

```dart
import 'package:permission_handler/permission_handler.dart';

class PermissionService {
  Future<bool> requestCamera() async {
    final status = await Permission.camera.request();
    return status.isGranted;
  }

  Future<bool> requestLocation() async {
    // Check current status first
    var status = await Permission.locationWhenInUse.status;
    if (status.isGranted) return true;
    if (status.isPermanentlyDenied) {
      // Direct user to app settings
      await openAppSettings();
      return false;
    }
    status = await Permission.locationWhenInUse.request();
    return status.isGranted;
  }

  Future<void> requestMultiple() async {
    final statuses = await [
      Permission.camera,
      Permission.microphone,
    ].request();

    for (final entry in statuses.entries) {
      if (!entry.value.isGranted) {
        throw PermissionDeniedException(entry.key.toString());
      }
    }
  }
}
```

**Android — add to `android/app/src/main/AndroidManifest.xml`:**

```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
```

**iOS — add to `ios/Runner/Info.plist`:**

```xml
<key>NSCameraUsageDescription</key>
<string>We need camera access to take photos.</string>
<key>NSLocationWhenInUseUsageDescription</key>
<string>We need your location to show nearby results.</string>
```

---

## 4. Camera & Image Picker

```yaml
dependencies:
  image_picker: ^1.1.2
```

```dart
import 'package:image_picker/image_picker.dart';

class MediaService {
  final _picker = ImagePicker();

  Future<XFile?> pickImage({
    ImageSource source = ImageSource.gallery,
    int quality = 85,
    double? maxWidth,
    double? maxHeight,
  }) async {
    return _picker.pickImage(
      source:    source,
      imageQuality: quality,
      maxWidth:  maxWidth,
      maxHeight: maxHeight,
    );
  }

  Future<XFile?> pickVideo({
    ImageSource source = ImageSource.gallery,
    Duration? maxDuration,
  }) async {
    return _picker.pickVideo(source: source, maxDuration: maxDuration);
  }
}

// UI
OutlinedButton.icon(
  icon: const Icon(Icons.photo_library),
  label: const Text('Pick from gallery'),
  onPressed: () async {
    final file = await MediaService().pickImage();
    if (file != null && mounted) {
      setState(() => _selectedImage = File(file.path));
    }
  },
),

if (_selectedImage != null)
  Image.file(_selectedImage!, height: 200, fit: BoxFit.cover),
```

---

## 5. File I/O with dart:io & path_provider

```yaml
dependencies:
  path_provider: ^2.1.3
```

```dart
import 'dart:io';
import 'package:path_provider/path_provider.dart';

class FileStorageService {
  Future<File> _localFile(String filename) async {
    final dir = await getApplicationDocumentsDirectory();
    return File('${dir.path}/$filename');
  }

  Future<void> writeJson(String filename, Map<String, dynamic> data) async {
    final file = await _localFile(filename);
    await file.writeAsString(jsonEncode(data));
  }

  Future<Map<String, dynamic>?> readJson(String filename) async {
    try {
      final file = await _localFile(filename);
      if (!file.existsSync()) return null;
      final content = await file.readAsString();
      return jsonDecode(content) as Map<String, dynamic>;
    } catch (_) {
      return null;
    }
  }

  Future<void> delete(String filename) async {
    final file = await _localFile(filename);
    if (file.existsSync()) await file.delete();
  }
}
```

**Common path_provider directories:**

| Method                             | Location                       | Use for                |
| ---------------------------------- | ------------------------------ | ---------------------- |
| `getApplicationDocumentsDirectory` | User-visible documents         | User files, exports    |
| `getApplicationSupportDirectory`   | App-private data (not in docs) | Databases, preferences |
| `getTemporaryDirectory`            | OS may clear at any time       | Cache, temp downloads  |
| `getApplicationCacheDirectory`     | Cache the user can clear       | Image cache            |
| `getDownloadsDirectory` (desktop)  | Downloads folder               | Downloadable content   |

---

## 6. Sharing & URL Launching

```yaml
dependencies:
  share_plus: ^10.0.0
  url_launcher: ^6.3.0
```

```dart
import 'package:share_plus/share_plus.dart';
import 'package:url_launcher/url_launcher.dart';

// Share text / files
await Share.share('Check out this article: https://example.com/article');

await Share.shareXFiles(
  [XFile('/path/to/photo.jpg')],
  text: 'My favourite photo!',
);

// Launch URLs
Future<void> launchUrl(String url) async {
  final uri = Uri.parse(url);
  if (!await canLaunchUrl(uri)) throw Exception('Cannot launch $url');
  await launchUrl(uri, mode: LaunchMode.externalApplication);
}

// Phone, email, sms
await launchUrl(Uri(scheme: 'tel',    path:  '+1234567890'));
await launchUrl(Uri(scheme: 'mailto', path:  'info@example.com',
  queryParameters: {'subject': 'Hello', 'body': 'Hi there'}));
await launchUrl(Uri(scheme: 'sms',    path:  '+1234567890'));
```

---

## 7. Platform-Adaptive UI

```dart
import 'dart:io' show Platform;
import 'package:flutter/foundation.dart' show kIsWeb;

// Check current platform
final bool isAndroid = !kIsWeb && Platform.isAndroid;
final bool isIOS     = !kIsWeb && Platform.isIOS;
final bool isMacOS   = !kIsWeb && Platform.isMacOS;
final bool isDesktop = !kIsWeb && (Platform.isWindows || Platform.isMacOS || Platform.isLinux);

// Adaptive widget factory
class AdaptiveButton extends StatelessWidget {
  const AdaptiveButton({super.key, required this.label, required this.onPressed});
  final String label;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    if (Platform.isIOS) {
      return CupertinoButton(onPressed: onPressed, child: Text(label));
    }
    return FilledButton(onPressed: onPressed, child: Text(label));
  }
}

// Responsive breakpoints with LayoutBuilder
class ResponsiveScaffold extends StatelessWidget {
  const ResponsiveScaffold({super.key, required this.body});
  final Widget body;

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        if (constraints.maxWidth >= 1200) {
          return _DesktopLayout(body: body);
        } else if (constraints.maxWidth >= 600) {
          return _TabletLayout(body: body);
        } else {
          return _MobileLayout(body: body);
        }
      },
    );
  }
}
```

---

## 8. Secure Storage

```yaml
dependencies:
  flutter_secure_storage: ^9.2.2
```

```dart
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class TokenStorage {
  static const _storage = FlutterSecureStorage(
    // iOS: use keychain
    iOptions: IOSOptions(
      accessibility: KeychainAccessibility.first_unlock,
    ),
    // Android: use EncryptedSharedPreferences
    aOptions: AndroidOptions(
      encryptedSharedPreferences: true,
    ),
  );

  static const _accessKey  = 'access_token';
  static const _refreshKey = 'refresh_token';

  static Future<void>    write(String token)          => _storage.write(key: _accessKey,  value: token);
  static Future<String?> read()                       => _storage.read(key: _accessKey);
  static Future<void>    writeRefresh(String token)   => _storage.write(key: _refreshKey, value: token);
  static Future<String?> readRefresh()                => _storage.read(key: _refreshKey);
  static Future<void>    deleteAll()                  => _storage.deleteAll();
}
```

---

## Anti-Patterns

```dart
// ❌ Storing tokens in SharedPreferences — unencrypted on device
final prefs = await SharedPreferences.getInstance();
await prefs.setString('token', accessToken); // easily read by other apps on rooted devices
// ✅ Use flutter_secure_storage

// ❌ Accessing dart:io Platform.isXxx in widget build without platform check
// Crashes on web because dart:io is not available
Widget build(BuildContext context) {
  if (Platform.isIOS) return CupertinoButton(...);  // ← crashes on web
}
// ✅ Guard with !kIsWeb before using dart:io Platform

// ❌ Not handling MissingPluginException
// Plugin may be absent on some platforms (e.g., desktop, web)
final level = await _channel.invokeMethod<int>('getBatteryLevel');
// ✅ Catch MissingPluginException and return a safe default

// ❌ Calling permission_handler without adding Info.plist / AndroidManifest entries
// Permission dialog will never appear and permission will always be denied
// ✅ Add all required permission entries to platform manifests

// ❌ Reading/writing files synchronously on the main thread
final content = File('/some/path').readAsStringSync(); // blocks UI
// ✅ Always use async file API: await file.readAsString()

// ❌ Hardcoding absolute paths
final file = File('/data/user/0/com.example/files/data.json'); // device-specific, breaks
// ✅ Always use path_provider to resolve directories at runtime
```
