import { Resend } from 'resend'

// Singleton — ne pas recréer à chaque appel
export const resend = new Resend(process.env.RESEND_API_KEY)
