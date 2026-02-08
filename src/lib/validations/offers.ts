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

// Étape 3: Détails (optionnel)
const SUBCATEGORY_MAX = 100
const VOLUME_MAX = 255
const TEXT_FIELD_MAX = 1000
const MARGIN_MIN = 0.01
const MARGIN_MAX = 99.99

export const createOfferStep3Schema = z.object({
  subcategory: z
    .string()
    .max(SUBCATEGORY_MAX, `La sous-catégorie ne peut pas dépasser ${SUBCATEGORY_MAX} caractères`)
    .optional()
    .or(z.literal('')),
  margin: z
    .number()
    .min(MARGIN_MIN, `La marge doit être d'au moins ${MARGIN_MIN}%`)
    .max(MARGIN_MAX, `La marge ne peut pas dépasser ${MARGIN_MAX}%`)
    .multipleOf(0.01, 'La marge doit avoir maximum 2 décimales')
    .optional()
    .nullable(),
  volume: z
    .string()
    .max(VOLUME_MAX, `Le volume ne peut pas dépasser ${VOLUME_MAX} caractères`)
    .optional()
    .or(z.literal('')),
  conditions: z
    .string()
    .max(TEXT_FIELD_MAX, `Les conditions ne peuvent pas dépasser ${TEXT_FIELD_MAX} caractères`)
    .optional()
    .or(z.literal('')),
  animation: z
    .string()
    .max(TEXT_FIELD_MAX, `L'animation ne peut pas dépasser ${TEXT_FIELD_MAX} caractères`)
    .optional()
    .or(z.literal('')),
  photoUrl: z.string().url().optional().nullable().or(z.literal('')),
})

// Schéma complet pour la Server Action (merge + refinement)
export const createOfferSchema = createOfferStep1Schema
  .merge(createOfferStep2Schema)
  .merge(createOfferStep3Schema)
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
export type CreateOfferStep3Input = z.infer<typeof createOfferStep3Schema>
export type CreateOfferInput = z.infer<typeof createOfferSchema>

// Schéma pour la mise à jour d'offre (pas de refinement startDate >= today)
export const updateOfferSchema = createOfferStep1Schema
  .merge(createOfferStep2Schema)
  .merge(createOfferStep3Schema)
  .extend({
    id: z.string().uuid('ID offre invalide'),
  })
  .refine(
    (data) => new Date(data.endDate) >= new Date(data.startDate),
    { message: 'La date de fin doit être après la date de début', path: ['endDate'] }
  )

export type UpdateOfferInput = z.infer<typeof updateOfferSchema>

// Schéma pour la suppression d'offre
export const deleteOfferSchema = z.object({
  id: z.string().uuid('ID offre invalide'),
})

export type DeleteOfferInput = z.infer<typeof deleteOfferSchema>
