# Recovery fault-injection protocol

Mapped practices: **ERCA-097** and **ERCA-127**.

## Decision

Determine whether one workflow recovers safely from a named interruption or
ambiguous external effect.

## Run

1. Select one completion claim and identify its durable state, external effects,
   retry boundary, and idempotency or deduplication key.
2. Record a successful baseline trace and its terminal artifact.
3. Inject one realistic fault at a declared event boundary: worker loss,
   timeout, stale lease, duplicated delivery, or response loss after an external
   write.
4. Restore the worker through the production recovery path. Do not repair state
   by hand unless manual recovery is the path under test.
5. Compare the recovered trace and terminal artifact with the baseline, then
   inspect external systems for missing or duplicated effects.

## Pass condition

The workflow reaches a valid terminal state, applies every required external
effect exactly under its declared contract, avoids unauthorized duplicate
effects, and leaves a trace from which the injected fault and recovery are
reconstructable.

## Retained artifact

Keep the fault specification, baseline and recovered typed traces, external
effect ledger, terminal artifacts, and a pass/fail record tied to the workflow
revision.
