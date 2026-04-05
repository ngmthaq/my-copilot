---
name: git-merge-rebase
description: "Git merge and rebase strategies. Use when: choosing between merge and rebase, performing merges, rebasing branches, understanding fast-forward vs no-ff, maintaining linear history. DO NOT USE FOR: resolving conflicts (use git-conflict-resolution), interactive rebase for history cleanup (use git-history-management)."
---

# Git Merge & Rebase Skill

## Overview

Covers merge and rebase mechanics, when to use each, and strategies for clean Git history.

---

## 1. Git Merge

Combines branches by creating a merge commit.

```bash
git merge <branch>                # merge branch into current
git merge --no-ff <branch>        # force merge commit (no fast-forward)
git merge --ff-only <branch>      # only merge if fast-forward possible
git merge --squash <branch>       # squash all commits into one (no merge commit)
git merge --abort                 # abort an in-progress merge
```

### Merge types

```
# Fast-forward (linear, no merge commit)
main:     A──B
feature:        C──D
result:   A──B──C──D

# No fast-forward (merge commit created)
main:     A──B──────M
feature:     \     /
              C──D

# Squash merge (single commit, no branch history)
main:     A──B──S
```

---

## 2. Git Rebase

Replays commits on top of another branch.

```bash
git rebase <branch>               # rebase current onto <branch>
git rebase origin/main            # rebase onto remote main
git rebase --onto <new> <old>     # transplant commits
git rebase --abort                # abort in-progress rebase
git rebase --continue             # continue after conflict resolution
```

### How rebase works

```
# Before rebase
main:     A──B──E
feature:     \
              C──D

# After: git switch feature && git rebase main
main:     A──B──E
feature:          \
                   C'──D'
```

---

## 3. Merge vs Rebase

| Aspect            | Merge                    | Rebase                 |
| ----------------- | ------------------------ | ---------------------- |
| History           | Preserves branch history | Linear history         |
| Merge commits     | Yes                      | No                     |
| Conflict handling | Once                     | Per commit             |
| Safe for shared?  | Yes                      | No (rewrites history)  |
| Best for          | Shared/public branches   | Local/feature branches |

### Golden rule

> **Never rebase commits that have been pushed and shared with others.**

---

## 4. Common Workflows

### Keep feature branch up to date (rebase)

```bash
git switch feature/my-feature
git fetch origin
git rebase origin/main
# Resolve any conflicts
git push --force-with-lease    # needed because history changed
```

### Keep feature branch up to date (merge)

```bash
git switch feature/my-feature
git fetch origin
git merge origin/main
git push
```

### Merge feature into main

```bash
git switch main
git pull
git merge --no-ff feature/my-feature
git push
```

---

## 5. Rebase --onto (Advanced)

Transplant a range of commits onto a new base.

```bash
# Move feature2 (which branched off feature1) onto main
git rebase --onto main feature1 feature2
```

```
# Before
main:      A──B
feature1:      \──C──D
feature2:              \──E──F

# After: git rebase --onto main feature1 feature2
main:      A──B
feature2:      \──E'──F'
```

---

## 6. Merge Strategies

```bash
git merge -s recursive <branch>    # default strategy
git merge -s ours <branch>         # keep our tree entirely
git merge -X ours <branch>         # auto-resolve conflicts with ours
git merge -X theirs <branch>       # auto-resolve conflicts with theirs
```

---

## 7. Best Practices

- **Use rebase** to keep feature branches up to date with main
- **Use merge** to integrate feature branches into main
- **Use `--no-ff`** when merging to main (preserves feature branch context)
- **Use `--force-with-lease`** after rebasing (never `--force`)
- **Squash merge** for clean single-commit features on main
- **Don't rebase** shared/public branches

---

## 8. Quick Reference

| Action                    | Command                         |
| ------------------------- | ------------------------------- |
| Merge (with merge commit) | `git merge --no-ff <branch>`    |
| Fast-forward merge only   | `git merge --ff-only <branch>`  |
| Squash merge              | `git merge --squash <branch>`   |
| Rebase onto main          | `git rebase origin/main`        |
| Rebase onto (transplant)  | `git rebase --onto <new> <old>` |
| Abort merge               | `git merge --abort`             |
| Abort rebase              | `git rebase --abort`            |
| Push after rebase         | `git push --force-with-lease`   |
