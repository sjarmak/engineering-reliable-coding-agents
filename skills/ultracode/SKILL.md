---
name: ultracode
description: Execute a locked, non-trivial implementation goal autonomously through verified completion. Use after requirements have been resolved and a Codex goal is active, especially for multi-session repository work that needs durable issue tracking, resumable execution, quality gates, and persistent progress without repeated user prompting. Do not use for discovery, brainstorming, ambiguous specifications, or ordinary one-turn edits.
---

# Ultracode

Turn a locked specification into a verified result. Treat the active goal as the
terminal condition, repository tracking as durable work state, and tests plus
acceptance criteria as the completion oracle.

## Enter

1. Read the active goal. If none exists, stop and ask the user to create or
   authorize one; never infer goal authority.
2. Recover repository instructions and current state. Read applicable skills
   before acting.
3. Confirm the specification has no unresolved choice that would materially
   change the result. Return unresolved design work to requirements
   clarification before execution.
4. In a Beads repository, run `bd prime`, inspect ready and active work, and
   create or claim the smallest issue that advances the goal before editing.
   Else use the repository's durable tracker.

## Execute

Work in vertical, resumable slices:

1. Select the highest-leverage unblocked slice.
2. Record its acceptance oracle in the durable tracker.
3. Inspect existing code and tests before editing.
4. Implement the smallest complete change that satisfies the oracle.
5. Verify at the narrowest useful level, then run broader gates proportional to
   risk.
6. Update or close the durable issue only when its acceptance criteria hold.
7. Re-read the active goal and select the next slice.

Prefer informed action over status narration. Preserve user changes and existing
architecture. Create follow-up issues for discovered work; never hide it in
markdown TODOs or conversational memory.

## Verification Contract

Completion requires evidence, not confidence:

- Map every locked acceptance criterion to a check or artifact.
- Test failure paths and boundary conditions, not only the happy path.
- Run repository tests, lint, type checks, builds, and domain-specific
  validation when relevant.
- Inspect diffs and repository status before handoff.
- For research or data pipelines, validate provenance, determinism, leakage
  controls, checksums, and reproducibility in addition to code correctness.
- Never weaken a gate to make the work pass. Report a failed gate as a result
  when the locked specification requires it.

Use additional review, security, TDD, or verification skills when their trigger
conditions apply. They refine this loop; they do not replace its terminal
condition.

## Persistence

Assume execution may span turns or context compaction:

- Keep shared state in the repository tracker.
- Keep the goal active while required work remains.
- Store durable discoveries in the repository's approved memory mechanism.
- At every handoff, leave the next slice, current evidence, and exact blocker
  recoverable without conversation history.
- Continue automatically while safe in-scope work remains.

Do not broaden authority. Ask only when completion requires a material user
choice, external authorization, destructive action outside scope, or unavailable
secret. A hard or slow task is not a blocker.

## Exit

Before declaring completion:

1. Close completed durable issues.
2. Run the final quality and acceptance gates.
3. Inspect working-tree and sync state.
4. Follow repository policy for commits and pushes; never infer permission.
5. Mark the active goal complete only when its full objective is achieved and no
   required work remains.
6. Report the outcome, evidence, changed artifacts, tracker state, and any
   intentionally unperformed commit or sync step.

If genuinely blocked, preserve the exact condition and attempted alternatives.
Use the goal's blocked state only after its required repeated-blocker threshold
is satisfied.

## Evidence provenance

Read [references/evidence-map.md](references/evidence-map.md) when auditing the
workflow's persistent-state, verification, escalation, and handoff rules. This
skill is a Codex-oriented operational synthesis; it does not establish that the
same autonomy level or tracker contract fits another deployment.
