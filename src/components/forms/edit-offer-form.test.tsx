import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EditOfferForm } from './edit-offer-form'
import type { SerializedOffer } from '@/lib/utils/offers'

// Mock next/navigation
const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

// Mock server action
const mockUpdateOffer = vi.fn()
vi.mock('@/lib/actions/offers', () => ({
  updateOffer: (...args: unknown[]) => mockUpdateOffer(...args),
}))

// Mock Supabase client (for PhotoUpload)
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getUser: () => Promise.resolve({ data: { user: { id: 'supplier-123' } } }),
    },
  }),
}))

// Mock storage utilities (used by PhotoUpload)
vi.mock('@/lib/supabase/storage', () => ({
  uploadOfferPhoto: vi.fn(),
  deleteOfferPhoto: vi.fn(),
}))

// Mock sonner
const mockToastSuccess = vi.fn()
const mockToastError = vi.fn()
vi.mock('sonner', () => ({
  toast: {
    success: (...args: unknown[]) => mockToastSuccess(...args),
    error: (...args: unknown[]) => mockToastError(...args),
  },
}))

function futureDate(daysFromNow: number): string {
  const d = new Date()
  d.setDate(d.getDate() + daysFromNow)
  return d.toISOString()
}

function pastDate(daysAgo: number): string {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  return d.toISOString()
}

function createMockOffer(overrides: Partial<SerializedOffer> = {}): SerializedOffer {
  return {
    id: '550e8400-e29b-41d4-a716-446655440000',
    supplierId: 'supplier-123',
    name: 'Nutella 1kg',
    promoPrice: 12.99,
    discountPercent: 25,
    startDate: futureDate(5),
    endDate: futureDate(30),
    category: 'EPICERIE',
    subcategory: null,
    photoUrl: null,
    margin: null,
    volume: null,
    conditions: null,
    animation: null,
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
    ...overrides,
  }
}

describe('EditOfferForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('pre-filled form', () => {
    it('renders step 1 with pre-filled values', () => {
      render(<EditOfferForm offer={createMockOffer()} supplierId="supplier-123" />)

      expect(screen.getByDisplayValue('Nutella 1kg')).toBeInTheDocument()
      expect(screen.getByDisplayValue('12.99')).toBeInTheDocument()
      expect(screen.getByDisplayValue('25')).toBeInTheDocument()
    })

    it('renders StepIndicator with 3 steps', () => {
      render(<EditOfferForm offer={createMockOffer()} supplierId="supplier-123" />)
      const progressbar = screen.getByRole('progressbar')
      expect(progressbar).toBeInTheDocument()
      expect(progressbar).toHaveAttribute('aria-valuemax', '3')
    })
  })

  describe('step navigation', () => {
    it('navigates to step 2 when step 1 is valid', async () => {
      const user = userEvent.setup()
      render(<EditOfferForm offer={createMockOffer()} supplierId="supplier-123" />)

      await user.click(screen.getByRole('button', { name: /suivant/i }))

      await waitFor(() => {
        expect(screen.getByLabelText(/date de début/i)).toBeInTheDocument()
      })
    })

    it('can navigate back from step 2 to step 1', async () => {
      const user = userEvent.setup()
      render(<EditOfferForm offer={createMockOffer()} supplierId="supplier-123" />)

      await user.click(screen.getByRole('button', { name: /suivant/i }))

      await waitFor(() => {
        expect(screen.getByLabelText(/date de début/i)).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /retour/i }))

      await waitFor(() => {
        expect(screen.getByDisplayValue('Nutella 1kg')).toBeInTheDocument()
      })
    })

    it('navigates to step 3 via "Enrichir"', async () => {
      const user = userEvent.setup()
      render(<EditOfferForm offer={createMockOffer()} supplierId="supplier-123" />)

      await user.click(screen.getByRole('button', { name: /suivant/i }))

      await waitFor(() => {
        expect(screen.getByLabelText(/date de début/i)).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /enrichir/i }))

      await waitFor(() => {
        expect(screen.getByLabelText(/sous-catégorie/i)).toBeInTheDocument()
      })
    })
  })

  describe('startDate disabled when offer already started', () => {
    it('disables startDate field when offer has started', async () => {
      const user = userEvent.setup()
      const offer = createMockOffer({ startDate: pastDate(5) })
      render(<EditOfferForm offer={offer} supplierId="supplier-123" />)

      await user.click(screen.getByRole('button', { name: /suivant/i }))

      await waitFor(() => {
        expect(screen.getByLabelText(/date de début/i)).toBeDisabled()
      })
    })

    it('enables startDate field when offer has not started yet', async () => {
      const user = userEvent.setup()
      const offer = createMockOffer({ startDate: futureDate(5) })
      render(<EditOfferForm offer={offer} supplierId="supplier-123" />)

      await user.click(screen.getByRole('button', { name: /suivant/i }))

      await waitFor(() => {
        expect(screen.getByLabelText(/date de début/i)).not.toBeDisabled()
      })
    })

    it('sets min attribute on startDate when offer has not started yet', async () => {
      const user = userEvent.setup()
      const offer = createMockOffer({ startDate: futureDate(5) })
      render(<EditOfferForm offer={offer} supplierId="supplier-123" />)

      await user.click(screen.getByRole('button', { name: /suivant/i }))

      const today = new Date().toISOString().split('T')[0]
      await waitFor(() => {
        expect(screen.getByLabelText(/date de début/i)).toHaveAttribute('min', today)
      })
    })

    it('does not set min attribute on startDate when offer has already started', async () => {
      const user = userEvent.setup()
      const offer = createMockOffer({ startDate: pastDate(5) })
      render(<EditOfferForm offer={offer} supplierId="supplier-123" />)

      await user.click(screen.getByRole('button', { name: /suivant/i }))

      await waitFor(() => {
        expect(screen.getByLabelText(/date de début/i)).not.toHaveAttribute('min')
      })
    })
  })

  describe('form submission', () => {
    it('calls updateOffer and shows success toast on success', async () => {
      mockUpdateOffer.mockResolvedValue({ success: true, data: { offerId: '550e8400-e29b-41d4-a716-446655440000' } })
      const user = userEvent.setup()
      render(<EditOfferForm offer={createMockOffer()} supplierId="supplier-123" />)

      // Go to step 2
      await user.click(screen.getByRole('button', { name: /suivant/i }))

      await waitFor(() => {
        expect(screen.getByLabelText(/date de début/i)).toBeInTheDocument()
      })

      // Submit from step 2
      await user.click(screen.getByRole('button', { name: /enregistrer/i }))

      await waitFor(() => {
        expect(mockUpdateOffer).toHaveBeenCalled()
      })

      await waitFor(() => {
        expect(mockToastSuccess).toHaveBeenCalledWith('Offre modifiée')
      })

      expect(mockPush).toHaveBeenCalledWith('/offers/550e8400-e29b-41d4-a716-446655440000')
    })

    it('shows error toast on server error', async () => {
      mockUpdateOffer.mockResolvedValue({
        success: false,
        error: 'Erreur serveur',
        code: 'SERVER_ERROR',
      })
      const user = userEvent.setup()
      render(<EditOfferForm offer={createMockOffer()} supplierId="supplier-123" />)

      // Go to step 2
      await user.click(screen.getByRole('button', { name: /suivant/i }))

      await waitFor(() => {
        expect(screen.getByLabelText(/date de début/i)).toBeInTheDocument()
      })

      // Submit
      await user.click(screen.getByRole('button', { name: /enregistrer/i }))

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith('Erreur serveur')
      })
    })

    it('shows error toast on unexpected error', async () => {
      mockUpdateOffer.mockRejectedValue(new Error('Network error'))
      const user = userEvent.setup()
      render(<EditOfferForm offer={createMockOffer()} supplierId="supplier-123" />)

      // Go to step 2
      await user.click(screen.getByRole('button', { name: /suivant/i }))

      await waitFor(() => {
        expect(screen.getByLabelText(/date de début/i)).toBeInTheDocument()
      })

      // Submit
      await user.click(screen.getByRole('button', { name: /enregistrer/i }))

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith('Une erreur inattendue est survenue')
      })
    })
  })

  describe('step 3 rendering with pre-filled optional data', () => {
    it('displays pre-filled optional fields on step 3', async () => {
      const offer = createMockOffer({
        subcategory: 'Bio',
        margin: 15.5,
        volume: '2 palettes',
        conditions: 'Franco 500€',
        animation: 'PLV fournie',
      })
      const user = userEvent.setup()
      render(<EditOfferForm offer={offer} supplierId="supplier-123" />)

      // Navigate to step 2 then step 3
      await user.click(screen.getByRole('button', { name: /suivant/i }))

      await waitFor(() => {
        expect(screen.getByLabelText(/date de début/i)).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /enrichir/i }))

      await waitFor(() => {
        expect(screen.getByLabelText(/sous-catégorie/i)).toBeInTheDocument()
      })

      expect(screen.getByDisplayValue('Bio')).toBeInTheDocument()
      expect(screen.getByDisplayValue('15.5')).toBeInTheDocument()
      expect(screen.getByDisplayValue('2 palettes')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Franco 500€')).toBeInTheDocument()
      expect(screen.getByDisplayValue('PLV fournie')).toBeInTheDocument()
    })
  })

  describe('submit button labels', () => {
    it('shows "Enregistrer les modifications" instead of "Publier"', async () => {
      const user = userEvent.setup()
      render(<EditOfferForm offer={createMockOffer()} supplierId="supplier-123" />)

      // Go to step 2
      await user.click(screen.getByRole('button', { name: /suivant/i }))

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /enregistrer les modifications/i })).toBeInTheDocument()
      })

      // No "Publier" button
      expect(screen.queryByRole('button', { name: /publier/i })).not.toBeInTheDocument()
    })
  })
})
