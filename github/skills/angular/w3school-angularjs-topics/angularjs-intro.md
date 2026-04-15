# AngularJS Intro

> Source: https://www.w3schools.com/angularjs/angularjs_intro.asp

# AngularJS Introduction

## AngularJS is a JavaScript Framework

AngularJS is a JavaScript framework written in JavaScript, distributed as a JavaScript file that can be added to a web page with a script tag:

```html
<script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.6.9/angular.min.js"></script>
```

## AngularJS Extends HTML

AngularJS extends HTML with **ng-directives**. Key directives include:

- **ng-app**: Defines an AngularJS application
- **ng-model**: Binds the value of HTML controls (input, select, textarea) to application data
- **ng-bind**: Binds application data to the HTML view

### AngularJS Example

```html
<!DOCTYPE html>
<html>
  <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.6.9/angular.min.js"></script>
  <body>
    <div ng-app="">
      <p>Name: <input type="text" ng-model="name" /></p>
      <p ng-bind="name"></p>
    </div>
  </body>
</html>
```

AngularJS starts automatically when the web page loads. The **ng-app** directive designates the <div> element as the owner of an AngularJS application. The **ng-model** directive links the input field value to the application variable **name**. The **ng-bind** directive connects the <p> element content to the application variable **name**.

## AngularJS Directives

AngularJS directives are HTML attributes with an **ng** prefix. The **ng-init** directive initializes AngularJS application variables.

### AngularJS Example

```html
<div ng-app="" ng-init="firstName='John'">
  <p>The name is <span ng-bind="firstName"></span></p>
</div>
```

For HTML validity, you can use **data-ng-** instead of **ng-**:

```html
<div data-ng-app="" data-ng-init="firstName='John'">
  <p>The name is <span data-ng-bind="firstName"></span></p>
</div>
```

## AngularJS Expressions

AngularJS expressions are written inside double braces: **{{ expression }}**. AngularJS outputs data exactly where the expression is written.

### AngularJS Example

```html
<!DOCTYPE html>
<html>
  <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.6.9/angular.min.js"></script>
  <body>
    <div ng-app="">
      <p>My first expression: {{ 5 + 5 }}</p>
    </div>
  </body>
</html>
```

AngularJS expressions bind AngularJS data to HTML the same way as the **ng-bind** directive.

```html
<!DOCTYPE html>
<html>
  <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.6.9/angular.min.js"></script>
  <body>
    <div ng-app="">
      <p>Name: <input type="text" ng-model="name" /></p>
      <p>{{name}}</p>
    </div>
  </body>
</html>
```

## AngularJS Applications

AngularJS **modules** define AngularJS applications. AngularJS **controllers** control AngularJS applications. The **ng-app** directive defines the application, and the **ng-controller** directive defines the controller.

### AngularJS Example

```html
<div ng-app="myApp" ng-controller="myCtrl">
  First Name: <input type="text" ng-model="firstName" /><br />
  Last Name: <input type="text" ng-model="lastName" /><br />
  <br />
  Full Name: {{firstName + " " + lastName}}
</div>

<script>
  var app = angular.module("myApp", []);
  app.controller("myCtrl", function ($scope) {
    $scope.firstName = "John";
    $scope.lastName = "Doe";
  });
</script>
```

### AngularJS Module

```javascript
var app = angular.module("myApp", []);
```

### AngularJS Controller

```javascript
app.controller("myCtrl", function ($scope) {
  $scope.firstName = "John";
  $scope.lastName = "Doe";
});
```
