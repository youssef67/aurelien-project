import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { LogoutButton } from './logout-button'

// Mock next/navigation
const mockPush = vi.fn()
const mockRefresh = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
}))

// Mock logout action
vi.mock('@/lib/actions/auth', () => ({
  logout: vi.fn(),
}))

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

import { logout } from '@/lib/actions/auth'
import { toast } from 'sonner'

describe('LogoutButton', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders logout button with correct text', () => {
    render(<LogoutButton />)
    expect(screen.getByRole('button', { name: /se déconnecter/i })).toBeInTheDocument()
  })

  it('renders with LogOut icon', () => {
    render(<LogoutButton />)
    const button = screen.getByRole('button')
    const svg = button.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  it('shows loading state when clicked', async () => {
    vi.mocked(logout).mockImplementation(() => new Promise(() => {})) // Never resolves

    render(<LogoutButton />)

    const button = screen.getByRole('button')
    fireEvent.click(button)

    await waitFor(() => {
      expect(button).toBeDisabled()
    })
  })

  it('redirects to login on success', async () => {
    vi.mocked(logout).mockResolvedValue({ success: true, data: undefined })

    render(<LogoutButton />)

    fireEvent.click(screen.getByRole('button'))

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Vous avez été déconnecté')
      expect(mockPush).toHaveBeenCalledWith('/login')
      expect(mockRefresh).toHaveBeenCalled()
    })
  })

  it('shows error toast on failure', async () => {
    vi.mocked(logout).mockResolvedValue({
      success: false,
      error: 'Erreur de déconnexion',
      code: 'SERVER_ERROR'
    })

    render(<LogoutButton />)

    fireEvent.click(screen.getByRole('button'))

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Erreur de déconnexion')
      expect(mockPush).not.toHaveBeenCalled()
    })
  })

  it('handles unexpected exceptions without redirecting', async () => {
    vi.mocked(logout).mockRejectedValue(new Error('Network error'))

    render(<LogoutButton />)

    fireEvent.click(screen.getByRole('button'))

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Une erreur inattendue s\'est produite')
      expect(mockPush).not.toHaveBeenCalled()
    })
  })

  it('re-enables button after error', async () => {
    vi.mocked(logout).mockResolvedValue({
      success: false,
      error: 'Erreur',
      code: 'SERVER_ERROR'
    })

    render(<LogoutButton />)

    const button = screen.getByRole('button')
    fireEvent.click(button)

    await waitFor(() => {
      expect(button).not.toBeDisabled()
    })
  })

  it('accepts custom className', () => {
    render(<LogoutButton className="custom-class" />)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('custom-class')
  })

  it('sets aria-busy during loading state', async () => {
    vi.mocked(logout).mockImplementation(() => new Promise(() => {})) // Never resolves

    render(<LogoutButton />)

    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-busy', 'false')

    fireEvent.click(button)

    await waitFor(() => {
      expect(button).toHaveAttribute('aria-busy', 'true')
    })
  })
})
