# AngularJS API

> Source: https://www.w3schools.com/angularjs/angularjs_api.asp

# AngularJS API

## Overview

API stands for **Application Programming Interface**.

## AngularJS Global API

The AngularJS Global API is a set of global JavaScript functions for performing common tasks like:

- Comparing objects
- Iterating objects
- Converting data

The Global API functions are accessed using the angular object.

## Common API Functions

| API                 | Description                               |
| ------------------- | ----------------------------------------- |
| angular.lowercase() | Converts a string to lowercase            |
| angular.uppercase() | Converts a string to uppercase            |
| angular.isString()  | Returns true if the reference is a string |
| angular.isNumber()  | Returns true if the reference is a number |

## angular.lowercase()

```javascript
var app = angular.module("myApp", []);
app.controller("myCtrl", function ($scope) {
  $scope.x1 = "JOHN";
  $scope.x2 = angular.lowercase($scope.x1);
});
```

## angular.uppercase()

```javascript
var app = angular.module("myApp", []);
app.controller("myCtrl", function ($scope) {
  $scope.x1 = "John";
  $scope.x2 = angular.uppercase($scope.x1);
});
```

## angular.isString()

```javascript
var app = angular.module("myApp", []);
app.controller("myCtrl", function ($scope) {
  $scope.x1 = "JOHN";
  $scope.x2 = angular.isString($scope.x1);
});
```

## angular.isNumber()

```javascript
var app = angular.module("myApp", []);
app.controller("myCtrl", function ($scope) {
  $scope.x1 = "JOHN";
  $scope.x2 = angular.isNumber($scope.x1);
});
```
