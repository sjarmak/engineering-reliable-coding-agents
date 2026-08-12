# Evidence and practice map

This Codex-oriented skill consolidates persistent execution and verification
rules. It is an implementation artifact, not evidence for unrestricted autonomy
or for any particular task tracker.

## Mapped practices

`ERCA-NNN` is the stable identifier of a practice record in the companion
catalog, after the initials of *Engineering Reliable Coding Agents*. Resolve
one in [`companion/catalog.json`](https://github.com/sjarmak/engineering-reliable-coding-agents/blob/main/companion/catalog.json)
or on the [companion site](https://sjarmak.ai/books/engineering-reliable-coding-agents/companion).

- `ERCA-130` · `make-agent-state-first-class-persistent`: keep goal and task state outside the model context.
- `ERCA-094` · `ground-evaluation-in-execution`: use executable checks as completion evidence.
- `ERCA-069` · `distrust-agent-self-reports`: inspect artifacts, diffs, and repository state before closing work.
- `ERCA-106` · `place-human-checkpoints-at-failure-points`: ask for human decisions at material authority and design boundaries.
- `ERCA-088` · `consolidate-spec-restart-lost-runs`: require a locked, coherent specification before autonomous execution.
- `ERCA-099` · `durable-artifact-handoff`: make progress recoverable across turns and context compaction.

The first three and specification-restart practices are developed in the
manuscript. Human checkpoint placement is companion-only. Durable artifact
handoff is thin-support and should be evaluated in the deployment where the
skill is used.
