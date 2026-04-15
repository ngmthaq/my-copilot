# AngularJS Data Binding

> Source: https://www.w3schools.com/angularjs/angularjs_databinding.asp

# AngularJS Data Binding

## Data Model

AngularJS applications typically have a data model, which is a collection of data available for the application.

```javascript
var app = angular.module("myApp", []);
app.controller("myCtrl", function ($scope) {
  $scope.firstname = "John";
  $scope.lastname = "Doe";
});
```

## HTML View

The HTML container where the AngularJS application displays is called the view. The view accesses the model through several methods.

Use the `ng-bind` directive to bind element content to model properties:

```html
<p ng-bind="firstname"></p>
```

Alternatively, use double braces to display model data:

```html
<p>First name: {{firstname}}</p>
```

The `ng-model` directive binds model to view on HTML controls (input, select, textarea):

```html
<input ng-model="firstname" />
```

## The ng-model Directive

The `ng-model` directive establishes two-way binding between model and view on form elements.

## Two-way Binding

Data binding synchronizes the model and view automatically. When model data changes, the view reflects it; when view data changes, the model updates immediately.

```html
<div ng-app="myApp" ng-controller="myCtrl">
  Name: <input ng-model="firstname" />
  <h1>{{firstname}}</h1>
</div>

<script>
  var app = angular.module("myApp", []);
  app.controller("myCtrl", function ($scope) {
    $scope.firstname = "John";
    $scope.lastname = "Doe";
  });
</script>
```

## AngularJS Controller

Controllers manage AngularJS applications. The immediate model-view synchronization allows controllers to remain separated from the view while focusing on model data. Any controller changes automatically reflect in the view.

```html
<div ng-app="myApp" ng-controller="myCtrl">
  <h1 ng-click="changeName()">{{firstname}}</h1>
</div>

<script>
  var app = angular.module("myApp", []);
  app.controller("myCtrl", function ($scope) {
    $scope.firstname = "John";
    $scope.changeName = function () {
      $scope.firstname = "Nelly";
    };
  });
</script>
```
