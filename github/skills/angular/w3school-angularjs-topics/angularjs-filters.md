# AngularJS Filters

> Source: https://www.w3schools.com/angularjs/angularjs_filters.asp

# AngularJS Filters

## Overview

Filters in AngularJS transform and format data for display purposes. The framework provides nine built-in filters that handle common formatting tasks.

## Available Filters

AngularJS includes the following filters:

- **currency** - Formats numbers as currency
- **date** - Applies specified date formatting
- **filter** - Extracts matching items from arrays
- **json** - Converts objects to JSON strings
- **limitTo** - Restricts arrays/strings to specified length
- **lowercase** - Converts strings to lowercase
- **number** - Formats numbers as strings
- **orderBy** - Sorts arrays by expression
- **uppercase** - Converts strings to uppercase

## Adding Filters to Expressions

Filters attach to expressions using the pipe character `|`:

```javascript
{
  {
    lastName | uppercase;
  }
}
```

### Uppercase Example

```html
<div ng-app="myApp" ng-controller="personCtrl">
  <p>The name is {{ lastName | uppercase }}</p>
</div>
```

### Lowercase Example

```html
<div ng-app="myApp" ng-controller="personCtrl">
  <p>The name is {{ lastName | lowercase }}</p>
</div>
```

## Applying Filters to Directives

Filters work with directives like `ng-repeat`:

```html
<div ng-app="myApp" ng-controller="namesCtrl">
  <ul>
    <li ng-repeat="x in names | orderBy:'country'">
      {{ x.name + ', ' + x.country }}
    </li>
  </ul>
</div>
```

## Currency Filter

Formats numbers as currency values:

```html
<div ng-app="myApp" ng-controller="costCtrl">
  <h1>Price: {{ price | currency }}</h1>
</div>
```

## Filter Filter

The `filter` filter selects array subsets containing matching items:

```html
<div ng-app="myApp" ng-controller="namesCtrl">
  <ul>
    <li ng-repeat="x in names | filter : 'i'">{{ x }}</li>
  </ul>
</div>
```

## Filtering Based on User Input

Binding input fields with `ng-model` enables dynamic filtering:

```html
<div ng-app="myApp" ng-controller="namesCtrl">
  <p><input type="text" ng-model="test" /></p>
  <ul>
    <li ng-repeat="x in names | filter : test">{{ x }}</li>
  </ul>
</div>
```

## Sorting Arrays with User Interaction

Use `ng-click` on table headers to toggle sort order:

```html
<div ng-app="myApp" ng-controller="namesCtrl">
  <table border="1" width="100%">
    <tr>
      <th ng-click="orderByMe('name')">Name</th>
      <th ng-click="orderByMe('country')">Country</th>
    </tr>
    <tr ng-repeat="x in names | orderBy:myOrderBy">
      <td>{{x.name}}</td>
      <td>{{x.country}}</td>
    </tr>
  </table>
</div>

<script>
  angular.module("myApp", []).controller("namesCtrl", function ($scope) {
    $scope.names = [
      { name: "Jani", country: "Norway" },
      { name: "Carl", country: "Sweden" },
      { name: "Margareth", country: "England" },
      { name: "Hege", country: "Norway" },
      { name: "Joe", country: "Denmark" },
      { name: "Gustav", country: "Sweden" },
      { name: "Birgit", country: "Denmark" },
      { name: "Mary", country: "England" },
      { name: "Kai", country: "Norway" },
    ];
    $scope.orderByMe = function (x) {
      $scope.myOrderBy = x;
    };
  });
</script>
```

## Custom Filters

Create custom filters by registering a filter factory with your module:

```html
<ul ng-app="myApp" ng-controller="namesCtrl">
  <li ng-repeat="x in names">{{x | myFormat}}</li>
</ul>

<script>
  var app = angular.module("myApp", []);
  app.filter("myFormat", function () {
    return function (x) {
      var i,
        c,
        txt = "";
      for (i = 0; i < x.length; i++) {
        c = x[i];
        if (i % 2 == 0) {
          c = c.toUpperCase();
        }
        txt += c;
      }
      return txt;
    };
  });
  app.controller("namesCtrl", function ($scope) {
    $scope.names = [
      "Jani",
      "Carl",
      "Margareth",
      "Hege",
      "Joe",
      "Gustav",
      "Birgit",
      "Mary",
      "Kai",
    ];
  });
</script>
```

The `myFormat` filter capitalizes every other character in a string.
