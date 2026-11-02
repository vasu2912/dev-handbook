---
title: Git, CI, and safe delivery
description: Explain version history, merge and rebase, regression search, automated pipelines, deployment strategies, and rollback.
---

Git records a graph of snapshots. A branch is a movable reference to a commit. A release pipeline turns a reviewed snapshot into an artifact and moves that artifact through validation and deployment.

## History and collaboration

A merge joins histories and can preserve their branching structure. A rebase recreates commits on a different base, changing commit identities. Rewriting already shared history requires coordination because other work may depend on the old identities.

A revert records a new change that reverses an earlier change. A reset moves a reference and can also alter staged or working files depending on the mode. They have different consequences for collaborators and uncommitted work.

`git bisect` narrows a regression between a known good and known bad revision. Its result depends on a reliable test and a suitable history. Revisions that cannot be evaluated need to be skipped rather than labeled incorrectly.

## CI and artifacts

Continuous integration checks changes frequently. A useful pipeline verifies formatting or static rules where required, runs the relevant tests, builds an artifact, and records its identity. Continuous delivery keeps validated changes ready for release. Continuous deployment automatically releases changes that pass its gates.

Build once and promote the same artifact when environments allow it. Rebuilding separately for production can produce different bytes because dependencies or tools changed. Keep configuration separate and record the commit, artifact digest, and deployment outcome.

## Deployment strategies

| Strategy   | Traffic behavior                  | Main consideration                                   |
| ---------- | --------------------------------- | ---------------------------------------------------- |
| Rolling    | Replaces instances gradually      | Old and new versions coexist                         |
| Blue-green | Switches between two environments | Capacity and state compatibility                     |
| Canary     | Exposes a limited workload first  | Representative traffic and meaningful abort criteria |

A feature flag separates code deployment from activating behavior. Flags still need ownership, tests for relevant states, and removal when the transition ends.

## Rollback and compatibility

A rollback replaces code or routing. It cannot automatically undo a schema deletion, sent email, or captured payment. Use [compatible migrations](/databases/migrations-and-recovery/) and version-tolerant events so both versions can operate during a rollout.

Good release signals include user-visible errors, latency, saturation, and business outcomes. A process returning HTTP 200 is insufficient if every checkout remains pending. Define the recovery action before releasing a change whose state cannot be reversed.

## Sources

- [Git: branching and merging](https://git-scm.com/book/en/v2/Git-Branching-Basic-Branching-and-Merging)
- [Git: bisect](https://git-scm.com/docs/git-bisect)
- [GitHub: understanding Actions](https://docs.github.com/en/actions/get-started/understand-github-actions)
- [Kubernetes: Deployments](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/)
