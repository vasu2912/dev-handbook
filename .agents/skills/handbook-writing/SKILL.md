---
name: handbook-writing
description: House style for handbook articles in src/content/docs. Use when writing a new article, rewriting or restructuring an existing one, or reviewing article prose.
---

# Handbook writing

Every article answers five questions in order: what problem is the reader facing, what is the simplest fix, where does it break, what do they do instead, and when should they choose it. Theory serves a decision the reader has to make. If a section explains a mechanism without leading to a decision, it is not finished.

Apply `unslop` to every sentence you write. Pick the page type and its outline from [`TEMPLATES.md`](TEMPLATES.md). Worked before-and-after rewrites live in [`EXAMPLES.md`](EXAMPLES.md); read them before your first article in a session.

## Steps

1. **Pick the page type.** Concept, technology, pattern, design walkthrough, or guide. Done when the article's outline matches that type's template in `TEMPLATES.md`, with any skipped section skipped for a stated reason.
2. **Choose the running example.** One concrete system the whole article returns to: a checkout service, a chat app, a ride-hailing dispatcher. Done when every H2 uses it at least once.
3. **Gather the numbers.** Latencies, sizes, rates, limits, and the names of real systems that implement the idea. Done when each H2 holds at least one number or named system the reader can anchor on. Use public, checkable figures and round them ("about 1 ms", "roughly 500 GB").
4. **Write the opening** (see below). Done when the first paragraph names a situation and its pain, and the definition arrives no earlier than the second paragraph.
5. **Write each section with the explanation loop** (see below). Done when every option and every strategy ends on a verdict.
6. **Write the ending** (see below).
7. **Check the article** against the checklist at the bottom, then run `pnpm check`. Done when every checklist line holds and the check passes.

When rewriting an existing article, keep its file path, frontmatter `title`, and its place in `src/navigation.json`. Renaming a heading changes its anchor: search `src/content/docs` for links to the old anchor and update them. `pnpm check` fails on a broken anchor. A new article also needs an entry in `src/navigation.json`.

## The opening

Start from the reader's situation, then the pain, then the idea, then the catch, then a one-sentence roadmap.

- **Situation.** Second person, present tense, concrete. "Your checkout service calls the payment provider. The response never arrives."
- **Pain.** What goes wrong and what it costs. Use a number when one exists: "Postgres answers in about 50 ms. Under load that climbs past 400 ms."
- **Idea.** Name the concept and give a one-sentence definition. A bold thesis line works well here.
- **Catch.** The idea solves the pain and creates a new problem. Say which.
- **Roadmap.** One sentence on what the article covers. Skip it for articles under five minutes.

The frontmatter `description` is the subtitle under the title. Write it as the outcome the reader gets, in one sentence.

## The explanation loop

Each strategy, pattern, or option gets the same sequence of moves:

1. **Verdict or one-line definition first.** "This is the default. Reach for it unless you have a reason not to."
2. **How it works.** A numbered flow of three to five steps, written against the running example.
3. **Diagram**, placed right after the sentence that introduces it.
4. **Trade-off.** The upside, then "The downside is…" in one or two sentences.
5. **Where it breaks.** The failure mode, then the fix or the next option.
6. **When to use it.** One line, with the deciding condition in bold: "Use this when **writes must never be lost**."
7. **Interview verdict**, when the topic comes up in interviews: how common it is, what interviewers expect, or the one thing to remember.

Moves 3 and 7 are optional per section. Moves 1, 4, and 6 are required.

### The option ladder

When a problem has several solutions, present them from simplest to strongest. Name each rung for its role so the reader knows where it sits before reading it:

```markdown
### Naive approach: lock the row for the whole checkout
**How it works.** …
**Where it breaks.** …

### Better approach: reserve with an expiry time
**How it works.** …
**Where it breaks.** …

### Strong approach: atomic reservation in the cache
**How it works.** …
**Where it breaks.** …
```

The labels are `Naive approach`, `Better approach`, and `Strong approach`. The ladder does not have to be complete: two strong approaches and no naive one is fine. Introduce the naive rung by naming the mistake directly ("The first idea most people try is…"). Every rung, including the strongest, gets a **Where it breaks** paragraph. Close the ladder with a sentence on what decides between the rungs.

## The ending

A concept, technology, or pattern article ends with an H2 `Summary` of four short paragraphs:

1. A one-line restatement: "Caching is what you do when reading from the source is too slow or too expensive."
2. The core trade-off in one or two sentences.
3. "In an interview, bring this up when…" followed by a short checklist in one sentence.
4. The one mistake to avoid, stated as an imperative, plus one contrast sentence: "Don't shard early. A well-indexed single database handles more than most people expect."

A `## Sources` list of the external references used may follow the summary; it is the only thing that does.

Design walkthroughs end with the final design diagram and a level-expectations section instead (see `TEMPLATES.md`). Guides end with the next step for the reader, not a recap.

## Voice

- **Talk to the reader as "you".** Use "we" for the design being built together ("we check the cache first"). Avoid "I" and claims of personal experience the handbook cannot back up.
- **The interviewer is a character.** Say what interviewers assume, probe, and look for: "Interviewers will ask what happens when the lock holder crashes." Present this as common practice, never as a first-hand anecdote.
- **Give verdicts.** "Default to cache-aside." "Don't reach for two-phase commit." Hedge on degree ("usually", "in most systems"), never on direction.
- **Name the common mistake.** "A common mistake is to publish the event before the transaction commits."
- **Write one rule worth remembering per H2.** A short sentence, often in bold, that the reader could repeat in an interview: "**Treat a cache as a copy you can lose, never as the source of truth.**"
- **Stay plain and calm.** Light, dry asides are fine ("Ok, that was a lot."). Exclamation marks at most once per article. No hype words, no emoji.

## Mechanics

- **Paragraphs:** two to four sentences. Use a one-sentence paragraph for emphasis or a transition.
- **Sentences:** vary length. Follow a long explanatory sentence with a short one.
- **Prose first.** Roughly two thirds prose. Use numbered lists for flows and steps, bullets for sets of fixes or options. Give a bullet a bold lead-in only when it names the item ("**Request coalescing.** One request fetches; the rest wait.").
- **Ask before you answer.** A plain question paragraph ("But what if the cache node dies?") leads into the next idea. Questions are prose, not headings, except in the interview-questions section.
- **Bold** marks decisions, rules, and the first use of a key term. Never bold a whole paragraph.
- **Tables** only for reference data the reader scans: status codes, limits, a comparison of more than three options across more than two attributes. Make the comparison in prose first, and end it with a verdict.
- **Code** blocks stay short: one to eight lines, with comments on the lines that matter, followed by a sentence saying what the code shows. Write APIs as `POST /v1/orders -> Order`.
- **Back-of-envelope math** goes in a code block, one step per line, then rounded:

  ```text
  10M daily users × 20 reads = 200M reads/day
  200M / 86,400 s ≈ 2,300 reads/s average
  × 10 at peak ≈ 23,000 reads/s
  ```

## Visuals

- **A diagram for each major idea.** Aim for one per H2 in concept, pattern, and walkthrough articles.
- **Number and caption every figure, as in a book.** Put an ID and a caption on the fence's first line: ```` ```mermaid #fig-cache-miss The read path on a cache miss. The service falls back to the database and fills the cache. ````. The caption is a short title sentence, then one or two sentences saying what to notice. The build numbers figures in page order and renders "Figure N." before the caption.
- **Refer to the figure from the text.** Write `[Figure](#fig-cache-miss)` in the sentence that introduces it ("[Figure](#fig-cache-miss) shows the read path on a miss."). The build turns the link into "Figure N" and fails on a reference to a missing figure. Every figure is referenced at least once, before it appears.
- **Walk through it.** After a diagram with more than three boxes, a numbered walkthrough names each box in bold, in diagram order.
- **Formats.** Use a ```` ```mermaid ```` fence for flows and sequences. Use an Anatomy figure (`<div data-anatomy="…">`) only when one exists for the topic; see `diagrams/anatomy.md`. Each article supports one interactive figure.
- **Callouts** are rare: two or three per article, each with a specific title. Use `:::tip[In an interview]` for an interview angle, `:::caution[Common mistake]` for a trap, and `:::note[Related pattern]` to point at a pattern article. Keep each callout to three sentences or fewer.

## Checklist

- [ ] The outline matches the page type's template, or a skipped section has a reason.
- [ ] The opening starts with a situation and its pain; the definition comes no earlier than the second paragraph.
- [ ] One running example appears in every H2.
- [ ] Every H2 has a number or a named real system.
- [ ] Every option, strategy, and ladder rung ends with a verdict or a "use this when" line.
- [ ] Every ladder rung has a **Where it breaks** paragraph.
- [ ] Each H2 has one rule worth remembering.
- [ ] Each major idea has a numbered, captioned figure that the text references before it appears.
- [ ] Paragraphs are four sentences or fewer.
- [ ] The ending matches the page type.
- [ ] `unslop` passes: no em dashes, sentence-case headings, no filler.
- [ ] Links to renamed headings are updated, and `pnpm check` passes.
