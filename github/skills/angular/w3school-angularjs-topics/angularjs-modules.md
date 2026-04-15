# AngularJS Modules

> Source: https://www.w3schools.com/angularjs/angularjs_modules.asp

# AngularJS Modules

## Creating a Module

An AngularJS module is a container for different parts of an application, including controllers, directives, filters, and services. Modules are created using the `angular.module` function:

```javascript
var app = angular.module("myApp", []);
```

The first parameter specifies the module name, while the second parameter (an empty array) defines dependent modules.

## Adding a Controller

Controllers belong to modules and are added using the `ng-controller` directive:

```html
<div ng-app="myApp" ng-controller="myCtrl">
  {{ firstName + " " + lastName }}
</div>

<script>
  var app = angular.module("myApp", []);

  app.controller("myCtrl", function ($scope) {
    $scope.firstName = "John";
    $scope.lastName = "Doe";
  });
</script>
```

## Adding a Directive

Custom directives can be added to modules to extend functionality:

```html
<div ng-app="myApp" w3-test-directive></div>

<script>
  var app = angular.module("myApp", []);

  app.directive("w3TestDirective", function () {
    return {
      template: "I was made in a directive constructor!",
    };
  });
</script>
```

## Modules and Controllers in Files

Modules and controllers are typically organized in separate JavaScript files for maintainability:

```javascript
// myApp.js
var app = angular.module("myApp", []);

// myCtrl.js
app.controller("myCtrl", function ($scope) {
  $scope.firstName = "John";
  $scope.lastName = "Doe";
});
```

## Global Namespace Protection

AngularJS modules prevent function pollution by keeping functions local to the module, avoiding conflicts with other scripts.

## Library Loading

The AngularJS library should load in the `<head>` or at the start of the `<body>` element, as calls to `angular.module` can only be compiled after the library has been loaded.
