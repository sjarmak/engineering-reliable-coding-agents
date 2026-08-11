import importlib.util
import os
import unittest


SCRIPT = os.path.join(os.path.dirname(__file__), "check_release_counts.py")
SPEC = importlib.util.spec_from_file_location("check_release_counts", SCRIPT)
COUNTS = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(COUNTS)


class ReleaseCountSourceTests(unittest.TestCase):
    def test_source_review_figure_is_self_contained_and_current(self):
        counts = COUNTS.load_counts()
        figure = os.path.normpath(os.path.join(COUNTS.REPO, COUNTS.FIGURE_SVG))
        self.assertEqual(os.path.commonpath([COUNTS.REPO, figure]), COUNTS.REPO)
        self.assertEqual(counts["scholarly"], 160)
        self.assertEqual(counts["practitioner"], 99)
        self.assertEqual(counts["benchmarks"], 29)
        self.assertEqual(counts["author_system_cases"], 17)

        with open(figure, encoding="utf-8") as source:
            text = source.read()
        for expected in (
            "160 scholarly",
            "99 practitioner",
            "206 edition records",
            "56 developed practices",
            "150 companion practices",
            "193 gated records plus 13 catalog-level leads",
        ):
            self.assertIn(expected, text)
        self.assertNotIn("159 scholarly", text)

    def test_release_summary_tuple_is_checked_exactly(self):
        counts = COUNTS.load_counts()
        current = (
            "160 scholarly works, 99 practitioner records, 29 benchmark records, "
            "and 17 author-system case records"
        )
        stale = current.replace("160 scholarly", "159 scholarly")
        self.assertEqual(COUNTS.corpus_claim_problems(current, counts), [])
        self.assertTrue(COUNTS.corpus_claim_problems(stale, counts))


if __name__ == "__main__":
    unittest.main()
