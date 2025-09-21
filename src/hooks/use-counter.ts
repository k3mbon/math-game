import { useState, useCallback } from "react"

interface UseCounterOptions {
  min?: number
  max?: number
}

export function useCounter(
  initialValue: number,
  options?: UseCounterOptions
) {
  const { min, max } = options || {}
  const [count, setCount] = useState(initialValue)

  const increment = useCallback(() => {
    setCount((prevCount) => {
      if (max !== undefined && prevCount >= max) {
        return prevCount
      }
      return prevCount + 1
    })
  }, [max])

  const decrement = useCallback(() => {
    setCount((prevCount) => {
      if (min !== undefined && prevCount <= min) {
        return prevCount
      }
      return prevCount - 1
    })
  }, [min])

  const reset = useCallback(() => {
    setCount(initialValue)
  }, [initialValue])

  const set = useCallback((value: number) => {
    setCount(() => {
      if (min !== undefined && value < min) {
        return min
      }
      if (max !== undefined && value > max) {
        return max
      }
      return value
    })
  }, [min, max])

  return {
    count,
    increment,
    decrement,
    reset,
    set,
  }
}