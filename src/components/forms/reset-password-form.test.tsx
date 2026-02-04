import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ResetPasswordForm } from './reset-password-form'

// Mock next/navigation
const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

// Mock auth actions
const mockUpdatePassword = vi.fn()
vi.mock('@/lib/actions/auth', () => ({
  updatePassword: (...args: unknown[]) => mockUpdatePassword(...args),
}))

import { toast } from 'sonner'

describe('ResetPasswordForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('renders password input field', () => {
      render(<ResetPasswordForm />)

      const passwordInput = screen.getByPlaceholderText(/minimum 8 caractères/i)
      expect(passwordInput).toBeInTheDocument()
      expect(passwordInput).toHaveAttribute('type', 'password')
      expect(passwordInput).toHaveAttribute('autocomplete', 'new-password')
    })

    it('renders confirm password input field', () => {
      render(<ResetPasswordForm />)

      const confirmInput = screen.getByPlaceholderText(/répétez le mot de passe/i)
      expect(confirmInput).toBeInTheDocument()
      expect(confirmInput).toHaveAttribute('type', 'password')
    })

    it('renders submit button', () => {
      render(<ResetPasswordForm />)

      const submitButton = screen.getByRole('button', { name: /modifier le mot de passe/i })
      expect(submitButton).toBeInTheDocument()
      expect(submitButton).toHaveAttribute('type', 'submit')
    })

    it('renders password toggle buttons', () => {
      render(<ResetPasswordForm />)

      const toggleButtons = screen.getAllByRole('button', { name: /afficher le mot de passe/i })
      expect(toggleButtons).toHaveLength(2)
    })
  })

  describe('validation', () => {
    it('shows error for short password', async () => {
      render(<ResetPasswordForm />)

      const passwordInput = screen.getByPlaceholderText(/minimum 8 caractères/i)
      const confirmInput = screen.getByPlaceholderText(/répétez le mot de passe/i)
      const submitButton = screen.getByRole('button', { name: /modifier le mot de passe/i })

      fireEvent.change(passwordInput, { target: { value: 'short' } })
      fireEvent.change(confirmInput, { target: { value: 'short' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/8 caractères/i)).toBeInTheDocument()
      })
    })

    it('shows error when passwords do not match', async () => {
      render(<ResetPasswordForm />)

      const passwordInput = screen.getByPlaceholderText(/minimum 8 caractères/i)
      const confirmInput = screen.getByPlaceholderText(/répétez le mot de passe/i)
      const submitButton = screen.getByRole('button', { name: /modifier le mot de passe/i })

      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.change(confirmInput, { target: { value: 'different123' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/ne correspondent pas/i)).toBeInTheDocument()
      })
    })
  })

  describe('password visibility toggle', () => {
    it('toggles password visibility', () => {
      render(<ResetPasswordForm />)

      const passwordInput = screen.getByPlaceholderText(/minimum 8 caractères/i)
      const toggleButtons = screen.getAllByRole('button', { name: /afficher le mot de passe/i })

      expect(passwordInput).toHaveAttribute('type', 'password')

      fireEvent.click(toggleButtons[0])

      expect(passwordInput).toHaveAttribute('type', 'text')
    })

    it('toggles confirm password visibility independently', () => {
      render(<ResetPasswordForm />)

      const confirmInput = screen.getByPlaceholderText(/répétez le mot de passe/i)
      const toggleButtons = screen.getAllByRole('button', { name: /afficher le mot de passe/i })

      expect(confirmInput).toHaveAttribute('type', 'password')

      fireEvent.click(toggleButtons[1])

      expect(confirmInput).toHaveAttribute('type', 'text')
    })
  })

  describe('submission', () => {
    it('shows loading state during submission', async () => {
      mockUpdatePassword.mockImplementation(() => new Promise(() => {}))

      render(<ResetPasswordForm />)

      const passwordInput = screen.getByPlaceholderText(/minimum 8 caractères/i)
      const confirmInput = screen.getByPlaceholderText(/répétez le mot de passe/i)
      const submitButton = screen.getByRole('button', { name: /modifier le mot de passe/i })

      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.change(confirmInput, { target: { value: 'password123' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(submitButton).toBeDisabled()
      })
    })

    it('redirects to login on success', async () => {
      mockUpdatePassword.mockResolvedValueOnce({ success: true, data: undefined })

      render(<ResetPasswordForm />)

      const passwordInput = screen.getByPlaceholderText(/minimum 8 caractères/i)
      const confirmInput = screen.getByPlaceholderText(/répétez le mot de passe/i)
      const submitButton = screen.getByRole('button', { name: /modifier le mot de passe/i })

      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.change(confirmInput, { target: { value: 'password123' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Mot de passe modifié avec succès')
        expect(mockPush).toHaveBeenCalledWith('/login')
      })
    })

    it('shows error toast on failure', async () => {
      mockUpdatePassword.mockResolvedValueOnce({
        success: false,
        error: 'Lien expiré',
        code: 'UNAUTHORIZED',
      })

      render(<ResetPasswordForm />)

      const passwordInput = screen.getByPlaceholderText(/minimum 8 caractères/i)
      const confirmInput = screen.getByPlaceholderText(/répétez le mot de passe/i)
      const submitButton = screen.getByRole('button', { name: /modifier le mot de passe/i })

      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.change(confirmInput, { target: { value: 'password123' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Lien expiré')
        expect(mockPush).not.toHaveBeenCalled()
      })
    })

    it('shows error toast on unexpected exception', async () => {
      mockUpdatePassword.mockRejectedValueOnce(new Error('Network error'))

      render(<ResetPasswordForm />)

      const passwordInput = screen.getByPlaceholderText(/minimum 8 caractères/i)
      const confirmInput = screen.getByPlaceholderText(/répétez le mot de passe/i)
      const submitButton = screen.getByRole('button', { name: /modifier le mot de passe/i })

      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.change(confirmInput, { target: { value: 'password123' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Une erreur inattendue s\'est produite')
      })
    })
  })
})
