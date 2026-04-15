# AngularJS Application

> Source: https://www.w3schools.com/angularjs/angularjs_application.asp

# AngularJS Application

## Make a Shopping List

Create a real AngularJS application with a shopping list where you can add or remove items.

## Application Explained

### Step 1. Getting Started

Start by creating an application called `myShoppingList` with a controller named `myCtrl`. The controller adds a `products` array to the current `$scope`. Use the `ng-repeat` directive to display list items based on array values.

```javascript
var app = angular.module("myShoppingList", []);
app.controller("myCtrl", function ($scope) {
  $scope.products = ["Milk", "Bread", "Cheese"];
});
```

```html
<div ng-app="myShoppingList" ng-controller="myCtrl">
  <ul>
    <li ng-repeat="x in products">{{x}}</li>
  </ul>
</div>
```

### Step 2. Adding Items

Add a text field bound to the application using `ng-model`. Create an `addItem` function in the controller that pushes new items from the input field to the `products` array. Add a button with `ng-click` to trigger this function.

```javascript
$scope.addItem = function () {
  $scope.products.push($scope.addMe);
};
```

```html
<input ng-model="addMe" /> <button ng-click="addItem()">Add</button>
```

### Step 3. Removing Items

Create a `removeItem` function that accepts an index parameter and removes items using `splice()`. Add a `<span>` element for each item with `ng-click="removeItem($index)"` to enable deletion.

```javascript
$scope.removeItem = function (x) {
  $scope.products.splice(x, 1);
};
```

```html
<li ng-repeat="x in products">
  {{x}}<span ng-click="removeItem($index)">&times;</span>
</li>
```

### Step 4. Error Handling

Add validation to prevent duplicate items and empty entries. Display error messages when users attempt invalid actions. Clear error text when legitimate operations occur.

```javascript
$scope.addItem = function () {
  $scope.errortext = "";
  if (!$scope.addMe) {
    return;
  }
  if ($scope.products.indexOf($scope.addMe) == -1) {
    $scope.products.push($scope.addMe);
  } else {
    $scope.errortext = "The item is already in your shopping list.";
  }
};
```

### Step 5. Design

Use the W3.CSS stylesheet to improve application appearance:

```html
<link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css" />
```

Apply appropriate W3.CSS classes throughout the application structure for professional styling.
