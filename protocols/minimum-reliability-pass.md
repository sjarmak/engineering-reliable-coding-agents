# Minimum reliability pass

Use this pass when a team cannot adopt the full apparatus at once. It orders
six controls by dependency, not by claimed universal return on investment.

## Inputs

- one representative task family;
- one agent, model, harness, and tool-policy revision;
- a small repeated-run budget;
- a named reviewer and an output directory.

## Run

1. Execute the same representative tasks more than once and retain each result.
2. Verify outcomes through execution or another decision-relevant oracle.
3. Run the agent with an ordinary identity that lacks destructive authority.
4. Persist task state outside the model context and retry one interrupted run.
5. Retain the raw action trace and ask a reviewer to reconstruct one failure.
6. Record cost and elapsed time beside quality, then name the incumbent system.

## Pass condition

The pass succeeds only when all six steps leave inspectable artifacts tied to
the same system revision. A failed step becomes the next engineering target; it
must not be averaged away by the other five.

## Retained artifact

Create `minimum-pass/<date>-<revision>/` containing a manifest, repeated-run
results, oracle output, authority-denial record, interrupted-run record, raw
trace with reviewer attribution, and cost/time summary.
