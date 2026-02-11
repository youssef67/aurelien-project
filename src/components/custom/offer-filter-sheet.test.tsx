import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { OfferFilterSheet } from './offer-filter-sheet'
import type { DateFilterValue, BrandFilterValue } from './offer-filter-sheet'

const mockSuppliers = [
  { id: 'sup-1', companyName: 'Alpha Foods' },
  { id: 'sup-2', companyName: 'Beta Drinks' },
  { id: 'sup-3', companyName: 'Nestlé' },
]

function renderSheet(overrides: Partial<{
  open: boolean
  onOpenChange: (open: boolean) => void
  suppliers: { id: string; companyName: string }[]
  dateFilter: DateFilterValue
  supplierFilter: string[]
  storeBrandLabel: string
  brandFilter: BrandFilterValue
  onApply: (date: DateFilterValue, suppliers: string[], brand: BrandFilterValue) => void
  onReset: () => void
}> = {}) {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    suppliers: mockSuppliers,
    dateFilter: 'all' as DateFilterValue,
    supplierFilter: [] as string[],
    storeBrandLabel: 'Leclerc',
    brandFilter: 'all' as BrandFilterValue,
    onApply: vi.fn(),
    onReset: vi.fn(),
    ...overrides,
  }
  return { ...render(<OfferFilterSheet {...defaultProps} />), props: defaultProps }
}

describe('OfferFilterSheet', () => {
  it('renders the sheet with title "Filtrer les offres"', () => {
    renderSheet()
    expect(screen.getByText('Filtrer les offres')).toBeInTheDocument()
  })

  it('renders 3 date options', () => {
    renderSheet()
    expect(screen.getByText('Toutes les dates')).toBeInTheDocument()
    expect(screen.getByText('Cette semaine')).toBeInTheDocument()
    expect(screen.getByText('Ce mois')).toBeInTheDocument()
  })

  it('"Toutes les dates" is selected by default when dateFilter is "all"', () => {
    renderSheet({ dateFilter: 'all' })
    const allRadio = screen.getByRole('radio', { name: 'Toutes les dates' })
    expect(allRadio).toHaveAttribute('aria-checked', 'true')
  })

  it('"Cette semaine" is selected when dateFilter is "this-week"', () => {
    renderSheet({ dateFilter: 'this-week' })
    const weekRadio = screen.getByRole('radio', { name: 'Cette semaine' })
    expect(weekRadio).toHaveAttribute('aria-checked', 'true')
  })

  it('renders suppliers sorted alphabetically', () => {
    renderSheet()
    const labels = screen.getAllByRole('checkbox').map((cb) => {
      const label = cb.closest('label')
      return label?.textContent?.trim()
    })
    expect(labels).toEqual(['Alpha Foods', 'Beta Drinks', 'Nestlé'])
  })

  it('checking a supplier toggles the checkbox', () => {
    renderSheet()
    const checkbox = screen.getAllByRole('checkbox')[0]
    expect(checkbox).not.toBeChecked()
    fireEvent.click(checkbox)
    expect(checkbox).toBeChecked()
  })

  it('clicking "Appliquer" calls onApply with selected values including brand', () => {
    const { props } = renderSheet()

    // Select "Cette semaine"
    fireEvent.click(screen.getByRole('radio', { name: 'Cette semaine' }))
    // Check first supplier
    fireEvent.click(screen.getAllByRole('checkbox')[0])

    fireEvent.click(screen.getByText('Appliquer'))

    expect(props.onApply).toHaveBeenCalledWith('this-week', ['sup-1'], 'all')
  })

  it('clicking "Réinitialiser" calls onReset', () => {
    const { props } = renderSheet()
    fireEvent.click(screen.getByText('Réinitialiser'))
    expect(props.onReset).toHaveBeenCalled()
  })

  it('internal state does not modify parent before "Appliquer"', () => {
    const { props } = renderSheet()

    // Change internal state
    fireEvent.click(screen.getByRole('radio', { name: 'Ce mois' }))
    fireEvent.click(screen.getAllByRole('checkbox')[1])

    // onApply should not have been called yet
    expect(props.onApply).not.toHaveBeenCalled()
  })

  it('renders checkboxes checked for already-filtered suppliers', () => {
    renderSheet({ supplierFilter: ['sup-2', 'sup-3'] })

    const checkboxes = screen.getAllByRole('checkbox')
    expect(checkboxes[0]).not.toBeChecked() // Alpha Foods
    expect(checkboxes[1]).toBeChecked()     // Beta Drinks
    expect(checkboxes[2]).toBeChecked()     // Nestlé
  })

  it('renders Appliquer and Réinitialiser buttons', () => {
    renderSheet()
    expect(screen.getByText('Appliquer')).toBeInTheDocument()
    expect(screen.getByText('Réinitialiser')).toBeInTheDocument()
  })

  it('resets visual state after clicking "Réinitialiser"', () => {
    renderSheet({ dateFilter: 'this-week', supplierFilter: ['sup-1', 'sup-3'], brandFilter: 'my-brand' })

    // Verify initial visual state
    expect(screen.getByRole('radio', { name: 'Cette semaine' })).toHaveAttribute('aria-checked', 'true')
    expect(screen.getAllByRole('checkbox')[0]).toBeChecked() // Alpha Foods
    expect(screen.getAllByRole('checkbox')[2]).toBeChecked() // Nestlé
    expect(screen.getByRole('radio', { name: 'Mon enseigne uniquement (Leclerc)' })).toHaveAttribute('aria-checked', 'true')

    fireEvent.click(screen.getByText('Réinitialiser'))

    // After reset: date should be "Toutes les dates", all suppliers unchecked, brand "all"
    expect(screen.getByRole('radio', { name: 'Toutes les dates' })).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByRole('radio', { name: 'Cette semaine' })).toHaveAttribute('aria-checked', 'false')
    expect(screen.getAllByRole('checkbox')[0]).not.toBeChecked()
    expect(screen.getAllByRole('checkbox')[2]).not.toBeChecked()
    expect(screen.getByRole('radio', { name: 'Toutes les enseignes' })).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByRole('radio', { name: 'Mon enseigne uniquement (Leclerc)' })).toHaveAttribute('aria-checked', 'false')
  })

  it('unchecking a checked supplier removes it from selection', () => {
    const { props } = renderSheet({ supplierFilter: ['sup-1'] })

    const checkbox = screen.getAllByRole('checkbox')[0]
    expect(checkbox).toBeChecked()

    fireEvent.click(checkbox)
    expect(checkbox).not.toBeChecked()

    fireEvent.click(screen.getByText('Appliquer'))
    expect(props.onApply).toHaveBeenCalledWith('all', [], 'all')
  })

  // ==========================================
  // Story 3.4 — Brand filter tests
  // ==========================================

  describe('brand filter section', () => {
    it('renders the "Enseigne compatible" section', () => {
      renderSheet()
      expect(screen.getByText('Enseigne compatible')).toBeInTheDocument()
    })

    it('renders 2 radio options: "Toutes les enseignes" and "Mon enseigne uniquement (Leclerc)"', () => {
      renderSheet({ storeBrandLabel: 'Leclerc' })
      expect(screen.getByRole('radio', { name: 'Toutes les enseignes' })).toBeInTheDocument()
      expect(screen.getByRole('radio', { name: 'Mon enseigne uniquement (Leclerc)' })).toBeInTheDocument()
    })

    it('"Toutes les enseignes" is selected by default when brandFilter is "all"', () => {
      renderSheet({ brandFilter: 'all' })
      const allRadio = screen.getByRole('radio', { name: 'Toutes les enseignes' })
      expect(allRadio).toHaveAttribute('aria-checked', 'true')
    })

    it('clicking "Mon enseigne uniquement" changes the selection', () => {
      renderSheet({ storeBrandLabel: 'Leclerc', brandFilter: 'all' })

      const myBrandRadio = screen.getByRole('radio', { name: 'Mon enseigne uniquement (Leclerc)' })
      expect(myBrandRadio).toHaveAttribute('aria-checked', 'false')

      fireEvent.click(myBrandRadio)
      expect(myBrandRadio).toHaveAttribute('aria-checked', 'true')
      expect(screen.getByRole('radio', { name: 'Toutes les enseignes' })).toHaveAttribute('aria-checked', 'false')
    })

    it('clicking "Appliquer" after selecting brand calls onApply with brand argument', () => {
      const { props } = renderSheet({ storeBrandLabel: 'Leclerc', brandFilter: 'all' })

      fireEvent.click(screen.getByRole('radio', { name: 'Mon enseigne uniquement (Leclerc)' }))
      fireEvent.click(screen.getByText('Appliquer'))

      expect(props.onApply).toHaveBeenCalledWith('all', [], 'my-brand')
    })

    it('"Réinitialiser" resets brand to "all"', () => {
      renderSheet({ storeBrandLabel: 'Leclerc', brandFilter: 'my-brand' })

      expect(screen.getByRole('radio', { name: 'Mon enseigne uniquement (Leclerc)' })).toHaveAttribute('aria-checked', 'true')

      fireEvent.click(screen.getByText('Réinitialiser'))

      expect(screen.getByRole('radio', { name: 'Toutes les enseignes' })).toHaveAttribute('aria-checked', 'true')
      expect(screen.getByRole('radio', { name: 'Mon enseigne uniquement (Leclerc)' })).toHaveAttribute('aria-checked', 'false')
    })

    it('pre-selects "Mon enseigne" when brandFilter is "my-brand"', () => {
      renderSheet({ storeBrandLabel: 'Leclerc', brandFilter: 'my-brand' })

      expect(screen.getByRole('radio', { name: 'Mon enseigne uniquement (Leclerc)' })).toHaveAttribute('aria-checked', 'true')
      expect(screen.getByRole('radio', { name: 'Toutes les enseignes' })).toHaveAttribute('aria-checked', 'false')
    })

    it('only shows "Toutes les enseignes" when storeBrandLabel is not provided', () => {
      renderSheet({ storeBrandLabel: undefined })

      expect(screen.getByRole('radio', { name: 'Toutes les enseignes' })).toBeInTheDocument()
      expect(screen.queryByText(/Mon enseigne uniquement/)).not.toBeInTheDocument()
    })

    it('resyncs brand filter from external state when Sheet re-opens', () => {
      const baseProps = {
        open: true,
        onOpenChange: vi.fn(),
        suppliers: mockSuppliers,
        dateFilter: 'all' as DateFilterValue,
        supplierFilter: [] as string[],
        storeBrandLabel: 'Leclerc',
        brandFilter: 'all' as BrandFilterValue,
        onApply: vi.fn(),
        onReset: vi.fn(),
      }

      const { rerender } = render(<OfferFilterSheet {...baseProps} />)

      // Change brand locally without applying
      fireEvent.click(screen.getByRole('radio', { name: 'Mon enseigne uniquement (Leclerc)' }))
      expect(screen.getByRole('radio', { name: 'Mon enseigne uniquement (Leclerc)' })).toHaveAttribute('aria-checked', 'true')

      // Close the Sheet
      rerender(<OfferFilterSheet {...baseProps} open={false} />)

      // Re-open the Sheet with brandFilter still 'all'
      rerender(<OfferFilterSheet {...baseProps} open={true} brandFilter="all" />)

      // Brand filter should be resynced to 'all' (local change discarded)
      expect(screen.getByRole('radio', { name: 'Toutes les enseignes' })).toHaveAttribute('aria-checked', 'true')
      expect(screen.getByRole('radio', { name: 'Mon enseigne uniquement (Leclerc)' })).toHaveAttribute('aria-checked', 'false')
    })
  })
})
