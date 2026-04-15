# AngularJS Http

> Source: https://www.w3schools.com/angularjs/angularjs_http.asp

# AngularJS AJAX - $http

## AngularJS $http

The AngularJS `$http` service makes a request to the server, and returns a response.

### Example

Make a simple request to the server, and display the result in a header:

```javascript
var app = angular.module("myApp", []);
app.controller("myCtrl", function ($scope, $http) {
  $http.get("welcome.htm").then(function (response) {
    $scope.myWelcome = response.data;
  });
});
```

## Methods

The example above uses the `.get` method of the `$http` service. The .get method is a shortcut method of the $http service.

There are several shortcut methods:

- `.delete()`
- `.get()`
- `.head()`
- `.jsonp()`
- `.patch()`
- `.post()`
- `.put()`

The methods above are all shortcuts of calling the $http service:

```javascript
var app = angular.module("myApp", []);
app.controller("myCtrl", function ($scope, $http) {
  $http({
    method: "GET",
    url: "welcome.htm",
  }).then(
    function mySuccess(response) {
      $scope.myWelcome = response.data;
    },
    function myError(response) {
      $scope.myWelcome = response.statusText;
    },
  );
});
```

## Properties

The response from the server is an object with these properties:

- `.config` the object used to generate the request.
- `.data` a string, or an object, carrying the response from the server.
- `.headers` a function to use to get header information.
- `.status` a number defining the HTTP status.
- `.statusText` a string defining the HTTP status.

### Example

```javascript
var app = angular.module("myApp", []);
app.controller("myCtrl", function ($scope, $http) {
  $http.get("welcome.htm").then(function (response) {
    $scope.content = response.data;
    $scope.statuscode = response.status;
    $scope.statustext = response.statusText;
  });
});
```

To handle errors, add one more functions to the `.then` method:

```javascript
var app = angular.module("myApp", []);
app.controller("myCtrl", function ($scope, $http) {
  $http.get("wrongfilename.htm").then(
    function (response) {
      // First function handles success
      $scope.content = response.data;
    },
    function (response) {
      // Second function handles error
      $scope.content = "Something went wrong";
    },
  );
});
```

## JSON

The data you get from the response is expected to be in JSON format. JSON is a great way of transporting data, and it is easy to use within AngularJS, or any other JavaScript.

Example: On the server we have a file that returns a JSON object containing 15 customers, all wrapped in array called `records`.

### Example

The `ng-repeat` directive is perfect for looping through an array:

```javascript
var app = angular.module("myApp", []);
app.controller("customersCtrl", function ($scope, $http) {
  $http.get("customers.php").then(function (response) {
    $scope.myData = response.data.records;
  });
});
```

Application explained:

The application defines the `customersCtrl` controller, with a `$scope` and `$http` object.

`$http` is an XMLHttpRequest object for requesting external data.

`$http.get()` reads JSON data from the server.

On success, the controller creates a property, `myData`, in the scope, with JSON data from the server.
