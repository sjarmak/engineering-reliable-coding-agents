# Markdown editing workflow

Edit [`engineering-reliable-coding-agents.md`](engineering-reliable-coding-agents.md). It is a
single Markdown rendering of the complete current manuscript: abstract, introduction, all 19
chapters, closing chapter, glossary, references, and data-availability statement.

LaTeX remains the release source of truth. The Markdown file is an editing surface and change
ledger, not an input to the arXiv build. Each mapped section begins with a `tex-sync:start`
comment naming its exact TeX target. Leave the `tex-sync` comments unchanged.

After editing, run:

```bash
node scripts/editable-manuscript.mjs --status
```

The command reports one state per TeX file:

- `synced`: neither side changed from the recorded baseline.
- `markdown-edited`: the Markdown contains edits ready to transfer to TeX.
- `tex-edited`: TeX changed after the editing copy was generated.
- `conflict`: both representations changed and need reconciliation.

Ask the editing agent to apply every `markdown-edited` section to its named TeX file. Review the
resulting TeX diff, rebuild the PDF, and inspect the changed pages. Once those edits are committed,
refresh the editing copy with:

```bash
node scripts/editable-manuscript.mjs --write
```

The generator refuses to overwrite unapplied Markdown edits or conflicts. `--write --force`
bypasses that protection and should be used only when the editing copy is intentionally being
discarded.

Text drawn inside figures is maintained in the figure source rather than in this Markdown file.
For example, Figure 2 is sourced from [`../assets/review-flow.svg`](../assets/review-flow.svg).
