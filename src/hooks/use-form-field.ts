import { useFormContext } from "react-hook-form"

export function useFormField() {
  const { formState, getFieldState } = useFormContext()

  const fieldState = getFieldState("name", formState)

  return {
    isDirty: fieldState.isDirty,
    isTouched: fieldState.isTouched,
    isValid: fieldState.isValid,
    error: fieldState.error,
  }
}