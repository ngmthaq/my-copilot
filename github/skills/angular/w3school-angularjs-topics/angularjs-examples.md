# AngularJS Examples

> Source: https://www.w3schools.com/angularjs/angularjs_examples.asp

# AngularJS Examples

## AngularJS Basics

The tutorial begins with fundamental AngularJS directives and expressions. A simple example demonstrates two-way data binding:

```html
<div ng-app="">
  <p>Name: <input type="text" ng-model="name" /></p>
  <p>You wrote: {{ name }}</p>
</div>
```

Basic topics covered include directives, expressions, and controllers as foundational concepts.

## AngularJS Expressions

This section explores how AngularJS evaluates expressions in various contexts:

- Simple expressions with variables
- Numeric expressions and operations
- String manipulation examples
- Object and array handling
- Using `ng-bind` directive for binding expressions

## AngularJS Modules

Modules organize AngularJS applications and define how components interact. Examples show:

- Basic controller creation within modules
- Separating controllers into external files
- Proper timing for loading AngularJS libraries

## AngularJS Directives

Custom directives extend HTML functionality. The section demonstrates:

- Built-in directives like `ng-model` and `ng-repeat`
- Creating custom directives with different syntaxes
- Using directives as elements, attributes, classes, and comments
- Directive restrictions and limitations

## AngularJS Models

Models manage application data with validation capabilities:

- Basic model binding
- Two-way data binding implementation
- Form validation states
- CSS class application based on field validity

## AngularJS Controllers

Controllers manage business logic and scope management:

- Basic controller functions
- Property definitions within controllers
- External JavaScript file organization
- Controller naming conventions

## AngularJS Scopes

Scopes bind data between controllers and views while maintaining synchronization across the application hierarchy.

## AngularJS Filters

Filters format data display including uppercase, lowercase, currency conversion, and sorting operations.

## AngularJS Tables, Forms, and APIs

Additional sections cover XMLHttpRequest operations, table rendering, database integration, HTML DOM manipulation, event handling, and built-in API methods.

## AngularJS Applications

Complete application examples include note-taking and to-do list implementations demonstrating practical integration of covered concepts.
