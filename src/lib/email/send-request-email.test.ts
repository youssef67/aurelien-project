import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock resend
const mockEmailsSend = vi.fn()
vi.mock('@/lib/email/resend', () => ({
  resend: {
    emails: {
      send: (...args: unknown[]) => mockEmailsSend(...args),
    },
  },
}))

// Mock template
vi.mock('@/lib/email/templates/request-notification', () => ({
  RequestNotificationEmail: vi.fn(() => 'mocked-react-element'),
}))

import { sendEmailForRequest } from './send-request-email'

function defaultParams() {
  return {
    supplierEmail: 'supplier@example.com',
    requestType: 'INFO' as const,
    storeName: 'Mon Magasin',
    storeBrand: 'Carrefour',
    storeCity: 'Paris',
    offerName: 'Promo Biscuits',
    requestId: '660e8400-e29b-41d4-a716-446655440000',
    message: 'Question sur les délais',
  }
}

describe('sendEmailForRequest', () => {
  const originalEnv = process.env

  beforeEach(() => {
    vi.clearAllMocks()
    process.env = { ...originalEnv, RESEND_API_KEY: 're_test_key' }
    mockEmailsSend.mockResolvedValue({ data: { id: 'email-123' }, error: null })
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe('INFO request', () => {
    it('sends email with correct subject for INFO type', async () => {
      await sendEmailForRequest(defaultParams())

      expect(mockEmailsSend).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: 'Nouvelle demande de renseignements - Promo Biscuits',
        })
      )
    })

    it('sends email to supplier email address', async () => {
      await sendEmailForRequest(defaultParams())

      expect(mockEmailsSend).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'supplier@example.com',
        })
      )
    })
  })

  describe('ORDER request', () => {
    it('sends email with correct subject for ORDER type', async () => {
      await sendEmailForRequest({ ...defaultParams(), requestType: 'ORDER' })

      expect(mockEmailsSend).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: 'Intention de commande - Promo Biscuits',
        })
      )
    })
  })

  describe('error resilience', () => {
    it('does not throw when resend returns error', async () => {
      mockEmailsSend.mockResolvedValue({ data: null, error: { message: 'Rate limited' } })
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await expect(sendEmailForRequest(defaultParams())).resolves.toBeUndefined()

      consoleSpy.mockRestore()
    })

    it('logs error when resend returns error', async () => {
      const resendError = { message: 'Rate limited' }
      mockEmailsSend.mockResolvedValue({ data: null, error: resendError })
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await sendEmailForRequest(defaultParams())

      expect(consoleSpy).toHaveBeenCalledWith('Resend email error:', resendError)
      consoleSpy.mockRestore()
    })

    it('does not throw when resend.emails.send throws', async () => {
      mockEmailsSend.mockRejectedValue(new Error('Network error'))
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await expect(sendEmailForRequest(defaultParams())).resolves.toBeUndefined()

      consoleSpy.mockRestore()
    })

    it('logs error when resend.emails.send throws', async () => {
      const thrownError = new Error('Network error')
      mockEmailsSend.mockRejectedValue(thrownError)
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await sendEmailForRequest(defaultParams())

      expect(consoleSpy).toHaveBeenCalledWith('sendEmailForRequest failed:', thrownError)
      consoleSpy.mockRestore()
    })
  })

  describe('missing RESEND_API_KEY', () => {
    it('does not send email when RESEND_API_KEY is not set', async () => {
      delete process.env.RESEND_API_KEY
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      await sendEmailForRequest(defaultParams())

      expect(mockEmailsSend).not.toHaveBeenCalled()
      consoleSpy.mockRestore()
    })

    it('logs warning when RESEND_API_KEY is not set', async () => {
      delete process.env.RESEND_API_KEY
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      await sendEmailForRequest(defaultParams())

      expect(consoleSpy).toHaveBeenCalledWith('RESEND_API_KEY not set, skipping email')
      consoleSpy.mockRestore()
    })
  })

  describe('email configuration', () => {
    it('uses default from address when EMAIL_FROM not set', async () => {
      await sendEmailForRequest(defaultParams())

      expect(mockEmailsSend).toHaveBeenCalledWith(
        expect.objectContaining({
          from: 'Aurelien <noreply@aurelien-project.fr>',
        })
      )
    })

    it('passes rendered template as react param', async () => {
      await sendEmailForRequest(defaultParams())

      expect(mockEmailsSend).toHaveBeenCalledWith(
        expect.objectContaining({
          react: 'mocked-react-element',
        })
      )
    })
  })
})
