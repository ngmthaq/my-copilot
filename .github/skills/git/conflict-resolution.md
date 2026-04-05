---
name: git-conflict-resolution
description: "Git merge conflict resolution techniques. Use when: resolving merge conflicts, understanding conflict markers, handling conflicts during rebase/merge/cherry-pick, preventing conflicts. DO NOT USE FOR: merge vs rebase strategy (use git-merge-rebase)."
---

# Git Conflict Resolution Skill

## Overview

Covers how to identify, understand, and resolve Git merge conflicts in various scenarios.

---

## 1. Understanding Conflict Markers

When a conflict occurs, Git marks the file:

```
<<<<<<< HEAD
your changes (current branch)
=======
their changes (incoming branch)
>>>>>>> feature/branch-name
```

---

## 2. Resolving Conflicts During Merge

```bash
# Start the merge
git merge feature/branch

# Conflict occurs — check which files
git status

# Edit conflicted files, remove markers, keep desired code
# Then mark as resolved
git add <resolved-file>

# Complete the merge
git commit

# Or abort the merge entirely
git merge --abort
```

---

## 3. Resolving Conflicts During Rebase

```bash
git rebase main

# Conflict occurs — resolve the file
git add <resolved-file>
git rebase --continue

# Or skip this commit
git rebase --skip

# Or abort
git rebase --abort
```

---

## 4. Resolving Conflicts During Cherry-Pick

```bash
git cherry-pick <commit>

# On conflict:
git add <resolved-file>
git cherry-pick --continue

# Or abort
git cherry-pick --abort
```

---

## 5. Choosing a Side (Theirs vs Ours)

```bash
# Keep our version for a file
git checkout --ours <file>
git add <file>

# Keep their version for a file
git checkout --theirs <file>
git add <file>

# Merge strategy — accept one side for all conflicts
git merge -X ours feature/branch
git merge -X theirs feature/branch
```

> **Note:** During rebase, `--ours` and `--theirs` are swapped because rebase replays your commits onto the target.

---

## 6. Using Merge Tools

```bash
git mergetool                      # use configured tool
git mergetool --tool=vimdiff       # use specific tool
git config --global merge.tool vimdiff
```

---

## 7. Preventing Conflicts

- Pull frequently — keep branches up to date
- Keep branches short-lived
- Communicate with team on shared files
- Make small, focused commits

```bash
# Dry-run a merge to check for conflicts
git merge --no-commit --no-ff feature/branch
git merge --abort
```

---

## 8. Quick Reference

| Scenario             | Resolve & Continue                             | Abort                     |
| -------------------- | ---------------------------------------------- | ------------------------- |
| Merge conflict       | `git add <file> && git commit`                 | `git merge --abort`       |
| Rebase conflict      | `git add <file> && git rebase --continue`      | `git rebase --abort`      |
| Cherry-pick conflict | `git add <file> && git cherry-pick --continue` | `git cherry-pick --abort` |
| Keep ours            | `git checkout --ours <file>`                   | —                         |
| Keep theirs          | `git checkout --theirs <file>`                 | —                         |
