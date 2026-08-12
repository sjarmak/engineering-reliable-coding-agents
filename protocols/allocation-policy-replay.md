# Allocation-policy replay

Mapped practices: **ERCA-171**, **ERCA-187**, and **ERCA-191**.

## Decision

Determine whether a candidate routing policy improves the quality-cost-time
frontier over the live incumbent without hiding deadline failures.

## Run

1. Freeze a trace set containing arrival times, task features available at the
   decision point, eligible workers, measured outcomes, costs, latencies, and
   deadlines. Remove features learned only after routing. Keep model calls
   grouped by turn and session: sampling them as independent requests discards
   the inference-state reuse that sets what the calls actually cost.
2. Replay the incumbent policy and reproduce its observed decisions within a
   declared tolerance.
3. Replay the candidate policy on the same arrivals and worker availability.
   Recompute when the policy claims it would have re-decided.
4. Compare feasible completion rate, quality, total cost, tail latency, and the
   quality of the best result available at each deadline.
5. Inspect regressions by task stratum and simulate one worker-loss or queue-load
   shift before promotion.

## Pass condition

Promote only when the candidate clears the predeclared decision threshold,
meets budget and deadline constraints, and introduces no unacceptable stratum
or fault-scenario regression. Otherwise retain the incumbent and record the
candidate as rejected or unresolved.

## Retained artifact

Keep the immutable replay manifest, input trace hash, both policy revisions,
per-decision replay output, metric summary, regression slices, and promotion
decision.
