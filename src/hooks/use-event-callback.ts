import { useRef, useEffect, useCallback } from "react"

export function useEventCallback<Args extends unknown[], R>(
  fn: (...args: Args) => R
): (...args: Args) => R {
  const ref = useRef<(...args: Args) => R>(fn)

  // "mutable" ref object that holds a reference to the latest function arg
  useEffect(() => {
    ref.current = fn
  }, [fn])

  // keep a stable callback for event listeners
  return useCallback((...args: Args) => ref.current(...args), [])
}