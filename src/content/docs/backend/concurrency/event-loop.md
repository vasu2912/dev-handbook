---
title: Event loop
description: See how one thread interleaves many I/O tasks with callbacks, and why blocking the loop stalls every request.
sidebar:
  order: 4
---

An event loop runs one thread that repeatedly checks for work and invokes callbacks. When a task starts a database query or another I/O operation, it registers what to run when the result is ready and gives control back to the loop.

```text
run task -> start I/O -> register callback -> run another task
                                      ^
                         I/O completes, callback becomes ready
```

Operating systems expose readiness mechanisms such as `epoll` on Linux, `kqueue` on macOS, and `IOCP` on Windows. The runtime uses them to learn which sockets can make progress, then runs the associated callbacks.


<svg viewBox="0 0 500 400" style="max-width:100%;height:auto;font-family:'Inter',system-ui,sans-serif; margin: 1.5rem auto; display: block;" role="img" aria-label="Event Loop Cycle">
  <rect width="500" height="400" fill="var(--diagram-bg)" rx="8" stroke="var(--diagram-border)"/>
  <g transform="translate(190, 40)">
    <rect width="120" height="40" rx="4" fill="var(--diagram-accent-bg)" stroke="var(--diagram-accent)"/>
    <text x="60" y="24" fill="var(--diagram-accent-fill)" font-size="14" text-anchor="middle">1. Poll I/O</text>
  </g>
  <path d="M 250 80 L 250 120" fill="none" stroke="var(--diagram-ink)" stroke-width="2" marker-end="url(#arrow)"/>
  <g transform="translate(190, 120)">
    <rect width="120" height="40" rx="4" fill="var(--diagram-green-bg)" stroke="var(--diagram-green)"/>
    <text x="60" y="24" fill="var(--diagram-green)" font-size="14" text-anchor="middle">2. Check Callbacks</text>
  </g>
  <path d="M 250 160 L 250 200" fill="none" stroke="var(--diagram-ink)" stroke-width="2" marker-end="url(#arrow)"/>
  <g transform="translate(190, 200)">
    <rect width="120" height="40" rx="4" fill="var(--diagram-accent-bg)" stroke="var(--diagram-accent)"/>
    <text x="60" y="24" fill="var(--diagram-accent-fill)" font-size="14" text-anchor="middle">3. Run Callback</text>
  </g>
  <path d="M 190 220 Q 90 220 90 260" fill="none" stroke="var(--diagram-ink)" stroke-width="2" marker-end="url(#arrow)"/>
  <g transform="translate(30, 260)">
    <rect width="120" height="40" rx="4" fill="var(--diagram-red-bg)" stroke="var(--diagram-red)"/>
    <text x="60" y="24" fill="var(--diagram-red)" font-size="14" text-anchor="middle">4. Start I/O</text>
  </g>
  <path d="M 90 300 Q 90 340 190 340" fill="none" stroke="var(--diagram-ink)" stroke-width="2" marker-end="url(#arrow)"/>
  <g transform="translate(190, 320)">
    <rect width="130" height="40" rx="4" fill="var(--diagram-yellow-bg)" stroke="var(--diagram-ink)"/>
    <text x="65" y="24" fill="var(--diagram-ink)" font-size="14" text-anchor="middle">5. Register Callback</text>
  </g>
  <path d="M 320 340 Q 420 340 420 220 T 310 60" fill="none" stroke="var(--diagram-ink)" stroke-width="2" marker-end="url(#arrow)"/>
  <defs>
    <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--diagram-ink)" />
    </marker>
  </defs>
</svg>


## Why one thread can hold many tasks

The event loop has one execution stack and does not switch between OS threads. Each waiting task stores a small amount of continuation state rather than a full OS thread stack. Thousands of I/O-bound tasks can therefore remain in flight with low scheduling overhead.

The trade-off is strict. A CPU-heavy callback blocks the only loop thread. Every other request waits until that callback returns. Keep callbacks short and move expensive computation to a worker thread or process.

## `async` and `await` express callbacks

Callback style makes the control handoff visible:

```javascript
db.query("SELECT * FROM users", userId, function (err, user) {
	if (err) throw err;
	sendResponse(user);
});
```

`async` and `await` flatten the same control flow:

```javascript
async function handleRequest(req) {
	const user = await db.query("SELECT * FROM users", req.userId);
	sendResponse(user);
}
```

At `await`, the function yields. The runtime stores the continuation and resumes it when the promise settles. The function looks synchronous, but the event loop remains available to other tasks.

An async function can be understood as a state machine. Each `await` is a state transition, and the code after it is the continuation for the I/O operation. If the thread blocks on synchronous CPU work, the state machine cannot advance and every in-flight request stalls.

Compare this model with [goroutines](/backend/concurrency/goroutines/) and [threads](/backend/concurrency/threads/).
