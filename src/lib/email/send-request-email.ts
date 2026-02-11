import { resend } from './resend'
import { RequestNotificationEmail } from './templates/request-notification'

const EMAIL_FROM = process.env.EMAIL_FROM || 'Aurelien <noreply@aurelien-project.fr>'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export async function sendEmailForRequest({
  supplierEmail,
  requestType,
  storeName,
  storeBrand,
  storeCity,
  offerName,
  requestId,
  message,
}: {
  supplierEmail: string
  requestType: 'INFO' | 'ORDER'
  storeName: string
  storeBrand: string
  storeCity: string
  offerName: string
  requestId: string
  message: string | null
}): Promise<void> {
  try {
    // Pas de clé API = pas d'envoi (dev local sans Resend)
    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY not set, skipping email')
      return
    }

    const subject = requestType === 'ORDER'
      ? `Intention de commande - ${offerName}`
      : `Nouvelle demande de renseignements - ${offerName}`

    const ctaUrl = `${APP_URL}/requests/${requestId}`

    const { error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: supplierEmail,
      subject,
      react: RequestNotificationEmail({
        requestType,
        storeName,
        storeBrand,
        storeCity,
        offerName,
        message,
        ctaUrl,
      }),
    })

    if (error) {
      console.error('Resend email error:', error)
    }
  } catch (error) {
    console.error('sendEmailForRequest failed:', error)
    // NEVER throw — fire-and-forget
  }
}
