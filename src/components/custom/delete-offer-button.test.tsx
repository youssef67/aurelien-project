import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DeleteOfferButton } from './delete-offer-button'

// Mock next/navigation
const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

// Mock deleteOffer server action
const mockDeleteOffer = vi.fn()
vi.mock('@/lib/actions/offers', () => ({
  deleteOffer: (...args: unknown[]) => mockDeleteOffer(...args),
}))

// Mock sonner toast
const mockToastSuccess = vi.fn()
const mockToastError = vi.fn()
vi.mock('sonner', () => ({
  toast: {
    success: (...args: unknown[]) => mockToastSuccess(...args),
    error: (...args: unknown[]) => mockToastError(...args),
  },
}))

describe('DeleteOfferButton', () => {
  const offerId = '550e8400-e29b-41d4-a716-446655440000'

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the delete trigger button', () => {
    render(<DeleteOfferButton offerId={offerId} />)

    expect(screen.getByRole('button', { name: /supprimer cette offre/i })).toBeInTheDocument()
  })

  it('opens dialog on click', async () => {
    const user = userEvent.setup()
    render(<DeleteOfferButton offerId={offerId} />)

    await user.click(screen.getByRole('button', { name: /supprimer cette offre/i }))

    expect(screen.getByText(/êtes-vous sûr/i)).toBeInTheDocument()
    expect(screen.getByText(/cette action est irréversible/i)).toBeInTheDocument()
  })

  it('shows Annuler and Supprimer buttons in dialog', async () => {
    const user = userEvent.setup()
    render(<DeleteOfferButton offerId={offerId} />)

    await user.click(screen.getByRole('button', { name: /supprimer cette offre/i }))

    expect(screen.getByRole('button', { name: /annuler/i })).toBeInTheDocument()
    // The dialog confirm button labeled "Supprimer"
    expect(screen.getByRole('button', { name: /^supprimer$/i })).toBeInTheDocument()
  })

  it('closes dialog on Annuler without calling deleteOffer', async () => {
    const user = userEvent.setup()
    render(<DeleteOfferButton offerId={offerId} />)

    await user.click(screen.getByRole('button', { name: /supprimer cette offre/i }))
    await user.click(screen.getByRole('button', { name: /annuler/i }))

    expect(mockDeleteOffer).not.toHaveBeenCalled()
  })

  it('calls deleteOffer with correct offerId on confirm', async () => {
    mockDeleteOffer.mockResolvedValue({ success: true, data: { offerId } })
    const user = userEvent.setup()
    render(<DeleteOfferButton offerId={offerId} />)

    await user.click(screen.getByRole('button', { name: /supprimer cette offre/i }))

    // Click the destructive Supprimer button in the dialog footer
    const dialogButtons = screen.getAllByRole('button', { name: /supprimer$/i })
    const confirmButton = dialogButtons[dialogButtons.length - 1]
    await user.click(confirmButton)

    await waitFor(() => {
      expect(mockDeleteOffer).toHaveBeenCalledWith({ id: offerId })
    })
  })

  it('shows success toast and redirects on successful deletion', async () => {
    mockDeleteOffer.mockResolvedValue({ success: true, data: { offerId } })
    const user = userEvent.setup()
    render(<DeleteOfferButton offerId={offerId} />)

    await user.click(screen.getByRole('button', { name: /supprimer cette offre/i }))

    const dialogButtons = screen.getAllByRole('button', { name: /supprimer$/i })
    const confirmButton = dialogButtons[dialogButtons.length - 1]
    await user.click(confirmButton)

    await waitFor(() => {
      expect(mockToastSuccess).toHaveBeenCalledWith('Offre supprimée')
      expect(mockPush).toHaveBeenCalledWith('/dashboard')
    })
  })

  it('shows error toast on failure, dialog stays open', async () => {
    mockDeleteOffer.mockResolvedValue({
      success: false,
      error: 'Accès interdit',
      code: 'FORBIDDEN',
    })
    const user = userEvent.setup()
    render(<DeleteOfferButton offerId={offerId} />)

    await user.click(screen.getByRole('button', { name: /supprimer cette offre/i }))

    const dialogButtons = screen.getAllByRole('button', { name: /supprimer$/i })
    const confirmButton = dialogButtons[dialogButtons.length - 1]
    await user.click(confirmButton)

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith('Accès interdit')
    })

    // Dialog should still be open
    expect(screen.getByText(/êtes-vous sûr/i)).toBeInTheDocument()
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('shows generic error toast on unexpected exception', async () => {
    mockDeleteOffer.mockRejectedValue(new Error('Network error'))
    const user = userEvent.setup()
    render(<DeleteOfferButton offerId={offerId} />)

    await user.click(screen.getByRole('button', { name: /supprimer cette offre/i }))

    const dialogButtons = screen.getAllByRole('button', { name: /supprimer$/i })
    const confirmButton = dialogButtons[dialogButtons.length - 1]
    await user.click(confirmButton)

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith('Une erreur inattendue est survenue')
    })
  })

  it('disables buttons during loading', async () => {
    // Make deleteOffer hang to test loading state
    mockDeleteOffer.mockImplementation(() => new Promise(() => {}))
    const user = userEvent.setup()
    render(<DeleteOfferButton offerId={offerId} />)

    await user.click(screen.getByRole('button', { name: /supprimer cette offre/i }))

    const dialogButtons = screen.getAllByRole('button', { name: /supprimer$/i })
    const confirmButton = dialogButtons[dialogButtons.length - 1]
    await user.click(confirmButton)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /annuler/i })).toBeDisabled()
      // The confirm button in the dialog should be disabled
      const allSupprimer = screen.getAllByRole('button', { name: /supprimer$/i })
      const dialogConfirm = allSupprimer[allSupprimer.length - 1]
      expect(dialogConfirm).toBeDisabled()
    })
  })

  it('prevents dialog dismissal during loading (Escape/overlay)', async () => {
    // Make deleteOffer hang to test loading state
    mockDeleteOffer.mockImplementation(() => new Promise(() => {}))
    const user = userEvent.setup()
    render(<DeleteOfferButton offerId={offerId} />)

    // Open dialog and trigger delete
    await user.click(screen.getByRole('button', { name: /supprimer cette offre/i }))

    const dialogButtons = screen.getAllByRole('button', { name: /supprimer$/i })
    const confirmButton = dialogButtons[dialogButtons.length - 1]
    await user.click(confirmButton)

    // Wait for loading state
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /annuler/i })).toBeDisabled()
    })

    // Try to dismiss via Escape key
    await user.keyboard('{Escape}')

    // Dialog should still be open (not dismissible during loading)
    expect(screen.getByText(/êtes-vous sûr/i)).toBeInTheDocument()
  })
})
