---
name: git-collaboration-workflow
description: "Git team collaboration patterns. Use when: working with pull requests, code reviews, forking workflows, upstream syncing, shared repository practices. DO NOT USE FOR: conflict resolution (use git-conflict-resolution), commit message formatting (use git-commit-conventions)."
---

# Git Collaboration Workflow Skill

## Overview

Covers team collaboration patterns including PR workflows, forking, upstream syncing, and code review practices.

---

## 1. Pull Request Workflow

### Standard flow

```bash
# 1. Create feature branch
git switch -c feature/my-feature

# 2. Make changes and commit
git add .
git commit -m "feat: add new feature"

# 3. Push to remote
git push -u origin feature/my-feature

# 4. Create PR (via GitHub CLI)
gh pr create --title "feat: add new feature" --body "Description here"

# 5. After review, merge via GitHub UI or CLI
gh pr merge <number> --squash
```

### Keep branch up to date with main

```bash
git switch feature/my-feature
git fetch origin
git rebase origin/main
# Or merge:
git merge origin/main
```

### Review a PR locally

```bash
gh pr checkout <number>
# Or manually:
git fetch origin pull/<number>/head:pr-<number>
git switch pr-<number>
```

---

## 2. Fork Workflow

Used for open source contributions.

```bash
# 1. Fork on GitHub, then clone your fork
git clone <your-fork-url>
cd <repo>

# 2. Add upstream remote
git remote add upstream <original-repo-url>

# 3. Create feature branch
git switch -c fix/typo-in-docs

# 4. Work and commit
git commit -am "fix: correct typo in README"

# 5. Push to your fork
git push -u origin fix/typo-in-docs

# 6. Open PR from fork to upstream via GitHub
```

### Sync fork with upstream

```bash
git fetch upstream
git switch main
git merge upstream/main
git push origin main
```

---

## 3. Code Review Best Practices

### As a reviewer

- Pull the branch locally if needed: `gh pr checkout <number>`
- Run tests before approving
- Use inline comments for specific feedback
- Approve, request changes, or comment

```bash
gh pr review <number> --approve
gh pr review <number> --request-changes --body "Please fix X"
gh pr review <number> --comment --body "Looks good overall"
```

### As an author

- Keep PRs small and focused (< 400 lines ideally)
- Write clear PR descriptions
- Respond to all review comments
- Push fixes as new commits (easier to re-review), squash on merge

---

## 4. Shared Repository Practices

### Protect the main branch

- Require PR reviews before merging
- Require status checks (CI) to pass
- Prevent force pushes to main
- Require branches to be up to date before merging

### Keep history clean

```bash
# Squash merge (one commit per feature)
gh pr merge <number> --squash

# Or rebase merge (linear history)
gh pr merge <number> --rebase
```

### Clean up merged branches

```bash
# Delete local merged branches
git branch --merged main | grep -v main | xargs git branch -d

# Delete remote branch
git push origin --delete feature/old-branch

# Prune stale remote-tracking branches
git fetch --prune
```

---

## 5. Useful GitHub CLI Commands

```bash
gh pr list                          # list open PRs
gh pr status                        # your PR status
gh pr view <number>                 # view PR details
gh pr diff <number>                 # view PR diff
gh pr checks <number>               # view CI status
gh issue list                       # list issues
gh issue create --title "Bug" --body "Details"
```

---

## 6. Quick Reference

| Action                 | Command                                           |
| ---------------------- | ------------------------------------------------- |
| Create PR              | `gh pr create --title "..." --body "..."`         |
| Checkout PR locally    | `gh pr checkout <number>`                         |
| Sync fork              | `git fetch upstream && git merge upstream/main`   |
| Squash merge PR        | `gh pr merge <number> --squash`                   |
| Delete merged branches | `git branch --merged main \| xargs git branch -d` |
| Review PR              | `gh pr review <number> --approve`                 |
