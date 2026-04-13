---
name: flutter-animations
description: "Flutter animations — implicit animations (AnimatedContainer, AnimatedOpacity, TweenAnimationBuilder), explicit animations (AnimationController, Tween, CurvedAnimation, AnimatedBuilder), Hero transitions, page transitions, Lottie, and staggered animations. Use when: adding motion to UI; transitioning between screens; building loading or micro-interaction animations. DO NOT USE FOR: layout sizing (use flutter-layout-system); state management (use flutter-state-management)."
---

# Flutter Animations

## 1. Implicit Animations (Easiest)

Implicit widgets animate automatically whenever a property changes — no controller needed.

```dart
class AnimatedCard extends StatefulWidget {
  const AnimatedCard({super.key});
  @override
  State<AnimatedCard> createState() => _AnimatedCardState();
}

class _AnimatedCardState extends State<AnimatedCard> {
  bool _expanded = false;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => setState(() => _expanded = !_expanded),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
        width:   _expanded ? 300 : 150,
        height:  _expanded ? 150 : 80,
        decoration: BoxDecoration(
          color:        _expanded ? Colors.blue : Colors.grey,
          borderRadius: BorderRadius.circular(_expanded ? 24 : 8),
          boxShadow: [
            BoxShadow(
              color:      Colors.black26,
              blurRadius: _expanded ? 16 : 4,
              offset:     const Offset(0, 4),
            ),
          ],
        ),
        child: Center(
          child: AnimatedDefaultTextStyle(
            duration: const Duration(milliseconds: 300),
            style: Theme.of(context).textTheme.headlineSmall!.copyWith(
              color: _expanded ? Colors.white : Colors.black87,
            ),
            child: const Text('Tap me'),
          ),
        ),
      ),
    );
  }
}
```

### Common Implicit Animation Widgets

| Widget                     | Animates                                    |
| -------------------------- | ------------------------------------------- |
| `AnimatedContainer`        | size, color, border, padding, decoration    |
| `AnimatedOpacity`          | opacity (0.0 – 1.0)                         |
| `AnimatedAlign`            | alignment within parent                     |
| `AnimatedPadding`          | padding EdgeInsets                          |
| `AnimatedPositioned`       | position inside a Stack                     |
| `AnimatedDefaultTextStyle` | TextStyle (font size, color, weight)        |
| `AnimatedScale`            | scale factor                                |
| `AnimatedRotation`         | rotation in turns                           |
| `AnimatedSlide`            | fractional offset translation               |
| `AnimatedSwitcher`         | cross-fades between different child widgets |

```dart
// AnimatedSwitcher — swap widgets with animation
AnimatedSwitcher(
  duration: const Duration(milliseconds: 400),
  transitionBuilder: (child, animation) => FadeTransition(
    opacity: animation,
    child: ScaleTransition(scale: animation, child: child),
  ),
  child: _isLoading
      ? const CircularProgressIndicator(key: ValueKey('loading'))
      : Text('Done!', key: const ValueKey('done')),
),
```

---

## 2. TweenAnimationBuilder

Animates any value type over a duration when the target value changes.

```dart
TweenAnimationBuilder<double>(
  tween: Tween(begin: 0, end: _progress),  // 0.0 – 1.0
  duration: const Duration(milliseconds: 600),
  curve: Curves.easeOut,
  builder: (context, value, child) {
    return LinearProgressIndicator(value: value);
  },
),

// Animate a Color
TweenAnimationBuilder<Color?>(
  tween: ColorTween(
    begin: Colors.grey,
    end:   _active ? Colors.green : Colors.red,
  ),
  duration: const Duration(milliseconds: 300),
  builder: (context, color, _) {
    return Icon(Icons.circle, color: color);
  },
),
```

---

## 3. Explicit Animations (Full Control)

Use when you need loops, finer timing control, or coordination between multiple animations.

```dart
class SpinningIcon extends StatefulWidget {
  const SpinningIcon({super.key});
  @override
  State<SpinningIcon> createState() => _SpinningIconState();
}

class _SpinningIconState extends State<SpinningIcon>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  late final Animation<double>   _rotation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync:    this,         // TickerProvider from mixin
      duration: const Duration(seconds: 2),
    )..repeat();              // loop infinitely

    // Apply a curve to the raw 0.0–1.0 value
    _rotation = CurvedAnimation(
      parent: _controller,
      curve:  Curves.linear,
    );
  }

  @override
  void dispose() {
    _controller.dispose();  // ✅ always dispose
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return RotationTransition(
      turns: _rotation,
      child: const Icon(Icons.refresh, size: 48),
    );
  }
}
```

### AnimationController API

```dart
_controller.forward();                // play forward (0 → 1)
_controller.reverse();                // play backward (1 → 0)
_controller.repeat(reverse: true);    // ping-pong loop
_controller.stop();
_controller.reset();                  // jump to 0
_controller.animateTo(0.5, duration: const Duration(milliseconds: 200));

// Listen to status
_controller.addStatusListener((status) {
  if (status == AnimationStatus.completed) _controller.reverse();
});
```

### Tween Types

```dart
final anim = Tween<double>(begin: 0, end: 100).animate(_controller);
final color = ColorTween(begin: Colors.red, end: Colors.blue).animate(_controller);
final size  = SizeTween(begin: Size.zero, end: const Size(200, 100)).animate(_controller);
final rect  = RectTween(begin: Rect.zero, end: const Rect.fromLTWH(0, 0, 200, 100)).animate(_controller);

// Sequence: chain tweens at different intervals
final opacity = TweenSequence([
  TweenSequenceItem(tween: Tween(begin: 0.0, end: 1.0), weight: 30),
  TweenSequenceItem(tween: ConstantTween(1.0),           weight: 40),
  TweenSequenceItem(tween: Tween(begin: 1.0, end: 0.0), weight: 30),
]).animate(_controller);
```

---

## 4. AnimatedBuilder & AnimatedWidget

```dart
// AnimatedBuilder — rebuilds subtree on each tick
AnimatedBuilder(
  animation: _controller,
  builder: (context, child) {
    return Transform.scale(
      scale: 1 + _controller.value * 0.5,
      child: child, // child is NOT rebuilt on each tick — passed as-is
    );
  },
  child: const Icon(Icons.star, size: 48), // built once
),

// AnimatedWidget — cleaner for reusable animated widgets
class PulsingWidget extends AnimatedWidget {
  const PulsingWidget({super.key, required Animation<double> animation})
      : super(listenable: animation);

  @override
  Widget build(BuildContext context) {
    final animation = listenable as Animation<double>;
    return Transform.scale(
      scale: animation.value,
      child: const FlutterLogo(size: 100),
    );
  }
}

// Usage
PulsingWidget(animation: Tween(begin: 0.8, end: 1.2).animate(_controller));
```

---

## 5. Staggered Animations

```dart
class _StaggeredListState extends State<StaggeredList>
    with SingleTickerProviderStateMixin {
  late final AnimationController _ctrl;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(vsync: this, duration: const Duration(milliseconds: 1200))
      ..forward();
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  Animation<double> _interval(double begin, double end) =>
      CurvedAnimation(
        parent: _ctrl,
        curve:  Interval(begin, end, curve: Curves.easeOut),
      );

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        for (int i = 0; i < 5; i++)
          FadeTransition(
            opacity: _interval(i * 0.15, i * 0.15 + 0.4),
            child: SlideTransition(
              position: Tween<Offset>(
                begin: const Offset(0, 0.5),
                end:   Offset.zero,
              ).animate(_interval(i * 0.15, i * 0.15 + 0.4)),
              child: ListTile(title: Text('Item ${i + 1}')),
            ),
          ),
      ],
    );
  }
}
```

---

## 6. Hero Transitions

Hero animates a shared widget between two routes.

```dart
// Source screen
Hero(
  tag: 'product-image-${product.id}', // must be unique and match destination
  child: Image.network(product.imageUrl, width: 80, height: 80, fit: BoxFit.cover),
)

// Destination screen
Hero(
  tag: 'product-image-${product.id}', // same tag
  child: Image.network(product.imageUrl, width: double.infinity, fit: BoxFit.cover),
)

// Custom Hero flight animation
Hero(
  tag: 'avatar',
  flightShuttleBuilder: (_, animation, __, fromCtx, toCtx) {
    return FadeTransition(
      opacity: animation,
      child: fromCtx.widget,
    );
  },
  child: const CircleAvatar(radius: 24),
),
```

---

## 7. Page Transitions

```dart
// Custom transition with GoRouter
GoRoute(
  path: '/detail/:id',
  pageBuilder: (context, state) => CustomTransitionPage(
    key: state.pageKey,
    child: DetailPage(id: state.pathParameters['id']!),
    transitionsBuilder: (context, animation, secondaryAnimation, child) {
      return SlideTransition(
        position: Tween<Offset>(
          begin: const Offset(1, 0),
          end:   Offset.zero,
        ).animate(CurvedAnimation(parent: animation, curve: Curves.easeInOut)),
        child: child,
      );
    },
  ),
),

// Fade transition
FadeTransition(opacity: animation, child: child)

// Scale + fade
ScaleTransition(
  scale: Tween(begin: 0.9, end: 1.0).animate(
    CurvedAnimation(parent: animation, curve: Curves.easeOut),
  ),
  child: FadeTransition(opacity: animation, child: child),
)
```

---

## 8. Lottie Animations

```yaml
dependencies:
  lottie: ^3.1.2
```

```dart
import 'package:lottie/lottie.dart';

// Play once then stop
Lottie.asset(
  'assets/animations/success.json',
  width:  200,
  height: 200,
  repeat: false,
  onLoaded: (composition) {
    // composition.duration available
  },
)

// Control with AnimationController
class _LottieState extends State<LottieWidget>
    with SingleTickerProviderStateMixin {
  late final AnimationController _ctrl;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(vsync: this);
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Lottie.asset(
      'assets/animations/loader.json',
      controller: _ctrl,
      onLoaded: (comp) {
        _ctrl.duration = comp.duration;
        _ctrl.repeat();
      },
    );
  }
}
```

---

## 9. Key Curves Reference

| Curve                  | Effect                                |
| ---------------------- | ------------------------------------- |
| `Curves.linear`        | constant speed                        |
| `Curves.easeIn`        | starts slow, ends fast                |
| `Curves.easeOut`       | starts fast, ends slow (most natural) |
| `Curves.easeInOut`     | slow–fast–slow                        |
| `Curves.bounceOut`     | bounces at the end                    |
| `Curves.elasticOut`    | overshoots then settles               |
| `Curves.decelerate`    | decelerates into rest                 |
| `Curves.fastOutSlowIn` | Material motion standard              |

---

## Anti-Patterns

```dart
// ❌ Forgetting to dispose AnimationController — memory leak and ticker leaks
class _MyState extends State<MyWidget> with SingleTickerProviderStateMixin {
  late final AnimationController _ctrl = AnimationController(vsync: this, duration: ...);
  // dispose() never calls _ctrl.dispose()
}
// ✅ Always override dispose() and call _ctrl.dispose() before super.dispose()

// ❌ Animating too many properties inside a setState rebuild
// Flutter rebuilds the whole subtree on every animation frame
onTap: () => setState(() => _animating = true),
// build uses _animating to change 10 different properties
// ✅ Use AnimatedBuilder with a controller — only the builder subtree rebuilds

// ❌ Using the wrong mixin for multiple controllers
class _MyState extends State<MyWidget> with SingleTickerProviderStateMixin {
  late final AnimationController _ctrl1 = AnimationController(vsync: this, ...);
  late final AnimationController _ctrl2 = AnimationController(vsync: this, ...); // ❌
}
// ✅ Use TickerProviderStateMixin (plural) when you have multiple controllers

// ❌ Hero tag conflicts — using the same tag on multiple visible Heroes
Hero(tag: 'image', ...) // in a list — every row has the same tag
// ✅ Include a unique ID in the tag: 'product-image-${product.id}'

// ❌ Running long animations on the UI thread via setState every frame
Timer.periodic(const Duration(milliseconds: 16), (_) => setState(() => angle += 0.01));
// ✅ Use AnimationController with vsync — runs on the raster thread efficiently
```
