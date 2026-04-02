---
name: git-branching-strategies
description: "Git branching models and strategies. Use when: choosing a branching workflow, setting up Git Flow / GitHub Flow / trunk-based development, creating feature/release/hotfix branches. DO NOT USE FOR: merge/rebase mechanics (use git-merge-rebase), or basic branch commands (use git-basic-commands)."
---

# Git Branching Strategies Skill

## Overview

Covers common branching models, when to use each, and how to implement them.

---

## 1. Branch Basics

```bash
git branch                      # list local branches
git branch -a                   # list all (local + remote)
git branch <name>               # create branch
git checkout <name>             # switch branch
git checkout -b <name>          # create + switch
git switch <name>               # switch (modern)
git switch -c <name>            # create + switch (modern)
git branch -d <name>            # delete (safe)
git branch -D <name>            # delete (force)
git push origin --delete <name> # delete remote branch
git branch -m <old> <new>       # rename branch
```

---

## 2. GitHub Flow (Recommended for Most Teams)

Simple, lightweight model ideal for continuous delivery.

**Branches:** `main` + short-lived feature branches.

```
main ─────●─────●─────●─────●─────
            \         /
feature/x    ●───●───●
```

### Workflow

1. Create a feature branch from `main`
2. Make commits on the feature branch
3. Open a pull request
4. Code review + CI passes
5. Merge to `main` (squash or merge commit)
6. Delete the feature branch

```bash
git switch -c feature/add-login
# ... work and commit ...
git push -u origin feature/add-login
# Open PR, review, merge via GitHub
git switch main && git pull
git branch -d feature/add-login
```

### Best for

- Teams practicing continuous delivery
- SaaS / web applications
- Small to medium teams

---

## 3. Git Flow

Structured model with dedicated branches for releases and hotfixes.

**Branches:** `main`, `develop`, `feature/*`, `release/*`, `hotfix/*`

```
main     ─────●───────────────●───────●
               \             /       /
develop   ─────●───●───●───●───●───●
                \     /       \   /
feature/x        ●──●    release/1.0
```

### Workflow

```bash
# Feature
git switch -c feature/dashboard develop
# ... work ...
git switch develop && git merge feature/dashboard
git branch -d feature/dashboard

# Release
git switch -c release/1.0 develop
# ... final fixes, bump version ...
git switch main && git merge release/1.0 --no-ff
git tag v1.0
git switch develop && git merge release/1.0
git branch -d release/1.0

# Hotfix
git switch -c hotfix/fix-crash main
# ... fix ...
git switch main && git merge hotfix/fix-crash --no-ff
git tag v1.0.1
git switch develop && git merge hotfix/fix-crash
git branch -d hotfix/fix-crash
```

### Best for

- Projects with scheduled releases
- Software with multiple versions in production
- Larger teams needing structure

---

## 4. Trunk-Based Development

Everyone commits to `main` (trunk) frequently. Short-lived branches optional.

```
main ───●──●──●──●──●──●──●──●──●
         \  /
          ●     (optional short branch, <1 day)
```

### Workflow

```bash
# Direct commit to main
git switch main
git pull
# ... small change ...
git commit -am "add input validation"
git push

# Or short-lived branch (merged same day)
git switch -c fix/typo
git commit -am "fix typo in header"
git push -u origin fix/typo
# Merge PR immediately
```

### Key practices

- Feature flags to hide incomplete work
- Small, frequent commits
- Strong CI/CD pipeline
- Code review via pair programming or quick PRs

### Best for

- Teams with strong CI/CD
- Experienced teams comfortable with feature flags
- High-velocity delivery

---

## 5. Choosing a Strategy

| Factor            | GitHub Flow  | Git Flow     | Trunk-Based |
| ----------------- | ------------ | ------------ | ----------- |
| Release cadence   | Continuous   | Scheduled    | Continuous  |
| Team size         | Small–Medium | Medium–Large | Any         |
| Complexity        | Low          | High         | Low         |
| Multiple versions | No           | Yes          | No          |
| CI/CD maturity    | Moderate     | Any          | High        |

---

## 6. Branch Naming Conventions

```
feature/<description>     # new feature
fix/<description>         # bug fix
hotfix/<description>      # urgent production fix
release/<version>         # release preparation
chore/<description>       # maintenance tasks
docs/<description>        # documentation updates
```

Keep names lowercase, use hyphens: `feature/user-authentication`
