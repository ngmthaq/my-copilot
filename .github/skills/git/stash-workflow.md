---
name: git-stash-workflow
description: "Git stash for temporarily saving work. Use when: stashing uncommitted changes, switching branches with pending work, managing multiple stashes, applying/dropping stashes. DO NOT USE FOR: committing changes (use git-basic-commands)."
---

# Git Stash Workflow Skill

## Overview

Covers using `git stash` to temporarily save and restore uncommitted changes.

---

## 1. Basic Stash Operations

```bash
git stash                          # stash tracked modified files + staged
git stash -u                       # also stash untracked files
git stash -a                       # also stash ignored files
git stash push -m "description"    # stash with a message
```

---

## 2. Listing Stashes

```bash
git stash list
# Example output:
# stash@{0}: On feature: WIP login form
# stash@{1}: On main: debugging auth issue
```

---

## 3. Restoring Stashes

```bash
git stash pop                      # apply latest stash + remove it
git stash apply                    # apply latest stash, keep in list
git stash pop stash@{2}            # apply specific stash + remove
git stash apply stash@{2}          # apply specific stash, keep in list
```

---

## 4. Viewing Stash Contents

```bash
git stash show                     # summary of latest stash
git stash show -p                  # full diff of latest stash
git stash show stash@{1}           # summary of specific stash
git stash show -p stash@{1}        # full diff of specific stash
```

---

## 5. Removing Stashes

```bash
git stash drop                     # remove latest stash
git stash drop stash@{2}           # remove specific stash
git stash clear                    # remove ALL stashes (careful!)
```

---

## 6. Stashing Specific Files

```bash
git stash push -m "message" <file1> <file2>
git stash push -m "just the config" config/settings.json
```

---

## 7. Creating a Branch from Stash

```bash
git stash branch <new-branch>              # from latest stash
git stash branch <new-branch> stash@{1}    # from specific stash
```

This creates a new branch, checks out the commit where the stash was made, applies the stash, and drops it.

---

## 8. Common Patterns

### Switch branches with pending work

```bash
git stash -u
git switch other-branch
# ... do work ...
git switch original-branch
git stash pop
```

### Pull with uncommitted changes

```bash
git stash
git pull --rebase
git stash pop
```

### Test something quickly on a clean tree

```bash
git stash -u
# ... test on clean state ...
git stash pop
```

---

## 9. Quick Reference

| Action             | Command                   |
| ------------------ | ------------------------- |
| Stash changes      | `git stash`               |
| Stash with message | `git stash push -m "msg"` |
| Include untracked  | `git stash -u`            |
| List stashes       | `git stash list`          |
| Apply + remove     | `git stash pop`           |
| Apply + keep       | `git stash apply`         |
| View diff          | `git stash show -p`       |
| Drop stash         | `git stash drop`          |
| Clear all          | `git stash clear`         |
| Branch from stash  | `git stash branch <name>` |
