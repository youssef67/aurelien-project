import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { RequestStatusFilterChips } from './request-status-filter-chips'

describe('RequestStatusFilterChips', () => {
  const defaultProps = {
    selectedStatus: null as string | null,
    onStatusChange: vi.fn(),
    statusCounts: { PENDING: 5, TREATED: 3 },
    totalCount: 8,
  }

  it('renders all three chips', () => {
    render(<RequestStatusFilterChips {...defaultProps} />)
    expect(screen.getByText('Tous (8)')).toBeInTheDocument()
    expect(screen.getByText('Nouveaux (5)')).toBeInTheDocument()
    expect(screen.getByText('Traités (3)')).toBeInTheDocument()
  })

  it('renders radiogroup with aria-label', () => {
    render(<RequestStatusFilterChips {...defaultProps} />)
    expect(screen.getByRole('radiogroup', { name: 'Filtrer par statut' })).toBeInTheDocument()
  })

  it('marks "Tous" as checked when no status is selected', () => {
    render(<RequestStatusFilterChips {...defaultProps} />)
    const allChip = screen.getByRole('radio', { name: /tous/i })
    expect(allChip).toHaveAttribute('aria-checked', 'true')
  })

  it('marks selected status chip as checked', () => {
    render(<RequestStatusFilterChips {...defaultProps} selectedStatus="PENDING" />)
    const pendingChip = screen.getByRole('radio', { name: /nouveaux/i })
    expect(pendingChip).toHaveAttribute('aria-checked', 'true')
    const allChip = screen.getByRole('radio', { name: /tous/i })
    expect(allChip).toHaveAttribute('aria-checked', 'false')
  })

  it('calls onStatusChange with status when a status chip is clicked', () => {
    const onStatusChange = vi.fn()
    render(<RequestStatusFilterChips {...defaultProps} onStatusChange={onStatusChange} />)
    fireEvent.click(screen.getByText('Nouveaux (5)'))
    expect(onStatusChange).toHaveBeenCalledWith('PENDING')
  })

  it('calls onStatusChange with null when "Tous" is clicked', () => {
    const onStatusChange = vi.fn()
    render(<RequestStatusFilterChips {...defaultProps} selectedStatus="TREATED" onStatusChange={onStatusChange} />)
    fireEvent.click(screen.getByText('Tous (8)'))
    expect(onStatusChange).toHaveBeenCalledWith(null)
  })

  it('applies active style to selected chip', () => {
    render(<RequestStatusFilterChips {...defaultProps} selectedStatus="PENDING" />)
    const pendingChip = screen.getByRole('radio', { name: /nouveaux/i })
    expect(pendingChip.className).toContain('bg-primary')
    const allChip = screen.getByRole('radio', { name: /tous/i })
    expect(allChip.className).toContain('bg-secondary')
  })

  it('displays zero counts when no matching requests', () => {
    render(<RequestStatusFilterChips {...defaultProps} statusCounts={{}} totalCount={0} />)
    expect(screen.getByText('Tous (0)')).toBeInTheDocument()
    expect(screen.getByText('Nouveaux (0)')).toBeInTheDocument()
    expect(screen.getByText('Traités (0)')).toBeInTheDocument()
  })
})
