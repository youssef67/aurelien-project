import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { RequestTypeFilterChips } from './request-type-filter-chips'

describe('RequestTypeFilterChips', () => {
  const defaultProps = {
    selectedType: null as string | null,
    onTypeChange: vi.fn(),
    typeCounts: { INFO: 3, ORDER: 5 },
    totalCount: 8,
  }

  it('renders all three chips', () => {
    render(<RequestTypeFilterChips {...defaultProps} />)
    expect(screen.getByText('Tous (8)')).toBeInTheDocument()
    expect(screen.getByText('Renseignements (3)')).toBeInTheDocument()
    expect(screen.getByText('Commandes (5)')).toBeInTheDocument()
  })

  it('renders radiogroup with aria-label', () => {
    render(<RequestTypeFilterChips {...defaultProps} />)
    expect(screen.getByRole('radiogroup', { name: 'Filtrer par type' })).toBeInTheDocument()
  })

  it('marks "Tous" as checked when no type is selected', () => {
    render(<RequestTypeFilterChips {...defaultProps} />)
    const allChip = screen.getByRole('radio', { name: /tous/i })
    expect(allChip).toHaveAttribute('aria-checked', 'true')
  })

  it('marks selected type chip as checked', () => {
    render(<RequestTypeFilterChips {...defaultProps} selectedType="ORDER" />)
    const orderChip = screen.getByRole('radio', { name: /commande/i })
    expect(orderChip).toHaveAttribute('aria-checked', 'true')
    const allChip = screen.getByRole('radio', { name: /tous/i })
    expect(allChip).toHaveAttribute('aria-checked', 'false')
  })

  it('calls onTypeChange with type when a type chip is clicked', () => {
    const onTypeChange = vi.fn()
    render(<RequestTypeFilterChips {...defaultProps} onTypeChange={onTypeChange} />)
    fireEvent.click(screen.getByText('Commandes (5)'))
    expect(onTypeChange).toHaveBeenCalledWith('ORDER')
  })

  it('calls onTypeChange with null when "Tous" is clicked', () => {
    const onTypeChange = vi.fn()
    render(<RequestTypeFilterChips {...defaultProps} selectedType="INFO" onTypeChange={onTypeChange} />)
    fireEvent.click(screen.getByText('Tous (8)'))
    expect(onTypeChange).toHaveBeenCalledWith(null)
  })

  it('applies active style to selected chip', () => {
    render(<RequestTypeFilterChips {...defaultProps} selectedType="INFO" />)
    const infoChip = screen.getByRole('radio', { name: /renseignements/i })
    expect(infoChip.className).toContain('bg-primary')
    const allChip = screen.getByRole('radio', { name: /tous/i })
    expect(allChip.className).toContain('bg-secondary')
  })

  it('displays zero counts when no matching requests', () => {
    render(<RequestTypeFilterChips {...defaultProps} typeCounts={{}} totalCount={0} />)
    expect(screen.getByText('Tous (0)')).toBeInTheDocument()
    expect(screen.getByText('Renseignements (0)')).toBeInTheDocument()
    expect(screen.getByText('Commandes (0)')).toBeInTheDocument()
  })
})
