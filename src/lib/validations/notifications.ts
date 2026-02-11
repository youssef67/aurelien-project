import { z } from 'zod'

export const createNotificationSchema = z.object({
  userId: z.string().uuid(),
  userType: z.enum(['SUPPLIER', 'STORE']),
  type: z.enum(['NEW_REQUEST', 'REQUEST_TREATED']),
  title: z.string().min(1),
  body: z.string().min(1),
  relatedId: z.string().uuid().optional(),
})

export type CreateNotificationInput = z.infer<typeof createNotificationSchema>
