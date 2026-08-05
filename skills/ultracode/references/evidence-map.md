# Evidence and practice map

This Codex-oriented skill consolidates persistent execution and verification
rules. It is an implementation artifact, not evidence for unrestricted autonomy
or for any particular task tracker.

## Mapped practices

- `make-agent-state-first-class-persistent`: keep goal and task state outside the model context.
- `ground-evaluation-in-execution`: use executable checks as completion evidence.
- `distrust-agent-self-reports`: inspect artifacts, diffs, and repository state before closing work.
- `place-human-checkpoints-at-failure-points`: ask for human decisions at material authority and design boundaries.
- `consolidate-spec-restart-lost-runs`: require a locked, coherent specification before autonomous execution.
- `durable-artifact-handoff`: make progress recoverable across turns and context compaction.

The first three and specification-restart practices are developed in the
manuscript. Human checkpoint placement is companion-only. Durable artifact
handoff is thin-support and should be evaluated in the deployment where the
skill is used.
