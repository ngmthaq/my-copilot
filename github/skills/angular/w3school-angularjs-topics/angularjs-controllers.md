# AngularJS Controllers

> Source: https://www.w3schools.com/angularjs/angularjs_controllers.asp

# AngularJS Controllers

## AngularJS Controllers

AngularJS controllers manage the data within AngularJS applications. Controllers are standard JavaScript Objects, created using a conventional JavaScript object constructor.

AngularJS applications are controlled by controllers. The **ng-controller** directive defines the application controller, which is a JavaScript Object created by a standard JavaScript object constructor.

### Example

```javascript
var app = angular.module("myApp", []);
app.controller("myCtrl", function ($scope) {
  $scope.firstName = "John";
  $scope.lastName = "Doe";
});
```

```html
<div ng-app="myApp" ng-controller="myCtrl">
  First Name: <input type="text" ng-model="firstName" /><br />
  Last Name: <input type="text" ng-model="lastName" /><br />
  <br />
  Full Name: {{firstName + " " + lastName}}
</div>
```

**Application explained:**

The AngularJS application is defined by `ng-app="myApp"`. The application runs inside the `<div>`. The `ng-controller="myCtrl"` attribute is an AngularJS directive that defines a controller. The `myCtrl` function is a JavaScript function. AngularJS invokes the controller with a `$scope` object. In AngularJS, `$scope` represents the application object (the owner of application variables and functions). The controller creates two properties in the scope (`firstName` and `lastName`). The `ng-model` directives bind the input fields to the controller properties.

## Controller Methods

A controller can have methods (variables as functions):

```javascript
var app = angular.module("myApp", []);
app.controller("personCtrl", function ($scope) {
  $scope.firstName = "John";
  $scope.lastName = "Doe";
  $scope.fullName = function () {
    return $scope.firstName + " " + $scope.lastName;
  };
});
```

```html
<div ng-app="myApp" ng-controller="personCtrl">
  First Name: <input type="text" ng-model="firstName" /><br />
  Last Name: <input type="text" ng-model="lastName" /><br />
  <br />
  Full Name: {{fullName()}}
</div>
```

## Controllers In External Files

In larger applications, it is common to store controllers in external files.

```html
<div ng-app="myApp" ng-controller="personCtrl">
  First Name: <input type="text" ng-model="firstName" /><br />
  Last Name: <input type="text" ng-model="lastName" /><br />
  <br />
  Full Name: {{fullName()}}
</div>

<script src="personController.js"></script>
```

## Another Example

Create a controller file with array data:

```javascript
angular.module("myApp", []).controller("namesCtrl", function ($scope) {
  $scope.names = [
    { name: "Jani", country: "Norway" },
    { name: "Hege", country: "Sweden" },
    { name: "Kai", country: "Denmark" },
  ];
});
```

```html
<div ng-app="myApp" ng-controller="namesCtrl">
  <ul>
    <li ng-repeat="x in names">{{ x.name + ', ' + x.country }}</li>
  </ul>
</div>

<script src="namesController.js"></script>
```
