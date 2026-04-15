# AngularJS Animations

> Source: https://www.w3schools.com/angularjs/angularjs_animations.asp

# AngularJS Animations

## What is an Animation?

An animation is when the transformation of an HTML element gives you an illusion of motion.

Example:

```html
<body ng-app="ngAnimate">
  Hide the DIV: <input type="checkbox" ng-model="myCheck" />
  <div ng-hide="myCheck"></div>
</body>
```

Applications should not be filled with animations, but some animations can make the application easier to understand.

## What do I Need?

To make your applications ready for animations, you must include the AngularJS Animate library:

```html
<script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.6.9/angular-animate.js"></script>
```

Then you must refer to the `ngAnimate` module in your application:

```html
<body ng-app="ngAnimate"></body>
```

Or if your application has a name, add `ngAnimate` as a dependency in your application module:

```html
<body ng-app="myApp">
  <h1>Hide the DIV: <input type="checkbox" ng-model="myCheck" /></h1>
  <div ng-hide="myCheck"></div>

  <script>
    var app = angular.module("myApp", ["ngAnimate"]);
  </script>
</body>
```

## What Does ngAnimate Do?

The ngAnimate module adds and removes classes.

The ngAnimate module does not animate your HTML elements, but when ngAnimate notice certain events, like hide or show of an HTML element, the element gets some pre-defined classes which can be used to make animations.

The directives in AngularJS who add/remove classes are:

- `ng-show`
- `ng-hide`
- `ng-class`
- `ng-view`
- `ng-include`
- `ng-repeat`
- `ng-if`
- `ng-switch`

The `ng-show` and `ng-hide` directives adds or removes a `ng-hide` class value.

The other directives adds a `ng-enter` class value when they enter the DOM, and a `ng-leave` attribute when they are removed from the DOM.

The `ng-repeat` directive also adds a `ng-move` class value when the HTML element changes position.

In addition, during the animation, the HTML element will have a set of class values, which will be removed when the animation has finished.

Example: the `ng-hide` directive will add these class values:

- `ng-animate`
- `ng-hide-animate`
- `ng-hide-add` (if the element will be hidden)
- `ng-hide-remove` (if the element will be showed)
- `ng-hide-add-active` (if the element will be hidden)
- `ng-hide-remove-active` (if the element will be showed)

## Animations Using CSS

We can use CSS transitions or CSS animations to animate HTML elements.

## CSS Transitions

CSS transitions allows you to change CSS property values smoothly, from one value to another, over a given duration.

Example:

When the DIV element gets the `.ng-hide` class, the transition will take 0.5 seconds, and the height will smoothly change from 100px to 0:

```css
div {
  transition: all linear 0.5s;
  background-color: lightblue;
  height: 100px;
}

.ng-hide {
  height: 0;
}
```

## CSS Animations

CSS Animations allows you to change CSS property values smoothly, from one value to another, over a given duration.

Example:

When the DIV element gets the `.ng-hide` class, the `myChange` animation will run, which will smoothly change the height from 100px to 0:

```css
@keyframes myChange {
  from {
    height: 100px;
  }
  to {
    height: 0;
  }
}

div {
  height: 100px;
  background-color: lightblue;
}

div.ng-hide {
  animation: 0.5s myChange;
}
```
