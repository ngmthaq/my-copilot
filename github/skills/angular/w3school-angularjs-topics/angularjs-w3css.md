# AngularJS W3.CSS

> Source: https://www.w3schools.com/angularjs/angularjs_w3css.asp

# AngularJS and W3.CSS

## W3.CSS

To include W3.CSS in your AngularJS application, add the following line to the head of your document:

```html
<link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css" />
```

If you want to study W3.CSS, visit the W3.CSS Tutorial.

Below is a complete HTML example, with all AngularJS directives and W3.CSS classes explained.

## HTML Code

```html
<!DOCTYPE html>
<html>
  <link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css" />
  <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.6.9/angular.min.js"></script>
  <body ng-app="myApp" ng-controller="userCtrl">
    <div class="w3-container">
      <h3>Users</h3>

      <table class="w3-table w3-bordered w3-striped">
        <tr>
          <th>Edit</th>
          <th>First Name</th>
          <th>Last Name</th>
        </tr>
        <tr ng-repeat="user in users">
          <td>
            <button class="w3-btn w3-ripple" ng-click="editUser(user.id)">
              Edit
            </button>
          </td>
          <td>{{ user.fName }}</td>
          <td>{{ user.lName }}</td>
        </tr>
      </table>
      <br />
      <button class="w3-btn w3-green w3-ripple" ng-click="editUser('new')">
        Create New User
      </button>

      <form ng-hide="hideform">
        <h3 ng-show="edit">Create New User:</h3>
        <h3 ng-hide="edit">Edit User:</h3>
        <label>First Name:</label>
        <input
          class="w3-input w3-border"
          type="text"
          ng-model="fName"
          ng-disabled="!edit"
          placeholder="First Name"
        />
        <br />
        <label>Last Name:</label>
        <input
          class="w3-input w3-border"
          type="text"
          ng-model="lName"
          ng-disabled="!edit"
          placeholder="Last Name"
        />
        <br />
        <label>Password:</label>
        <input
          class="w3-input w3-border"
          type="password"
          ng-model="passw1"
          placeholder="Password"
        />
        <br />
        <label>Repeat:</label>
        <input
          class="w3-input w3-border"
          type="password"
          ng-model="passw2"
          placeholder="Repeat Password"
        />
        <br />
        <button
          class="w3-btn w3-green w3-ripple"
          ng-disabled="error || incomplete"
        >
          Save Changes
        </button>
      </form>
    </div>

    <script src="myUsers.js"></script>
  </body>
</html>
```

## Directives Explained

| AngularJS Directive   | Description                                                                          |
| --------------------- | ------------------------------------------------------------------------------------ |
| `<body ng-app`        | Defines an application for the body element                                          |
| `<body ng-controller` | Defines a controller for the body element                                            |
| `<tr ng-repeat`       | Repeats the tr element for each user in users                                        |
| `<button ng-click`    | Invokes the editUser() function when the button is clicked                           |
| `<h3 ng-show`         | Shows the h3 element if edit equals true                                             |
| `<h3 ng-hide`         | Hides the form if hideform equals true, and hides the h3 element if edit equals true |
| `<input ng-model`     | Binds the input element to the application                                           |
| `<button ng-disabled` | Disables the button element if error or incomplete equals true                       |

## W3.CSS Classes Explained

| Element    | Class        | Defines                                   |
| ---------- | ------------ | ----------------------------------------- |
| `<div>`    | w3-container | A content container                       |
| `<table>`  | w3-table     | A table                                   |
| `<table>`  | w3-bordered  | A bordered table                          |
| `<table>`  | w3-striped   | A striped table                           |
| `<button>` | w3-btn       | A button                                  |
| `<button>` | w3-green     | A green button                            |
| `<button>` | w3-ripple    | A ripple effect when you click the button |
| `<input>`  | w3-input     | An input field                            |
| `<input>`  | w3-border    | A border on the input field               |

## JavaScript Code

### myUsers.js

```javascript
angular.module("myApp", []).controller("userCtrl", function ($scope) {
  $scope.fName = "";
  $scope.lName = "";
  $scope.passw1 = "";
  $scope.passw2 = "";
  $scope.users = [
    { id: 1, fName: "Hege", lName: "Pege" },
    { id: 2, fName: "Kim", lName: "Pim" },
    { id: 3, fName: "Sal", lName: "Smith" },
    { id: 4, fName: "Jack", lName: "Jones" },
    { id: 5, fName: "John", lName: "Doe" },
    { id: 6, fName: "Peter", lName: "Pan" },
  ];
  $scope.edit = true;
  $scope.error = false;
  $scope.incomplete = false;
  $scope.hideform = true;
  $scope.editUser = function (id) {
    $scope.hideform = false;
    if (id == "new") {
      $scope.edit = true;
      $scope.incomplete = true;
      $scope.fName = "";
      $scope.lName = "";
    } else {
      $scope.edit = false;
      $scope.fName = $scope.users[id - 1].fName;
      $scope.lName = $scope.users[id - 1].lName;
    }
  };

  $scope.$watch("passw1", function () {
    $scope.test();
  });
  $scope.$watch("passw2", function () {
    $scope.test();
  });
  $scope.$watch("fName", function () {
    $scope.test();
  });
  $scope.$watch("lName", function () {
    $scope.test();
  });

  $scope.test = function () {
    if ($scope.passw1 !== $scope.passw2) {
      $scope.error = true;
    } else {
      $scope.error = false;
    }
    $scope.incomplete = false;
    if (
      $scope.edit &&
      (!$scope.fName.length ||
        !$scope.lName.length ||
        !$scope.passw1.length ||
        !$scope.passw2.length)
    ) {
      $scope.incomplete = true;
    }
  };
});
```

## JavaScript Code Explained

| Scope Properties  | Used for                                              |
| ----------------- | ----------------------------------------------------- |
| $scope.fName      | Model variable (user first name)                      |
| $scope.lName      | Model variable (user last name)                       |
| $scope.passw1     | Model variable (user password 1)                      |
| $scope.passw2     | Model variable (user password 2)                      |
| $scope.users      | Model variable (array of users)                       |
| $scope.edit       | Set to true when user clicks 'Create user'            |
| $scope.hideform   | Set to false when user clicks 'Edit' or 'Create user' |
| $scope.error      | Set to true if passw1 does not equal passw2           |
| $scope.incomplete | Set to true if any field is empty (length = 0)        |
| $scope.editUser   | Sets model variables                                  |
| $scope.$watch     | Watches model variables                               |
| $scope.test       | Tests model variables for errors and incompleteness   |
