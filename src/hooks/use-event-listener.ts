import { useRef, useEffect } from "react"

export function useEventListener<T extends HTMLElement = HTMLDivElement>(
  eventName: keyof HTMLElementEventMap,
  handler: Function,
  element?: React.RefObject<T>
) {
  const savedHandler = useRef<Function>()

  useEffect(() => {
    savedHandler.current = handler
  }, [handler])

  useEffect(() => {
    const targetElement: T | Window = element?.current || window
    if (!targetElement.addEventListener) {
      return
    }

    const eventListener = (event: Event) => savedHandler.current?.(event)

    targetElement.addEventListener(eventName, eventListener)

    return () => {
      targetElement.removeEventListener(eventName, eventListener)
    }
  }, [eventName, element])
}