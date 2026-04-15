# AngularJS Validation

> Source: https://www.w3schools.com/angularjs/angularjs_validation.asp

# AngularJS Form Validation

## Form Validation

AngularJS offers client-side form validation through monitoring form and input field states. It tracks whether fields have been touched, modified, or remain pristine, while allowing both standard HTML5 attributes and custom validation functions.

**Note:** Client-side validation cannot solely secure user input; server-side validation is also necessary.

## Required

Use the HTML5 `required` attribute to specify that an input field must be filled:

```html
<form name="myForm">
  <input name="myInput" ng-model="myInput" required />
</form>

<p>The input's valid state is:</p>
<h1>{{myForm.myInput.$valid}}</h1>
```

## E-mail

Use the HTML5 `email` type to validate that input contains a valid email address:

```html
<form name="myForm">
  <input name="myInput" ng-model="myInput" type="email" />
</form>

<p>The input's valid state is:</p>
<h1>{{myForm.myInput.$valid}}</h1>
```

## Form State and Input State

AngularJS continuously updates the state of forms and input fields.

**Input field states:**

- `$untouched` - Field has not been touched yet
- `$touched` - Field has been touched
- `$pristine` - Field has not been modified
- `$dirty` - Field has been modified
- `$invalid` - Field content is not valid
- `$valid` - Field content is valid

**Form states:**

- `$pristine` - No fields modified yet
- `$dirty` - One or more fields modified
- `$invalid` - Form content is not valid
- `$valid` - Form content is valid
- `$submitted` - Form is submitted

Display meaningful messages based on these states:

```html
<input name="myName" ng-model="myName" required />
<span ng-show="myForm.myName.$touched && myForm.myName.$invalid">
  The name is required.
</span>
```

## CSS Classes

AngularJS adds CSS classes to forms and input fields based on their states.

**Input field classes:**

- `ng-untouched`, `ng-touched`
- `ng-pristine`, `ng-dirty`
- `ng-valid`, `ng-invalid`
- `ng-valid-_key_`, `ng-invalid-_key_` (e.g., `ng-valid-required`)

**Form classes:**

- `ng-pristine`, `ng-dirty`
- `ng-valid`, `ng-invalid`
- `ng-valid-_key_`, `ng-invalid-_key_`

Apply styles to enhance user experience:

```css
input.ng-invalid {
  background-color: pink;
}
input.ng-valid {
  background-color: lightgreen;
}
```

Style forms based on modification state:

```css
form.ng-pristine {
  background-color: lightblue;
}
form.ng-dirty {
  background-color: pink;
}
```

## Custom Validation

Create custom validation by adding a directive with a validation function:

```html
<form name="myForm">
  <input name="myInput" ng-model="myInput" required my-directive />
</form>

<script>
  var app = angular.module("myApp", []);
  app.directive("myDirective", function () {
    return {
      require: "ngModel",
      link: function (scope, element, attr, mCtrl) {
        function myValidation(value) {
          if (value.indexOf("e") > -1) {
            mCtrl.$setValidity("charE", true);
          } else {
            mCtrl.$setValidity("charE", false);
          }
          return value;
        }
        mCtrl.$parsers.push(myValidation);
      },
    };
  });
</script>
```

**Explanation:** Use camelCase for directive names in JavaScript (`myDirective`) but hyphenated format in HTML (`my-directive`). The directive requires `ngModel` and defines a validation function that executes whenever input changes. In this example, validation checks for the letter "e".

## Validation Example

```html
<!DOCTYPE html>
<html>
  <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.6.9/angular.min.js"></script>
  <body>
    <h2>Validation Example</h2>

    <form ng-app="myApp" ng-controller="validateCtrl" name="myForm" novalidate>
      <p>
        Username:<br />
        <input type="text" name="user" ng-model="user" required />
        <span
          style="color:red"
          ng-show="myForm.user.$dirty && myForm.user.$invalid"
        >
          <span ng-show="myForm.user.$error.required"
            >Username is required.</span
          >
        </span>
      </p>

      <p>
        Email:<br />
        <input type="email" name="email" ng-model="email" required />
        <span
          style="color:red"
          ng-show="myForm.email.$dirty && myForm.email.$invalid"
        >
          <span ng-show="myForm.email.$error.required">Email is required.</span>
          <span ng-show="myForm.email.$error.email"
            >Invalid email address.</span
          >
        </span>
      </p>

      <p>
        <input
          type="submit"
          ng-disabled="myForm.user.$dirty && myForm.user.$invalid ||
  myForm.email.$dirty && myForm.email.$invalid"
        />
      </p>
    </form>

    <script>
      var app = angular.module("myApp", []);
      app.controller("validateCtrl", function ($scope) {
        $scope.user = "John Doe";
        $scope.email = "john.doe@gmail.com";
      });
    </script>
  </body>
</html>
```

The HTML `novalidate` attribute disables default browser validation. The `ng-model` directive binds input elements to the model. Error messages display only when fields are `$dirty` and `$invalid`, providing user-friendly feedback.
