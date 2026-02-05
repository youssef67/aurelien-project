'use client'

import { cn } from '@/lib/utils/cn'
import { Check } from 'lucide-react'

interface StepIndicatorProps {
  currentStep: number
  totalSteps: number
  labels: string[]
}

export function StepIndicator({ currentStep, totalSteps, labels }: StepIndicatorProps) {
  return (
    <div
      role="progressbar"
      aria-valuenow={currentStep}
      aria-valuemin={1}
      aria-valuemax={totalSteps}
      aria-label={`Étape ${currentStep} sur ${totalSteps} : ${labels[currentStep - 1]}`}
      className="flex items-center justify-center gap-2 py-4"
    >
      {Array.from({ length: totalSteps }, (_, i) => {
        const step = i + 1
        const isCompleted = step < currentStep
        const isCurrent = step === currentStep

        return (
          <div key={step} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              {/* Circle */}
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors',
                  isCompleted && 'bg-primary text-primary-foreground',
                  isCurrent && 'border-2 border-primary text-primary',
                  !isCompleted && !isCurrent && 'border-2 border-muted text-muted-foreground'
                )}
              >
                {isCompleted ? <Check className="h-4 w-4" /> : step}
              </div>

              {/* Label */}
              <span
                className={cn(
                  'text-xs',
                  isCurrent && 'font-medium text-primary',
                  isCompleted && 'text-muted-foreground',
                  !isCompleted && !isCurrent && 'text-muted-foreground'
                )}
              >
                {labels[i]}
              </span>
            </div>

            {/* Connector line */}
            {step < totalSteps && (
              <div
                className={cn(
                  'mx-2 mb-5 h-0.5 w-8',
                  step < currentStep ? 'bg-primary' : 'bg-muted'
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
