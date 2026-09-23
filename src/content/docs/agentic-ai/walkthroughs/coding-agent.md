---
title: Design a coding agent
description: Design an isolated coding agent that can inspect a repository, edit files, run tests, and prepare a reviewable change.
---

The coding agent receives a bounded change request. It works in an isolated checkout, reads repository instructions, edits files, runs allowed commands, and prepares a diff for human review.

## Isolate the workspace

Create a short-lived branch or worktree for one task. Mount only the repository and required build caches. Do not expose unrelated home-directory files, SSH keys, cloud credentials, or the container runtime socket.

Record the starting commit. All later evidence refers to that state and the agent's diff.

## Build a repository map before loading files

List tracked files, read repository instructions, inspect package manifests, and search for symbols. Retrieve relevant files into context as needed. Sending the whole repository wastes context and increases the chance that an unrelated instruction affects the task.

A code-search index can help with large repositories, but the filesystem and version control remain the source of truth.

## Separate file operations from shell execution

Use structured tools for reading, patching, and listing files. Restrict shell commands by working directory, duration, environment, network access, and output size.

Do not give the agent a persistent shell with inherited developer credentials. Package installation and network access deserve explicit policy.

## Let tests provide external evidence

The agent proposes a plan, edits files, and runs targeted checks. The compiler, linter, and tests return evidence that differs from another model critique.

Run repository-required full checks before completion. Record commands, exit codes, and relevant output. A model statement that “tests should pass” has no value.

## Use specialized workers only where they help

A planner, code worker, test worker, and reviewer can operate as subagents, but a fixed pipeline may be simpler. Give each role a contract and minimal context. The reviewer inspects the actual diff and test evidence, not the coding agent's summary alone.

No agent receives merge permission by default. A human or protected CI policy decides whether the change can merge.

## Handle untrusted repository content

Issues, comments, generated files, test fixtures, and source code can contain prompt injections. Repository instructions approved by the project have a different trust level from arbitrary file content.

Keep secrets out of the workspace and restrict network egress so a successful injection cannot upload source or credentials.

## Finish with a review package

Return the diff, changed-file summary, tests run, failures, unresolved risks, and source references. Leave the workspace available long enough for review, then remove it according to retention policy.
