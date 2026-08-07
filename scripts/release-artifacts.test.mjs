import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";

import { verifyRelease } from "./release-gate.mjs";

test("the prepared rc.14 archives satisfy the repository release contract", async () => {
  assert.deepEqual(await verifyRelease(path.resolve(".")), []);
});
