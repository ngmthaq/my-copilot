# AngularJS Expressions

> Source: https://www.w3schools.com/angularjs/angularjs_expressions.asp

# AngularJS Expressions

## AngularJS Expressions

AngularJS binds data to HTML using **Expressions**. Expressions can be written inside double braces: `{{ expression }}` or within a directive: `ng-bind="expression"`.

AngularJS resolves the expression and returns the result exactly where the expression is written. These expressions are similar to JavaScript expressions and can contain literals, operators, and variables.

### Example

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

If you remove the `ng-app` directive, HTML will display the expression as-is without evaluating it.

You can write expressions anywhere, and AngularJS will resolve and return the result. For example, change CSS properties dynamically:

```html
<div ng-app="" ng-init="myCol='lightblue'">
  <input style="background-color:{{myCol}}" ng-model="myCol" />
</div>
```

## AngularJS Numbers

AngularJS numbers function like JavaScript numbers:

```html
<div ng-app="" ng-init="quantity=1;cost=5">
  <p>Total in dollar: {{ quantity * cost }}</p>
</div>
```

Same example using `ng-bind`:

```html
<div ng-app="" ng-init="quantity=1;cost=5">
  <p>Total in dollar: <span ng-bind="quantity * cost"></span></p>
</div>
```

## AngularJS Strings

AngularJS strings work like JavaScript strings:

```html
<div ng-app="" ng-init="firstName='John';lastName='Doe'">
  <p>The name is {{ firstName + " " + lastName }}</p>
</div>
```

Same example using `ng-bind`:

```html
<div ng-app="" ng-init="firstName='John';lastName='Doe'">
  <p>The name is <span ng-bind="firstName + ' ' + lastName"></span></p>
</div>
```

## AngularJS Objects

AngularJS objects are like JavaScript objects:

```html
<div ng-app="" ng-init="person={firstName:'John',lastName:'Doe'}">
  <p>The name is {{ person.lastName }}</p>
</div>
```

Same example using `ng-bind`:

```html
<div ng-app="" ng-init="person={firstName:'John',lastName:'Doe'}">
  <p>The name is <span ng-bind="person.lastName"></span></p>
</div>
```

## AngularJS Arrays

AngularJS arrays function like JavaScript arrays:

```html
<div ng-app="" ng-init="points=[1,15,19,2,40]">
  <p>The third result is {{ points[2] }}</p>
</div>
```

Same example using `ng-bind`:

```html
<div ng-app="" ng-init="points=[1,15,19,2,40]">
  <p>The third result is <span ng-bind="points[2]"></span></p>
</div>
```

## AngularJS Expressions vs. JavaScript Expressions

| Aspect       | AngularJS                  | JavaScript                    |
| ------------ | -------------------------- | ----------------------------- |
| Location     | Can be written inside HTML | Cannot be written inside HTML |
| Conditionals | Not supported              | Supported                     |
| Loops        | Not supported              | Supported                     |
| Exceptions   | Not supported              | Supported                     |
| Filters      | Supported                  | Not supported                 |

Like JavaScript expressions, AngularJS expressions can contain literals, operators, and variables.
