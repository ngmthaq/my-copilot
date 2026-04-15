# AngularJS Includes

> Source: https://www.w3schools.com/angularjs/angularjs_includes.asp

# AngularJS Includes

## AngularJS Includes

You can incorporate HTML content from external files by using the **ng-include** directive in AngularJS:

```html
<body ng-app="">
  <div ng-include="'myFile.htm'"></div>
</body>
```

## Include AngularJS Code

External HTML files incorporated via the ng-include directive can also contain AngularJS code that will execute within your application.

### myTable.htm:

```html
<table>
  <tr ng-repeat="x in names">
    <td>{{ x.Name }}</td>
    <td>{{ x.Country }}</td>
  </tr>
</table>
```

### Complete Example:

```html
<body>
  <div ng-app="myApp" ng-controller="customersCtrl">
    <div ng-include="'myTable.htm'"></div>
  </div>

  <script>
    var app = angular.module("myApp", []);
    app.controller("customersCtrl", function ($scope, $http) {
      $http.get("customers.php").then(function (response) {
        $scope.names = response.data.records;
      });
    });
  </script>
</body>
```

## Include Cross Domains

By default, ng-include prevents inclusion of files from other domains. To enable cross-domain file access, add a whitelist in your application's config function:

```html
<body ng-app="myApp">
  <div ng-include="'https://tryit.w3schools.com/angular_include.php'"></div>

  <script>
    var app = angular.module("myApp", []);
    app.config(function ($sceDelegateProvider) {
      $sceDelegateProvider.resourceUrlWhitelist([
        "https://tryit.w3schools.com/**",
      ]);
    });
  </script>
</body>
```

Ensure the destination server permits cross-domain file access.
