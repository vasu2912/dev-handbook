---
title: Async work and scheduled jobs
description: Separate task submission, execution capacity, scheduling, and durable completion.
---

Moving work to another thread changes when the caller waits. It does not make the work reliable, increase database capacity, or guarantee that a task survives deployment. Spring's executors and schedulers are useful inside a running process. Durable jobs need stored state and a recovery mechanism.

## Submission is not completion

With `@EnableAsync`, a call through an `@Async` bean proxy submits work to a `TaskExecutor`. The caller can continue before the method finishes. A call from another method on the same instance bypasses that proxy and runs normally.

This configuration fragment defines a deliberately small executor so its capacity is easy to trace. Imports are omitted. Spring initializes and shuts down the executor bean:

```java
@Configuration
@EnableAsync
class AsyncConfiguration {
	@Bean
	ThreadPoolTaskExecutor exports() {
		var executor = new ThreadPoolTaskExecutor();
		executor.setCorePoolSize(2);
		executor.setMaxPoolSize(2);
		executor.setQueueCapacity(2);
		executor.setThreadNamePrefix("export-");
		executor.setRejectedExecutionHandler(new ThreadPoolExecutor.AbortPolicy());
		return executor;
	}
}
```

The following method fragment belongs to a separate `@Service` bean. Its injected `renderer` writes the report and returns its path, or throws if rendering fails:

```java
@Async("exports")
public CompletableFuture<Path> generate(String reportId) {
	return CompletableFuture.completedFuture(renderer.write(reportId));
}
```

`renderer.write` runs on the worker thread before that completed future is created. If it throws, the future returned by Spring's proxy completes exceptionally. This caller fragment observes both failure points. It assumes injected `exportService` and `log` fields:

```java
try {
	CompletableFuture<Path> result = exportService.generate("r42");
	log.info("r42 submitted");
	result.whenComplete((path, failure) -> {
		if (failure != null) {
			log.error("r42 failed", failure);
		} else {
			log.info("r42 completed: {}", path);
		}
	});
} catch (TaskRejectedException overloaded) {
	log.warn("r42 not submitted: export capacity exhausted");
}
```

`whenComplete` observes the outcome without waiting for it. Its callback can run on the completing worker, or immediately on the caller if the future is already complete. Keep it short. Ignoring the future loses the failure. A `void` async method cannot report execution failures to its caller. `AsyncUncaughtExceptionHandler` handles that case, and the default behavior only logs the failure.

The following log is illustrative. Assume the renderer fails after submission has returned:

```text
request-thread  r42 submitted
export-1        r42 failed: ReportStorageUnavailable
```

No completed report exists. If an HTTP response already said "report generated," that response was wrong. If the API promises durable acceptance, persist a job before acknowledging it and expose its eventual outcome. A future and an executor queue are not a job store.

### Follow the caller and worker

<section class="walkthrough" aria-label="Async submission and worker failure">
<section data-scenario="Accepted task fails later">
<p><strong>Accepted task fails later</strong></p>
<ol class="walkthrough-steps">
<li><strong>Submit through the proxy</strong><p>The caller submits r42 while capacity is available. Spring returns a future. The job is in this process only, with no durable job row.</p><svg role="img" aria-label="Caller receives a future while worker owns r42 in memory" viewBox="0 0 440 100" width="100%" xmlns="http://www.w3.org/2000/svg"><rect x="5" y="10" width="180" height="80" rx="6" fill="var(--diagram-accent-bg)" stroke="var(--diagram-accent)"/><rect x="255" y="10" width="180" height="80" rx="6" fill="var(--diagram-bg)" stroke="var(--diagram-border)"/><path d="M185 50H255l-9 -5m9 5l-9 5" fill="none" stroke="var(--diagram-ink)"/><g fill="var(--diagram-ink)" font-size="18" text-anchor="middle"><text x="95" y="43">Caller</text><text x="95" y="70">future pending</text><text x="345" y="43">Worker</text><text x="345" y="70">r42 in memory</text></g></svg></li>
<li><strong>The caller continues</strong><p>The submission log appears. The worker starts rendering r42. Submission says nothing about report storage or successful completion.</p></li>
<li><strong>The worker fails</strong><p>The renderer throws ReportStorageUnavailable. The future becomes exceptional and the callback logs the failure. The caller's earlier submission log remains true, but no report was produced.</p></li>
<li><strong>Consider a process crash instead</strong><p>A crash loses the task and future. No callback can run in the dead process. Recovery requires a durable job record and a worker that claims unfinished jobs after restart.</p></li>
</ol>
</section>
<section data-scenario="Executor rejects submission">
<p><strong>Executor rejects submission</strong></p>
<ol class="walkthrough-steps">
<li><strong>Fill the finite capacity</strong><p>Hold r1 and r2 in the two workers. Submit r3 and r4 into the two queue slots. None of these tasks has finished.</p><svg role="img" aria-label="Two occupied workers and two full queue slots leave no room for r5" viewBox="0 0 440 130" width="100%" xmlns="http://www.w3.org/2000/svg"><rect x="5" y="10" width="200" height="75" rx="6" fill="var(--diagram-accent-bg)" stroke="var(--diagram-accent)"/><rect x="235" y="10" width="200" height="75" rx="6" fill="var(--diagram-yellow-bg)" stroke="var(--diagram-yellow)"/><g fill="var(--diagram-ink)" font-size="18" text-anchor="middle"><text x="105" y="40">Workers: r1, r2</text><text x="105" y="65">2 of 2 occupied</text><text x="335" y="40">Queue: r3, r4</text><text x="335" y="65">2 of 2 occupied</text><text x="220" y="116">r5 → rejected, not queued</text></g></svg></li>
<li><strong>Submit r5</strong><p>The abort policy rejects r5. Spring throws TaskRejectedException on the caller thread. The worker method for r5 never starts and no future is returned to this caller.</p></li>
<li><strong>Report overload, not acceptance</strong><p>The boundary can return an explicit overload response such as HTTP 503. Do not return a job ID that implies stored work. Retrying immediately in a loop only adds submission pressure.</p></li>
</ol>
</section>
</section>

## Bound the executor, not just threads

After the core threads are occupied, new work queues before the pool grows toward its maximum. With an unbounded queue, increasing the maximum does not solve backlog growth. In the example, core and maximum are both two, so there is no later growth stage.

| Submission while all earlier tasks remain unfinished | Running | Queued | Result |
| --- | --- | --- | --- |
| r1, r2 | 2 | 0 | Accepted |
| r3, r4 | 2 | 2 | Accepted, waiting |
| r5 | 2 | 2 | Rejected on the caller |

Choose finite capacity and an explicit overload response. A caller-runs rejection policy slows submission by executing work on the caller, but also makes that path synchronous. Separate slow export work from latency-sensitive tasks when they must not consume each other's workers.

On Java 21, Boot 4.0 can use virtual threads when `spring.threads.virtual.enabled=true`. Its auto-configured task executor then uses `SimpleAsyncTaskExecutor` rather than a thread pool. The explicitly named `exports` executor above remains a `ThreadPoolTaskExecutor`. Virtual threads reduce the cost of waiting on blocking I/O. They do not add CPU cores, database connections, or provider quota. Bound in-flight work at those resources.

## Treat thread context as an explicit input

Ordinary Spring transactions are thread-bound. An async worker does not inherit the caller's transaction, and it can run before that transaction commits. Pass stable identifiers or immutable task data rather than managed JPA entities or request objects. Open a worker transaction when the work needs one.

Logging context, request attributes, and security context also need deliberate handling across executor boundaries. Use the relevant context-propagation integration or a `TaskDecorator` for supported context, with cleanup after execution. Do not copy arbitrary thread-local state or attempt to propagate a database transaction. Scheduled work has no originating HTTP request at all.

## A schedule is local to each instance

With `@EnableScheduling`, `@Scheduled` registers triggers in the application. This scheduled method fragment runs on every replica. It assumes an injected `billing` service:

```java
@Scheduled(cron = "0 0 2 * * *", zone = "UTC")
public void sendDailyInvoices() {
	billing.sendDueInvoices();
}
```

Illustrative trace with two replicas and no coordinated claim:

```text
02:00:00 replica-a  sendDueInvoices starts
02:00:00 replica-b  sendDueInvoices starts
02:00:01 replica-a  sends invoice i17
02:00:01 replica-b  sends invoice i17 again
```

A `synchronized` method or local lock only coordinates threads inside one replica. Cluster-wide work needs coordinated ownership, database-backed claims, or an external scheduler. Claims need crash recovery, and effects still need idempotency when a worker stops after sending but before recording success.

Fixed delay measures the gap after completion. Fixed rate targets a cadence, while cron uses calendar times and a configured time zone. Overlap depends on the scheduler and task arrangement. Repeated schedules on one method are independent. Async dispatch can return before the job finishes, so the next trigger can submit overlapping work.

Boot's non-virtual scheduler uses one thread by default, which can let one slow job delay unrelated jobs. Its virtual-thread scheduler handles fixed-delay tasks on the scheduler thread, a reason to check behavior before switching execution models.

Executor queues and ordinary scheduled triggers are not durable. Graceful shutdown can allow work to finish, but cannot recover lost in-memory tasks after termination. Record required work durably when missed executions or partial completion matter.

Continue with [proxies](/java-spring/proxies/), [events and messaging](/java-spring/events-messaging/), and [running services](/java-spring/running-services/).

## Sources

- [Spring task execution and scheduling](https://docs.spring.io/spring-framework/reference/integration/scheduling.html)
- [Spring Boot 4.0 task execution and scheduling](https://docs.spring.io/spring-boot/4.0/reference/features/task-execution-and-scheduling.html)
