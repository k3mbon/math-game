import { useState, useEffect } from "react"

export function useIsSSR() {
  const [isSSR, setIsSSR] = useState(true)

  useEffect(() => {
    setIsSSR(false)
  }, [])

  return isSSR
}