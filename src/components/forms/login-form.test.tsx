import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { LoginForm } from './login-form'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
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
vi.mock('@/lib/actions/auth', () => ({
  login: vi.fn(),
  resendConfirmationEmail: vi.fn(),
}))

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('renders email input field', () => {
      render(<LoginForm />)

      const emailInput = screen.getByPlaceholderText(/votre@email/i)
      expect(emailInput).toBeInTheDocument()
      expect(emailInput).toHaveAttribute('type', 'email')
      expect(emailInput).toHaveAttribute('autocomplete', 'email')
    })

    it('renders password input field', () => {
      render(<LoginForm />)

      const passwordInput = screen.getByPlaceholderText(/••••••••/i)
      expect(passwordInput).toBeInTheDocument()
      expect(passwordInput).toHaveAttribute('type', 'password')
      expect(passwordInput).toHaveAttribute('autocomplete', 'current-password')
    })

    it('renders submit button', () => {
      render(<LoginForm />)

      const submitButton = screen.getByRole('button', { name: /se connecter/i })
      expect(submitButton).toBeInTheDocument()
      expect(submitButton).toHaveAttribute('type', 'submit')
    })

    it('renders password toggle button with accessibility attributes', () => {
      render(<LoginForm />)

      const toggleButton = screen.getByRole('button', { name: /afficher le mot de passe/i })
      expect(toggleButton).toBeInTheDocument()
      expect(toggleButton).toHaveAttribute('type', 'button')
      expect(toggleButton).toHaveAttribute('aria-pressed', 'false')
    })

    it('does not show email confirmation message initially', () => {
      render(<LoginForm />)

      expect(screen.queryByText(/pas encore confirmé/i)).not.toBeInTheDocument()
    })
  })

  describe('password visibility toggle', () => {
    it('shows password when toggle is clicked', () => {
      render(<LoginForm />)

      const passwordInput = screen.getByPlaceholderText(/••••••••/i)
      const toggleButton = screen.getByRole('button', { name: /afficher le mot de passe/i })

      expect(passwordInput).toHaveAttribute('type', 'password')
      expect(toggleButton).toHaveAttribute('aria-pressed', 'false')

      fireEvent.click(toggleButton)

      expect(passwordInput).toHaveAttribute('type', 'text')
      expect(toggleButton).toHaveAttribute('aria-pressed', 'true')
    })

    it('hides password when toggle is clicked again', () => {
      render(<LoginForm />)

      const passwordInput = screen.getByPlaceholderText(/••••••••/i)
      const toggleButton = screen.getByRole('button', { name: /afficher le mot de passe/i })

      // Show password
      fireEvent.click(toggleButton)
      expect(passwordInput).toHaveAttribute('type', 'text')

      // Hide password
      fireEvent.click(toggleButton)
      expect(passwordInput).toHaveAttribute('type', 'password')
      expect(toggleButton).toHaveAttribute('aria-pressed', 'false')
    })

    it('updates aria-label when toggled', () => {
      render(<LoginForm />)

      const toggleButton = screen.getByRole('button', { name: /afficher le mot de passe/i })

      expect(toggleButton).toHaveAttribute('aria-label', 'Afficher le mot de passe')

      fireEvent.click(toggleButton)
      expect(toggleButton).toHaveAttribute('aria-label', 'Masquer le mot de passe')

      fireEvent.click(toggleButton)
      expect(toggleButton).toHaveAttribute('aria-label', 'Afficher le mot de passe')
    })
  })
})
