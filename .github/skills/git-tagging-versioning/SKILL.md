---
name: git-tagging-versioning
description: "Git tags and semantic versioning. Use when: creating release tags, managing versions, listing/deleting tags, semantic versioning workflow, annotated vs lightweight tags. DO NOT USE FOR: branching for releases (use git-branching-strategies)."
---

# Git Tagging & Versioning Skill

## Overview

Covers Git tags for marking releases and semantic versioning practices.

---

## 1. Tag Types

### Lightweight tag (just a pointer)

```bash
git tag v1.0.0
git tag v1.0.0 <commit>          # tag a specific commit
```

### Annotated tag (recommended — includes metadata)

```bash
git tag -a v1.0.0 -m "Release version 1.0.0"
git tag -a v1.0.0 <commit> -m "Release version 1.0.0"
```

---

## 2. Listing Tags

```bash
git tag                           # list all tags
git tag -l "v1.*"                 # filter tags by pattern
git tag --sort=-v:refname         # sort by version (newest first)
git show v1.0.0                   # show tag details
```

---

## 3. Pushing Tags

```bash
git push origin v1.0.0            # push specific tag
git push origin --tags             # push all tags
git push --follow-tags             # push commits + annotated tags
```

---

## 4. Deleting Tags

```bash
git tag -d v1.0.0                  # delete local tag
git push origin --delete v1.0.0    # delete remote tag
# Or:
git push origin :refs/tags/v1.0.0
```

---

## 5. Semantic Versioning (SemVer)

Format: `MAJOR.MINOR.PATCH`

| Component | When to increment                  | Example           |
| --------- | ---------------------------------- | ----------------- |
| MAJOR     | Breaking/incompatible API changes  | `1.0.0` → `2.0.0` |
| MINOR     | New features, backwards compatible | `1.0.0` → `1.1.0` |
| PATCH     | Bug fixes, backwards compatible    | `1.0.0` → `1.0.1` |

### Pre-release versions

```
v1.0.0-alpha.1
v1.0.0-beta.1
v1.0.0-rc.1
v1.0.0
```

---

## 6. Release Workflow

```bash
# 1. Ensure you're on main with latest changes
git switch main
git pull

# 2. Create annotated tag
git tag -a v1.2.0 -m "Release v1.2.0: add search feature"

# 3. Push tag
git push origin v1.2.0

# 4. Create GitHub release (via CLI)
gh release create v1.2.0 --title "v1.2.0" --notes "Release notes here"
```

### Create release with auto-generated notes

```bash
gh release create v1.2.0 --generate-notes
```

### Create release from a specific tag

```bash
gh release create v1.2.0 --target main --title "v1.2.0" --notes "Notes"
```

---

## 7. Checking Out Tags

```bash
git checkout v1.0.0                # detached HEAD at tag
git switch -c hotfix/v1.0.1 v1.0.0 # create branch from tag
```

---

## 8. Finding Version Info

```bash
git describe                       # latest tag + distance + hash
git describe --tags                 # include lightweight tags
git describe --abbrev=0            # just the latest tag name
git log v1.0.0..v1.1.0 --oneline  # commits between versions
```

---

## 9. Quick Reference

| Action                   | Command                                     |
| ------------------------ | ------------------------------------------- |
| Create annotated tag     | `git tag -a v1.0.0 -m "msg"`                |
| Create lightweight tag   | `git tag v1.0.0`                            |
| List tags                | `git tag -l`                                |
| Push tag                 | `git push origin v1.0.0`                    |
| Push all tags            | `git push origin --tags`                    |
| Delete local tag         | `git tag -d v1.0.0`                         |
| Delete remote tag        | `git push origin --delete v1.0.0`           |
| Create GitHub release    | `gh release create v1.0.0 --generate-notes` |
| Describe current version | `git describe --tags`                       |
