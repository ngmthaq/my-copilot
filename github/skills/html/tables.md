---
name: html-tables
description: "HTML data tables — table structure, headers, caption, scope, complex headers, accessible table patterns, responsive tables. Use when: displaying tabular data; associating headers with cells; making tables accessible; building responsive tables. DO NOT USE FOR: layout (use CSS Grid/Flexbox); decorative grids."
---

# HTML Data Tables

## 1. Basic Table Structure

```html
<table>
  <caption>
    Monthly expenses for Q1 2025
  </caption>
  <thead>
    <tr>
      <th scope="col">Month</th>
      <th scope="col">Rent</th>
      <th scope="col">Utilities</th>
      <th scope="col">Total</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">January</th>
      <td>$1,200</td>
      <td>$150</td>
      <td>$1,350</td>
    </tr>
    <tr>
      <th scope="row">February</th>
      <td>$1,200</td>
      <td>$130</td>
      <td>$1,330</td>
    </tr>
    <tr>
      <th scope="row">March</th>
      <td>$1,200</td>
      <td>$145</td>
      <td>$1,345</td>
    </tr>
  </tbody>
  <tfoot>
    <tr>
      <th scope="row">Total</th>
      <td>$3,600</td>
      <td>$425</td>
      <td>$4,025</td>
    </tr>
  </tfoot>
</table>
```

---

## 2. Table Elements Reference

| Element      | Purpose                              | Required?             |
| ------------ | ------------------------------------ | --------------------- |
| `<table>`    | Table container                      | Yes                   |
| `<caption>`  | Table title/description              | Strongly recommended  |
| `<thead>`    | Header row group                     | Recommended           |
| `<tbody>`    | Body row group                       | Recommended           |
| `<tfoot>`    | Footer row group (summaries, totals) | Optional              |
| `<tr>`       | Table row                            | Yes                   |
| `<th>`       | Header cell                          | Yes (for data tables) |
| `<td>`       | Data cell                            | Yes                   |
| `<colgroup>` | Column grouping (for styling)        | Optional              |
| `<col>`      | Individual column (within colgroup)  | Optional              |

---

## 3. Header Scope

```html
<!-- Column headers -->
<th scope="col">Name</th>

<!-- Row headers -->
<th scope="row">January</th>

<!-- Column group header -->
<th scope="colgroup" colspan="2">Contact Info</th>

<!-- Row group header -->
<th scope="rowgroup" rowspan="3">Q1</th>
```

### Rules

- Use `scope="col"` on column headers in `<thead>`.
- Use `scope="row"` on row headers (usually first cell in each row).
- Scope tells screen readers which cells a header applies to.

---

## 4. Complex Tables with `headers`/`id`

For tables where `scope` is insufficient (multi-level headers, irregular structure):

```html
<table>
  <caption>
    Sales by region and product
  </caption>
  <thead>
    <tr>
      <td></td>
      <th id="shoes" scope="col">Shoes</th>
      <th id="shirts" scope="col">Shirts</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th id="north" scope="row">North</th>
      <td headers="north shoes">500</td>
      <td headers="north shirts">320</td>
    </tr>
    <tr>
      <th id="south" scope="row">South</th>
      <td headers="south shoes">410</td>
      <td headers="south shirts">280</td>
    </tr>
  </tbody>
</table>
```

---

## 5. Spanning Cells

```html
<!-- Column span -->
<th colspan="3">Contact Information</th>

<!-- Row span -->
<th rowspan="4" scope="rowgroup">Q1 2025</th>

<!-- Example: multi-level headers -->
<table>
  <caption>
    Employee directory
  </caption>
  <thead>
    <tr>
      <th rowspan="2" scope="col">Name</th>
      <th colspan="2" scope="colgroup">Contact</th>
      <th rowspan="2" scope="col">Department</th>
    </tr>
    <tr>
      <th scope="col">Email</th>
      <th scope="col">Phone</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">Alice</th>
      <td>alice@co.com</td>
      <td>555-0101</td>
      <td>Engineering</td>
    </tr>
  </tbody>
</table>
```

---

## 6. Caption and Summary

```html
<!-- Visible caption (preferred) -->
<table>
  <caption>
    User accounts created in 2025
  </caption>
  ...
</table>

<!-- Caption with more detail -->
<table aria-describedby="table-desc">
  <caption>
    Quarterly revenue
  </caption>
  ...
</table>
<p id="table-desc">Revenue figures in USD, rounded to nearest thousand.</p>

<!-- If caption must be visually hidden -->
<table>
  <caption class="sr-only">
    Comparison of plan features
  </caption>
  ...
</table>
```

---

## 7. Column Styling

```html
<table>
  <colgroup>
    <col />
    <!-- default -->
    <col class="highlight" />
    <!-- styled column -->
    <col span="2" class="numeric" />
    <!-- two columns same style -->
  </colgroup>
  ...
</table>
```

---

## 8. Responsive Table Patterns

### Horizontal Scroll

```html
<div class="table-wrapper" role="region" aria-labelledby="table-caption" tabindex="0">
  <table>
    <caption id="table-caption">
      Wide data table
    </caption>
    ...
  </table>
</div>
```

```css
.table-wrapper {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}
```

### Stack on Mobile (CSS-only)

```css
@media (max-width: 640px) {
  table,
  thead,
  tbody,
  th,
  td,
  tr {
    display: block;
  }
  thead {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
  }
  td::before {
    content: attr(data-label);
    font-weight: bold;
    display: block;
  }
}
```

```html
<tr>
  <td data-label="Name">Alice</td>
  <td data-label="Email">alice@co.com</td>
  <td data-label="Role">Engineer</td>
</tr>
```

---

## 9. Sortable Tables (Accessible)

```html
<table>
  <thead>
    <tr>
      <th scope="col" aria-sort="ascending">
        <button>Name <span aria-hidden="true">▲</span></button>
      </th>
      <th scope="col" aria-sort="none">
        <button>Date <span aria-hidden="true">▲</span></button>
      </th>
    </tr>
  </thead>
  ...
</table>
```

- Use `aria-sort` values: `ascending`, `descending`, `none`.
- Sort buttons inside `<th>` — keeps the header clickable and keyboard-operable.

---

## 10. Anti-Patterns

| Anti-Pattern                                 | Fix                                                       |
| -------------------------------------------- | --------------------------------------------------------- |
| `<table>` used for page layout               | Use CSS Grid or Flexbox                                   |
| Data table without `<th>` elements           | Add `<th>` with `scope` for column/row headers            |
| Missing `<caption>`                          | Add `<caption>` to describe the table's purpose           |
| No `scope` on `<th>`                         | Add `scope="col"` or `scope="row"`                        |
| Using `<b>` / `<strong>` in `<td>` as header | Use `<th scope="row">` instead                            |
| Layout table without `role="presentation"`   | If layout table is unavoidable, add `role="presentation"` |
| Scrollable table without keyboard access     | Add `tabindex="0"` and `role="region"` to wrapper         |
| Spanning cells without `headers`/`id`        | Use `headers` attribute for complex multi-level tables    |
