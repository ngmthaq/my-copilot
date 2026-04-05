---
name: git
description: "Unified Git skill index — covers all Git topics including essential daily commands, branching strategies, collaboration workflows, commit conventions, conflict resolution, history management, hooks automation, merge/rebase mechanics, stash workflows, and tagging/versioning. Use this as the entry point; it delegates to focused sub-skill files for each domain."
---

# Git Skill

## Overview

This file is the top-level entry point for all Git-related topics. It identifies the right sub-skill file to consult based on what the user is trying to accomplish. Each sub-skill file contains detailed patterns, examples, and best practices for its domain.

---

## Sub-Skills Reference

| Domain                 | File                                                   | When to use                                                                                                                              |
| ---------------------- | ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Basic Commands         | [basic-commands.md](basic-commands.md)                 | Initializing repos, staging/committing changes, checking status/log, working with remotes, cloning repos, viewing diffs                  |
| Branching Strategies   | [branching-strategies.md](branching-strategies.md)     | Choosing a branching workflow, setting up Git Flow / GitHub Flow / trunk-based development, creating feature/release/hotfix branches     |
| Collaboration Workflow | [collaboration-workflow.md](collaboration-workflow.md) | Working with pull requests, code reviews, forking workflows, upstream syncing, shared repository practices                               |
| Commit Conventions     | [commit-conventions.md](commit-conventions.md)         | Writing commit messages, setting up Conventional Commits, structuring commit history, writing multi-line commits                         |
| Conflict Resolution    | [conflict-resolution.md](conflict-resolution.md)       | Resolving merge conflicts, understanding conflict markers, handling conflicts during rebase/merge/cherry-pick, preventing conflicts      |
| History Management     | [history-management.md](history-management.md)         | Interactive rebase, squashing commits, editing commit history, bisecting bugs, reflog recovery, cleaning up history before merge         |
| Hooks & Automation     | [hooks-automation.md](hooks-automation.md)             | Setting up pre-commit/pre-push hooks, using Husky, lint-staged, commit message validation, automating checks before commit/push          |
| Merge & Rebase         | [merge-rebase.md](merge-rebase.md)                     | Choosing between merge and rebase, performing merges, rebasing branches, understanding fast-forward vs no-ff, maintaining linear history |
| Stash Workflow         | [stash-workflow.md](stash-workflow.md)                 | Stashing uncommitted changes, switching branches with pending work, managing multiple stashes, applying/dropping stashes                 |
| Tagging & Versioning   | [tagging-versioning.md](tagging-versioning.md)         | Creating release tags, managing versions, listing/deleting tags, semantic versioning workflow, annotated vs lightweight tags             |

---

## Quick Decision Guide

```
What are you trying to do?
│
├── Daily Git commands (init, add, commit, push, pull, log, diff)?
│   └── → basic-commands.md
│
├── Choose or set up a branching model (Git Flow, GitHub Flow, trunk-based)?
│   └── → branching-strategies.md
│
├── Work with pull requests, forks, or code reviews?
│   └── → collaboration-workflow.md
│
├── Write or enforce commit message conventions?
│   ├── Format rules / Conventional Commits?  → commit-conventions.md
│   └── Automate enforcement with hooks?       → hooks-automation.md
│
├── Resolve merge conflicts?
│   └── → conflict-resolution.md
│
├── Rewrite or clean up Git history?
│   ├── Interactive rebase / squash / bisect / reflog?  → history-management.md
│   └── Choosing merge vs rebase strategy?              → merge-rebase.md
│
├── Temporarily save uncommitted work?
│   └── → stash-workflow.md
│
├── Create releases or manage version tags?
│   └── → tagging-versioning.md
│
└── Automate checks before commit or push (Husky, lint-staged)?
    └── → hooks-automation.md
```

---

## How to Use This Skill

1. Identify the user's goal using the decision guide above.
2. Load the corresponding sub-skill file with `read_file`.
3. Follow the patterns and examples in that file to produce the response.
4. When a task spans multiple domains (e.g., setting up commit conventions **and** hooks to enforce them), load both sub-skill files before responding.
