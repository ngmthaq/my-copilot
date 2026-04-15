# AngularJS Routing

> Source: https://www.w3schools.com/angularjs/angularjs_routing.asp

# AngularJS Routing

## What is Routing in AngularJS?

The `ngRoute` module enables single-page application functionality, allowing navigation between different pages without full application reloading. The module "routes" your application to different pages seamlessly.

### Example

Navigate to different pages using routing:

```html
<body ng-app="myApp">
  <p><a href="#/!">Main</a></p>

  <a href="#!red">Red</a>
  <a href="#!green">Green</a>
  <a href="#!blue">Blue</a>

  <div ng-view></div>

  <script>
    var app = angular.module("myApp", ["ngRoute"]);
    app.config(function ($routeProvider) {
      $routeProvider
        .when("/", {
          templateUrl: "main.htm",
        })
        .when("/red", {
          templateUrl: "red.htm",
        })
        .when("/green", {
          templateUrl: "green.htm",
        })
        .when("/blue", {
          templateUrl: "blue.htm",
        });
    });
  </script>
</body>
```

## What do I Need?

Include the AngularJS Route module:

```html
<script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.6.9/angular-route.js"></script>
```

Add `ngRoute` as a dependency:

```javascript
var app = angular.module("myApp", ["ngRoute"]);
```

Configure routes using `$routeProvider`:

```javascript
app.config(function ($routeProvider) {
  $routeProvider
    .when("/", {
      templateUrl: "main.htm",
    })
    .when("/red", {
      templateUrl: "red.htm",
    });
});
```

## Where Does it Go?

The `ng-view` directive serves as a container for routed content. Three implementation options exist:

```html
<div ng-view></div>
```

```html
<ng-view></ng-view>
```

```html
<div class="ng-view"></div>
```

Applications support only one `ng-view` directive, which acts as a placeholder for all view content.

## $routeProvider

Define which page displays when users click links:

```javascript
var app = angular.module("myApp", ["ngRoute"]);
app.config(function ($routeProvider) {
  $routeProvider
    .when("/", {
      templateUrl: "main.htm",
    })
    .when("/london", {
      templateUrl: "london.htm",
    })
    .when("/paris", {
      templateUrl: "paris.htm",
    });
});
```

Work registered in the `config` method executes when the application loads.

## Controllers

Associate controllers with specific views:

```javascript
var app = angular.module("myApp", ["ngRoute"]);
app.config(function ($routeProvider) {
  $routeProvider
    .when("/", {
      templateUrl: "main.htm",
    })
    .when("/london", {
      templateUrl: "london.htm",
      controller: "londonCtrl",
    })
    .when("/paris", {
      templateUrl: "paris.htm",
      controller: "parisCtrl",
    });
});
app.controller("londonCtrl", function ($scope) {
  $scope.msg = "I love London";
});
app.controller("parisCtrl", function ($scope) {
  $scope.msg = "I love Paris";
});
```

Template files (london.htm):

```html
<h1>London</h1>
<h3>London is the capital city of England.</h3>
<p>
  It is the most populous city in the United Kingdom, with a metropolitan area
  of over 13 million inhabitants.
</p>
<p>{{msg}}</p>
```

## Template

Use the `template` property for inline HTML instead of external files:

```javascript
var app = angular.module("myApp", ["ngRoute"]);
app.config(function ($routeProvider) {
  $routeProvider
    .when("/", {
      template: "<h1>Main</h1><p>Click on the links to change this content</p>",
    })
    .when("/banana", {
      template: "<h1>Banana</h1><p>Bananas contain around 75% water.</p>",
    })
    .when("/tomato", {
      template: "<h1>Tomato</h1><p>Tomatoes contain around 95% water.</p>",
    });
});
```

## The otherwise method

Set a default route when no other routes match:

```javascript
var app = angular.module("myApp", ["ngRoute"]);
app.config(function ($routeProvider) {
  $routeProvider
    .when("/banana", {
      template: "<h1>Banana</h1><p>Bananas contain around 75% water.</p>",
    })
    .when("/tomato", {
      template: "<h1>Tomato</h1><p>Tomatoes contain around 95% water.</p>",
    })
    .otherwise({
      template: "<h1>None</h1><p>Nothing has been selected</p>",
    });
});
```
