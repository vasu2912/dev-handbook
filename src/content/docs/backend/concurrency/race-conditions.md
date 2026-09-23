---
title: Race conditions
description: Identify lost updates and check-then-act races, then choose mutual exclusion or message passing.
sidebar:
  order: 6
---

A race condition occurs when the result depends on the timing of interleaved operations. Shared mutable state is the common cause.


<svg viewBox="0 0 600 300" style="max-width:100%;height:auto;font-family:'Inter',system-ui,sans-serif; margin: 1.5rem 0;" role="img" aria-label="Race Condition Diagram">
  <rect width="600" height="300" fill="var(--diagram-bg)" rx="8" stroke="var(--diagram-border)"/>
  <text x="50" y="30" fill="var(--diagram-accent-fill)" font-weight="bold">Thread A</text>
  <text x="450" y="30" fill="var(--diagram-green)" font-weight="bold">Thread B</text>
  <rect x="250" y="20" width="100" height="40" rx="4" fill="var(--diagram-muted)" stroke="var(--diagram-border)"/>
  <text x="300" y="45" fill="var(--diagram-ink)" font-size="14" text-anchor="middle">Counter: 0</text>
  <g transform="translate(50, 80)">
    <rect width="120" height="30" fill="var(--diagram-accent-bg)" rx="4"/>
    <text x="60" y="20" fill="var(--diagram-accent-fill)" font-size="12" text-anchor="middle">Read Counter (0)</text>
  </g>
  <g transform="translate(430, 120)">
    <rect width="120" height="30" fill="var(--diagram-green-bg)" rx="4"/>
    <text x="60" y="20" fill="var(--diagram-green)" font-size="12" text-anchor="middle">Read Counter (0)</text>
  </g>
  <g transform="translate(50, 160)">
    <rect width="120" height="30" fill="var(--diagram-accent-bg)" rx="4"/>
    <text x="60" y="20" fill="var(--diagram-accent-fill)" font-size="12" text-anchor="middle">Increment (0+1=1)</text>
  </g>
  <g transform="translate(430, 200)">
    <rect width="120" height="30" fill="var(--diagram-green-bg)" rx="4"/>
    <text x="60" y="20" fill="var(--diagram-green)" font-size="12" text-anchor="middle">Increment (0+1=1)</text>
  </g>
  <g transform="translate(50, 240)">
    <rect width="120" height="30" fill="var(--diagram-red-bg)" rx="4"/>
    <text x="60" y="20" fill="var(--diagram-red)" font-size="12" text-anchor="middle">Write 1</text>
  </g>
  <g transform="translate(430, 240)">
    <rect width="120" height="30" fill="var(--diagram-red-bg)" rx="4"/>
    <text x="60" y="20" fill="var(--diagram-red)" font-size="12" text-anchor="middle">Write 1</text>
  </g>
  <path d="M 250 40 L 110 80" fill="none" stroke="var(--diagram-ink)" stroke-dasharray="4" marker-end="url(#arrow)"/>
  <path d="M 350 40 L 490 120" fill="none" stroke="var(--diagram-ink)" stroke-dasharray="4" marker-end="url(#arrow)"/>
  <path d="M 110 240 L 290 60" fill="none" stroke="var(--diagram-red)" marker-end="url(#arrow)"/>
  <path d="M 490 240 L 310 60" fill="none" stroke="var(--diagram-red)" marker-end="url(#arrow)"/>
</svg>


## The lost update

An increment has three steps: read, add one, and write. Two tasks can interleave like this:

```text
counter = 0

task A: read 0 -> calculate 1 --------> write 1
task B:       read 0 -> calculate 1 -> write 1

expected: 2, actual: 1
```

The same race can happen in single-threaded async code. `await` creates an interleaving point even when every callback runs on one OS thread.

```text
if (balance >= amount) {
	await recordPayment();
	balance -= amount;
}
```

Two calls can both read `100`, both pass the check, and both deduct after the `await`. The check and the act were not one atomic operation.

## Protect a critical section with a mutex

Use a lock when several threads or goroutines must access the same mutable state. The lock gives mutual exclusion, so one task performs the read-check-write sequence while other tasks wait.

```text
lock
  check balance
  record deduction
unlock
```

Keep the critical section small. Locks prevent races but can introduce deadlocks when two tasks acquire locks in opposite order, and contention can reduce throughput.

## Send messages to one owner

Channels avoid direct shared mutation. One goroutine owns the state, and other goroutines send it commands:

```text
workers -> channel: Deduct(amount)
owner   -> receive command -> check and update balance
```

The owner serializes updates. This makes ownership explicit, but the channel still needs a capacity, shutdown rule, and error policy.

The core check is simple. Find every read-modify-write or check-then-act sequence that crosses a context switch or `await`. Make it atomic with a mutex or database transaction, or give one owner the state and communicate through messages. Keep cancellation and failure behavior part of the design.

See [transactions in services](/backend/architecture/services/) when the shared state is persisted, and [goroutines](/backend/concurrency/goroutines/) for the Go scheduling model.
