---
name: javascript-browser-apis
description: "JavaScript browser APIs — Fetch, Storage, Web Workers, Intersection/Mutation/Resize Observers, Geolocation, Notifications, Clipboard, History, WebSockets, and performance APIs. Use when: making HTTP requests; using localStorage/sessionStorage; implementing observers; working with browser-specific APIs. DO NOT USE FOR: DOM manipulation (use javascript-dom-manipulation); async patterns (use javascript-async-programming)."
---

# JavaScript Browser APIs

## 1. Fetch API

```javascript
// GET
const res = await fetch("/api/users");
if (!res.ok) throw new Error(`HTTP ${res.status}`);
const data = await res.json();

// POST with JSON
const res = await fetch("/api/users", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name: "Alice", email: "alice@example.com" }),
});

// With timeout
const res = await fetch("/api/data", {
  signal: AbortSignal.timeout(5000),
});

// Upload file
const formData = new FormData();
formData.append("file", fileInput.files[0]);
await fetch("/api/upload", { method: "POST", body: formData });

// Stream response
const reader = res.body.getReader();
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  processChunk(value);
}
```

---

## 2. Storage APIs

```javascript
// localStorage — persists across sessions
localStorage.setItem("theme", "dark");
localStorage.getItem("theme"); // "dark"
localStorage.removeItem("theme");
localStorage.clear();

// sessionStorage — cleared when tab closes (same API)
sessionStorage.setItem("token", jwt);

// Store objects (must serialize)
localStorage.setItem("user", JSON.stringify(user));
const user = JSON.parse(localStorage.getItem("user"));

// Listen for storage changes (cross-tab)
window.addEventListener("storage", (e) => {
  console.log(e.key, e.oldValue, e.newValue);
});

// IndexedDB — structured data, large storage, async
const request = indexedDB.open("myDB", 1);
request.onupgradeneeded = (e) => {
  const db = e.target.result;
  db.createObjectStore("users", { keyPath: "id" });
};
request.onsuccess = (e) => {
  const db = e.target.result;
  const tx = db.transaction("users", "readwrite");
  tx.objectStore("users").add({ id: 1, name: "Alice" });
};
```

---

## 3. Web Workers

```javascript
// main.js — offload heavy computation
const worker = new Worker("worker.js");
worker.postMessage({ data: largeArray });
worker.onmessage = (e) => console.log("Result:", e.data);
worker.onerror = (e) => console.error("Error:", e.message);
worker.terminate();

// worker.js
self.onmessage = (e) => {
  const result = heavyComputation(e.data);
  self.postMessage(result);
};

// SharedWorker — shared across tabs
const shared = new SharedWorker("shared.js");
shared.port.start();
shared.port.postMessage("hello");
shared.port.onmessage = (e) => console.log(e.data);
```

---

## 4. Observers

```javascript
// IntersectionObserver — visibility detection (lazy load, infinite scroll)
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.src = entry.target.dataset.src; // lazy load
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1 },
);
document
  .querySelectorAll("img[data-src]")
  .forEach((img) => observer.observe(img));

// MutationObserver — watch DOM changes
const mutationObs = new MutationObserver((mutations) => {
  mutations.forEach((m) => console.log(m.type, m.target));
});
mutationObs.observe(document.body, {
  childList: true,
  subtree: true,
  attributes: true,
});

// ResizeObserver — watch element size changes
const resizeObs = new ResizeObserver((entries) => {
  for (const entry of entries) {
    const { width, height } = entry.contentRect;
    console.log(`${width}x${height}`);
  }
});
resizeObs.observe(element);
```

---

## 5. Geolocation

```javascript
// One-time position
navigator.geolocation.getCurrentPosition(
  (pos) => console.log(pos.coords.latitude, pos.coords.longitude),
  (err) => console.error(err.message),
  { enableHighAccuracy: true, timeout: 5000 },
);

// Watch position (continuous)
const watchId = navigator.geolocation.watchPosition(callback, errorCb);
navigator.geolocation.clearWatch(watchId);
```

---

## 6. Notifications & Permissions

```javascript
// Request permission
const perm = await Notification.requestPermission();
if (perm === "granted") {
  new Notification("Hello!", {
    body: "This is a notification",
    icon: "/icon.png",
  });
}

// Permissions API
const status = await navigator.permissions.query({ name: "geolocation" });
console.log(status.state); // "granted", "denied", "prompt"
status.onchange = () => console.log("Permission changed:", status.state);
```

---

## 7. Clipboard API

```javascript
// Write to clipboard
await navigator.clipboard.writeText("Copied text");

// Read from clipboard
const text = await navigator.clipboard.readText();

// Copy rich content
const blob = new Blob(["<b>Bold</b>"], { type: "text/html" });
await navigator.clipboard.write([new ClipboardItem({ "text/html": blob })]);
```

---

## 8. History & URL

```javascript
// Push state (no page reload)
history.pushState({ page: 2 }, "", "/page/2");
history.replaceState({ page: 2 }, "", "/page/2");

// Listen for back/forward
window.addEventListener("popstate", (e) => {
  console.log("State:", e.state);
});

// URL API
const url = new URL("https://example.com/path?q=test&page=1");
url.searchParams.get("q"); // "test"
url.searchParams.set("page", "2");
url.searchParams.append("tag", "js");
url.toString(); // "https://example.com/path?q=test&page=2&tag=js"

// URLSearchParams
const params = new URLSearchParams(window.location.search);
params.get("q");
```

---

## 9. WebSocket

```javascript
const ws = new WebSocket("wss://example.com/socket");

ws.onopen = () =>
  ws.send(JSON.stringify({ type: "subscribe", channel: "chat" }));
ws.onmessage = (e) => console.log(JSON.parse(e.data));
ws.onerror = (e) => console.error("WebSocket error:", e);
ws.onclose = (e) => console.log(`Closed: ${e.code} ${e.reason}`);

// Send only when open
if (ws.readyState === WebSocket.OPEN) {
  ws.send(data);
}
```

---

## 10. Performance APIs

```javascript
// Measure execution time
performance.mark("start");
doWork();
performance.mark("end");
performance.measure("doWork", "start", "end");
const duration = performance.getEntriesByName("doWork")[0].duration;

// Navigation timing
const nav = performance.getEntriesByType("navigation")[0];
console.log("DOM loaded:", nav.domContentLoadedEventEnd - nav.startTime);

// Resource timing
performance.getEntriesByType("resource").forEach((r) => {
  console.log(`${r.name}: ${r.duration}ms`);
});

// requestIdleCallback — run during idle periods
requestIdleCallback((deadline) => {
  while (deadline.timeRemaining() > 0) {
    doLowPriorityWork();
  }
});

// requestAnimationFrame — sync with display refresh
function animate() {
  updatePosition();
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);
```

---

## 11. Other Useful APIs

```javascript
// Broadcast Channel — cross-tab communication
const bc = new BroadcastChannel("app");
bc.postMessage({ type: "logout" });
bc.onmessage = (e) => handleMessage(e.data);

// Structured Clone
const deep = structuredClone(complexObject);

// Blob & File
const blob = new Blob(["Hello"], { type: "text/plain" });
const url = URL.createObjectURL(blob);
// Remember to revoke: URL.revokeObjectURL(url)

// Crypto
const uuid = crypto.randomUUID();
const array = new Uint8Array(16);
crypto.getRandomValues(array);
```
