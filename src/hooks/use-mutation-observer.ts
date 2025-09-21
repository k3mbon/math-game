import { useEffect } from "react"

export function useMutationObserver(
  node: Node | null,
  callback: MutationCallback,
  options?: MutationObserverInit
) {
  useEffect(() => {
    if (!node) return

    const observer = new MutationObserver(callback)
    observer.observe(node, options)

    return () => observer.disconnect()
  }, [node, callback, options])
}