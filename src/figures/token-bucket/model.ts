export const CAPACITY = 20;
export const TRAFFIC_PER_SECOND = 8;
export function createBucket(refillRate = 5) {
  return { tokens: CAPACITY, refillRate, elapsed: 0, accepted: 0, rejected: 0 };
}
export type Bucket = ReturnType<typeof createBucket>;
export function sendRequests(bucket: Bucket, count: number): Bucket {
  const accepted = Math.min(count, Math.floor(bucket.tokens + 1e-9));
  return {
    ...bucket,
    tokens: Math.max(0, bucket.tokens - accepted),
    accepted: bucket.accepted + accepted,
    rejected: bucket.rejected + count - accepted,
  };
}
export function advanceBucket(bucket: Bucket, seconds: number): Bucket {
  return {
    ...bucket,
    tokens: Math.min(CAPACITY, bucket.tokens + seconds * bucket.refillRate),
    elapsed: bucket.elapsed + seconds,
  };
}

// Requests arrive at evenly spaced simulation times, independently of display frames.
export function advanceTraffic(bucket: Bucket, seconds: number): Bucket {
  const end = bucket.elapsed + seconds;
  let next =
    (Math.floor(bucket.elapsed * TRAFFIC_PER_SECOND + 1e-9) + 1) /
    TRAFFIC_PER_SECOND;
  let current = bucket;
  while (next <= end + 1e-9) {
    current = sendRequests(
      advanceBucket(current, Math.max(0, next - current.elapsed)),
      1,
    );
    next += 1 / TRAFFIC_PER_SECOND;
  }
  return advanceBucket(current, Math.max(0, end - current.elapsed));
}
