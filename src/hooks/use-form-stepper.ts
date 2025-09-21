import { useStepper } from "./use-stepper"
import { useFormContext } from "react-hook-form"

interface UseFormStepperProps {
  initialStep?: number
  steps: { id: string; label: string }[]
}

export function useFormStepper({
  initialStep = 0,
  steps,
}: UseFormStepperProps) {
  const { trigger, getValues } = useFormContext()
  const { currentStep, nextStep, prevStep, goToStep, steps: stepperSteps } = useStepper({
    initialStep,
    steps,
  })

  const handleNext = async () => {
    const isValid = await trigger()
    if (isValid) {
      nextStep()
    }
  }

  const handlePrev = () => {
    prevStep()
  }

  const handleGoToStep = async (step: number) => {
    const isValid = await trigger()
    if (isValid) {
      goToStep(step)
    }
  }

  return {
    currentStep,
    nextStep: handleNext,
    prevStep: handlePrev,
    goToStep: handleGoToStep,
    steps: stepperSteps,
    getValues,
  }
}