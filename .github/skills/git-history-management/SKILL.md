---
name: git-history-management
description: "Git history rewriting and management. Use when: interactive rebase, squashing commits, editing commit history, bisecting bugs, reflog recovery, cleaning up history before merge. DO NOT USE FOR: basic log viewing (use git-basic-commands), merge/rebase strategy (use git-merge-rebase)."
---

# Git History Management Skill

## Overview

Covers techniques for rewriting, searching, and managing Git commit history.

---

## 1. Interactive Rebase

```bash
git rebase -i HEAD~<n>        # last n commits
git rebase -i <commit>        # everything after <commit>
```

### Rebase commands

| Command  | Effect                                       |
| -------- | -------------------------------------------- |
| `pick`   | Keep commit as-is                            |
| `reword` | Keep commit, edit message                    |
| `edit`   | Pause to amend the commit                    |
| `squash` | Merge into previous commit (keep message)    |
| `fixup`  | Merge into previous commit (discard message) |
| `drop`   | Remove commit                                |

---

## 2. Squashing Commits

```bash
# Via interactive rebase
git rebase -i HEAD~3
# Mark commits as 'squash' or 'fixup'

# Via soft reset
git reset --soft HEAD~3
git commit -m "feat: combined feature"

# Via merge
git merge --squash feature/branch
git commit -m "feat: add feature"
```

---

## 3. Git Bisect (Find Bug-Introducing Commit)

```bash
git bisect start
git bisect bad                 # current commit is bad
git bisect good <known-good>   # mark a known good commit

# Test each checkout, then mark:
git bisect good   # or
git bisect bad

# When done:
git bisect reset

# Automated:
git bisect run npm test
```

---

## 4. Git Reflog (Recovery)

```bash
git reflog                     # show all HEAD movements
```

### Recover deleted commits or branches

```bash
git reflog
# Find the lost commit hash
git switch -c recovered-branch <reflog-hash>
# Or reset to it:
git reset --hard <reflog-hash>
```

---

## 5. Cherry-Pick

```bash
git cherry-pick <commit>
git cherry-pick <c1> <c2>               # multiple commits
git cherry-pick --no-commit <commit>     # apply without committing
```

---

## 6. Revert vs Reset

| Method   | Effect                       | Safe for shared branches? |
| -------- | ---------------------------- | ------------------------- |
| `revert` | Creates new undo commit      | Yes                       |
| `reset`  | Moves HEAD, rewrites history | No (local only)           |

```bash
git revert <commit>
git reset --soft HEAD~1        # undo commit, keep staged
git reset --mixed HEAD~1       # undo commit, keep unstaged
git reset --hard HEAD~1        # undo commit, discard changes
```

---

## 7. Cleaning Up Before Merge

```bash
git fetch origin
git rebase -i origin/main
# Squash WIP commits, reword messages
git push --force-with-lease    # always use over --force
```

---

## 8. Quick Reference

| Action             | Command                                 |
| ------------------ | --------------------------------------- |
| Interactive rebase | `git rebase -i HEAD~<n>`                |
| Squash last N      | `git reset --soft HEAD~N && git commit` |
| Amend last commit  | `git commit --amend`                    |
| Bisect             | `git bisect start/bad/good`             |
| Reflog             | `git reflog`                            |
| Cherry-pick        | `git cherry-pick <commit>`              |
| Revert             | `git revert <commit>`                   |
| Safe force push    | `git push --force-with-lease`           |
