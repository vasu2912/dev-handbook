import { readFile, writeFile } from 'node:fs/promises';

const sourcePath = new URL('../research/agentic-ai-interview-questions.md', import.meta.url);
const outputPath = new URL('../src/content/docs/agentic-ai/reference/question-coverage.md', import.meta.url);

const readingRules = [
	[1, 14, '/agentic-ai/foundations/llms/', 'How language models generate text'],
	[15, 20, '/agentic-ai/foundations/generation-and-structured-output/', 'Sampling and structured output'],
	[21, 27, '/agentic-ai/foundations/embeddings/', 'Embeddings and semantic search'],
	[28, 38, '/agentic-ai/rag/', 'Retrieval-augmented generation'],
	[39, 40, '/agentic-ai/security/prompt-injection/', 'Prompt injection'],
	[41, 46, '/agentic-ai/agents/', 'What makes a system an agent'],
	[47, 55, '/agentic-ai/agents/agent-loop/', 'The agent loop'],
	[56, 68, '/agentic-ai/context-and-memory/', 'Context engineering and memory'],
	[69, 80, '/agentic-ai/agents/planning-and-control/', 'Planning and control'],
	[81, 90, '/agentic-ai/orchestration/', 'Agent orchestration'],
	[91, 110, '/agentic-ai/orchestration/durable-execution/', 'Durable agent execution'],
	[111, 122, '/agentic-ai/tools/', 'Tools and function calls'],
	[123, 140, '/agentic-ai/tools/safe-execution/', 'Safe tool execution'],
	[141, 160, '/agentic-ai/mcp/', 'MCP mental model'],
	[161, 175, '/agentic-ai/mcp/integration-patterns/', 'MCP integration patterns'],
	[176, 195, '/agentic-ai/mcp/security-and-operations/', 'MCP security and operations'],
	[196, 211, '/agentic-ai/mcp/integration-patterns/', 'MCP integration patterns'],
	[212, 240, '/agentic-ai/multi-agent/', 'Multi-agent systems'],
	[241, 270, '/agentic-ai/multi-agent/subagents/', 'Subagents and handoffs'],
	[271, 292, '/agentic-ai/walkthroughs/', 'Agentic system walkthroughs'],
	[293, 309, '/agentic-ai/context-and-memory/', 'Context engineering and memory'],
	[310, 326, '/agentic-ai/context-and-memory/', 'Context engineering and memory'],
	[327, 337, '/agentic-ai/rag/agentic-rag/', 'Agentic RAG'],
	[338, 342, '/agentic-ai/rag/evaluation-and-security/', 'Evaluate and secure RAG'],
	[343, 357, '/agentic-ai/security/prompt-injection/', 'Prompt injection'],
	[358, 376, '/agentic-ai/security/identity-and-sandboxing/', 'Identity and sandboxing'],
	[377, 397, '/agentic-ai/production/reliability/', 'Agent reliability'],
	[398, 413, '/agentic-ai/production/observability/', 'Agent observability'],
	[414, 435, '/agentic-ai/production/evaluation/', 'Agent evaluation'],
	[436, 451, '/agentic-ai/production/performance-and-cost/', 'Agent performance and cost'],
	[452, 474, '/agentic-ai/frameworks/', 'Choose an agent framework'],
	[475, 497, '/agentic-ai/tutorials/tool-agent/', 'Hands-on tutorials'],
	[498, 519, '/agentic-ai/walkthroughs/', 'Agentic system walkthroughs'],
	[520, 540, '/agentic-ai/production/', 'Production readiness'],
	[541, 560, '/agentic-ai/reference/decision-guide/', 'Agent architecture decision guide'],
];

const exactReadings = new Map([
	[3, ['/agentic-ai/foundations/transformers-and-attention/', 'Transformers and attention']],
	[4, ['/agentic-ai/foundations/transformers-and-attention/', 'Transformers and attention']],
	[5, ['/agentic-ai/foundations/tokens-and-context/', 'Tokens and context windows']],
	[6, ['/agentic-ai/foundations/tokens-and-context/', 'Tokens and context windows']],
	[7, ['/agentic-ai/foundations/tokens-and-context/', 'Tokens and context windows']],
	[8, ['/agentic-ai/foundations/generation-and-structured-output/', 'Sampling and structured output']],
	[9, ['/agentic-ai/foundations/generation-and-structured-output/', 'Sampling and structured output']],
	[10, ['/agentic-ai/foundations/generation-and-structured-output/', 'Sampling and structured output']],
	[32, ['/agentic-ai/rag/retrieval-pipeline/', 'Build the retrieval pipeline']],
	[33, ['/agentic-ai/rag/retrieval-pipeline/', 'Build the retrieval pipeline']],
	[34, ['/agentic-ai/rag/retrieval-pipeline/', 'Build the retrieval pipeline']],
	[35, ['/agentic-ai/rag/retrieval-pipeline/', 'Build the retrieval pipeline']],
	[36, ['/agentic-ai/rag/retrieval-pipeline/', 'Build the retrieval pipeline']],
	[37, ['/agentic-ai/rag/retrieval-pipeline/', 'Build the retrieval pipeline']],
	[38, ['/agentic-ai/production/performance-and-cost/', 'Agent performance and cost']],
	[475, ['/agentic-ai/tutorials/tool-agent/', 'Build a bounded tool agent']],
	[476, ['/agentic-ai/tutorials/tool-agent/', 'Build a bounded tool agent']],
	[477, ['/agentic-ai/tutorials/tool-agent/', 'Build a bounded tool agent']],
	[478, ['/agentic-ai/tutorials/tool-agent/', 'Build a bounded tool agent']],
	[479, ['/agentic-ai/tutorials/tool-agent/', 'Build a bounded tool agent']],
	[480, ['/agentic-ai/tutorials/tool-agent/', 'Build a bounded tool agent']],
	[481, ['/agentic-ai/tutorials/tool-agent/', 'Build a bounded tool agent']],
	[482, ['/agentic-ai/tutorials/tool-agent/', 'Build a bounded tool agent']],
	[483, ['/agentic-ai/tutorials/subagents/', 'Build a subagent workflow']],
	[484, ['/agentic-ai/tutorials/subagents/', 'Build a subagent workflow']],
	[485, ['/agentic-ai/tutorials/subagents/', 'Build a subagent workflow']],
	[486, ['/agentic-ai/tutorials/subagents/', 'Build a subagent workflow']],
	[487, ['/agentic-ai/context-and-memory/', 'Context engineering and memory']],
	[488, ['/agentic-ai/foundations/embeddings/', 'Embeddings and semantic search']],
	[489, ['/agentic-ai/tutorials/rag/', 'Build a small RAG system']],
	[490, ['/agentic-ai/tutorials/rag/', 'Build a small RAG system']],
	[491, ['/agentic-ai/tutorials/rag/', 'Build a small RAG system']],
	[492, ['/agentic-ai/tutorials/mcp-server/', 'Build an MCP server']],
	[493, ['/agentic-ai/tutorials/mcp-server/', 'Build an MCP server']],
	[494, ['/agentic-ai/tutorials/mcp-server/', 'Build an MCP server']],
	[495, ['/agentic-ai/mcp/security-and-operations/', 'MCP security and operations']],
	[496, ['/agentic-ai/mcp/security-and-operations/', 'MCP security and operations']],
	[497, ['/agentic-ai/tutorials/tool-agent/', 'Build a bounded tool agent']],
	[498, ['/agentic-ai/walkthroughs/enterprise-assistant/', 'Enterprise assistant']],
	[499, ['/agentic-ai/walkthroughs/enterprise-assistant/', 'Enterprise assistant']],
	[500, ['/agentic-ai/walkthroughs/enterprise-assistant/', 'Enterprise assistant']],
	[501, ['/agentic-ai/walkthroughs/enterprise-assistant/', 'Enterprise assistant']],
	[502, ['/agentic-ai/walkthroughs/enterprise-assistant/', 'Enterprise assistant']],
	[503, ['/agentic-ai/walkthroughs/enterprise-assistant/', 'Enterprise assistant']],
	[504, ['/agentic-ai/walkthroughs/enterprise-assistant/', 'Enterprise assistant']],
	[505, ['/agentic-ai/walkthroughs/enterprise-assistant/', 'Enterprise assistant']],
	[506, ['/agentic-ai/walkthroughs/coding-agent/', 'Coding agent']],
	[507, ['/agentic-ai/walkthroughs/coding-agent/', 'Coding agent']],
	[508, ['/agentic-ai/walkthroughs/coding-agent/', 'Coding agent']],
	[509, ['/agentic-ai/walkthroughs/coding-agent/', 'Coding agent']],
	[510, ['/agentic-ai/walkthroughs/coding-agent/', 'Coding agent']],
	[511, ['/agentic-ai/walkthroughs/coding-agent/', 'Coding agent']],
	[512, ['/agentic-ai/walkthroughs/coding-agent/', 'Coding agent']],
	[513, ['/agentic-ai/walkthroughs/devops-agent/', 'DevOps investigation agent']],
	[514, ['/agentic-ai/walkthroughs/devops-agent/', 'DevOps investigation agent']],
	[515, ['/agentic-ai/walkthroughs/devops-agent/', 'DevOps investigation agent']],
	[516, ['/agentic-ai/walkthroughs/devops-agent/', 'DevOps investigation agent']],
	[517, ['/agentic-ai/walkthroughs/devops-agent/', 'DevOps investigation agent']],
	[518, ['/agentic-ai/walkthroughs/devops-agent/', 'DevOps investigation agent']],
	[519, ['/agentic-ai/walkthroughs/devops-agent/', 'DevOps investigation agent']],
	[520, ['/agentic-ai/agents/agent-loop/', 'The agent loop']],
	[521, ['/agentic-ai/agents/agent-loop/', 'The agent loop']],
	[522, ['/agentic-ai/tools/', 'Tools and function calls']],
	[523, ['/agentic-ai/tools/', 'Tools and function calls']],
	[524, ['/agentic-ai/tools/safe-execution/', 'Safe tool execution']],
	[525, ['/agentic-ai/security/prompt-injection/', 'Prompt injection']],
	[526, ['/agentic-ai/security/prompt-injection/', 'Prompt injection']],
	[527, ['/agentic-ai/mcp/security-and-operations/', 'MCP security and operations']],
	[528, ['/agentic-ai/tools/safe-execution/', 'Safe tool execution']],
	[529, ['/agentic-ai/production/reliability/', 'Agent reliability']],
	[530, ['/agentic-ai/production/reliability/', 'Agent reliability']],
	[531, ['/agentic-ai/multi-agent/subagents/', 'Subagents and handoffs']],
	[532, ['/agentic-ai/multi-agent/subagents/', 'Subagents and handoffs']],
	[533, ['/agentic-ai/production/performance-and-cost/', 'Agent performance and cost']],
	[534, ['/agentic-ai/production/evaluation/', 'Agent evaluation']],
	[535, ['/agentic-ai/production/performance-and-cost/', 'Agent performance and cost']],
	[536, ['/agentic-ai/production/performance-and-cost/', 'Agent performance and cost']],
	[537, ['/agentic-ai/rag/evaluation-and-security/', 'Evaluate and secure RAG']],
	[538, ['/agentic-ai/rag/evaluation-and-security/', 'Evaluate and secure RAG']],
	[539, ['/agentic-ai/security/identity-and-sandboxing/', 'Identity and sandboxing']],
	[540, ['/agentic-ai/security/prompt-injection/', 'Prompt injection']],
	[546, ['/agentic-ai/production/', 'Production readiness']],
	[547, ['/agentic-ai/security/', 'Agent security']],
	[548, ['/agentic-ai/security/identity-and-sandboxing/', 'Identity and sandboxing']],
	[549, ['/agentic-ai/multi-agent/', 'Multi-agent systems']],
	[550, ['/agentic-ai/production/observability/', 'Agent observability']],
	[551, ['/agentic-ai/tools/safe-execution/', 'Safe tool execution']],
	[552, ['/agentic-ai/tools/safe-execution/', 'Safe tool execution']],
	[553, ['/agentic-ai/production/observability/', 'Agent observability']],
	[554, ['/agentic-ai/production/reliability/', 'Agent reliability']],
	[555, ['/agentic-ai/production/performance-and-cost/', 'Agent performance and cost']],
	[556, ['/agentic-ai/mcp/security-and-operations/', 'MCP security and operations']],
	[557, ['/agentic-ai/mcp/integration-patterns/', 'MCP integration patterns']],
	[558, ['/agentic-ai/mcp/', 'MCP mental model']],
	[559, ['/agentic-ai/multi-agent/subagents/', 'Subagents and handoffs']],
	[560, ['/agentic-ai/multi-agent/', 'Multi-agent systems']],
]);

const sectionRanges = [
	[1, 40, 'Generative AI and LLM foundations'],
	[41, 80, 'Agentic AI foundations'],
	[81, 110, 'Agent architecture'],
	[111, 140, 'Tool calling'],
	[141, 195, 'Model Context Protocol'],
	[196, 211, 'MCP scenarios'],
	[212, 240, 'Multi-agent systems'],
	[241, 270, 'Subagents'],
	[271, 292, 'Multi-agent architecture scenarios'],
	[293, 309, 'Context engineering'],
	[310, 326, 'Agent memory'],
	[327, 342, 'RAG for agents'],
	[343, 376, 'Security'],
	[377, 397, 'Reliability and production engineering'],
	[398, 413, 'Observability'],
	[414, 435, 'Evaluation'],
	[436, 451, 'Performance and cost'],
	[452, 474, 'Frameworks'],
	[475, 497, 'Coding exercises'],
	[498, 519, 'System design'],
	[520, 540, 'Failure scenarios'],
	[541, 560, 'Senior engineering decisions'],
];

function readingFor(questionNumber) {
	const exact = exactReadings.get(questionNumber);
	if (exact) return { url: exact[0], title: exact[1] };
	const rule = readingRules.find(([start, end]) => questionNumber >= start && questionNumber <= end);
	if (!rule) throw new Error(`No reading rule for question ${questionNumber}`);
	return { url: rule[2], title: rule[3] };
}

function sectionFor(questionNumber) {
	const section = sectionRanges.find(([start, end]) => questionNumber >= start && questionNumber <= end);
	if (!section) throw new Error(`No section for question ${questionNumber}`);
	return section[2];
}

const source = await readFile(sourcePath, 'utf8');
const questions = [];

for (const line of source.split(/\r?\n/)) {
	const match = line.match(/^(\d+)\.\s+(.+)$/);
	if (!match) continue;
	const number = Number(match[1]);
	if (number === questions.length + 1 && number <= 560) {
		questions.push({ number, text: match[2].replaceAll('|', '\\|') });
	}
	if (questions.length === 560) break;
}

if (questions.length !== 560) {
	throw new Error(`Expected 560 sequential questions, found ${questions.length}`);
}

const lines = [
	'---',
	'title: Agentic AI question coverage',
	'description: Map all 560 source questions to the handbook pages that teach the underlying topics.',
	'---',
	'',
	'This index proves coverage of the original study list. The handbook uses a dependency-based learning order instead of presenting 560 isolated answers.',
	'',
	'Questions retain their original wording. A mapping identifies the primary reading page. Related links on that page lead to deeper material.',
	'',
];

let currentSection = '';
for (const question of questions) {
	const section = sectionFor(question.number);
	if (section !== currentSection) {
		if (currentSection) lines.push('');
		lines.push(`## ${section}`, '', '| # | Source question | Primary reading |', '|---:|---|---|');
		currentSection = section;
	}
	const reading = readingFor(question.number);
	lines.push(`| ${question.number} | ${question.text} | [${reading.title}](${reading.url}) |`);
}

lines.push('', '## Coverage check', '', `- Questions mapped: ${questions.length}`, '- Expected sequence: 1 through 560', '- Generated by `scripts/build-agentic-ai-question-map.mjs` from the preserved source list.');

await writeFile(outputPath, `${lines.join('\n')}\n`, 'utf8');
