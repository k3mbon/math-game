import * as React from "react"
import { useIsomorphicLayoutEffect } from "./use-isomorphic-layout-effect"

export function useLockedBody(initialLocked = false) {
  const [locked, setLocked] = React.useState(initialLocked)

  useIsomorphicLayoutEffect(() => {
    if (!locked) {
      return
    }

    const originalOverflow = document.body.style.overflow
    const originalPaddingRight = document.body.style.paddingRight

    const scrollBarWidth = window.innerWidth - document.body.offsetWidth

    document.body.style.overflow = "hidden"
    document.body.style.paddingRight = `${scrollBarWidth}px`

    return () => {
      document.body.style.overflow = originalOverflow
      document.body.style.paddingRight = originalPaddingRight
    }
  }, [locked])

  React.useEffect(() => {
    if (locked !== initialLocked) {
      setLocked(initialLocked)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialLocked])

  return [locked, setLocked] as const
}