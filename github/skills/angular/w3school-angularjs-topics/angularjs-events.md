# AngularJS Events

> Source: https://www.w3schools.com/angularjs/angularjs_events.asp

# AngularJS Events

AngularJS has its own HTML events directives.

## AngularJS Events

You can add AngularJS event listeners to your HTML elements by using one or more of these directives:

- `ng-blur`
- `ng-change`
- `ng-click`
- `ng-copy`
- `ng-cut`
- `ng-dblclick`
- `ng-focus`
- `ng-keydown`
- `ng-keypress`
- `ng-keyup`
- `ng-mousedown`
- `ng-mouseenter`
- `ng-mouseleave`
- `ng-mousemove`
- `ng-mouseover`
- `ng-mouseup`
- `ng-paste`

The event directives allows us to run AngularJS functions at certain user events.

An AngularJS event will not overwrite an HTML event, both events will be executed.

## Mouse Events

Mouse events occur when the cursor moves over an element, in this order:

1. ng-mouseover
2. ng-mouseenter
3. ng-mousemove
4. ng-mouseleave

Or when a mouse button is clicked on an element, in this order:

1. ng-mousedown
2. ng-mouseup
3. ng-click

You can add mouse events on any HTML element.

### Example

Increase the count variable when the mouse moves over the H1 element:

```html
<div ng-app="myApp" ng-controller="myCtrl">
  <h1 ng-mousemove="count = count + 1">Mouse over me!</h1>
  <h2>{{ count }}</h2>
</div>

<script>
  var app = angular.module("myApp", []);
  app.controller("myCtrl", function ($scope) {
    $scope.count = 0;
  });
</script>
```

## The ng-click Directive

The `ng-click` directive defines AngularJS code that will be executed when the element is being clicked.

### Example

```html
<div ng-app="myApp" ng-controller="myCtrl">
  <button ng-click="count = count + 1">Click me!</button>
  <p>{{ count }}</p>
</div>

<script>
  var app = angular.module("myApp", []);
  app.controller("myCtrl", function ($scope) {
    $scope.count = 0;
  });
</script>
```

You can also refer to a function:

```html
<div ng-app="myApp" ng-controller="myCtrl">
  <button ng-click="myFunction()">Click me!</button>
  <p>{{ count }}</p>
</div>

<script>
  var app = angular.module("myApp", []);
  app.controller("myCtrl", function ($scope) {
    $scope.count = 0;
    $scope.myFunction = function () {
      $scope.count++;
    };
  });
</script>
```

## Toggle, True/False

If you want to show a section of HTML code when a button is clicked, and hide when the button is clicked again, like a dropdown menu, make the button behave like a toggle switch:

```html
<div ng-app="myApp" ng-controller="myCtrl">
  <button ng-click="myFunc()">Click Me!</button>

  <div ng-show="showMe">
    <h1>Menu:</h1>
    <div>Pizza</div>
    <div>Pasta</div>
    <div>Pesce</div>
  </div>
</div>

<script>
  var app = angular.module("myApp", []);
  app.controller("myCtrl", function ($scope) {
    $scope.showMe = false;
    $scope.myFunc = function () {
      $scope.showMe = !$scope.showMe;
    };
  });
</script>
```

The `showMe` variable starts out as the Boolean value `false`.

The `myFunc` function sets the `showMe` variable to the opposite of what it is, by using the `!` (not) operator.

## $event Object

You can pass the `$event` object as an argument when calling the function.

The `$event` object contains the browser's event object:

```html
<div ng-app="myApp" ng-controller="myCtrl">
  <h1 ng-mousemove="myFunc($event)">Mouse Over Me!</h1>
  <p>Coordinates: {{x + ', ' + y}}</p>
</div>

<script>
  var app = angular.module("myApp", []);
  app.controller("myCtrl", function ($scope) {
    $scope.myFunc = function (myE) {
      $scope.x = myE.clientX;
      $scope.y = myE.clientY;
    };
  });
</script>
```
