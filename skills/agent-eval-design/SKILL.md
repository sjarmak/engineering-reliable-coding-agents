---
name: "agent-eval-design"
description: "Design rigorous evaluations and benchmarks for AI agents, developer tools, retrieval systems, and repository-scale automation. Covers task selection, contamination control, metric choice tied to engineering decisions, and statistical validity. Use when asked to design an eval/benchmark, critique an existing benchmark, choose metrics for an agent or RAG system, or decide whether a measured improvement is real. NOT for running an existing performance-benchmark suite or a per-feature acceptance checklist, or one-off model spot-checks."
---

# Agent Evaluation & Benchmark Design

Design evaluations for AI agents, dev tools, retrieval, and repo-scale
automation. **Evaluation quality beats benchmark size** — a small set of real,
uncontaminated, decision-driving tasks is worth more than thousands of synthetic
puzzles.

## Core principles

- **Measure real tasks.** Representative workloads over synthetic puzzles. If no
  one does the task in practice, the number is noise.
- **Separate capability from prompt engineering.** Hold the harness/prompt fixed
  when comparing models; hold the model fixed when comparing prompts. Report which
  you varied. A gain you can't attribute is a gain you can't ship.
- **Every metric must change an engineering decision.** Before adding a metric,
  name the decision it informs. If nothing changes based on its value, cut it.
- **Reproducibility is a first-class result.** Pin model versions, seeds, dataset
  hashes, harness commit, and date. An unrepeatable eval is an anecdote.
- **Minimize contamination.** Assume public benchmarks are in training data;
  prefer held-out, private, or post-cutoff tasks and say so.

## Dimensions to consider

Correctness · completeness · reliability · latency · cost · determinism ·
reproducibility · developer effort · failure recovery · robustness. Pick the few
that map to real decisions for _this_ system; don't report all ten by reflex.

## Repository-scale evaluations

For agents that operate over codebases, evaluate the axes that synthetic tasks
miss: repository understanding, cross-file reasoning, architectural consistency,
migration quality, semantic correctness (not just diff-match), dependency
propagation, test generation, and documentation accuracy. Verify outcomes by
execution (tests pass, build green, behavior preserved) rather than string
similarity to a reference solution.

## Benchmark design — audit before trusting

Before believing a benchmark, check it for:

- **Contamination / dataset leakage** — is the answer reachable from training
  data or from the prompt itself?
- **Unrealistic tasks** — puzzle-shaped work no engineer actually does.
- **Missing edge cases** — the failure modes that matter live in the tail.
- **Insufficient statistical power** — enough trials and items to distinguish
  signal from run-to-run variance? Report variance/CIs, not a single point.
- **Evaluation blind spots** — what the metric structurally cannot see (e.g.
  pass@1 hides flakiness; exact-match hides correct-but-different solutions).

## Metrics: engineering value, not leaderboard rank

Prefer metrics that capture value delivered: task completion, semantic
correctness, regression rate, benchmark coverage, engineering effort saved,
implementation quality, verification quality, cost-performance tradeoff.
A metric that only moves a leaderboard and no product decision is a distraction.

**Guard against parity-before-efficiency errors:** confirm two systems produce
equivalent _outputs_ on matched inputs before comparing their speed or cost.
A cheaper system that quietly drops work is not cheaper.

## Tracking across runs

Role: read-only analysis/planning — route implementation of the eval harness to a
separate pass. Store the pinned baseline (dataset hash, harness commit, model
version, seeds, date) somewhere durable in the repo (e.g. `evals/baseline.json`)
and have every recurring run diff against it. Emit metrics as a tracked series,
not a one-shot number — "is the improvement real" is answered against history.

## Output

Recommend, with evidence:

1. **Improved benchmark design** — concrete changes to tasks, splits, or scoring.
2. **New evaluation methodologies** — where the current approach is structurally blind.
3. **Missing metrics** — each tied to the decision it would inform.
4. **Stronger validation** — contamination controls, statistical power, repro pinning.
5. **Cost-performance framing** — the tradeoff curve, not a single winner.
6. **Opportunities** — publication or product angles the eval surfaces, when they exist.

## Evidence provenance

Read [references/evidence-map.md](references/evidence-map.md) when auditing why
this workflow contains a step or how strongly the associated manuscript
supports it. Treat the skill as a derived operational artifact, not as
independent evidence that the workflow transfers to every agent system.
