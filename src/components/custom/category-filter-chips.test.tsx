import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CategoryFilterChips } from './category-filter-chips'

const defaultProps = {
  selectedCategory: null as string | null,
  onCategoryChange: vi.fn(),
  categoryCounts: {
    EPICERIE: 5,
    FRAIS: 3,
    DPH: 0,
    SURGELES: 2,
    BOISSONS: 1,
    AUTRES: 1,
  },
  totalCount: 12,
}

describe('CategoryFilterChips', () => {
  it('renders all 7 chips (Tout + 6 categories)', () => {
    render(<CategoryFilterChips {...defaultProps} />)

    expect(screen.getByText('Tout (12)')).toBeInTheDocument()
    expect(screen.getByText('Épicerie (5)')).toBeInTheDocument()
    expect(screen.getByText('Frais (3)')).toBeInTheDocument()
    expect(screen.getByText('DPH (0)')).toBeInTheDocument()
    expect(screen.getByText('Surgelés (2)')).toBeInTheDocument()
    expect(screen.getByText('Boissons (1)')).toBeInTheDocument()
    expect(screen.getByText('Autres (1)')).toBeInTheDocument()
  })

  it('"Tout" is active by default when selectedCategory is null', () => {
    render(<CategoryFilterChips {...defaultProps} />)

    const toutButton = screen.getByText('Tout (12)')
    expect(toutButton).toHaveAttribute('aria-checked', 'true')
    expect(toutButton.className).toContain('bg-primary')
  })

  it('category chips are inactive when selectedCategory is null', () => {
    render(<CategoryFilterChips {...defaultProps} />)

    const epicerieButton = screen.getByText('Épicerie (5)')
    expect(epicerieButton).toHaveAttribute('aria-checked', 'false')
    expect(epicerieButton.className).toContain('bg-secondary')
  })

  it('calls onCategoryChange with "EPICERIE" when Épicerie is clicked', () => {
    const onCategoryChange = vi.fn()
    render(<CategoryFilterChips {...defaultProps} onCategoryChange={onCategoryChange} />)

    fireEvent.click(screen.getByText('Épicerie (5)'))
    expect(onCategoryChange).toHaveBeenCalledWith('EPICERIE')
  })

  it('calls onCategoryChange with null when Tout is clicked', () => {
    const onCategoryChange = vi.fn()
    render(
      <CategoryFilterChips
        {...defaultProps}
        selectedCategory="EPICERIE"
        onCategoryChange={onCategoryChange}
      />
    )

    fireEvent.click(screen.getByText('Tout (12)'))
    expect(onCategoryChange).toHaveBeenCalledWith(null)
  })

  it('active chip has bg-primary style', () => {
    render(<CategoryFilterChips {...defaultProps} selectedCategory="FRAIS" />)

    const fraisButton = screen.getByText('Frais (3)')
    expect(fraisButton.className).toContain('bg-primary')
    expect(fraisButton).toHaveAttribute('aria-checked', 'true')
  })

  it('inactive chip has bg-secondary style', () => {
    render(<CategoryFilterChips {...defaultProps} selectedCategory="FRAIS" />)

    const toutButton = screen.getByText('Tout (12)')
    expect(toutButton.className).toContain('bg-secondary')
    expect(toutButton).toHaveAttribute('aria-checked', 'false')
  })

  it('displays counts in parentheses for each chip', () => {
    render(<CategoryFilterChips {...defaultProps} />)

    expect(screen.getByText('Tout (12)')).toBeInTheDocument()
    expect(screen.getByText('Épicerie (5)')).toBeInTheDocument()
    expect(screen.getByText('Frais (3)')).toBeInTheDocument()
  })

  it('displays "(0)" for categories with zero offers', () => {
    render(<CategoryFilterChips {...defaultProps} />)

    expect(screen.getByText('DPH (0)')).toBeInTheDocument()
  })

  it('chips have role="radio" and radiogroup container', () => {
    render(<CategoryFilterChips {...defaultProps} />)

    const radiogroup = screen.getByRole('radiogroup', { name: /filtrer par catégorie/i })
    expect(radiogroup).toBeInTheDocument()

    const radios = screen.getAllByRole('radio')
    expect(radios).toHaveLength(7)
  })

  it('renders chips in the exact order: Tout, Épicerie, Frais, DPH, Surgelés, Boissons, Autres', () => {
    render(<CategoryFilterChips {...defaultProps} />)

    const radios = screen.getAllByRole('radio')
    expect(radios[0]).toHaveTextContent('Tout (12)')
    expect(radios[1]).toHaveTextContent('Épicerie (5)')
    expect(radios[2]).toHaveTextContent('Frais (3)')
    expect(radios[3]).toHaveTextContent('DPH (0)')
    expect(radios[4]).toHaveTextContent('Surgelés (2)')
    expect(radios[5]).toHaveTextContent('Boissons (1)')
    expect(radios[6]).toHaveTextContent('Autres (1)')
  })

  it('displays (0) for categories not in categoryCounts', () => {
    render(
      <CategoryFilterChips
        {...defaultProps}
        categoryCounts={{ EPICERIE: 2 }}
        totalCount={2}
      />
    )

    expect(screen.getByText('Frais (0)')).toBeInTheDocument()
    expect(screen.getByText('DPH (0)')).toBeInTheDocument()
  })
})
