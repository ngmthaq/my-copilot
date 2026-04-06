---
name: flutter-forms-validation
description: "Flutter forms & validation — Form widget with GlobalKey, TextFormField validators, FormFieldState, TextEditingController, FocusNode, keyboard management, submission handling, and reactive_forms patterns. Use when: building any input form; validating user input; handling keyboard focus; managing text controllers. DO NOT USE FOR: state management libraries (use flutter-state-management); API submission (use flutter-api-integration)."
---

# Flutter Forms & Validation

## 1. Form with GlobalKey (Standard Pattern)

```dart
class LoginForm extends StatefulWidget {
  const LoginForm({super.key});
  @override
  State<LoginForm> createState() => _LoginFormState();
}

class _LoginFormState extends State<LoginForm> {
  final _formKey = GlobalKey<FormState>();

  // Controllers hold the current text value
  final _emailCtrl    = TextEditingController();
  final _passwordCtrl = TextEditingController();

  // Focus nodes for keyboard traversal
  final _emailFocus    = FocusNode();
  final _passwordFocus = FocusNode();

  bool _isLoading = false;
  bool _obscurePassword = true;

  @override
  void dispose() {
    // ✅ Always dispose controllers and focus nodes
    _emailCtrl.dispose();
    _passwordCtrl.dispose();
    _emailFocus.dispose();
    _passwordFocus.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    // Validate all fields — returns false if any validator fails
    if (!(_formKey.currentState?.validate() ?? false)) return;

    // Save all fields (triggers onSaved callbacks)
    _formKey.currentState?.save();

    setState(() => _isLoading = true);
    try {
      await context.read<AuthService>().login(
        _emailCtrl.text.trim(),
        _passwordCtrl.text,
      );
      if (mounted) context.go('/home');
    } on AuthException catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.message)),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Form(
      key: _formKey,
      autovalidateMode: AutovalidateMode.onUserInteraction, // validate as user types
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          TextFormField(
            controller:    _emailCtrl,
            focusNode:     _emailFocus,
            keyboardType:  TextInputType.emailAddress,
            textInputAction: TextInputAction.next,
            autofillHints: const [AutofillHints.email],
            decoration: const InputDecoration(
              labelText: 'Email',
              prefixIcon: Icon(Icons.email_outlined),
            ),
            validator: _validateEmail,
            onFieldSubmitted: (_) => _passwordFocus.requestFocus(),
          ),
          const SizedBox(height: 16),
          TextFormField(
            controller:     _passwordCtrl,
            focusNode:      _passwordFocus,
            obscureText:    _obscurePassword,
            textInputAction: TextInputAction.done,
            autofillHints:  const [AutofillHints.password],
            decoration: InputDecoration(
              labelText: 'Password',
              prefixIcon: const Icon(Icons.lock_outlined),
              suffixIcon: IconButton(
                icon: Icon(_obscurePassword ? Icons.visibility : Icons.visibility_off),
                onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
              ),
            ),
            validator: _validatePassword,
            onFieldSubmitted: (_) => _submit(),
          ),
          const SizedBox(height: 24),
          FilledButton(
            onPressed: _isLoading ? null : _submit,
            child: _isLoading
                ? const SizedBox.square(
                    dimension: 20,
                    child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                  )
                : const Text('Sign In'),
          ),
        ],
      ),
    );
  }

  String? _validateEmail(String? value) {
    if (value == null || value.trim().isEmpty) return 'Email is required';
    final emailRegex = RegExp(r'^[\w.+-]+@[\w-]+\.[a-zA-Z]{2,}$');
    if (!emailRegex.hasMatch(value.trim())) return 'Enter a valid email address';
    return null; // null means valid
  }

  String? _validatePassword(String? value) {
    if (value == null || value.isEmpty) return 'Password is required';
    if (value.length < 8) return 'Password must be at least 8 characters';
    return null;
  }
}
```

---

## 2. TextEditingController

```dart
final controller = TextEditingController();

// Set initial value
final controller = TextEditingController(text: user.name);

// Read current value
final text = controller.text;
final trimmed = controller.text.trim();

// Set programmatically (preserves cursor position)
controller.text = 'New value';

// Set with cursor at end
controller.value = TextEditingValue(
  text: 'New value',
  selection: TextSelection.collapsed(offset: 'New value'.length),
);

// Clear
controller.clear();

// Listen to changes
controller.addListener(() {
  print('Changed: ${controller.text}');
});

// ✅ Dispose in State.dispose()
@override
void dispose() {
  controller.dispose();
  super.dispose();
}
```

---

## 3. FocusNode & Keyboard Management

```dart
final nameFocus  = FocusNode();
final emailFocus = FocusNode();

// Request focus programmatically
nameFocus.requestFocus();

// Move to next field
FocusScope.of(context).nextFocus();

// Unfocus / dismiss keyboard
FocusScope.of(context).unfocus();

// Dismiss keyboard on tap outside any field
GestureDetector(
  onTap: () => FocusScope.of(context).unfocus(),
  behavior: HitTestBehavior.translucent,
  child: const Form(...),
);

// textInputAction determines the action button on the keyboard
TextFormField(
  textInputAction: TextInputAction.next,   // "Next" key
  onFieldSubmitted: (_) => emailFocus.requestFocus(),
);

TextFormField(
  textInputAction: TextInputAction.done,   // "Done" key
  onFieldSubmitted: (_) => _submit(),
);

// Listen to focus changes
emailFocus.addListener(() {
  if (!emailFocus.hasFocus) _validateEmail(); // validate on blur
});
```

---

## 4. Common Validators

```dart
// Reusable validators — return null for valid, String for error message

String? requiredValidator(String? value, [String field = 'This field']) {
  if (value == null || value.trim().isEmpty) return '$field is required';
  return null;
}

String? emailValidator(String? value) {
  if (value == null || value.trim().isEmpty) return 'Email is required';
  final re = RegExp(r'^[\w.+-]+@[\w-]+\.[a-zA-Z]{2,}$');
  if (!re.hasMatch(value.trim())) return 'Enter a valid email';
  return null;
}

String? minLengthValidator(String? value, int min) {
  if (value == null || value.length < min) {
    return 'Must be at least $min characters';
  }
  return null;
}

String? phoneValidator(String? value) {
  if (value == null || value.trim().isEmpty) return 'Phone is required';
  final digits = value.replaceAll(RegExp(r'[\s\-\(\)]'), '');
  if (digits.length < 9 || !RegExp(r'^\+?\d+$').hasMatch(digits)) {
    return 'Enter a valid phone number';
  }
  return null;
}

// Compose validators
String? Function(String?) composeValidators(
    List<String? Function(String?)> validators) {
  return (value) {
    for (final v in validators) {
      final error = v(value);
      if (error != null) return error;
    }
    return null;
  };
}

// Usage
TextFormField(
  validator: composeValidators([
    (v) => requiredValidator(v, 'Email'),
    emailValidator,
  ]),
);
```

---

## 5. Multi-field Form — Registration Example

```dart
class _RegistrationFormState extends State<RegistrationForm> {
  final _formKey      = GlobalKey<FormState>();
  final _nameCtrl     = TextEditingController();
  final _emailCtrl    = TextEditingController();
  final _passwordCtrl = TextEditingController();
  final _confirmCtrl  = TextEditingController();
  DateTime? _birthDate;
  String _gender = 'prefer_not_to_say';

  @override
  void dispose() {
    _nameCtrl.dispose();
    _emailCtrl.dispose();
    _passwordCtrl.dispose();
    _confirmCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Form(
      key: _formKey,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Text field
          TextFormField(
            controller: _nameCtrl,
            decoration: const InputDecoration(labelText: 'Full Name'),
            validator: (v) => requiredValidator(v, 'Name'),
          ),
          const SizedBox(height: 12),

          TextFormField(
            controller: _emailCtrl,
            keyboardType: TextInputType.emailAddress,
            decoration: const InputDecoration(labelText: 'Email'),
            validator: emailValidator,
          ),
          const SizedBox(height: 12),

          TextFormField(
            controller: _passwordCtrl,
            obscureText: true,
            decoration: const InputDecoration(labelText: 'Password'),
            validator: (v) => minLengthValidator(v, 8),
          ),
          const SizedBox(height: 12),

          // Confirm password — cross-field validation
          TextFormField(
            controller: _confirmCtrl,
            obscureText: true,
            decoration: const InputDecoration(labelText: 'Confirm Password'),
            validator: (v) {
              if (v != _passwordCtrl.text) return 'Passwords do not match';
              return null;
            },
          ),
          const SizedBox(height: 12),

          // Dropdown
          DropdownButtonFormField<String>(
            value: _gender,
            decoration: const InputDecoration(labelText: 'Gender'),
            items: const [
              DropdownMenuItem(value: 'male',   child: Text('Male')),
              DropdownMenuItem(value: 'female', child: Text('Female')),
              DropdownMenuItem(value: 'prefer_not_to_say', child: Text('Prefer not to say')),
            ],
            onChanged: (v) => setState(() => _gender = v!),
          ),
          const SizedBox(height: 12),

          // Date picker via FormField
          FormField<DateTime>(
            validator: (v) => v == null ? 'Birth date is required' : null,
            builder: (state) => Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                OutlinedButton.icon(
                  icon: const Icon(Icons.calendar_today),
                  label: Text(_birthDate == null
                      ? 'Select birth date'
                      : DateFormat.yMd().format(_birthDate!)),
                  onPressed: () async {
                    final picked = await showDatePicker(
                      context: context,
                      initialDate: DateTime(2000),
                      firstDate: DateTime(1900),
                      lastDate: DateTime.now(),
                    );
                    if (picked != null) {
                      setState(() => _birthDate = picked);
                      state.didChange(picked);
                    }
                  },
                ),
                if (state.hasError)
                  Text(state.errorText!, style: TextStyle(color: Theme.of(context).colorScheme.error, fontSize: 12)),
              ],
            ),
          ),
          const SizedBox(height: 24),

          FilledButton(
            onPressed: _submit,
            child: const Text('Register'),
          ),
        ],
      ),
    );
  }

  void _submit() {
    if (_formKey.currentState?.validate() ?? false) {
      _formKey.currentState?.save();
      // proceed with registration
    }
  }
}
```

---

## 6. AutovalidateMode

| Mode                 | Behaviour                                                      |
| -------------------- | -------------------------------------------------------------- |
| `disabled` (default) | Never auto-validates — only on explicit `validate()` call      |
| `onUserInteraction`  | Validates a field once the user interacts with it              |
| `always`             | Validates on every rebuild — aggressive, may show errors early |

```dart
Form(
  autovalidateMode: AutovalidateMode.onUserInteraction,
  child: ...,
);

// Per-field override
TextFormField(
  autovalidateMode: AutovalidateMode.always,
  validator: ...,
);
```

---

## 7. Resetting a Form

```dart
// Reset all fields to their initial values and clear errors
_formKey.currentState?.reset();

// Also clear controllers manually if needed
_emailCtrl.clear();
_passwordCtrl.clear();
```

---

## 8. Keyboard Type Reference

| `TextInputType`                    | Use for                             |
| ---------------------------------- | ----------------------------------- |
| `text`                             | General text (default)              |
| `multiline`                        | Multi-line notes, bio               |
| `emailAddress`                     | Email fields                        |
| `number`                           | Integers                            |
| `numberWithOptions(decimal: true)` | Decimal numbers                     |
| `phone`                            | Phone numbers                       |
| `url`                              | URLs                                |
| `visiblePassword`                  | Password with no suggestions        |
| `name`                             | Full name with capitalisation hints |
| `streetAddress`                    | Address fields                      |

---

## Anti-Patterns

```dart
// ❌ Not disposing TextEditingController — memory leak
class _MyState extends State<MyWidget> {
  final ctrl = TextEditingController();
  // dispose() never called
}
// ✅
@override
void dispose() {
  ctrl.dispose();
  super.dispose();
}

// ❌ Reading controller.text inside validator called before text is set
TextFormField(
  validator: (_) {
    // value param is reliable; don't read another controller here
    // unless it is initialised before this field renders
  },
);

// ❌ Calling validate() before the user touches the form
// Shows all errors immediately on page load
_formKey.currentState?.validate(); // called in initState
// ✅ Only call validate() on submit or explicit user action

// ❌ Using setState for every keystroke inside a large form
// causes the entire form to rebuild on every character typed
onChanged: (v) => setState(() => _query = v)
// ✅ Use a dedicated TextEditingController; read on submit
// Or use ValueNotifier if you need reactive downstream changes

// ❌ Cross-field validation in individual field validators
// when the referenced field hasn't been entered yet
validator: (v) => v == anotherCtrl.text ? null : 'Must match'
// ✅ Ensure form build order puts dependent fields AFTER their references
// and perform cross-field validation only at submit (_formKey.currentState?.validate())
```
