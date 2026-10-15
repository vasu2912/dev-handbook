import { test } from "node:test";
import assert from "node:assert/strict";
import {
  createBucket,
  sendRequests,
} from "../../src/figures/token-bucket/model.ts";

test("a full bucket permits 20 requests from a burst of 25 and rejects the rest", () => {
  const bucket = sendRequests(createBucket(), 25);
  assert.equal(bucket.tokens, 0);
  assert.equal(bucket.accepted, 20);
  assert.equal(bucket.rejected, 5);
});

test("refill is continuous, but a request requires a whole token", async () => {
  const { advanceBucket } =
    await import("../../src/figures/token-bucket/model.ts");
  const empty = sendRequests(createBucket(), 20);
  const halfway = sendRequests(advanceBucket(empty, 0.1), 1);
  assert.equal(halfway.tokens, 0.5);
  assert.equal(halfway.rejected, 1);
  const ready = sendRequests(advanceBucket(halfway, 0.1), 1);
  assert.equal(ready.tokens, 0);
  assert.equal(ready.accepted, 21);
});

test("long idle periods cap the bucket and rejected requests spend no tokens", async () => {
  const { advanceBucket } =
    await import("../../src/figures/token-bucket/model.ts");
  const empty = sendRequests(createBucket(), 20);
  const refilled = advanceBucket(empty, 100);
  assert.equal(refilled.tokens, 20);
  assert.equal(refilled.elapsed, 100);
  const remainder = sendRequests(advanceBucket(empty, 0.05), 100);
  assert.equal(remainder.tokens, 0.25);
  assert.equal(remainder.rejected, 100);
});

test("eight requests per second consume the same credits regardless of animation frame size", async () => {
  const { advanceTraffic } =
    await import("../../src/figures/token-bucket/model.ts");
  const whole = advanceTraffic(createBucket(), 10);
  let frames = createBucket();
  for (let i = 0; i < 100; i++) frames = advanceTraffic(frames, 0.1);
  // The first request arrives at 0.125 s, while the full bucket cannot refill.
  assert.equal(whole.accepted, 69);
  assert.equal(whole.rejected, 11);
  assert.equal(frames.accepted, whole.accepted);
  assert.equal(frames.rejected, whole.rejected);
  assert.ok(Math.abs(frames.tokens - whole.tokens) < 1e-8);
});
