---
title: Build a subagent workflow
description: Run bounded TypeScript research workers in parallel and aggregate typed results without sharing the full parent context.
---

This tutorial builds the orchestration seam for parallel subagents. Each worker receives one question, a small evidence set, a deadline, and an output contract.

## Define the contract

```ts
type Finding = {
	question: string;
	answer: string;
	evidenceIds: string[];
	unresolved: string[];
};

type ResearchTask = {
	question: string;
	allowedEvidence: { id: string; text: string }[];
	deadlineMs: number;
};

type ResearchWorker = (task: ResearchTask, signal: AbortSignal) => Promise<Finding>;
```

The task contains no conversation transcript and no unrelated tools.

## Add a timeout wrapper

```ts
async function runWithDeadline(
	worker: ResearchWorker,
	task: ResearchTask,
): Promise<Finding> {
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), task.deadlineMs);

	try {
		return await worker(task, controller.signal);
	} finally {
		clearTimeout(timeout);
	}
}
```

The worker must pass the signal to its model and tool clients for cancellation to stop real work.

## Run independent questions in parallel

```ts
async function researchAll(
	worker: ResearchWorker,
	tasks: ResearchTask[],
): Promise<{ findings: Finding[]; failures: string[] }> {
	const settled = await Promise.allSettled(
		tasks.map((task) => runWithDeadline(worker, task)),
	);

	const findings: Finding[] = [];
	const failures: string[] = [];

	for (const [index, result] of settled.entries()) {
		if (result.status === 'fulfilled') {
			findings.push(result.value);
		} else {
			failures.push(`${tasks[index].question}: ${String(result.reason)}`);
		}
	}

	return { findings, failures };
}
```

`Promise.allSettled` preserves successful findings when one worker fails. The parent sees the missing branch instead of interpreting it as “no evidence.”

## Add a model-backed worker

Implement `ResearchWorker` with your selected model SDK. Give the model only `question` and `allowedEvidence`. Require output matching `Finding`, then validate evidence identifiers against the supplied list.

The parent must reject invented evidence IDs even when the answer sounds plausible.

## Aggregate without erasing disagreement

Group findings by question. Deduplicate identical evidence IDs. If two answers conflict, return both with their evidence and mark the question unresolved. Do not ask an aggregator model to choose without seeing the supporting records.

## Add budgets before adding workers

Set a total worker count and allocate model tokens or cost per task. Parallel work lowers wall-clock time only when the tasks are independent. It increases peak traffic and usually increases total token use.
