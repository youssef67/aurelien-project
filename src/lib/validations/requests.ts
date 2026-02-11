import { z } from 'zod'

export const REQUEST_TYPES = ['INFO', 'ORDER'] as const
export const REQUEST_STATUSES = ['PENDING', 'TREATED'] as const

export const createRequestSchema = z.object({
  offerId: z.string().uuid('ID offre invalide'),
  type: z.enum(REQUEST_TYPES),
  message: z
    .string()
    .max(1000, 'Le message ne peut pas dépasser 1000 caractères')
    .optional()
    .or(z.literal('')),
})

export type CreateRequestInput = z.infer<typeof createRequestSchema>

export const updateRequestStatusSchema = z.object({
  requestId: z.string().uuid('ID demande invalide'),
})
