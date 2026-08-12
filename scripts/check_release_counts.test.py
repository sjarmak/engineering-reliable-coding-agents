import importlib.util
import os
import unittest


SCRIPT = os.path.join(os.path.dirname(__file__), "check_release_counts.py")
SPEC = importlib.util.spec_from_file_location("check_release_counts", SCRIPT)
COUNTS = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(COUNTS)


class ReleaseCountSourceTests(unittest.TestCase):
    def test_source_review_figure_is_self_contained_and_current(self):
        # Pinning the numbers here made the test fail whenever a source was
        # admitted, which is the moment the figure most needs checking. Derive
        # them, and assert only the invariant: the figure states what the
        # companion data says.
        counts = COUNTS.load_counts()
        figure = os.path.normpath(os.path.join(COUNTS.REPO, COUNTS.FIGURE_SVG))
        self.assertEqual(os.path.commonpath([COUNTS.REPO, figure]), COUNTS.REPO)

        with open(figure, encoding="utf-8") as source:
            text = source.read()
        for expected in (
            f"{counts['scholarly']} scholarly",
            f"{counts['practitioner']} practitioner",
            f"{counts['total']} edition records",
            f"{counts['developed']} developed practices",
            f"{counts['companion_only']} companion practices",
            f"{counts['gated']} gated records plus {counts['leads']} catalog-level leads",
        ):
            self.assertIn(expected, text)
        self.assertNotIn(f"{counts['scholarly'] - 1} scholarly", text)
        self.assertNotIn(f"{counts['practitioner'] - 1} practitioner", text)

    def test_release_summary_tuple_is_checked_exactly(self):
        counts = COUNTS.load_counts()
        current = (
            f"{counts['scholarly']} scholarly works, {counts['practitioner']} practitioner "
            f"records, {counts['benchmarks']} benchmark records, "
            f"and {counts['author_system_cases']} author-system case records"
        )
        stale = current.replace(
            f"{counts['scholarly']} scholarly", f"{counts['scholarly'] - 1} scholarly"
        )
        self.assertEqual(COUNTS.corpus_claim_problems(current, counts), [])
        self.assertTrue(COUNTS.corpus_claim_problems(stale, counts))


if __name__ == "__main__":
    unittest.main()
