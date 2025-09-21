import { useState, useMemo } from "react"

export function useMap<K, V>(initialState = new Map<K, V>()) {
  const [value, setValue] = useState(initialState)

  const handlers = useMemo(
    () =>
      Object.assign(value, {
        set: (key: K, value: V) => {
          setValue((oldMap) => {
            const newMap = new Map(oldMap)
            newMap.set(key, value)
            return newMap
          })
        },

        clear: () => setValue(new Map()),

        delete: (key: K) => {
          setValue((oldMap) => {
            const newMap = new Map(oldMap)
            newMap.delete(key)
            return newMap
          })
        },
      }),
    [value]
  )

  return handlers
}