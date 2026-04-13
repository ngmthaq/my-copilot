---
name: dart-cli-development
description: "Dart CLI development — building command-line tools with the args package, reading stdin/stdout/stderr, working with files and directories using dart:io, handling signals (SIGINT), compiling native executables with dart compile exe, structuring multi-command CLIs, progress indicators, and environment variables. Use when: building Dart CLI tools or scripts; parsing command-line arguments; reading from files; compiling standalone executables. DO NOT USE FOR: Flutter apps; general async patterns (use dart-async-await); package publishing (use dart-packages-dependencies)."
---

# Dart CLI Development

## 1. Project Setup

```bash
# Create a new CLI project scaffold
dart create --template=cli my_tool
cd my_tool

# Result structure:
# bin/my_tool.dart   ← entry point
# lib/               ← business logic
# pubspec.yaml
```

```yaml
# pubspec.yaml
name: my_tool
description: A Dart CLI tool.
version: 1.0.0

environment:
  sdk: ">=3.0.0 <4.0.0"

dependencies:
  args: ^2.4.2

dev_dependencies:
  lints: ^3.0.0
  test: ^1.24.0

# Declare executables — `dart pub global activate` installs them
executables:
  my_tool: bin/my_tool # runs bin/my_tool.dart
```

---

## 2. Parsing Arguments with `package:args`

```bash
dart pub add args
```

### Simple flags and options

```dart
import 'package:args/args.dart';

void main(List<String> arguments) {
  final parser = ArgParser()
    ..addFlag(
      'verbose',
      abbr: 'v',
      negatable: false,
      help: 'Enable verbose output',
    )
    ..addFlag(
      'dry-run',
      abbr: 'n',
      negatable: false,
      help: 'Run without making changes',
    )
    ..addOption(
      'output',
      abbr: 'o',
      defaultsTo: 'output.txt',
      help: 'Output file path',
      valueHelp: 'FILE',
    )
    ..addOption(
      'format',
      allowed: ['json', 'csv', 'text'],
      defaultsTo: 'text',
      help: 'Output format',
    )
    ..addMultiOption(
      'tag',
      abbr: 't',
      help: 'Tags to apply (can be repeated)',
    );

  ArgResults results;
  try {
    results = parser.parse(arguments);
  } on FormatException catch (e) {
    stderr.writeln('Error: ${e.message}');
    stderr.writeln(parser.usage);
    exit(64); // EX_USAGE
  }

  final verbose = results['verbose'] as bool;
  final dryRun  = results['dry-run'] as bool;
  final output  = results['output']  as String;
  final format  = results['format']  as String;
  final tags    = results['tag']     as List<String>;
  final rest    = results.rest;       // positional args after flags

  if (verbose) print('Running in verbose mode...');
  print('Output: $output, Format: $format, Tags: $tags');
  if (rest.isNotEmpty) print('Files: $rest');
}
```

---

## 3. Multi-Command CLIs

```dart
import 'package:args/command_runner.dart';

void main(List<String> args) async {
  final runner = CommandRunner<void>(
    'my_tool',
    'A CLI tool with multiple commands.',
  )
    ..addCommand(BuildCommand())
    ..addCommand(DeployCommand())
    ..addCommand(ConfigCommand());

  try {
    await runner.run(args);
  } on UsageException catch (e) {
    stderr.writeln(e.message);
    exit(64);
  }
}

class BuildCommand extends Command<void> {
  @override
  String get name => 'build';

  @override
  String get description => 'Build the project.';

  BuildCommand() {
    argParser
      ..addFlag('release', abbr: 'r', help: 'Build in release mode')
      ..addOption('target', abbr: 't', defaultsTo: 'all', help: 'Build target');
  }

  @override
  Future<void> run() async {
    final release = argResults!['release'] as bool;
    final target  = argResults!['target']  as String;
    print('Building $target${release ? ' (release)' : ''}...');
    // implementation
  }
}

class DeployCommand extends Command<void> {
  @override
  String get name => 'deploy';

  @override
  String get description => 'Deploy the project.';

  @override
  Future<void> run() async {
    print('Deploying...');
  }
}

class ConfigCommand extends Command<void> {
  @override
  String get name => 'config';

  @override
  String get description => 'Manage configuration.';

  ConfigCommand() {
    addSubcommand(ConfigGetCommand());
    addSubcommand(ConfigSetCommand());
  }

  @override
  String? get usageFooter => '\nRun "my_tool config <subcommand> --help" for details.';
}

class ConfigGetCommand extends Command<void> {
  @override
  String get name => 'get';

  @override
  String get description => 'Get a configuration value.';

  @override
  void run() {
    final key = argResults!.rest.firstOrNull ?? '';
    if (key.isEmpty) usageException('KEY is required');
    print('$key = ${getConfig(key)}');
  }
}

class ConfigSetCommand extends Command<void> {
  @override
  String get name => 'set';

  @override
  String get description => 'Set a configuration value.';

  @override
  void run() {
    final args = argResults!.rest;
    if (args.length != 2) usageException('Usage: config set KEY VALUE');
    setConfig(args[0], args[1]);
    print('Set ${args[0]} = ${args[1]}');
  }
}
```

---

## 4. stdin / stdout / stderr

```dart
import 'dart:io';
import 'dart:convert';

void main() async {
  // stdout — standard output (print() writes here)
  stdout.writeln('Hello from stdout');
  stdout.write('No newline');

  // stderr — standard error
  stderr.writeln('This is an error message');

  // stdin — standard input
  // Read a single line
  stdout.write('Enter your name: ');
  final name = stdin.readLineSync(encoding: utf8)?.trim();
  if (name == null || name.isEmpty) {
    stderr.writeln('No input provided');
    exit(1);
  }
  print('Hello, $name!');

  // Read all stdin until EOF (e.g., piped input)
  final lines = await stdin
      .transform(utf8.decoder)
      .transform(const LineSplitter())
      .toList();
  print('Read ${lines.length} lines from stdin');

  // Read bytes in chunks
  await for (final chunk in stdin) {
    stdout.add(chunk); // pass-through (grep-like)
  }
}
```

---

## 5. Working with Files and Directories

```dart
import 'dart:io';

// --- Files ---

// Read entire file as string
final content = await File('input.txt').readAsString();

// Read as lines
final lines = await File('input.txt').readAsLines();

// Read as bytes
final bytes = await File('data.bin').readAsBytes();

// Stream large files line-by-line (memory efficient)
final stream = File('large.log')
    .openRead()
    .transform(utf8.decoder)
    .transform(const LineSplitter());

await for (final line in stream) {
  if (line.contains('ERROR')) print(line);
}

// Write (overwrites)
await File('output.txt').writeAsString('Hello\n');

// Append
final sink = File('log.txt').openWrite(mode: FileMode.append);
sink.writeln('[${DateTime.now()}] Event occurred');
await sink.flush();
await sink.close();

// Write bytes
await File('data.bin').writeAsBytes([0x48, 0x65, 0x6C, 0x6C, 0x6F]);

// Check existence
final exists = await File('file.txt').exists();

// Copy / delete
await File('source.txt').copy('dest.txt');
await File('to-delete.txt').delete();

// Get file info
final stat = await File('file.txt').stat();
print('Size: ${stat.size} bytes, Modified: ${stat.modified}');

// --- Directories ---

// Create (recursive creates parent dirs)
await Directory('output/reports').create(recursive: true);

// List contents
final dir = Directory('.');
await for (final entity in dir.list()) {
  if (entity is File) print('File: ${entity.path}');
  if (entity is Directory) print('Dir:  ${entity.path}');
}

// Recursive listing
await for (final entity in dir.list(recursive: true)) {
  print(entity.path);
}

// Delete directory and contents
await Directory('temp').delete(recursive: true);

// Temporary directory
final tempDir = await Directory.systemTemp.createTemp('my_tool_');
try {
  // use tempDir.path
} finally {
  await tempDir.delete(recursive: true);
}
```

---

## 6. Path Manipulation

```dart
import 'package:path/path.dart' as p;

// Join paths safely (handles separators on all platforms)
final full = p.join('usr', 'local', 'bin', 'dart');    // usr/local/bin/dart

// Normalize
final clean = p.normalize('home/../usr/local/./bin');  // usr/local/bin

// Components
p.basename('/home/alice/file.txt');       // file.txt
p.basenameWithoutExtension('file.txt');  // file
p.extension('file.txt');                 // .txt
p.dirname('/home/alice/file.txt');        // /home/alice

// Absolute / relative
p.isAbsolute('/home/alice');             // true
p.relative('/home/alice/file.txt', from: '/home/alice'); // file.txt

// Current working directory
final cwd = Directory.current.path;
final relative = p.relative(somePath, from: cwd);
```

---

## 7. Environment Variables & Platform

```dart
import 'dart:io';

// Read environment variable
final home  = Platform.environment['HOME'] ?? '/tmp';
final path  = Platform.environment['PATH'] ?? '';
final token = Platform.environment['API_TOKEN'];

if (token == null) {
  stderr.writeln('Error: API_TOKEN environment variable is not set');
  exit(1);
}

// Platform detection
print(Platform.operatingSystem);       // 'macos', 'linux', 'windows'
print(Platform.isWindows);             // false
print(Platform.isMacOS);               // true
print(Platform.isLinux);               // false
print(Platform.numberOfProcessors);    // e.g., 8
print(Platform.executable);           // path to dart executable
print(Platform.script.toFilePath());  // path to current script
```

---

## 8. Running Subprocesses

```dart
import 'dart:io';

// Run and wait (captures output)
final result = await Process.run(
  'git',
  ['status', '--short'],
  workingDirectory: '/path/to/repo',
);

if (result.exitCode != 0) {
  stderr.writeln('git failed: ${result.stderr}');
  exit(result.exitCode);
}
print(result.stdout);

// Stream process output (interactive / long-running)
final process = await Process.start(
  'dart',
  ['run', 'bin/server.dart'],
  environment: {...Platform.environment, 'PORT': '8080'},
);

process.stdout.transform(utf8.decoder).forEach(stdout.write);
process.stderr.transform(utf8.decoder).forEach(stderr.write);

final exitCode = await process.exitCode;
print('Process exited: $exitCode');

// Shell-style command (use with caution — injection risk if args are user-provided)
// ✅ Always pass args as a list, never build a raw shell string with user input
await Process.run('rm', ['-rf', safeDirectory]);
// ❌ Never: Process.run('sh', ['-c', 'rm -rf ${userInput}']);
```

---

## 9. Compiling Native Executables

```bash
# Compile to a native self-contained executable (no Dart SDK required to run)
dart compile exe bin/my_tool.dart -o build/my_tool

# Compile to kernel snapshot (faster startup, still needs Dart SDK)
dart compile kernel bin/my_tool.dart -o build/my_tool.dill

# Compile to JavaScript (for Node.js or browser — rare for CLI)
dart compile js bin/my_tool.dart -o build/my_tool.js

# Run the compiled exe
./build/my_tool --help
```

---

## 10. Exit Codes

```dart
import 'dart:io';

// Standard POSIX exit codes
const int exitSuccess         = 0;    // Success
const int exitUsageError      = 64;   // EX_USAGE — bad command-line arguments
const int exitDataError       = 65;   // EX_DATAERR — bad input data
const int exitNoInput         = 66;   // EX_NOINPUT — cannot open input
const int exitNoPermission    = 77;   // EX_NOPERM — permission denied
const int exitConfigError     = 78;   // EX_CONFIG — configuration error

void failUsage(String message, ArgParser parser) {
  stderr.writeln('Error: $message\n');
  stderr.writeln(parser.usage);
  exit(exitUsageError);
}

void failWithError(Object e) {
  stderr.writeln('Fatal: $e');
  exit(1);
}

// Graceful shutdown
void main(List<String> args) async {
  ProcessSignal.sigint.watch().listen((_) {
    stdout.writeln('\nInterrupted. Cleaning up...');
    cleanup();
    exit(0);
  });

  try {
    await run(args);
    exit(exitSuccess);
  } catch (e, st) {
    stderr.writeln('Unexpected error: $e');
    stderr.writeln(st);
    exit(1);
  }
}
```

---

## 11. Progress & Output Formatting

```dart
import 'dart:io';

// Overwrite current line (spinner / progress)
void printProgress(String message) {
  stdout.write('\r$message    '); // spaces to clear previous content
}

// Simple spinner
Future<T> withSpinner<T>(String message, Future<T> Function() task) async {
  const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  int frame = 0;
  bool done = false;

  final timer = Timer.periodic(Duration(milliseconds: 80), (_) {
    if (!done) stdout.write('\r${frames[frame++ % frames.length]} $message');
  });

  try {
    return await task();
  } finally {
    done = true;
    timer.cancel();
    stdout.writeln('\r✔ $message');
  }
}

// ANSI colors (check terminal support first)
bool get supportsAnsi => stdout.supportsAnsiEscapes;

String green(String s)  => supportsAnsi ? '\x1B[32m$s\x1B[0m' : s;
String red(String s)    => supportsAnsi ? '\x1B[31m$s\x1B[0m' : s;
String yellow(String s) => supportsAnsi ? '\x1B[33m$s\x1B[0m' : s;
String bold(String s)   => supportsAnsi ? '\x1B[1m$s\x1B[0m'  : s;
```

---

## Anti-Patterns

```dart
// ❌ Using print() for errors
print('Error: something went wrong'); // goes to stdout — breaks piping
// ✅ Use stderr
stderr.writeln('Error: something went wrong');

// ❌ Hard-coding exit code
exit(1); // what does 1 mean?
// ✅ Use named constants or POSIX codes
exit(exitUsageError); // self-documenting

// ❌ Building shell commands by string concatenation — command injection
await Process.run('sh', ['-c', 'rm $userProvidedPath']); // ❌ injection risk
// ✅ Pass args as a list
await Process.run('rm', [userProvidedPath]); // safe — no shell interpolation

// ❌ Reading entire large files into memory
final all = await File('10gb.log').readAsString(); // OOM
// ✅ Stream large files
File('10gb.log').openRead()
    .transform(utf8.decoder)
    .transform(const LineSplitter())
    .listen(processLine);

// ❌ Not handling stderr in subprocess — silently drops errors
final r = await Process.run('git', ['clone', url]);
// ✅ Always check exit code and capture stderr
if (r.exitCode != 0) {
  stderr.writeln('git clone failed:\n${r.stderr}');
  exit(r.exitCode);
}
```
