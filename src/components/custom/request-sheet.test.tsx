import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { RequestSheet } from './request-sheet'

// Mock sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

// Mock next/navigation
const mockRefresh = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: mockRefresh,
    push: vi.fn(),
    back: vi.fn(),
  }),
}))

// Mock createRequest
const mockCreateRequest = vi.fn()
vi.mock('@/lib/actions/requests', () => ({
  createRequest: (...args: unknown[]) => mockCreateRequest(...args),
}))

import { toast } from 'sonner'

function renderSheet(props: Partial<React.ComponentProps<typeof RequestSheet>> = {}) {
  return render(
    <RequestSheet
      offerId="offer-123"
      supplierName="Bio Fruits SARL"
      type="INFO"
      trigger={<button>Demande de renseignements</button>}
      {...props}
    />
  )
}

describe('RequestSheet', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders trigger button', () => {
    renderSheet()

    expect(screen.getByText('Demande de renseignements')).toBeInTheDocument()
  })

  it('opens sheet when trigger is clicked', async () => {
    renderSheet()

    fireEvent.click(screen.getByText('Demande de renseignements'))

    await waitFor(() => {
      expect(screen.getByText('Demande de renseignements', { selector: '[data-slot="sheet-title"]' })).toBeInTheDocument()
    })
  })

  it('displays correct title for INFO type', async () => {
    renderSheet({ type: 'INFO' })

    fireEvent.click(screen.getByText('Demande de renseignements'))

    await waitFor(() => {
      expect(screen.getByText('Demande de renseignements', { selector: '[data-slot="sheet-title"]' })).toBeInTheDocument()
    })
  })

  it('displays correct title for ORDER type', async () => {
    renderSheet({ type: 'ORDER', trigger: <button>Commander</button> })

    fireEvent.click(screen.getByText('Commander'))

    await waitFor(() => {
      expect(screen.getByText('Intention de commande')).toBeInTheDocument()
    })
  })

  it('displays supplier name in description', async () => {
    renderSheet()

    fireEvent.click(screen.getByText('Demande de renseignements'))

    await waitFor(() => {
      expect(screen.getByText('Envoyer une demande à Bio Fruits SARL')).toBeInTheDocument()
    })
  })

  it('displays textarea with placeholder', async () => {
    renderSheet()

    fireEvent.click(screen.getByText('Demande de renseignements'))

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Précisez votre question (optionnel)')).toBeInTheDocument()
    })
  })

  it('displays submit button "Envoyer"', async () => {
    renderSheet()

    fireEvent.click(screen.getByText('Demande de renseignements'))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Envoyer/i })).toBeInTheDocument()
    })
  })

  it('calls createRequest on submit with correct params', async () => {
    mockCreateRequest.mockResolvedValue({ success: true, data: { requestId: 'req-1' } })

    renderSheet()

    fireEvent.click(screen.getByText('Demande de renseignements'))

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Précisez votre question (optionnel)')).toBeInTheDocument()
    })

    fireEvent.change(screen.getByPlaceholderText('Précisez votre question (optionnel)'), {
      target: { value: 'Ma question' },
    })

    fireEvent.click(screen.getByRole('button', { name: /Envoyer/i }))

    await waitFor(() => {
      expect(mockCreateRequest).toHaveBeenCalledWith({
        offerId: 'offer-123',
        type: 'INFO',
        message: 'Ma question',
      })
    })
  })

  it('shows success toast on successful submit', async () => {
    mockCreateRequest.mockResolvedValue({ success: true, data: { requestId: 'req-1' } })

    renderSheet()

    fireEvent.click(screen.getByText('Demande de renseignements'))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Envoyer/i })).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /Envoyer/i }))

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Demande envoyée à Bio Fruits SARL')
    })
  })

  it('shows error toast on failed submit and keeps sheet open with message preserved', async () => {
    mockCreateRequest.mockResolvedValue({ success: false, error: 'Erreur test', code: 'SERVER_ERROR' })

    renderSheet()

    fireEvent.click(screen.getByText('Demande de renseignements'))

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Précisez votre question (optionnel)')).toBeInTheDocument()
    })

    // Type a message before submitting
    fireEvent.change(screen.getByPlaceholderText('Précisez votre question (optionnel)'), {
      target: { value: 'Mon message important' },
    })

    fireEvent.click(screen.getByRole('button', { name: /Envoyer/i }))

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Erreur test')
    })

    // AC7: Sheet stays open — title and textarea still visible
    expect(screen.getByText('Demande de renseignements', { selector: '[data-slot="sheet-title"]' })).toBeInTheDocument()

    // AC7: Message preserved in textarea
    expect(screen.getByPlaceholderText('Précisez votre question (optionnel)')).toHaveValue('Mon message important')
  })

  // Story 4.2 — AC5: Submit without message (empty textarea)
  it('calls createRequest with message undefined when textarea is empty', async () => {
    mockCreateRequest.mockResolvedValue({ success: true, data: { requestId: 'req-3' } })

    renderSheet()

    fireEvent.click(screen.getByText('Demande de renseignements'))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Envoyer/i })).toBeInTheDocument()
    })

    // Submit without typing anything
    fireEvent.click(screen.getByRole('button', { name: /Envoyer/i }))

    await waitFor(() => {
      expect(mockCreateRequest).toHaveBeenCalledWith({
        offerId: 'offer-123',
        type: 'INFO',
        message: undefined,
      })
    })
  })

  // Story 4.2 — AC5: Whitespace-only message treated as empty
  it('trims whitespace-only message to undefined', async () => {
    mockCreateRequest.mockResolvedValue({ success: true, data: { requestId: 'req-4' } })

    renderSheet()

    fireEvent.click(screen.getByText('Demande de renseignements'))

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Précisez votre question (optionnel)')).toBeInTheDocument()
    })

    fireEvent.change(screen.getByPlaceholderText('Précisez votre question (optionnel)'), {
      target: { value: '   ' },
    })

    fireEvent.click(screen.getByRole('button', { name: /Envoyer/i }))

    await waitFor(() => {
      expect(mockCreateRequest).toHaveBeenCalledWith({
        offerId: 'offer-123',
        type: 'INFO',
        message: undefined,
      })
    })
  })

  // Story 4.2 — AC1: Placeholder ORDER
  it('displays correct placeholder for ORDER type', async () => {
    renderSheet({ type: 'ORDER', trigger: <button>Souhaite commander</button> })

    fireEvent.click(screen.getByText('Souhaite commander'))

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Précisez quantité ou conditions (optionnel)')).toBeInTheDocument()
    })
  })

  // Story 4.2 — AC2: Submit with ORDER type
  it('calls createRequest with type ORDER on submit', async () => {
    mockCreateRequest.mockResolvedValue({ success: true, data: { requestId: 'req-2' } })

    renderSheet({ type: 'ORDER', trigger: <button>Souhaite commander</button> })

    fireEvent.click(screen.getByText('Souhaite commander'))

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Précisez quantité ou conditions (optionnel)')).toBeInTheDocument()
    })

    fireEvent.change(screen.getByPlaceholderText('Précisez quantité ou conditions (optionnel)'), {
      target: { value: '200 caisses' },
    })

    fireEvent.click(screen.getByRole('button', { name: /Envoyer/i }))

    await waitFor(() => {
      expect(mockCreateRequest).toHaveBeenCalledWith({
        offerId: 'offer-123',
        type: 'ORDER',
        message: '200 caisses',
      })
    })
  })

  // Story 4.2 — AC3: Success toast for ORDER
  it('shows ORDER success toast on successful submit', async () => {
    mockCreateRequest.mockResolvedValue({ success: true, data: { requestId: 'req-2' } })

    renderSheet({ type: 'ORDER', trigger: <button>Souhaite commander</button> })

    fireEvent.click(screen.getByText('Souhaite commander'))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Envoyer/i })).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /Envoyer/i }))

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Intention de commande envoyée !')
    })
  })

  it('does not open sheet when disabled', () => {
    renderSheet({ disabled: true })

    fireEvent.click(screen.getByText('Demande de renseignements'))

    // Sheet title should not appear
    expect(screen.queryByText('Envoyer une demande à Bio Fruits SARL')).not.toBeInTheDocument()
  })
})
