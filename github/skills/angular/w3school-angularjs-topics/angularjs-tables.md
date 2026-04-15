# AngularJS Tables

> Source: https://www.w3schools.com/angularjs/angularjs_tables.asp

# AngularJS Tables

## Displaying Data in a Table

The `ng-repeat` directive is ideal for rendering tables. Here's a basic example:

```html
<div ng-app="myApp" ng-controller="customersCtrl">
  <table>
    <tr ng-repeat="x in names">
      <td>{{ x.Name }}</td>
      <td>{{ x.Country }}</td>
    </tr>
  </table>
</div>

<script>
  var app = angular.module("myApp", []);
  app.controller("customersCtrl", function ($scope, $http) {
    $http.get("customers.php").then(function (response) {
      $scope.names = response.data.records;
    });
  });
</script>
```

## Displaying with CSS Style

Add styling to enhance table appearance:

```css
table,
th,
td {
  border: 1px solid grey;
  border-collapse: collapse;
  padding: 5px;
}

table tr:nth-child(odd) {
  background-color: #f1f1f1;
}

table tr:nth-child(even) {
  background-color: #ffffff;
}
```

## Display with orderBy Filter

Sort table data using the `orderBy` filter:

```html
<table>
  <tr ng-repeat="x in names | orderBy : 'Country'">
    <td>{{ x.Name }}</td>
    <td>{{ x.Country }}</td>
  </tr>
</table>
```

## Display with uppercase Filter

Apply the `uppercase` filter for formatted output:

```html
<table>
  <tr ng-repeat="x in names">
    <td>{{ x.Name }}</td>
    <td>{{ x.Country | uppercase }}</td>
  </tr>
</table>
```

## Display the Table Index ($index)

Include row numbering with the `$index` variable:

```html
<table>
  <tr ng-repeat="x in names">
    <td>{{ $index + 1 }}</td>
    <td>{{ x.Name }}</td>
    <td>{{ x.Country }}</td>
  </tr>
</table>
```

## Using $even and $odd

Apply conditional styling based on row parity:

```html
<table>
  <tr ng-repeat="x in names">
    <td ng-if="$odd" style="background-color:#f1f1f1">{{ x.Name }}</td>
    <td ng-if="$even">{{ x.Name }}</td>
    <td ng-if="$odd" style="background-color:#f1f1f1">{{ x.Country }}</td>
    <td ng-if="$even">{{ x.Country }}</td>
  </tr>
</table>
```
