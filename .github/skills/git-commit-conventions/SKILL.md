---
name: git-commit-conventions
description: "Git commit message conventions and best practices. Use when: writing commit messages, setting up Conventional Commits, structuring commit history, writing multi-line commits. DO NOT USE FOR: git hooks enforcement (use git-hooks-automation)."
---

# Git Commit Conventions Skill

## Overview

Covers commit message formats, Conventional Commits specification, and best practices for clear commit history.

---

## 1. Conventional Commits

The most widely adopted format. Used by Angular, Vue, and many open-source projects.

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

| Type       | Description                    |
| ---------- | ------------------------------ |
| `feat`     | New feature                    |
| `fix`      | Bug fix                        |
| `docs`     | Documentation only             |
| `style`    | Formatting, no code change     |
| `refactor` | Code change, no feature or fix |
| `perf`     | Performance improvement        |
| `test`     | Adding or updating tests       |
| `build`    | Build system or dependencies   |
| `ci`       | CI configuration               |
| `chore`    | Maintenance tasks              |
| `revert`   | Revert a previous commit       |

### Examples

```bash
git commit -m "feat(auth): add JWT token refresh"
git commit -m "fix(api): handle null response from payment service"
git commit -m "docs: update API endpoint documentation"
git commit -m "refactor(utils): simplify date formatting logic"
git commit -m "test(auth): add unit tests for login flow"
```

---

## 2. Multi-line Commit Messages

```bash
# Using editor
git commit
# Opens $EDITOR for multi-line message

# Using -m flags
git commit -m "feat(auth): add password reset flow" \
           -m "Implements email-based password reset with token expiration." \
           -m "Closes #42"

# Using heredoc
git commit -m "$(cat <<'EOF'
feat(auth): add password reset flow

Implements email-based password reset with token expiration.
Tokens expire after 24 hours. Rate limited to 3 requests per hour.

Closes #42
EOF
)"
```

---

## 3. Writing Good Commit Messages

### Subject line rules

- Use imperative mood: "add feature" not "added feature"
- Keep under 50 characters (72 max)
- Don't end with a period
- Capitalize the first word (after type prefix)

### Body rules

- Separate from subject with a blank line
- Wrap at 72 characters
- Explain **what** and **why**, not **how**

### Good vs bad

```bash
# Good
git commit -m "fix(cart): prevent duplicate items on rapid clicks"
git commit -m "feat(search): add fuzzy matching for product names"

# Bad
git commit -m "fix bug"
git commit -m "update code"
git commit -m "WIP"
git commit -m "asdf"
```

---

## 4. Breaking Changes

```bash
# In type prefix
git commit -m "feat!: remove deprecated API endpoints"

# In footer
git commit -m "$(cat <<'EOF'
feat(api): change authentication to OAuth2

Migrate from API key authentication to OAuth2.

BREAKING CHANGE: API key authentication is no longer supported.
All clients must use OAuth2 bearer tokens.
EOF
)"
```

---

## 5. Referencing Issues

```bash
# Close an issue
git commit -m "fix(login): validate email format - Closes #123"

# Reference without closing
git commit -m "refactor(auth): extract token logic - Ref #456"

# Multiple issues
git commit -m "feat(dashboard): add analytics widget - Closes #10, Closes #12"
```

---

## 6. Commit Frequency Guidelines

- **Commit often**: each commit should be one logical change
- **Atomic commits**: each commit should compile and pass tests
- **Don't mix concerns**: separate formatting changes from logic changes
- **Squash WIP commits** before merging to main

```bash
# Interactive rebase to clean up commits before PR
git rebase -i HEAD~3
# Mark commits as squash (s) or fixup (f)
```

---

## 7. Quick Reference

| Pattern         | Example                                 |
| --------------- | --------------------------------------- |
| Feature         | `feat(scope): add X`                    |
| Bug fix         | `fix(scope): handle edge case in X`     |
| Breaking change | `feat!: remove deprecated X`            |
| With body       | `git commit` (use editor)               |
| Close issue     | `fix(scope): description - Closes #123` |
| Scoped          | `feat(auth): description`               |
| Unscoped        | `docs: update README`                   |
