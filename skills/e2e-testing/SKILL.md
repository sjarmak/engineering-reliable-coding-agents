---
name: "e2e-testing"
description: "Thin methodology for end-to-end tests of critical user journeys — define journeys by risk, use semantic locators and condition-based waits, quarantine flaky tests with a tracked reason, and capture artifacts on failure. Use when adding or stabilizing E2E coverage; the e2e-runner agent applies it in depth."
---

# E2E Testing

End-to-end tests are the last line of defense before production: they exercise
real user journeys across the whole stack and catch integration failures unit
tests structurally cannot. Keep the suite small, critical, and stable — a flaky
E2E suite that nobody trusts is worse than none.

## Define journeys by risk

Test *journeys*, not pages. A journey is a full user-visible flow (sign in →
create → see it persist). Rank them and cover top-down; do not chase 100% of
screens.

- **HIGH** — money, auth, data loss (payment, login, delete/restore)
- **MEDIUM** — core navigation, search, primary CRUD
- **LOW** — cosmetic/UI polish (usually not worth an E2E test)

For each journey cover the happy path first, then the one or two error paths that
would actually hurt (declined payment, expired session).

## Write for stability

- **Semantic locators only.** `[data-testid="…"]` > role/label > CSS > XPath. A
  test tied to DOM structure breaks on every refactor; one tied to intent does not.
- **Wait for conditions, never for time.** `waitForResponse()` / `expect(...).toBeVisible()`,
  never `waitForTimeout(3000)`. Time-based waits are the single largest source of
  flake and they silently slow the suite.
- **Isolate every test.** No shared state, no order dependence; each test sets up
  and tears down its own data so it can run alone and in parallel.
- **Assert at each key step,** not just at the end, so a failure points at the
  step that broke.

## Quarantine flake, don't ignore it

A flaky test that stays green-ish erodes trust in the whole suite. When a test
flakes:

1. Confirm it with a repeat run (`--repeat-each=10` or equivalent).
2. Quarantine it explicitly (`test.fixme`/`test.skip`) with a **tracked issue
   reference in the reason** — never a bare skip that disappears silently.
3. Fix the root cause (usually a time-wait, a race, or shared state), then
   un-quarantine. Quarantine is a holding cell, not a graveyard.

## Capture artifacts on failure

Configure screenshots, video, and traces to record on failure/first-retry (not
always — artifacts are expensive). On CI, upload them and put the artifact path
in the failure report so a red run is debuggable without a local repro.

## What "done" looks like

Set pass-rate, flake, and runtime thresholds from the consequences of failure and
the decisions the suite gates. Critical journeys must meet their predeclared
release threshold, the suite must finish often enough to serve that gate, and
every failure must produce a diagnostic artifact. Report residual gaps in journey
coverage explicitly rather than implying the suite is exhaustive.

## Evidence provenance

Read [references/evidence-map.md](references/evidence-map.md) for the manuscript
practices that motivate this workflow and the limits on transferring them. The
skill is a derived testing protocol, not an independent validation of any fixed
threshold or tool choice.
