# AngularJS Services

> Source: https://www.w3schools.com/angularjs/angularjs_services.asp

# AngularJS Services

## What is a Service?

In AngularJS, a service is a function or object available for and limited to your AngularJS application. AngularJS includes approximately 30 built-in services, with `$location` being a commonly used example that provides methods returning information about the current web page location.

### Example: Using $location Service

```javascript
var app = angular.module("myApp", []);
app.controller("customersCtrl", function ($scope, $location) {
  $scope.myUrl = $location.absUrl();
});
```

Services must be defined as dependencies when passed to controllers.

## Why use Services?

While DOM objects like `window.location` exist, AngularJS supervises applications continuously and prefers its own services to handle changes and events properly. Using AngularJS services ensures compatibility with the framework's change detection mechanisms.

## The $http Service

The `$http` service ranks among the most frequently used services in AngularJS applications, enabling requests to servers and handling responses within your application.

### Example: HTTP Request

```javascript
var app = angular.module("myApp", []);
app.controller("myCtrl", function ($scope, $http) {
  $http.get("welcome.htm").then(function (response) {
    $scope.myWelcome = response.data;
  });
});
```

## The $timeout Service

The `$timeout` service functions as AngularJS's equivalent to `window.setTimeout`.

### Example: Delayed Message Update

```javascript
var app = angular.module("myApp", []);
app.controller("myCtrl", function ($scope, $timeout) {
  $scope.myHeader = "Hello World!";
  $timeout(function () {
    $scope.myHeader = "How are you today?";
  }, 2000);
});
```

## The $interval Service

The `$interval` service serves as AngularJS's version of `window.setInterval`.

### Example: Time Display

```javascript
var app = angular.module("myApp", []);
app.controller("myCtrl", function ($scope, $interval) {
  $scope.theTime = new Date().toLocaleTimeString();
  $interval(function () {
    $scope.theTime = new Date().toLocaleTimeString();
  }, 1000);
});
```

## Create Your Own Service

Connect custom services to modules by using the service method:

```javascript
app.service("hexafy", function () {
  this.myFunc = function (x) {
    return x.toString(16);
  };
});
```

Add the custom service as a dependency in controllers:

### Example: Custom Service in Controller

```javascript
app.controller("myCtrl", function ($scope, hexafy) {
  $scope.hex = hexafy.myFunc(255);
});
```

## Use a Custom Service Inside a Filter

Custom services can be integrated into filters by adding them as dependencies:

```javascript
app.filter("myFormat", [
  "hexafy",
  function (hexafy) {
    return function (x) {
      return hexafy.myFunc(x);
    };
  },
]);
```

Use the filter when displaying values:

```html
<ul>
  <li ng-repeat="x in counts">{{x | myFormat}}</li>
</ul>
```
