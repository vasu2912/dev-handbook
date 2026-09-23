---
title: Build a bounded tool agent
description: Build and test a TypeScript agent loop with validated tools, a step limit, a deadline, and repeated-action detection.
---

This tutorial builds the control loop around a model. The demo model is deterministic, so you can test the loop without an API key. The final seam accepts a real model adapter later.

## Create the agent types

Create `agent.ts`:

```ts
type ToolCall = {
	type: 'tool_call';
	name: string;
	arguments: Record<string, unknown>;
};

type FinalAnswer = { type: 'final'; text: string };
type Decision = ToolCall | FinalAnswer;

type Observation = {
	tool: string;
	arguments: Record<string, unknown>;
	result: unknown;
};

type Model = {
	decide(input: {
		goal: string;
		observations: Observation[];
	}): Promise<Decision>;
};

type Tool = {
	validate(arguments_: Record<string, unknown>): void;
	execute(arguments_: Record<string, unknown>): Promise<unknown>;
};
```

The model returns a proposal. The tool registry owns validation and execution.

## Add one narrow tool

```ts
const tools: Record<string, Tool> = {
	getWeather: {
		validate(arguments_) {
			if (typeof arguments_.city !== 'string' || arguments_.city.length > 80) {
				throw new Error('city must be a string with at most 80 characters');
			}
		},
		async execute(arguments_) {
			return { city: arguments_.city, condition: 'rain', temperatureC: 18 };
		},
	},
};
```

The example returns fixed data. A production implementation can call a weather API without changing the model contract.

## Implement the bounded loop

```ts
export async function runAgent(model: Model, goal: string): Promise<string> {
	const observations: Observation[] = [];
	const seenCalls = new Set<string>();
	const deadline = Date.now() + 5_000;

	for (let step = 0; step < 5; step += 1) {
		if (Date.now() >= deadline) throw new Error('agent deadline exceeded');

		const decision = await model.decide({ goal, observations });
		if (decision.type === 'final') return decision.text;

		const tool = tools[decision.name];
		if (!tool) throw new Error(`unknown tool: ${decision.name}`);

		const callKey = JSON.stringify([decision.name, decision.arguments]);
		if (seenCalls.has(callKey)) throw new Error('repeated tool call without progress');
		seenCalls.add(callKey);

		tool.validate(decision.arguments);
		const result = await tool.execute(decision.arguments);
		observations.push({
			tool: decision.name,
			arguments: decision.arguments,
			result,
		});
	}

	throw new Error('agent step limit exceeded');
}
```

The loop enforces its limits in code. The model cannot extend its own deadline or step count.

## Add a deterministic model adapter

```ts
const demoModel: Model = {
	async decide({ observations }) {
		if (observations.length === 0) {
			return {
				type: 'tool_call',
				name: 'getWeather',
				arguments: { city: 'Pune' },
			};
		}

		const weather = observations[0].result as {
			city: string;
			condition: string;
			temperatureC: number;
		};

		return {
			type: 'final',
			text: `${weather.city}: ${weather.condition}, ${weather.temperatureC}°C`,
		};
	},
};

console.log(await runAgent(demoModel, 'What is the weather in Pune?'));
```

Run the file with a TypeScript runner. The output is:

```text
Pune: rain, 18°C
```

## Test the boundaries

Replace the demo decision with an unknown tool, an invalid city, and the same tool call twice. Each case should fail before an unintended effect occurs.

When you connect a real model, keep the `Model` interface. Parse the provider response into `Decision`, validate it, and leave execution in this loop.
