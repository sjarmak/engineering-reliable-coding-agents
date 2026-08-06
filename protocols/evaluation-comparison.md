# Evaluation comparison protocol

Mapped practices: **ERCA-020**, **ERCA-024**, and **ERCA-025**.

## Decision

Decide whether candidate B improves a named engineering outcome over incumbent
A on the workload that will govern deployment.

## Run

1. Freeze the task set, oracle, system revisions, decoding settings, and cost
   accounting rule. Define the smallest effect worth acting on.
2. Pair A and B on the same tasks and nuisance conditions. Randomize execution
   order where order can affect the result.
3. Choose the number of repeats from the observed or pilot variance. If the
   budget cannot detect the target effect, record that limitation before use.
4. Run both systems, retaining per-task outcomes, seeds, execution logs, costs,
   and failures. Do not collapse repeated runs before inspection.
5. Estimate the paired difference with an uncertainty interval using a method
   matched to the metric. Plot the paired differences or outcome distributions.

## Pass condition

B passes only if the estimated improvement clears the predeclared engineering
threshold, its uncertainty does not cross the no-change boundary chosen for the
decision, and no safety or cost constraint fails. Otherwise retain A or report
the comparison as unresolved.

## Retained artifact

Store `comparison-manifest.json`, one row per task/run in `outcomes.csv`, raw
logs, the analysis script or notebook, and a one-page decision record.
