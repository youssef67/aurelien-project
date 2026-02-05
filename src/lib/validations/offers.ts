import { z } from 'zod'

const OFFER_NAME_MIN = 3
const OFFER_NAME_MAX = 255
const DISCOUNT_MIN = 1
const DISCOUNT_MAX = 99

// Catégories disponibles (mapper sur l'enum Prisma OfferCategory)
export const OFFER_CATEGORIES = [
  'EPICERIE',
  'FRAIS',
  'DPH',
  'SURGELES',
  'BOISSONS',
  'AUTRES',
] as const

export const OFFER_CATEGORY_LABELS: Record<string, string> = {
  EPICERIE: 'Épicerie',
  FRAIS: 'Frais',
  DPH: 'DPH',
  SURGELES: 'Surgelés',
  BOISSONS: 'Boissons',
  AUTRES: 'Autres',
}

// Étape 1: Produit & Prix
export const createOfferStep1Schema = z.object({
  name: z
    .string()
    .min(OFFER_NAME_MIN, `Le nom doit contenir au moins ${OFFER_NAME_MIN} caractères`)
    .max(OFFER_NAME_MAX, `Le nom ne peut pas dépasser ${OFFER_NAME_MAX} caractères`),
  promoPrice: z
    .number({ error: 'Le prix doit être un nombre' })
    .positive('Le prix doit être supérieur à 0')
    .multipleOf(0.01, 'Le prix doit avoir maximum 2 décimales'),
  discountPercent: z
    .number({ error: 'La remise doit être un nombre' })
    .int('La remise doit être un nombre entier')
    .min(DISCOUNT_MIN, `La remise doit être d'au moins ${DISCOUNT_MIN}%`)
    .max(DISCOUNT_MAX, `La remise ne peut pas dépasser ${DISCOUNT_MAX}%`),
})

// Étape 2: Dates & Catégorie
export const createOfferStep2Schema = z.object({
  startDate: z.string().min(1, 'La date de début est requise'),
  endDate: z.string().min(1, 'La date de fin est requise'),
  category: z.enum(OFFER_CATEGORIES, {
    error: 'Veuillez sélectionner une catégorie',
  }),
})

// Schéma complet pour la Server Action (merge + refinement)
export const createOfferSchema = createOfferStep1Schema
  .merge(createOfferStep2Schema)
  .refine(
    (data) => {
      const start = new Date(data.startDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return start >= today
    },
    { message: "La date de début doit être aujourd'hui ou dans le futur", path: ['startDate'] }
  )
  .refine(
    (data) => new Date(data.endDate) >= new Date(data.startDate),
    { message: 'La date de fin doit être après la date de début', path: ['endDate'] }
  )

export type CreateOfferStep1Input = z.infer<typeof createOfferStep1Schema>
export type CreateOfferStep2Input = z.infer<typeof createOfferStep2Schema>
export type CreateOfferInput = z.infer<typeof createOfferSchema>
