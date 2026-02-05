import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StepIndicator } from './step-indicator'

const LABELS = ['Produit & Prix', 'Dates & Catégorie']

describe('StepIndicator', () => {
  describe('rendering', () => {
    it('renders the correct number of steps', () => {
      render(<StepIndicator currentStep={1} totalSteps={2} labels={LABELS} />)
      // Step numbers or check icons
      expect(screen.getByText('1')).toBeInTheDocument()
      expect(screen.getByText('2')).toBeInTheDocument()
    })

    it('renders visible labels for each step', () => {
      render(<StepIndicator currentStep={1} totalSteps={2} labels={LABELS} />)
      expect(screen.getByText('Produit & Prix')).toBeInTheDocument()
      expect(screen.getByText('Dates & Catégorie')).toBeInTheDocument()
    })
  })

  describe('current step', () => {
    it('shows step 1 as current with ring border', () => {
      const { container } = render(<StepIndicator currentStep={1} totalSteps={2} labels={LABELS} />)
      const circles = container.querySelectorAll('.rounded-full')
      // Step 1 should have border-primary (current)
      expect(circles[0]).toHaveClass('border-primary')
    })

    it('shows step 2 as upcoming when on step 1', () => {
      const { container } = render(<StepIndicator currentStep={1} totalSteps={2} labels={LABELS} />)
      const circles = container.querySelectorAll('.rounded-full')
      // Step 2 should have border-muted (upcoming)
      expect(circles[1]).toHaveClass('border-muted')
    })
  })

  describe('completed step', () => {
    it('shows step 1 as completed with bg-primary when on step 2', () => {
      const { container } = render(<StepIndicator currentStep={2} totalSteps={2} labels={LABELS} />)
      const circles = container.querySelectorAll('.rounded-full')
      // Step 1 should be completed (bg-primary)
      expect(circles[0]).toHaveClass('bg-primary')
    })

    it('renders check icon for completed step', () => {
      const { container } = render(<StepIndicator currentStep={2} totalSteps={2} labels={LABELS} />)
      // Lucide Check icon renders as SVG
      const svgs = container.querySelectorAll('svg')
      expect(svgs.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('accessibility', () => {
    it('has progressbar role', () => {
      render(<StepIndicator currentStep={1} totalSteps={2} labels={LABELS} />)
      const progressbar = screen.getByRole('progressbar')
      expect(progressbar).toBeInTheDocument()
    })

    it('has correct aria-valuenow', () => {
      render(<StepIndicator currentStep={1} totalSteps={2} labels={LABELS} />)
      const progressbar = screen.getByRole('progressbar')
      expect(progressbar).toHaveAttribute('aria-valuenow', '1')
    })

    it('has correct aria-valuemax', () => {
      render(<StepIndicator currentStep={1} totalSteps={2} labels={LABELS} />)
      const progressbar = screen.getByRole('progressbar')
      expect(progressbar).toHaveAttribute('aria-valuemax', '2')
    })

    it('has descriptive aria-label', () => {
      render(<StepIndicator currentStep={1} totalSteps={2} labels={LABELS} />)
      const progressbar = screen.getByRole('progressbar')
      expect(progressbar).toHaveAttribute('aria-label', 'Étape 1 sur 2 : Produit & Prix')
    })

    it('updates aria-label when step changes', () => {
      render(<StepIndicator currentStep={2} totalSteps={2} labels={LABELS} />)
      const progressbar = screen.getByRole('progressbar')
      expect(progressbar).toHaveAttribute('aria-label', 'Étape 2 sur 2 : Dates & Catégorie')
    })
  })

  describe('connector line', () => {
    it('renders connector line between steps', () => {
      const { container } = render(<StepIndicator currentStep={1} totalSteps={2} labels={LABELS} />)
      // Should have a line element between steps
      const connectors = container.querySelectorAll('.h-0\\.5')
      expect(connectors.length).toBe(1)
    })

    it('shows completed connector when step is past', () => {
      const { container } = render(<StepIndicator currentStep={2} totalSteps={2} labels={LABELS} />)
      const connectors = container.querySelectorAll('.h-0\\.5')
      expect(connectors[0]).toHaveClass('bg-primary')
    })

    it('shows muted connector when step is not past', () => {
      const { container } = render(<StepIndicator currentStep={1} totalSteps={2} labels={LABELS} />)
      const connectors = container.querySelectorAll('.h-0\\.5')
      expect(connectors[0]).toHaveClass('bg-muted')
    })
  })
})
