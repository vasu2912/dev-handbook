---
title: "Fine-tuning and model adaptation"
description: "Prompting, retrieval, and fine-tuning compared: supervised fine-tuning, LoRA and QLoRA, RLHF and DPO, distillation, and the operational costs of each."
---

Adapting a model has three levers. Prompting changes the input. Retrieval changes the evidence in the input. Fine-tuning changes the parameters. Each lever costs orders of magnitude more than the one before it, so the order matters: try them in sequence, and move to the next only with evidence that the current one cannot meet the requirement.

| Lever | Changes | Cost profile | Best at |
|---|---|---|---|
| Prompting | The instruction and context | Engineering time only | Form, style, and procedure the model can follow |
| Retrieval | The facts in context | Ingest pipeline plus query cost | Fresh, private, or citable knowledge |
| Fine-tuning | Model parameters | Data, training runs, re-deploys | Repeated behavior: format, tone, domain vocabulary, tool-use patterns |

A rule of thumb that survives contact with production: fine-tune for **behavior**, retrieve for **knowledge**. Fine-tuning is a poor database. It cannot reliably add facts that stay current, and it cannot cite its sources.

## Supervised fine-tuning

Supervised fine-tuning (SFT) continues training a base or instruct model on input-output pairs. The modern recipe comes from InstructGPT: fine-tune on curated demonstrations, then align with preference data. SFT teaches the model what a good response looks like in your domain, which is why it works with hundreds to tens of thousands of examples rather than millions.

Data quality beats data quantity. Deduplicate, correct the outputs, match the target format exactly, and hold out a test set before you start. A fine-tune amplifies whatever the dataset contains, including errors, bias, and sensitive content. That risk has a name in the [OWASP LLM Top 10](/agentic-ai/production/guardrails/): data and model poisoning.

## LoRA makes fine-tuning cheap

Full fine-tuning updates every weight and stores a full copy of the model. **LoRA** freezes the base model and trains small low-rank matrices added to selected weight layers. The adapter is typically under one percent of the base model's size.

The practical consequences:

- Training needs far less memory, so it runs on smaller hardware.
- One base model can serve **many adapters**. Serving systems such as vLLM support multi-LoRA, so one deployment hosts per-tenant or per-task adapters.
- Adapters swap like artifacts: version them, evaluate them, and roll them back like code.

**QLoRA** pushes further: it loads the base model in 4-bit precision and trains a LoRA adapter on top, which makes fine-tuning feasible on a single consumer GPU with modest quality loss.

## Preference tuning: RLHF and DPO

SFT teaches the format. Preference tuning teaches which answer people prefer.

- **RLHF** (reinforcement learning from human feedback) trains a reward model on preference pairs, then optimizes the policy against that reward with PPO. It works but needs four models in memory (policy, reference, reward, value) and is famously unstable to tune.
- **DPO** (direct preference optimization) skips the reward model. It treats preference pairs as a classification signal and optimizes the policy directly. Most teams start here; the closed-loop version matters for research-grade alignment work.

## Distillation

Distillation trains a small student model to reproduce a larger teacher's outputs. For serving, it is a cost lever: a distilled student is cheaper per token and faster. Reasoning models made the technique prominent again, because DeepSeek-R1 distilled its reasoning behavior into smaller models that keep much of the performance. Distillation transfers behavior visible in the outputs. It does not transfer guarantees, and the student needs its own evaluation.

## The decision procedure

Work through this list, and stop when the requirement is met:

1. **Prompt first.** Clarify instructions, add few-shot examples, restructure the task.
2. **Retrieve knowledge.** If the model lacks facts, connect evidence, not weights.
3. **Fine-tune behavior.** When evaluation shows that prompting cannot hold the required format, vocabulary, or tool-use pattern across your traffic, fine-tune with a clean dataset and a fixed evaluation set.
4. **Re-evaluate everything.** A fine-tune that improves the target task can regress other tasks. Run the full evaluation suite, including safety checks, before replacing the previous model or adapter.

:::caution
Fine-tuning does not make a model private or secure, does not add citations, and does not freeze knowledge against drift. Teams that fine-tune to inject facts pay for the mistake twice: retraining on every change, and no way to audit which fact produced which answer.
:::

## Operating fine-tuned models

- Version prompts, datasets, adapters, and evaluation results together, so any deployed behavior is reproducible.
- Monitor for regression the same way as releases: task metrics from [evaluation](/agentic-ai/production/evaluation/), not vibes.
- Budget retraining. New base models, new providers, and data refreshes each restart the clock; a fine-tune is a commitment, not a one-off.

## Sources

- [LoRA: Low-Rank Adaptation of Large Language Models](https://arxiv.org/abs/2106.09685)
- [QLoRA: Efficient Finetuning of Quantized LLMs](https://arxiv.org/abs/2305.14314)
- [Training language models to follow instructions with human feedback (InstructGPT)](https://arxiv.org/abs/2203.02155)
- [Direct Preference Optimization: Your Language Model is Secretly a Reward Model](https://arxiv.org/abs/2305.18290)
- [Distilling the Knowledge in a Neural Network](https://arxiv.org/abs/1503.02531)
- [Hugging Face PEFT documentation](https://huggingface.co/docs/peft)
- [OpenAI fine-tuning documentation](https://platform.openai.com/docs/guides/fine-tuning)

*Last verified: October 17, 2026.*
