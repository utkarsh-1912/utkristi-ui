export interface ChartTick { time: number; value: number }
export interface ChartBucket { time: number; open: number; high: number; low: number; close: number }

/** Monotonic timestamps in milliseconds. Equal timestamps correct the latest sample. */
export function createChartStream(capacity = 8192) {
  if (!Number.isSafeInteger(capacity) || capacity < 1) throw new RangeError('Expected a positive sample capacity');
  const times = new Float64Array(capacity);
  const values = new Float64Array(capacity);
  const listeners = new Set<() => void>();
  let start = 0;
  let count = 0;
  return {
    append(batch: Iterable<ChartTick>) {
      let changed = false;
      for (const { time, value } of batch) {
        if (!Number.isFinite(time) || !Number.isFinite(value)) continue;
        const last = (start + count - 1) % capacity;
        if (count && time < times[last]) continue;
        if (count && time === times[last]) values[last] = value;
        else {
          const slot = (start + count) % capacity;
          times[slot] = time;
          values[slot] = value;
          if (count === capacity) start = (start + 1) % capacity;
          else count++;
        }
        changed = true;
      }
      if (changed) listeners.forEach(listener => listener());
    },
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    },
    snapshot(columns = 160): ChartBucket[] {
      if (!Number.isSafeInteger(columns) || columns < 1) throw new RangeError('Expected a positive bucket count');
      const result: ChartBucket[] = [];
      const span = times[(start + count - 1) % capacity] - times[start];
      let previous = -1;
      for (let i = 0; i < count; i++) {
        const slot = (start + i) % capacity;
        const time = times[slot], value = values[slot];
        const bin = span ? Math.min(columns - 1, Math.floor((time - times[start]) / span * columns)) : 0;
        if (bin !== previous) {
          result.push({ time, open: value, high: value, low: value, close: value });
          previous = bin;
        } else {
          const bucket = result[result.length - 1];
          bucket.high = Math.max(bucket.high, value);
          bucket.low = Math.min(bucket.low, value);
          bucket.close = value;
        }
      }
      return result;
    },
  };
}
