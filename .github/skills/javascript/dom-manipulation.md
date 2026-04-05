---
name: javascript-dom-manipulation
description: "JavaScript DOM manipulation — selecting elements, modifying content/attributes/styles, creating/removing elements, event handling, delegation, and DOM traversal. Use when: manipulating the DOM; handling user events; building UI without a framework. DO NOT USE FOR: browser APIs like fetch/storage (use javascript-browser-apis); framework-specific patterns."
---

# JavaScript DOM Manipulation

## 1. Selecting Elements

```javascript
// Single element
const el = document.getElementById("app");
const el = document.querySelector(".card:first-child");

// Multiple elements (returns NodeList)
const items = document.querySelectorAll(".item");
items.forEach((item) => {
  /* ... */
});

// Convert to array for full array methods
const arr = [...document.querySelectorAll("li")];
const filtered = arr.filter((li) => li.classList.contains("active"));

// Closest ancestor
const card = button.closest(".card");
```

---

## 2. Modifying Content

```javascript
// Text content (safe, no HTML parsing)
el.textContent = "Hello World";

// HTML content (⚠️ XSS risk with user input)
el.innerHTML = "<strong>Bold</strong>";

// Outer HTML (replaces element itself)
el.outerHTML = "<div>Replaced</div>";
```

---

## 3. Attributes & Data

```javascript
// Standard attributes
el.getAttribute("href");
el.setAttribute("href", "/new-path");
el.removeAttribute("disabled");
el.hasAttribute("disabled");

// Direct property access (preferred for standard attrs)
el.id = "main";
el.hidden = true;
input.value = "text";
input.checked = true;

// Data attributes
// <div data-user-id="42" data-role="admin">
el.dataset.userId; // "42"
el.dataset.role; // "admin"
el.dataset.status = "active"; // sets data-status="active"
```

---

## 4. Classes & Styles

```javascript
// ClassList API
el.classList.add("active", "visible");
el.classList.remove("hidden");
el.classList.toggle("open"); // Add/remove
el.classList.toggle("open", true); // Force add
el.classList.contains("active"); // true/false
el.classList.replace("old", "new");

// Inline styles
el.style.color = "red";
el.style.backgroundColor = "#fff"; // camelCase
el.style.cssText = "color: red; font-size: 16px;"; // Bulk set

// Computed styles (read-only, includes CSS)
const styles = getComputedStyle(el);
styles.getPropertyValue("font-size"); // "16px"

// CSS custom properties
el.style.setProperty("--primary", "#007bff");
getComputedStyle(el).getPropertyValue("--primary");
```

---

## 5. Creating & Removing Elements

```javascript
// Create
const div = document.createElement("div");
div.className = "card";
div.textContent = "New card";

// Insert
parent.appendChild(div);
parent.prepend(div); // First child
parent.append(div, "text", otherEl); // Multiple items
ref.before(div); // Before sibling
ref.after(div); // After sibling
parent.insertBefore(div, ref); // Before reference

// Replace
parent.replaceChild(newEl, oldEl);
oldEl.replaceWith(newEl);

// Remove
el.remove();
parent.removeChild(el);

// Clone
const clone = el.cloneNode(true); // true = deep clone

// DocumentFragment — batch insert (1 reflow)
const frag = document.createDocumentFragment();
items.forEach((text) => {
  const li = document.createElement("li");
  li.textContent = text;
  frag.appendChild(li);
});
list.appendChild(frag);

// Template literals + insertAdjacentHTML
el.insertAdjacentHTML(
  "beforeend",
  `
  <div class="card">
    <h3>${title}</h3>
    <p>${body}</p>
  </div>
`,
);
// Positions: "beforebegin" | "afterbegin" | "beforeend" | "afterend"
```

---

## 6. Event Handling

```javascript
// Add/remove listeners
function handleClick(e) {
  console.log(e.target);
}
el.addEventListener("click", handleClick);
el.removeEventListener("click", handleClick);

// Options
el.addEventListener("click", handler, {
  once: true, // Auto-remove after first call
  passive: true, // Won't call preventDefault (perf optimization for scroll/touch)
  capture: true, // Fire during capture phase
  signal: controller.signal, // Abort to remove
});

// Event object
el.addEventListener("click", (e) => {
  e.target; // Element that triggered event
  e.currentTarget; // Element listener is attached to
  e.preventDefault(); // Prevent default behavior
  e.stopPropagation(); // Stop bubbling
  e.type; // "click"
});

// Common events
// click, dblclick, mouseenter, mouseleave, mousemove
// keydown, keyup, keypress (deprecated)
// input, change, focus, blur, submit
// scroll, resize, load, DOMContentLoaded
```

---

## 7. Event Delegation

```javascript
// Instead of attaching listeners to every child — attach one to parent
document.querySelector(".todo-list").addEventListener("click", (e) => {
  // Delete button clicked
  if (e.target.matches(".delete-btn")) {
    e.target.closest(".todo-item").remove();
  }
  // Toggle complete
  if (e.target.matches(".toggle-btn")) {
    e.target.closest(".todo-item").classList.toggle("completed");
  }
});

// Works for dynamically added elements too
```

---

## 8. DOM Traversal

```javascript
// Parent
el.parentElement;
el.closest(".container"); // Nearest ancestor matching selector

// Children
el.children; // HTMLCollection (elements only)
el.childNodes; // NodeList (includes text nodes)
el.firstElementChild;
el.lastElementChild;
el.childElementCount;

// Siblings
el.nextElementSibling;
el.previousElementSibling;

// Check
el.contains(child); // Is child a descendant?
el.matches(".active"); // Does element match selector?
```

---

## 9. Dimensions & Scrolling

```javascript
// Element dimensions
el.offsetWidth / el.offsetHeight; // Includes border + padding
el.clientWidth / el.clientHeight; // Padding only (no border/scrollbar)
el.scrollWidth / el.scrollHeight; // Full content size
el.getBoundingClientRect(); // { top, left, width, height, ... }

// Scroll
el.scrollTop; // Current scroll position
el.scrollTo({ top: 0, behavior: "smooth" });
el.scrollIntoView({ behavior: "smooth", block: "center" });

// Viewport
window.innerWidth / window.innerHeight;
window.scrollX / window.scrollY;
```

---

## 10. Best Practices

- **Use `textContent`** over `innerHTML` to prevent XSS
- **Use event delegation** for lists and dynamic content
- **Batch DOM changes** with `DocumentFragment` or `requestAnimationFrame`
- **Use `closest()`** instead of manual parent traversal
- **Use `dataset`** for custom data instead of non-standard attributes
- **Use `classList`** instead of manually manipulating `className` strings
- **Minimize reflows** — read all dimensions first, then write all changes
- **Use `passive: true`** for scroll/touch listeners for better performance
- **Remove listeners** when elements are removed to prevent memory leaks
