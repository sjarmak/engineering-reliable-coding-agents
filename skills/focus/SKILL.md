---
name: "focus"
description: "Single-task execution loop (plan, execute, verify, hand off). Keeps one agent on one unit of work with a structured context handoff so progress survives across sessions."
---

# Focus: Single-Task Execution Loop

Enforces the discipline of **plan → execute → verify → close** on exactly one
unit of work. The original is coupled to a specific task tracker; this version
is tracker-agnostic: "the task" can be an issue, a tracker ID, a TODO entry, or
a written description.

## When to activate

- You have a concrete, scoped unit of work to implement.
- You're resuming work and need to pick up exactly where the last session left off.
- Another workflow delegates a scoped implementation phase here.

## Arguments

`[task | "description"] [--no-close]`

- A task ID → work on that task.
- A description → treat it as a new task.
- No argument → list ready work and pick one.
- `--no-close` → run plan/execute/verify but leave finalization to the caller
  (used when a wrapping workflow writes its own completion record or routes to
  an external reviewer). Manual use rarely needs this.

## Phase 0: Load context

Read the task: description, acceptance criteria, linked context, and any prior
rejection reason. If resuming, reconstruct where the last session stopped from
the task's notes and the working tree. **Do not start coding until you can state
what "done" looks like.**

## Phase 1: Plan

Produce a short, concrete plan: the files you'll touch, the order, and how you'll
verify each piece. Keep it proportional to the task; a one-file fix gets a
two-line plan.

## Phase 2: Execute

Implement the plan step by step. Commit in logical units. If context fills up,
write progress to the task and hand off to a fresh session rather than
continuing in a degraded window; a clean context that re-reads the plan beats a
full one that's lost the thread.

## Phase 3: Verify

Check the work against the acceptance criteria using the *actual diff*, not your
memory of what you implemented. Run the project's tests. Fix and re-verify until
the criteria are demonstrably met.

## Phase 4: Close (skip if `--no-close`)

Record what was done, key decisions, and a diff summary on the task. Mark it
complete.

## Context handoff contract

The point of `focus` is that work survives session boundaries cleanly: the task
record + commits are the durable state, so a new session running this skill can
pick up mid-task with no artifact clutter. Never leave half-state only in your
context window.

## Evidence provenance

Read [references/evidence-map.md](references/evidence-map.md) for the manuscript
practices behind durable state, restart discipline, and verification. The handoff
contract is an operational implementation of those ideas and should be adapted
to the repository's actual tracker and failure modes.
