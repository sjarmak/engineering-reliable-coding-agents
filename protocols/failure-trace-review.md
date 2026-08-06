# Failure-trace review

Mapped practices: **ERCA-045**, **ERCA-046**, and **ERCA-047**.

## Decision

Determine whether a retained trace supports a reproducible attribution to the
earliest upstream failure the record can establish.

## Run

1. Sample one failed task without showing the original operator's label to the
   reviewer.
2. Give the reviewer the raw ordered events, revisions, tool inputs and outputs,
   state transitions, and terminal artifact. Exclude post hoc narrative.
3. Ask the reviewer to identify the first supported failure, downstream effects,
   missing evidence, and the narrowest taxonomy label that fits.
4. Compare the attribution with the original label. Resolve disagreements by
   locating the missing or ambiguous event, not by majority preference alone.
5. Amend the trace schema or taxonomy when the record cannot distinguish
   competing mechanisms.

## Pass condition

The reviewer can cite the event that supports the attribution, distinguish it
from downstream symptoms, and reproduce the label using the published taxonomy.
If not, the trace or taxonomy fails the review.

## Retained artifact

Keep the sampled trace identifier, blinded reviewer response, original label,
adjudication note, and any schema or taxonomy change.
