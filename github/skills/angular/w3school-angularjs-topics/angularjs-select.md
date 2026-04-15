# AngularJS Select

> Source: https://www.w3schools.com/angularjs/angularjs_select.asp

# AngularJS Select Boxes

## Creating a Select Box Using ng-options

AngularJS enables you to build dropdown lists derived from items in an array or an object using the `ng-options` directive.

### Example

```html
<div ng-app="myApp" ng-controller="myCtrl">
  <select ng-model="selectedName" ng-options="x for x in names"></select>
</div>

<script>
  var app = angular.module("myApp", []);
  app.controller("myCtrl", function ($scope) {
    $scope.names = ["Emil", "Tobias", "Linus"];
  });
</script>
```

## ng-options vs ng-repeat

The `ng-repeat` directive can create the same dropdown:

```html
<select>
  <option ng-repeat="x in names">{{x}}</option>
</select>
```

The `ng-repeat` directive repeats HTML blocks for each array item, enabling dropdown option creation. However, `ng-options` was specifically designed for populating dropdown lists.

## What Do I Use?

Both directives work effectively. Consider this array of objects:

```javascript
$scope.cars = [
  { model: "Ford Mustang", color: "red" },
  { model: "Fiat 500", color: "white" },
  { model: "Volvo XC90", color: "black" },
];
```

### Using ng-repeat:

```html
<select ng-model="selectedCar">
  <option ng-repeat="x in cars" value="{{x.model}}">{{x.model}}</option>
</select>

<h1>You selected: {{selectedCar}}</h1>
```

### Using ng-repeat as an object:

```html
<select ng-model="selectedCar">
  <option ng-repeat="x in cars" ng-value="{{x}}">{{x.model}}</option>
</select>

<h1>You selected a {{selectedCar.color}} {{selectedCar.model}}</h1>
```

### Using ng-options:

```html
<select ng-model="selectedCar" ng-options="x.model for x in cars"></select>

<h1>You selected: {{selectedCar.model}}</h1>
<p>Its color is: {{selectedCar.color}}</p>
```

When the selected value is an object, it can retain additional information, providing greater application flexibility.

## The Data Source as an Object

Objects with key-value pairs serve as alternative data sources:

```javascript
$scope.cars = {
  car01: "Ford",
  car02: "Fiat",
  car03: "Volvo",
};
```

The `ng-options` syntax differs for objects:

```html
<select ng-model="selectedCar" ng-options="x for (x, y) in cars"></select>

<h1>You selected: {{selectedCar}}</h1>
```

The selected value consistently represents the **value** in a key-value pair.

### Object values:

```javascript
$scope.cars = {
  car01: { brand: "Ford", model: "Mustang", color: "red" },
  car02: { brand: "Fiat", model: "500", color: "white" },
  car03: { brand: "Volvo", model: "XC90", color: "black" },
};
```

### Displaying specific properties:

```html
<select ng-model="selectedCar" ng-options="y.brand for (x, y) in cars"></select>
```
