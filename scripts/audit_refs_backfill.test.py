#!/usr/bin/env python3
"""
audit_refs_backfill.test.py -- cover the batch-omission repair shared by
audit_arxiv_refs.py and audit_all_refs.py.

The bug this guards against: arXiv's id_list endpoint can return fewer entries
than were requested. The response still parses, so the batch loop's exception
retry never fires and every omitted ID is reported as a paper that does not
exist. Two runs over identical input then disagree, and a real missing
reference hides among the false ones.

No network and no third-party dependencies:

    python3 scripts/audit_refs_backfill.test.py
"""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from audit_arxiv_refs import backfill_missing  # noqa: E402

NO_DELAY = 0


def record(title):
    return {"title": title, "authors": ["A. Author"], "version": "1", "updated": ""}


def test_omitted_id_is_recovered():
    calls = []

    def fetch(ids):
        calls.append(list(ids))
        return {ids[0]: record("Recovered Paper")}

    lookup = {"2503.00001": record("Present Paper")}
    unverified = backfill_missing(["2503.00001", "2503.00002"], lookup, fetch,
                                  delay=NO_DELAY)

    assert calls == [["2503.00002"]], calls
    assert lookup["2503.00002"]["title"] == "Recovered Paper"
    assert unverified == set(), unverified


def test_answered_but_absent_is_not_unverified():
    """The API replied and had no such paper. That is a real finding."""
    def fetch(ids):
        return {}

    lookup = {}
    unverified = backfill_missing(["2503.00003"], lookup, fetch,
                                  delay=NO_DELAY, attempts=2)

    assert lookup == {}, lookup
    assert unverified == set(), unverified


def test_complete_batch_makes_no_extra_requests():
    calls = []

    def fetch(ids):
        calls.append(list(ids))
        return {}

    lookup = {"2503.00004": record("Present Paper")}
    unverified = backfill_missing(["2503.00004"], lookup, fetch, delay=NO_DELAY)

    assert calls == [], calls
    assert unverified == set(), unverified


def test_transient_error_then_success():
    attempts = []

    def fetch(ids):
        attempts.append(list(ids))
        if len(attempts) == 1:
            raise OSError("connection reset")
        return {ids[0]: record("Recovered After Retry")}

    lookup = {}
    unverified = backfill_missing(["2503.00005"], lookup, fetch,
                                  delay=NO_DELAY, attempts=2)

    assert len(attempts) == 2, attempts
    assert lookup["2503.00005"]["title"] == "Recovered After Retry"
    assert unverified == set(), unverified


def test_throttled_id_is_unverified_not_missing():
    """Every attempt failed at the transport layer, so we learned nothing.

    This is the regression that matters: HTTP 429 with an empty body used to
    be reported as NOT_FOUND, which marked correct references as nonexistent.
    """
    def fetch(ids):
        raise OSError("HTTP Error 429: Too Many Requests")

    lookup = {}
    unverified = backfill_missing(["2503.00006"], lookup, fetch,
                                  delay=NO_DELAY, attempts=2)

    assert lookup == {}, lookup
    assert unverified == {"2503.00006"}, unverified


def fetch_batch_over(body):
    """Run fetch_batch against a canned Atom body, with no network."""
    import audit_arxiv_refs as mod

    class FakeResponse:
        def __enter__(self):
            return self

        def __exit__(self, *exc):
            return False

        def read(self):
            return body

    original = mod.urllib.request.urlopen
    mod.urllib.request.urlopen = lambda *a, **k: FakeResponse()
    try:
        return mod.fetch_batch(["2503.00007"]), None
    except mod.EmptyFeed as exc:
        return None, exc
    finally:
        mod.urllib.request.urlopen = original


def test_entryless_feed_raises():
    """No entry at all is a transport result, not an answer."""
    out, exc = fetch_batch_over(b'<feed xmlns="http://www.w3.org/2005/Atom"></feed>')
    assert out is None and exc is not None, (out, exc)


def test_error_entry_is_an_answer_not_a_transport_failure():
    """arXiv replied with its error placeholder, so the paper really is absent.

    This must not raise: raising would file a genuinely missing reference as
    unverified and hide a real finding behind a rate-limit explanation.
    """
    body = (b'<feed xmlns="http://www.w3.org/2005/Atom"><entry>'
            b'<id>http://arxiv.org/api/errors#incorrect_id_format</id>'
            b'<title>Error</title></entry></feed>')
    out, exc = fetch_batch_over(body)
    assert exc is None, exc
    assert out == {}, out


def main():
    tests = [v for k, v in sorted(globals().items()) if k.startswith("test_")]
    for t in tests:
        t()
        print(f"ok  {t.__name__}")
    print(f"\n{len(tests)} passed")


if __name__ == "__main__":
    main()
