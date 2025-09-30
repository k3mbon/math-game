import { useState, useEffect } from "react"

export function useDarkMode() {
  // Always return light mode (false) and a no-op setter
  const [isDarkMode] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Clear any existing dark mode from localStorage
      localStorage.removeItem("darkMode")
      // Always remove dark class to ensure light mode
      document.documentElement.classList.remove("dark")
    }
  }, [])

  // Return false for isDarkMode and a no-op function for setIsDarkMode
  return [false, () => {}] as const
}