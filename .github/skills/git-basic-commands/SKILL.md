---
name: git-basic-commands
description: "Git essential commands for daily use. Use when: initializing repos, staging/committing changes, checking status/log, working with remotes, cloning repos, viewing diffs. DO NOT USE FOR: branching strategies (use git-branching-strategies), merge/rebase (use git-merge-rebase), or conflict resolution (use git-conflict-resolution)."
---

# Git Basic Commands Skill

## Overview

Covers fundamental Git CLI commands for everyday version control workflows.

---

## 1. Repository Setup

### Initialize a new repository

```bash
git init
git init <directory>
```

### Clone a repository

```bash
git clone <url>
git clone <url> <directory>
git clone --depth 1 <url>          # shallow clone (latest commit only)
git clone --branch <branch> <url>  # clone specific branch
```

---

## 2. Staging & Committing

### Check repository status

```bash
git status
git status -s    # short format
```

### Stage changes

```bash
git add <file>
git add <file1> <file2>
git add .                # stage all changes in current directory
git add -p               # interactively stage hunks
```

### Unstage changes

```bash
git restore --staged <file>
git reset HEAD <file>          # older syntax
```

### Commit

```bash
git commit -m "message"
git commit -m "title" -m "body"
git commit -am "message"       # stage tracked files + commit
```

### Discard working directory changes

```bash
git restore <file>
git checkout -- <file>         # older syntax
```

---

## 3. Viewing History & Diffs

### View commit log

```bash
git log
git log --oneline
git log --oneline --graph --all
git log -n 5                    # last 5 commits
git log --author="name"
git log --since="2024-01-01"
git log -- <file>               # history of specific file
```

### View diffs

```bash
git diff                        # unstaged changes
git diff --staged               # staged changes
git diff <commit1> <commit2>
git diff <branch1>..<branch2>
git diff -- <file>              # diff for specific file
```

### Show a specific commit

```bash
git show <commit>
git show <commit>:<file>        # file contents at commit
```

### Blame (who changed what)

```bash
git blame <file>
git blame -L 10,20 <file>      # specific line range
```

---

## 4. Working with Remotes

### List remotes

```bash
git remote -v
```

### Add a remote

```bash
git remote add <name> <url>
git remote add origin <url>
```

### Remove / rename a remote

```bash
git remote remove <name>
git remote rename <old> <new>
```

### Fetch changes

```bash
git fetch
git fetch <remote>
git fetch --all
git fetch --prune               # remove stale remote-tracking branches
```

### Pull changes

```bash
git pull
git pull <remote> <branch>
git pull --rebase               # rebase instead of merge
```

### Push changes

```bash
git push
git push <remote> <branch>
git push -u origin <branch>    # set upstream tracking
git push --tags                # push all tags
```

---

## 5. Undoing Changes

### Amend last commit

```bash
git commit --amend -m "new message"
git commit --amend --no-edit        # keep same message
```

### Revert a commit (creates new commit)

```bash
git revert <commit>
git revert <commit> --no-edit
```

### Reset (move HEAD)

```bash
git reset --soft <commit>    # keep changes staged
git reset --mixed <commit>   # keep changes unstaged (default)
git reset --hard <commit>    # discard all changes (destructive!)
```

---

## 6. Useful Utilities

```bash
git clean -fd                # remove untracked files and directories
git clean -n                 # dry run
git ls-files                 # list tracked files
git shortlog -sn             # contributor summary
git config --list            # show configuration
git config user.name "Name"
git config user.email "email@example.com"
```

---

## 7. Quick Reference Table

| Action               | Command               |
| -------------------- | --------------------- |
| Init repo            | `git init`            |
| Clone repo           | `git clone <url>`     |
| Check status         | `git status`          |
| Stage file           | `git add <file>`      |
| Commit               | `git commit -m "msg"` |
| View log             | `git log --oneline`   |
| View diff            | `git diff`            |
| Pull                 | `git pull`            |
| Push                 | `git push`            |
| Amend commit         | `git commit --amend`  |
| Revert commit        | `git revert <commit>` |
| Discard file changes | `git restore <file>`  |
