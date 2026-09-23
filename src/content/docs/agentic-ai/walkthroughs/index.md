---
title: Agentic system walkthroughs
description: Apply the handbook's agent, tool, MCP, security, reliability, and evaluation concepts to complete systems.
---

Each walkthrough starts with a user-visible outcome and follows one task through identity, context, model decisions, tools, state, and verification.

## Enterprise assistant

The [enterprise assistant](/agentic-ai/walkthroughs/enterprise-assistant/) searches internal knowledge and uses Jira, GitHub, Slack, and customer tools. Its main design problem is preserving user permissions across several systems.

## Coding agent

The [coding agent](/agentic-ai/walkthroughs/coding-agent/) inspects a repository, edits an isolated workspace, runs tests, and prepares a change for review. Its main design problem is containing code execution and proving the change works.

## DevOps investigation agent

The [DevOps investigation agent](/agentic-ai/walkthroughs/devops-agent/) responds to an alert with logs, metrics, deployment history, and Kubernetes state. Its main design problem is separating read-only diagnosis from approved remediation.

## Use one review frame

For every design, identify:

1. The source of truth
2. The effective identity
3. The model's allowed decisions
4. The tools and their permissions
5. The durable state and recovery point
6. The stop and approval conditions
7. The evidence that proves success
8. The evaluation and operational measures
