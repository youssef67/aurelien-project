import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CreateOfferForm } from './create-offer-form'

// Mock next/navigation
const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

// Mock server action
const mockCreateOffer = vi.fn()
vi.mock('@/lib/actions/offers', () => ({
  createOffer: (...args: unknown[]) => mockCreateOffer(...args),
}))

// Mock Supabase client (for PhotoUpload's supplierId)
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

// Mock localStorage
const mockLocalStorage: Record<string, string> = {}
beforeEach(() => {
  Object.keys(mockLocalStorage).forEach(key => delete mockLocalStorage[key])
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(
    (key: string) => mockLocalStorage[key] || null
  )
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(
    (key: string, value: string) => { mockLocalStorage[key] = value }
  )
  vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(
    (key: string) => { delete mockLocalStorage[key] }
  )
})

describe('CreateOfferForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('step 1 rendering', () => {
    it('renders step 1 fields by default', () => {
      render(<CreateOfferForm />)
      expect(screen.getByLabelText(/nom du produit/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/prix promo/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/remise/i)).toBeInTheDocument()
    })

    it('renders StepIndicator with 3 steps', () => {
      render(<CreateOfferForm />)
      const progressbar = screen.getByRole('progressbar')
      expect(progressbar).toBeInTheDocument()
      expect(progressbar).toHaveAttribute('aria-valuemax', '3')
    })

    it('renders "Suivant" button on step 1', () => {
      render(<CreateOfferForm />)
      expect(screen.getByRole('button', { name: /suivant/i })).toBeInTheDocument()
    })

    it('does not render "Retour" button on step 1', () => {
      render(<CreateOfferForm />)
      expect(screen.queryByRole('button', { name: /retour/i })).not.toBeInTheDocument()
    })
  })

  describe('step navigation', () => {
    it('navigates to step 2 when step 1 is valid', async () => {
      const user = userEvent.setup()
      render(<CreateOfferForm />)

      await user.type(screen.getByLabelText(/nom du produit/i), 'Nutella 1kg')
      await user.type(screen.getByLabelText(/prix promo/i), '12.99')
      await user.type(screen.getByLabelText(/remise/i), '25')
      await user.click(screen.getByRole('button', { name: /suivant/i }))

      await waitFor(() => {
        expect(screen.getByLabelText(/date de début/i)).toBeInTheDocument()
      })
    })

    it('does not navigate to step 2 when step 1 is invalid', async () => {
      const user = userEvent.setup()
      render(<CreateOfferForm />)

      // Leave fields empty and click next
      await user.click(screen.getByRole('button', { name: /suivant/i }))

      // Should still be on step 1
      await waitFor(() => {
        expect(screen.getByLabelText(/nom du produit/i)).toBeInTheDocument()
      })
    })

    it('can navigate back from step 2 to step 1', async () => {
      const user = userEvent.setup()
      render(<CreateOfferForm />)

      // Fill step 1 and go to step 2
      await user.type(screen.getByLabelText(/nom du produit/i), 'Nutella 1kg')
      await user.type(screen.getByLabelText(/prix promo/i), '12.99')
      await user.type(screen.getByLabelText(/remise/i), '25')
      await user.click(screen.getByRole('button', { name: /suivant/i }))

      await waitFor(() => {
        expect(screen.getByLabelText(/date de début/i)).toBeInTheDocument()
      })

      // Click back
      await user.click(screen.getByRole('button', { name: /retour/i }))

      await waitFor(() => {
        expect(screen.getByLabelText(/nom du produit/i)).toBeInTheDocument()
      })
    })
  })

  describe('step 2 rendering', () => {
    async function navigateToStep2() {
      const user = userEvent.setup()
      render(<CreateOfferForm />)

      await user.type(screen.getByLabelText(/nom du produit/i), 'Nutella 1kg')
      await user.type(screen.getByLabelText(/prix promo/i), '12.99')
      await user.type(screen.getByLabelText(/remise/i), '25')
      await user.click(screen.getByRole('button', { name: /suivant/i }))

      await waitFor(() => {
        expect(screen.getByLabelText(/date de début/i)).toBeInTheDocument()
      })

      return user
    }

    it('renders step 2 fields', async () => {
      await navigateToStep2()

      expect(screen.getByLabelText(/date de début/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/date de fin/i)).toBeInTheDocument()
      expect(screen.getByRole('combobox')).toBeInTheDocument()
    })

    it('renders "Publier" and "Enrichir" buttons on step 2', async () => {
      await navigateToStep2()

      expect(screen.getByRole('button', { name: /publier/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /enrichir/i })).toBeInTheDocument()
    })

    it('renders "Retour" button on step 2', async () => {
      await navigateToStep2()

      expect(screen.getByRole('button', { name: /retour/i })).toBeInTheDocument()
    })

    it('navigates to step 3 when "Enrichir" is clicked', async () => {
      const user = await navigateToStep2()

      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const nextWeek = new Date()
      nextWeek.setDate(nextWeek.getDate() + 7)

      await user.type(screen.getByLabelText(/date de début/i), tomorrow.toISOString().split('T')[0])
      await user.type(screen.getByLabelText(/date de fin/i), nextWeek.toISOString().split('T')[0])
      await user.click(screen.getByRole('combobox'))
      await user.click(screen.getByRole('option', { name: 'Épicerie' }))

      await user.click(screen.getByRole('button', { name: /enrichir/i }))

      await waitFor(() => {
        expect(screen.getByLabelText(/sous-catégorie/i)).toBeInTheDocument()
      })
    })
  })

  describe('step 3 rendering', () => {
    async function navigateToStep3() {
      const user = userEvent.setup()
      render(<CreateOfferForm />)

      // Fill step 1
      await user.type(screen.getByLabelText(/nom du produit/i), 'Nutella 1kg')
      await user.type(screen.getByLabelText(/prix promo/i), '12.99')
      await user.type(screen.getByLabelText(/remise/i), '25')
      await user.click(screen.getByRole('button', { name: /suivant/i }))

      await waitFor(() => {
        expect(screen.getByLabelText(/date de début/i)).toBeInTheDocument()
      })

      // Fill step 2
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const nextWeek = new Date()
      nextWeek.setDate(nextWeek.getDate() + 7)

      await user.type(screen.getByLabelText(/date de début/i), tomorrow.toISOString().split('T')[0])
      await user.type(screen.getByLabelText(/date de fin/i), nextWeek.toISOString().split('T')[0])
      await user.click(screen.getByRole('combobox'))
      await user.click(screen.getByRole('option', { name: 'Épicerie' }))
      await user.click(screen.getByRole('button', { name: /enrichir/i }))

      await waitFor(() => {
        expect(screen.getByLabelText(/sous-catégorie/i)).toBeInTheDocument()
      })

      return user
    }

    it('renders step 3 optional fields', async () => {
      await navigateToStep3()

      expect(screen.getByLabelText(/sous-catégorie/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/marge/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/volume/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/conditions/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/animation/i)).toBeInTheDocument()
    })

    it('renders photo upload zone', async () => {
      await navigateToStep3()

      expect(screen.getByLabelText(/ajouter une photo/i)).toBeInTheDocument()
    })

    it('renders "Retour" and "Publier" buttons on step 3', async () => {
      await navigateToStep3()

      expect(screen.getByRole('button', { name: /retour/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /publier/i })).toBeInTheDocument()
    })

    it('navigates back to step 2 from step 3', async () => {
      const user = await navigateToStep3()

      await user.click(screen.getByRole('button', { name: /retour/i }))

      await waitFor(() => {
        expect(screen.getByLabelText(/date de début/i)).toBeInTheDocument()
      })
    })
  })

  describe('form submission', () => {
    it('calls createOffer and shows success toast on success', async () => {
      mockCreateOffer.mockResolvedValue({ success: true, data: { offerId: 'offer-123' } })
      const user = userEvent.setup()
      render(<CreateOfferForm />)

      // Fill step 1
      await user.type(screen.getByLabelText(/nom du produit/i), 'Nutella 1kg')
      await user.type(screen.getByLabelText(/prix promo/i), '12.99')
      await user.type(screen.getByLabelText(/remise/i), '25')
      await user.click(screen.getByRole('button', { name: /suivant/i }))

      // Fill step 2
      await waitFor(() => {
        expect(screen.getByLabelText(/date de début/i)).toBeInTheDocument()
      })

      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const nextWeek = new Date()
      nextWeek.setDate(nextWeek.getDate() + 7)

      await user.type(screen.getByLabelText(/date de début/i), tomorrow.toISOString().split('T')[0])
      await user.type(screen.getByLabelText(/date de fin/i), nextWeek.toISOString().split('T')[0])

      // Select category
      await user.click(screen.getByRole('combobox'))
      await user.click(screen.getByRole('option', { name: 'Épicerie' }))

      // Submit
      await user.click(screen.getByRole('button', { name: /publier/i }))

      await waitFor(() => {
        expect(mockCreateOffer).toHaveBeenCalled()
      })

      await waitFor(() => {
        expect(mockToastSuccess).toHaveBeenCalledWith('Offre publiée !')
      })

      expect(mockPush).toHaveBeenCalledWith('/dashboard')
    })

    it('shows error toast on server error', async () => {
      mockCreateOffer.mockResolvedValue({
        success: false,
        error: 'Erreur serveur',
        code: 'SERVER_ERROR',
      })
      const user = userEvent.setup()
      render(<CreateOfferForm />)

      // Fill step 1
      await user.type(screen.getByLabelText(/nom du produit/i), 'Nutella 1kg')
      await user.type(screen.getByLabelText(/prix promo/i), '12.99')
      await user.type(screen.getByLabelText(/remise/i), '25')
      await user.click(screen.getByRole('button', { name: /suivant/i }))

      // Fill step 2
      await waitFor(() => {
        expect(screen.getByLabelText(/date de début/i)).toBeInTheDocument()
      })

      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const nextWeek = new Date()
      nextWeek.setDate(nextWeek.getDate() + 7)

      await user.type(screen.getByLabelText(/date de début/i), tomorrow.toISOString().split('T')[0])
      await user.type(screen.getByLabelText(/date de fin/i), nextWeek.toISOString().split('T')[0])

      await user.click(screen.getByRole('combobox'))
      await user.click(screen.getByRole('option', { name: 'Épicerie' }))

      await user.click(screen.getByRole('button', { name: /publier/i }))

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith('Erreur serveur')
      })
    })
  })

  describe('step 2 validation on submit', () => {
    async function fillStep1AndNavigateToStep2() {
      const user = userEvent.setup()
      render(<CreateOfferForm />)

      await user.type(screen.getByLabelText(/nom du produit/i), 'Nutella 1kg')
      await user.type(screen.getByLabelText(/prix promo/i), '12.99')
      await user.type(screen.getByLabelText(/remise/i), '25')
      await user.click(screen.getByRole('button', { name: /suivant/i }))

      await waitFor(() => {
        expect(screen.getByLabelText(/date de début/i)).toBeInTheDocument()
      })

      return user
    }

    it('does not submit when dates are empty', async () => {
      const user = await fillStep1AndNavigateToStep2()

      // Select category but leave dates empty
      await user.click(screen.getByRole('combobox'))
      await user.click(screen.getByRole('option', { name: 'Épicerie' }))

      await user.click(screen.getByRole('button', { name: /publier/i }))

      await waitFor(() => {
        expect(mockCreateOffer).not.toHaveBeenCalled()
      })
    })

    it('does not submit when endDate is before startDate', async () => {
      const user = await fillStep1AndNavigateToStep2()

      const farFuture = new Date()
      farFuture.setDate(farFuture.getDate() + 30)
      const nearFuture = new Date()
      nearFuture.setDate(nearFuture.getDate() + 5)

      await user.type(screen.getByLabelText(/date de début/i), farFuture.toISOString().split('T')[0])
      await user.type(screen.getByLabelText(/date de fin/i), nearFuture.toISOString().split('T')[0])

      await user.click(screen.getByRole('combobox'))
      await user.click(screen.getByRole('option', { name: 'Épicerie' }))

      await user.click(screen.getByRole('button', { name: /publier/i }))

      await waitFor(() => {
        expect(mockCreateOffer).not.toHaveBeenCalled()
      })
    })

    it('does not submit when no category selected', async () => {
      const user = await fillStep1AndNavigateToStep2()

      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const nextWeek = new Date()
      nextWeek.setDate(nextWeek.getDate() + 7)

      await user.type(screen.getByLabelText(/date de début/i), tomorrow.toISOString().split('T')[0])
      await user.type(screen.getByLabelText(/date de fin/i), nextWeek.toISOString().split('T')[0])

      // Don't select category
      await user.click(screen.getByRole('button', { name: /publier/i }))

      await waitFor(() => {
        expect(mockCreateOffer).not.toHaveBeenCalled()
      })
    })
  })

  describe('step 3 submission', () => {
    it('submits with optional fields from step 3', async () => {
      mockCreateOffer.mockResolvedValue({ success: true, data: { offerId: 'offer-456' } })
      const user = userEvent.setup()
      render(<CreateOfferForm />)

      // Fill step 1
      await user.type(screen.getByLabelText(/nom du produit/i), 'Nutella 1kg')
      await user.type(screen.getByLabelText(/prix promo/i), '12.99')
      await user.type(screen.getByLabelText(/remise/i), '25')
      await user.click(screen.getByRole('button', { name: /suivant/i }))

      await waitFor(() => {
        expect(screen.getByLabelText(/date de début/i)).toBeInTheDocument()
      })

      // Fill step 2
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const nextWeek = new Date()
      nextWeek.setDate(nextWeek.getDate() + 7)

      await user.type(screen.getByLabelText(/date de début/i), tomorrow.toISOString().split('T')[0])
      await user.type(screen.getByLabelText(/date de fin/i), nextWeek.toISOString().split('T')[0])
      await user.click(screen.getByRole('combobox'))
      await user.click(screen.getByRole('option', { name: 'Épicerie' }))

      // Navigate to step 3
      await user.click(screen.getByRole('button', { name: /enrichir/i }))

      await waitFor(() => {
        expect(screen.getByLabelText(/sous-catégorie/i)).toBeInTheDocument()
      })

      // Fill step 3 optional fields
      await user.type(screen.getByLabelText(/sous-catégorie/i), 'Bio')
      await user.type(screen.getByLabelText(/volume/i), '2 palettes')

      // Submit from step 3
      await user.click(screen.getByRole('button', { name: /publier/i }))

      await waitFor(() => {
        expect(mockCreateOffer).toHaveBeenCalledWith(
          expect.objectContaining({
            subcategory: 'Bio',
            volume: '2 palettes',
          })
        )
      })

      await waitFor(() => {
        expect(mockToastSuccess).toHaveBeenCalledWith('Offre publiée !')
      })
    })
  })

  describe('localStorage draft', () => {
    it('saves draft to localStorage on input change', async () => {
      const user = userEvent.setup()
      render(<CreateOfferForm />)

      await user.type(screen.getByLabelText(/nom du produit/i), 'Test')

      await waitFor(() => {
        expect(localStorage.setItem).toHaveBeenCalledWith(
          'create-offer-draft',
          expect.any(String)
        )
      })
    })

    it('restores step 3 fields from draft (except photoUrl)', async () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const nextWeek = new Date()
      nextWeek.setDate(nextWeek.getDate() + 7)

      const draft = {
        name: 'Nutella 1kg',
        promoPrice: 12.99,
        discountPercent: 25,
        startDate: tomorrow.toISOString().split('T')[0],
        endDate: nextWeek.toISOString().split('T')[0],
        category: 'EPICERIE',
        subcategory: 'Bio',
        volume: '2 palettes',
        conditions: 'Franco 500€',
        animation: 'PLV fournie',
      }
      mockLocalStorage['create-offer-draft'] = JSON.stringify(draft)

      const user = userEvent.setup()
      render(<CreateOfferForm />)

      // Navigate to step 3 to verify restored values
      await user.click(screen.getByRole('button', { name: /suivant/i }))

      await waitFor(() => {
        expect(screen.getByLabelText(/date de début/i)).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /enrichir/i }))

      await waitFor(() => {
        expect(screen.getByLabelText(/sous-catégorie/i)).toBeInTheDocument()
      })

      // Verify step 3 fields were restored from draft
      expect(screen.getByLabelText(/sous-catégorie/i)).toHaveValue('Bio')
      expect(screen.getByLabelText(/volume/i)).toHaveValue('2 palettes')
      expect(screen.getByDisplayValue('Franco 500€')).toBeInTheDocument()
      expect(screen.getByDisplayValue('PLV fournie')).toBeInTheDocument()
    })

    it('removes draft from localStorage on successful submission', async () => {
      mockCreateOffer.mockResolvedValue({ success: true, data: { offerId: 'offer-123' } })
      const user = userEvent.setup()
      render(<CreateOfferForm />)

      // Fill step 1
      await user.type(screen.getByLabelText(/nom du produit/i), 'Nutella 1kg')
      await user.type(screen.getByLabelText(/prix promo/i), '12.99')
      await user.type(screen.getByLabelText(/remise/i), '25')
      await user.click(screen.getByRole('button', { name: /suivant/i }))

      await waitFor(() => {
        expect(screen.getByLabelText(/date de début/i)).toBeInTheDocument()
      })

      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const nextWeek = new Date()
      nextWeek.setDate(nextWeek.getDate() + 7)

      await user.type(screen.getByLabelText(/date de début/i), tomorrow.toISOString().split('T')[0])
      await user.type(screen.getByLabelText(/date de fin/i), nextWeek.toISOString().split('T')[0])

      await user.click(screen.getByRole('combobox'))
      await user.click(screen.getByRole('option', { name: 'Épicerie' }))

      await user.click(screen.getByRole('button', { name: /publier/i }))

      await waitFor(() => {
        expect(localStorage.removeItem).toHaveBeenCalledWith('create-offer-draft')
      })
    })
  })
})
