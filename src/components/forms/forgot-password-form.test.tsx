import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ForgotPasswordForm } from './forgot-password-form'

// Mock auth actions
const mockRequestPasswordReset = vi.fn()
vi.mock('@/lib/actions/auth', () => ({
  requestPasswordReset: (...args: unknown[]) => mockRequestPasswordReset(...args),
}))

describe('ForgotPasswordForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('renders email input field', () => {
      render(<ForgotPasswordForm />)

      const emailInput = screen.getByPlaceholderText(/votre@email/i)
      expect(emailInput).toBeInTheDocument()
      expect(emailInput).toHaveAttribute('type', 'email')
      expect(emailInput).toHaveAttribute('autocomplete', 'email')
    })

    it('renders submit button', () => {
      render(<ForgotPasswordForm />)

      const submitButton = screen.getByRole('button', { name: /envoyer le lien/i })
      expect(submitButton).toBeInTheDocument()
      expect(submitButton).toHaveAttribute('type', 'submit')
    })

    it('does not show success message initially', () => {
      render(<ForgotPasswordForm />)

      expect(screen.queryByText(/lien de réinitialisation a été envoyé/i)).not.toBeInTheDocument()
    })
  })

  describe('validation', () => {
    it('does not call API for invalid email', async () => {
      render(<ForgotPasswordForm />)

      const emailInput = screen.getByPlaceholderText(/votre@email/i)
      const submitButton = screen.getByRole('button', { name: /envoyer le lien/i })

      fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
      fireEvent.click(submitButton)

      // Attendre un peu pour s'assurer que le formulaire a été soumis (ou pas)
      await waitFor(() => {
        expect(mockRequestPasswordReset).not.toHaveBeenCalled()
      })
    })

    it('does not submit for empty email', async () => {
      render(<ForgotPasswordForm />)

      const submitButton = screen.getByRole('button', { name: /envoyer le lien/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockRequestPasswordReset).not.toHaveBeenCalled()
      })
    })
  })

  describe('submission', () => {
    it('shows loading state during submission', async () => {
      mockRequestPasswordReset.mockImplementation(() => new Promise(() => {}))

      render(<ForgotPasswordForm />)

      const emailInput = screen.getByPlaceholderText(/votre@email/i)
      const submitButton = screen.getByRole('button', { name: /envoyer le lien/i })

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(submitButton).toBeDisabled()
      })
    })

    it('shows success message after submission', async () => {
      mockRequestPasswordReset.mockResolvedValueOnce({ success: true, data: undefined })

      render(<ForgotPasswordForm />)

      const emailInput = screen.getByPlaceholderText(/votre@email/i)
      const submitButton = screen.getByRole('button', { name: /envoyer le lien/i })

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/lien de réinitialisation a été envoyé/i)).toBeInTheDocument()
      })
    })

    it('hides form after successful submission', async () => {
      mockRequestPasswordReset.mockResolvedValueOnce({ success: true, data: undefined })

      render(<ForgotPasswordForm />)

      const emailInput = screen.getByPlaceholderText(/votre@email/i)
      const submitButton = screen.getByRole('button', { name: /envoyer le lien/i })

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        // Le formulaire ne devrait plus être visible
        expect(screen.queryByPlaceholderText(/votre@email/i)).not.toBeInTheDocument()
        expect(screen.queryByRole('button', { name: /envoyer le lien/i })).not.toBeInTheDocument()
      })
    })
  })
})
