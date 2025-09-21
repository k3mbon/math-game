import { useCallback } from "react"

type Ref<T> = React.Ref<T> | ((instance: T | null) => void)

export function useMergeRefs<T>(...refs: Ref<T>[]) {
  return useCallback((instance: T | null) => {
    refs.forEach((ref) => {
      if (typeof ref === "function") {
        ref(instance)
      } else if (ref) {
        ;(ref as React.MutableRefObject<T | null>).current = instance
      }
    })
  }, refs)
}