---
name: security-scanner
description: Language-agnostic security scanner covering dependencies (SCA), code patterns (SAST), and application-layer vulnerabilities (XSS, CSRF, SQLi, Prompt Injection, etc.), with concrete vulnerable and secure code examples.
---

---

# 🔐 Security Scanner Skill

## Purpose

Provide a reproducible, language-agnostic workflow to:

1. Detect dependency vulnerabilities (SCA)
2. Detect code-level issues (SAST)
3. Perform deep semantic security analysis (AppSec + AI security)
4. Produce actionable findings with remediation steps

---

## Scope

- Workspace-wide (monorepo supported)
- Language-agnostic (Node.js, Python, Java, Go, .NET, etc.)
- Framework-agnostic (web, backend, mobile, AI systems)

---

## Security Coverage + Examples

---

### 1. Dependency Vulnerabilities (SCA)

#### ❌ Vulnerable

```json
{
  "dependencies": {
    "lodash": "4.17.15"
  }
}
```

#### ✅ Fixed

```json
{
  "dependencies": {
    "lodash": "^4.17.21"
  }
}
```

---

### 2. Code-Level Issues (SAST)

#### ❌ Unsafe execution

```js
eval(userInput);
```

#### ✅ Safe

```js
// Avoid eval entirely
const parsed = JSON.parse(userInput);
```

---

#### ❌ Hardcoded secret

```python
API_KEY = "sk-123456"
```

#### ✅ Safe

```python
API_KEY = os.getenv("API_KEY")
```

---

### 3. Application Security (AppSec)

---

#### SQL Injection

❌ Vulnerable

```js
const query = "SELECT * FROM users WHERE id = " + userId;
```

✅ Safe

```js
db.query("SELECT * FROM users WHERE id = ?", [userId]);
```

---

#### XSS

❌ Vulnerable

```jsx
<div dangerouslySetInnerHTML={{ __html: userInput }} />
```

✅ Safe

```jsx
<div>{userInput}</div>
```

---

#### CSRF

❌ Vulnerable

```http
POST /transfer
(no CSRF token)
```

✅ Safe

```http
POST /transfer
X-CSRF-Token: <token>
```

---

#### Command Injection

❌ Vulnerable

```python
os.system("rm -rf " + userInput)
```

✅ Safe

```python
subprocess.run(["rm", "-rf", safe_path])
```

---

#### Broken Authorization

❌ Vulnerable

```js
app.get("/admin", (req, res) => {
  res.send("admin data");
});
```

✅ Safe

```js
app.get("/admin", authMiddleware("admin"), handler);
```

---

### 4. API Security

#### ❌ Mass Assignment

```js
User.create(req.body);
```

#### ✅ Safe

```js
User.create({
  name: req.body.name,
  email: req.body.email,
});
```

---

#### ❌ Missing validation

```js
app.post("/user", (req) => save(req.body));
```

#### ✅ Safe

```js
validate(schema, req.body);
```

---

### 5. AI / LLM Security

---

#### Prompt Injection

❌ Vulnerable

```js
const prompt = "System: You are safe\nUser: " + userInput;
```

✅ Safe

```js
const prompt = [
  { role: "system", content: "You are safe" },
  { role: "user", content: sanitize(userInput) },
];
```

---

#### Tool Injection

❌ Vulnerable

```js
agent.run(userInput); // directly executes tools
```

✅ Safe

```js
if (isAllowedTool(action)) {
  execute(action);
}
```

---

#### Data Exfiltration

❌ Vulnerable

```js
return llm("Summarize: " + secretData);
```

✅ Safe

```js
return llm("Summarize: " + redact(secretData));
```

---

## Step-by-Step Process

---

### Phase 1 — Project Discovery

Detect:

- Languages
- Lockfiles
- Frameworks
- Entry points

---

### Phase 2 — Dependency Scanning (SCA)

#### Example Commands

```bash
npm audit --json
pip-audit --format=json
dotnet list package --vulnerable
govulncheck ./...
```

---

### Phase 3 — Code Scanning (SAST)

#### Example (Semgrep)

```bash
semgrep --config=auto .
```

---

### Phase 4 — Deep Security Audit

#### Data Flow Model

```text
input → processing → sink
```

#### Example

❌ Vulnerable flow

```js
req.query.q → string concat → SQL query
```

✅ Safe flow

```js
req.query.q → validation → parameterized query
```

---

### Phase 5 — Risk Evaluation

| Severity | Criteria                    |
| -------- | --------------------------- |
| CRITICAL | Remote exploit, high impact |
| HIGH     | Realistic attack vector     |
| MEDIUM   | Limited scope               |
| LOW      | Best practice issue         |

---

### Phase 6 — Safe Auto-Fix

#### Example

```bash
npm audit fix
```

---

### Phase 7 — Reporting

#### Finding Example

```text
[SEC-001] - SQL Injection
Severity: HIGH
Location: userService.js:42
Description: Unsanitized input used in SQL query
Impact: Data exfiltration
Fix: Use parameterized queries
```

---

## Output Formats

### JSON

```json
{
  "type": "vulnerability",
  "category": "SQL Injection",
  "severity": "HIGH",
  "location": "userService.js:42",
  "fix": "Use parameterized queries"
}
```

---

### Markdown Summary

- 2 Critical
- 5 High
- 3 Medium

Top Issues:

- SQL Injection in user service
- XSS in comment component

---

## Decision Rules

- Fail CI on CRITICAL
- Flag HIGH for review
- Mark uncertain → "Needs Manual Review"

---

## Example Prompts

- "Scan project and detect SQLi, XSS, CSRF, and prompt injection"
- "Run full security audit and fix safe issues"

---
