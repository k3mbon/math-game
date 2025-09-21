import { useLayoutEffect } from "react"

type UseScrollLockOptions = {
  disableBodyPadding?: boolean
}

export function useScrollLock(locked: boolean, options?: UseScrollLockOptions) {
  useLayoutEffect(() => {
    if (!locked) {
      return
    }

    const originalOverflow = document.body.style.overflow
    const originalPaddingRight = document.body.style.paddingRight

    document.body.style.overflow = "hidden"

    if (options?.disableBodyPadding) {
      return
    }

    const scrollBarWidth = window.innerWidth - document.body.offsetWidth

    document.body.style.paddingRight = `${scrollBarWidth}px`

    return () => {
      document.body.style.overflow = originalOverflow
      document.body.style.paddingRight = originalPaddingRight
    }
  }, [locked, options?.disableBodyPadding])
}