import { useState, useEffect } from "react"

interface UseFetchOptions extends RequestInit {
  initialData?: any
}

export function useFetch<T = any>(
  url: string,
  options?: UseFetchOptions
) {
  const [data, setData] = useState<T | undefined>(options?.initialData)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await fetch(url, options)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const result = await response.json()
        setData(result)
      } catch (err: any) {
        setError(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [url, JSON.stringify(options)])

  return { data, loading, error }
}