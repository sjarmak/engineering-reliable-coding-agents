---
name: "failure-mode-capture"
description: "Record a \"don't do X here, it breaks Y\" lesson into AGENTS.md so an agent doesn't repeat a mistake. Dedupes against CLAUDE.md/instincts before writing, promotes generalizing lessons out of memory, and keeps AGENTS.md under budget. Use after a bug, regression, or near-miss, or when the user says \"capture this\" / \"make sure we don't do that again\"."
---

# Failure-Mode Capture

Turn a real incident into a one-line prevention in `AGENTS.md`, so the next agent
doesn't repeat it. This is how the failure-mode layer accumulates — deliberately,
one verified lesson at a time, not by dumping everything that ever went wrong.

Inspect the repository's existing instruction and memory layers first.
Project-wide preventions belong in `AGENTS.md`; area-only lessons belong in the
area guidance file the repository already uses; host or session habits stay in
the approved memory mechanism.

## When to use

- Right after a bug, regression, or near-miss whose cause generalizes
- The user says "capture this" / "don't let this happen again" / "add a guardrail"
- A code review surfaces a repeated mistake worth encoding once

## ZFC boundary

- **Mechanism:** read AGENTS.md and the memory files, run the similarity scan,
  count lines against the budget, write the entry.
- **Model:** decide whether the lesson generalizes, which layer it belongs in,
  whether it duplicates an existing entry, and how to phrase the prevention.

## How it works

### 1. Phrase the prevention (model)

One line: the action to avoid, then the consequence it prevents. Concrete and
checkable.

> Don't run migrations against the read replica — it has no write grant and fails
> silently mid-batch.

If you can't name a concrete consequence, it's not a failure-mode prevention —
it's a style preference, and belongs in the bundle or a code review, not here.

### 2. Decide the layer (model)

- Generalizes across the repo → **AGENTS.md** failure-mode log.
- Specific to one area → that area's **COMPASS.md** "Failure modes seen here".
- A local command or personal habit → **memory**, not here.

### 3. Dedup guard against memory (mechanism + model)

First, determine whether other instruction files point to `AGENTS.md`. If the
repository has a single instruction source, the cross-file dedup is moot.
Otherwise, scan other instruction files and any approved memory store for an
overlapping fact. If a match surfaces:

- The model decides whether it is the *same* lesson.
- If it is, and it belongs at the project level, **promote**: write it to
  AGENTS.md and **delete it from memory**, so it lives in exactly one layer.
- Also scan the existing AGENTS.md entries — if the lesson is already there,
  refine the existing line rather than adding a near-duplicate.

This guard is the whole point: it is why capturing a lesson here does not silently
duplicate something the memory system already knows.

### 4. Append under budget (mechanism)

Add the line to the **Failure-mode preventions** section. Then check the file
against its ceiling (~120 lines target, ~200 hard). If the addition pushes it
over, do not silently truncate — surface it and propose what to move: stale
preventions whose code no longer exists, or area-specific lines that belong in a
compass file.

## Best practices

1. **One verified lesson per entry.** Not a category, not a checklist — a single
   prevention tied to a real consequence.
2. **Prune as you add.** When a referenced code path is gone, the prevention is
   dead weight; remove it in the same pass.
3. **Promote out of memory, don't copy from it.** The dedup guard exists to keep
   the same fact from living in two layers.
4. **Budget is a forcing function.** If AGENTS.md keeps wanting to grow, the
   detail belongs in a compass file, not here.

## Evidence provenance

Read [references/evidence-map.md](references/evidence-map.md) for the manuscript
practices that motivate trace-derived failure taxonomies and durable prevention.
Only encode failures that were actually observed and whose mechanism
generalizes; do not convert speculative or thin-support entries into rules.
