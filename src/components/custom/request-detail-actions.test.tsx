import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RequestDetailActions } from './request-detail-actions'

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

// Mock server action
const mockUpdateRequestStatus = vi.fn()
vi.mock('@/lib/actions/requests', () => ({
  updateRequestStatus: (...args: unknown[]) => mockUpdateRequestStatus(...args),
}))

// Mock format
vi.mock('@/lib/utils/format', () => ({
  formatAbsoluteDate: () => '10 février 2026',
}))

describe('RequestDetailActions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('PENDING state', () => {
    const defaultProps = {
      requestId: 'req-1',
      status: 'PENDING' as const,
      phone: '0388123456',
      updatedAt: '2026-02-10T12:00:00Z',
    }

    it('renders "Appeler" button', () => {
      render(<RequestDetailActions {...defaultProps} />)
      expect(screen.getByRole('button', { name: /appeler/i })).toBeInTheDocument()
    })

    it('renders "Marquer comme traitée" button', () => {
      render(<RequestDetailActions {...defaultProps} />)
      expect(screen.getByRole('button', { name: /marquer comme traitée/i })).toBeInTheDocument()
    })

    it('does not render treated indicator', () => {
      render(<RequestDetailActions {...defaultProps} />)
      expect(screen.queryByText(/traitée le/i)).not.toBeInTheDocument()
    })

    it('copies phone to clipboard on desktop click', async () => {
      const writeText = vi.fn().mockResolvedValue(undefined)
      Object.defineProperty(window.navigator, 'clipboard', {
        value: { writeText },
        writable: true,
        configurable: true,
      })
      Object.defineProperty(window.navigator, 'maxTouchPoints', {
        value: 0,
        writable: true,
        configurable: true,
      })

      render(<RequestDetailActions {...defaultProps} />)

      fireEvent.click(screen.getByRole('button', { name: /appeler/i }))

      await waitFor(() => {
        expect(writeText).toHaveBeenCalledWith('0388123456')
      })
    })

    it('shows error toast when clipboard write fails', async () => {
      const writeText = vi.fn().mockRejectedValue(new Error('Clipboard denied'))
      Object.defineProperty(window.navigator, 'clipboard', {
        value: { writeText },
        writable: true,
        configurable: true,
      })
      Object.defineProperty(window.navigator, 'maxTouchPoints', {
        value: 0,
        writable: true,
        configurable: true,
      })
      const { toast } = await import('sonner')

      render(<RequestDetailActions {...defaultProps} />)

      fireEvent.click(screen.getByRole('button', { name: /appeler/i }))

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Impossible de copier le numéro')
      })
    })

    it('calls updateRequestStatus on treat click', async () => {
      mockUpdateRequestStatus.mockResolvedValue({ success: true, data: { requestId: 'req-1' } })

      const user = userEvent.setup()
      render(<RequestDetailActions {...defaultProps} />)

      await user.click(screen.getByRole('button', { name: /marquer comme traitée/i }))

      expect(mockUpdateRequestStatus).toHaveBeenCalledWith({ requestId: 'req-1' })
    })

    it('shows success toast after successful treatment', async () => {
      mockUpdateRequestStatus.mockResolvedValue({ success: true, data: { requestId: 'req-1' } })
      const { toast } = await import('sonner')

      const user = userEvent.setup()
      render(<RequestDetailActions {...defaultProps} />)

      await user.click(screen.getByRole('button', { name: /marquer comme traitée/i }))

      expect(toast.success).toHaveBeenCalledWith('Demande marquée comme traitée')
    })

    it('shows error toast on failure', async () => {
      mockUpdateRequestStatus.mockResolvedValue({ success: false, error: 'Erreur test', code: 'SERVER_ERROR' })
      const { toast } = await import('sonner')

      const user = userEvent.setup()
      render(<RequestDetailActions {...defaultProps} />)

      await user.click(screen.getByRole('button', { name: /marquer comme traitée/i }))

      expect(toast.error).toHaveBeenCalledWith('Erreur test')
    })

    it('disables treat button while pending', async () => {
      let resolveAction: (value: { success: true; data: { requestId: string } }) => void
      mockUpdateRequestStatus.mockImplementation(
        () => new Promise((resolve) => { resolveAction = resolve })
      )

      const user = userEvent.setup()
      render(<RequestDetailActions {...defaultProps} />)

      await user.click(screen.getByRole('button', { name: /marquer comme traitée/i }))

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /marquer comme traitée/i })).toBeDisabled()
      })

      // Resolve to clean up
      resolveAction!({ success: true, data: { requestId: 'req-1' } })
    })

    it('shows error toast when server action throws', async () => {
      mockUpdateRequestStatus.mockRejectedValue(new Error('Network error'))
      const { toast } = await import('sonner')

      const user = userEvent.setup()
      render(<RequestDetailActions {...defaultProps} />)

      await user.click(screen.getByRole('button', { name: /marquer comme traitée/i }))

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Une erreur est survenue')
      })
    })

    it('calls router.refresh after successful treatment', async () => {
      mockUpdateRequestStatus.mockResolvedValue({ success: true, data: { requestId: 'req-1' } })

      const user = userEvent.setup()
      render(<RequestDetailActions {...defaultProps} />)

      await user.click(screen.getByRole('button', { name: /marquer comme traitée/i }))

      expect(mockRefresh).toHaveBeenCalled()
    })
  })

  describe('TREATED state', () => {
    const defaultProps = {
      requestId: 'req-1',
      status: 'TREATED' as const,
      phone: '0388123456',
      updatedAt: '2026-02-10T12:00:00Z',
    }

    it('renders treated indicator with date', () => {
      render(<RequestDetailActions {...defaultProps} />)
      expect(screen.getByText(/traitée le/i)).toBeInTheDocument()
      expect(screen.getByText(/10 février 2026/)).toBeInTheDocument()
    })

    it('renders "Appeler" button', () => {
      render(<RequestDetailActions {...defaultProps} />)
      expect(screen.getByRole('button', { name: /appeler/i })).toBeInTheDocument()
    })

    it('does not render "Marquer comme traitée" button', () => {
      render(<RequestDetailActions {...defaultProps} />)
      expect(screen.queryByRole('button', { name: /marquer comme traitée/i })).not.toBeInTheDocument()
    })
  })

  describe('phone null handling', () => {
    it('does not render "Appeler" button when phone is null', () => {
      render(
        <RequestDetailActions
          requestId="req-1"
          status="PENDING"
          phone={null}
          updatedAt="2026-02-10T12:00:00Z"
        />
      )
      expect(screen.queryByRole('button', { name: /appeler/i })).not.toBeInTheDocument()
    })
  })
})
