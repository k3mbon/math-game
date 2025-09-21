import * as React from "react"

interface UseStepperProps {
  initialStep?: number
  steps: { id: string; label: string }[]
}

export function useStepper({
  initialStep = 0,
  steps,
}: UseStepperProps) {
  const [currentStep, setCurrentStep] = React.useState(initialStep)

  const nextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1))
  }

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0))
  }

  const resetSteps = () => {
    setCurrentStep(initialStep)
  }

  const goToStep = (step: number) => {
    setCurrentStep(Math.max(0, Math.min(step, steps.length - 1)))
  }

  return {
    currentStep,
    nextStep,
    prevStep,
    resetSteps,
    goToStep,
    steps,
    isFirstStep: currentStep === 0,
    isLastStep: currentStep === steps.length - 1,
  }
}