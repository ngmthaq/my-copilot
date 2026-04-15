# AngularJS Directives

> Source: https://www.w3schools.com/angularjs/angularjs_directives.asp

# AngularJS Directives

## AngularJS Directives

AngularJS lets you extend HTML with new attributes called **Directives**. The framework provides built-in directives for functionality and allows developers to define custom ones.

AngularJS directives use the `ng-` prefix. Key built-in directives include:

- `ng-app` - initializes an AngularJS application
- `ng-init` - initializes application data
- `ng-model` - binds HTML control values to application data

## Data Binding

Data binding connects AngularJS expressions with data. The syntax `{{ firstName }}` represents a binding expression that updates when associated data changes.

### Example

```html
<div ng-app="" ng-init="firstName='John'">
  <p>Name: <input type="text" ng-model="firstName" /></p>
  <p>You wrote: {{ firstName }}</p>
</div>
```

Two-way binding example with calculations:

```html
<div ng-app="" ng-init="quantity=1;price=5">
  Quantity: <input type="number" ng-model="quantity" /> Costs:
  <input type="number" ng-model="price" />
  Total in dollar: {{ quantity * price }}
</div>
```

## Repeating HTML Elements

The `ng-repeat` directive duplicates HTML elements for each collection item.

### Array Example

```html
<div ng-app="" ng-init="names=['Jani','Hege','Kai']">
  <ul>
    <li ng-repeat="x in names">{{ x }}</li>
  </ul>
</div>
```

### Array of Objects Example

```html
<div
  ng-app=""
  ng-init="names=[
{name:'Jani',country:'Norway'},
{name:'Hege',country:'Sweden'},
{name:'Kai',country:'Denmark'}]"
>
  <ul>
    <li ng-repeat="x in names">{{ x.name + ', ' + x.country }}</li>
  </ul>
</div>
```

## The ng-app Directive

The `ng-app` directive defines the **root element** of an AngularJS application and automatically initializes when the page loads.

## The ng-init Directive

The `ng-init` directive defines **initial values** for an AngularJS application. Controllers or modules are preferred alternatives.

## The ng-model Directive

The `ng-model` directive binds the value of HTML controls (input, select, textarea) to application data. It also provides:

- Type validation (number, email, required)
- Status information (invalid, dirty, touched, error)
- CSS classes for elements
- HTML form binding

## Create New Directives

Custom directives use camelCase in code (`w3TestDirective`) but kebab-case when invoked (`w3-test-directive`).

### Basic Example

```javascript
var app = angular.module("myApp", []);
app.directive("w3TestDirective", function () {
  return {
    template: "<h1>Made by a directive!</h1>",
  };
});
```

### Invocation Methods

Directives can be invoked as:

- Element name: `<w3-test-directive></w3-test-directive>`
- Attribute: `<div w3-test-directive></div>`
- Class: `<div class="w3-test-directive"></div>`
- Comment: `<!-- directive: w3-test-directive -->`

## Restrictions

The `restrict` property limits invocation methods:

```javascript
app.directive("w3TestDirective", function () {
  return {
    restrict: "A",
    template: "<h1>Made by a directive!</h1>",
  };
});
```

Valid values:

- `E` - Element name
- `A` - Attribute
- `C` - Class
- `M` - Comment

Default value is `EA` (both elements and attributes).
