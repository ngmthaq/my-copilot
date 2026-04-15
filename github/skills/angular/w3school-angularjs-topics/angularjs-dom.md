# AngularJS DOM

> Source: https://www.w3schools.com/angularjs/angularjs_htmldom.asp

# AngularJS HTML DOM

## The ng-disabled Directive

The **ng-disabled** directive binds AngularJS application data to the disabled attribute of HTML elements.

### AngularJS Example

```html
<div ng-app="" ng-init="mySwitch=true">
  <p>
    <button ng-disabled="mySwitch">Click Me!</button>
  </p>

  <p><input type="checkbox" ng-model="mySwitch" />Button</p>

  <p>{{ mySwitch }}</p>
</div>
```

Application explained:

The **ng-disabled** directive binds the application data **mySwitch** to the HTML button's **disabled** attribute.

The **ng-model** directive binds the value of the HTML checkbox element to the value of **mySwitch**.

If the value of **mySwitch** evaluates to **true**, the button will be disabled:

```html
<p>
  <button disabled>Click Me!</button>
</p>
```

If the value of **mySwitch** evaluates to **false**, the button will not be disabled:

```html
<p>
  <button>Click Me!</button>
</p>
```

## The ng-show Directive

The **ng-show** directive shows or hides an HTML element.

### AngularJS Example

```html
<div ng-app="">
  <p ng-show="true">I am visible.</p>

  <p ng-show="false">I am not visible.</p>
</div>
```

The ng-show directive shows (or hides) an HTML element based on the **value** of ng-show.

You can use any expression that evaluates to true or false:

### AngularJS Example

```html
<div ng-app="" ng-init="hour=13">
  <p ng-show="hour > 12">I am visible.</p>
</div>
```

## The ng-hide Directive

The **ng-hide** directive hides or shows an HTML element.

### AngularJS Example

```html
<div ng-app="">
  <p ng-hide="true">I am not visible.</p>

  <p ng-hide="false">I am visible.</p>
</div>
```
