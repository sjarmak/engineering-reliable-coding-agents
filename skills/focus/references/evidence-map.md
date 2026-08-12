# Evidence and practice map

This skill is a tracker-agnostic implementation of persistent work state and
verification discipline. It does not establish that one task granularity or
handoff format is optimal for every repository.

## Mapped practices

`ERCA-NNN` is the stable identifier of a practice record in the companion
catalog, after the initials of *Engineering Reliable Coding Agents*. Resolve
one in [`companion/catalog.json`](https://github.com/sjarmak/engineering-reliable-coding-agents/blob/main/companion/catalog.json)
or on the [companion site](https://sjarmak.ai/books/engineering-reliable-coding-agents/companion).

- `ERCA-130` · `make-agent-state-first-class-persistent`: externalize progress and acceptance state from the model context.
- `ERCA-088` · `consolidate-spec-restart-lost-runs`: restart from a coherent specification instead of patching a run that lost the task.
- `ERCA-069` · `distrust-agent-self-reports`: verify actual diff and repository state before accepting completion.
- `ERCA-153` · `make-verification-cheaper-than-acceptance`: make acceptance checks part of the normal execution path.
- `ERCA-099` · `durable-artifact-handoff`: hand work across sessions through durable references rather than conversational summaries alone.

The first four practices are developed in the manuscript. Durable artifact
handoff is a thin-support companion entry, so treat this skill's handoff contract
as an observable implementation hypothesis rather than a broadly validated rule.
