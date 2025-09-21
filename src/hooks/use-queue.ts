import { useState, useMemo } from 'react';

export function useQueue<T>(initialValue: T[] = []) {
  const [queue, setQueue] = useState(initialValue);

  const handlers = useMemo(
    () => ({
      enqueue: (item: T) => {
        setQueue((prev) => [...prev, item]);
      },
      dequeue: () => {
        if (queue.length === 0) {
          return undefined;
        }
        const [first, ...rest] = queue;
        setQueue(rest);
        return first;
      },
      peek: () => {
        if (queue.length === 0) {
          return undefined;
        }
        return queue[0];
      },
      clear: () => {
        setQueue([]);
      },
      size: queue.length,
      isEmpty: queue.length === 0,
    }),
    [queue]
  );

  return handlers;
}