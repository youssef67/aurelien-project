import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma/client'
import { createClient } from '@/lib/supabase/server'
import { createNotificationSchema, type CreateNotificationInput } from '@/lib/validations/notifications'
import { sendEmailForRequest } from '@/lib/email/send-request-email'
import { getNotifications } from '@/lib/queries/notifications'
import type { SerializedNotification } from '@/lib/utils/notifications'
import type { ActionResult } from '@/types/api'
import { z } from 'zod'

/**
 * Crée une notification en base (usage interne serveur uniquement).
 * Ne retourne pas d'ActionResult car c'est une opération secondaire fire-and-forget.
 */
async function createNotification(input: CreateNotificationInput): Promise<void> {
  const validated = createNotificationSchema.safeParse(input)
  if (!validated.success) {
    throw new Error(`Notification validation failed: ${validated.error.message}`)
  }

  await prisma.notification.create({
    data: {
      userId: validated.data.userId,
      userType: validated.data.userType,
      type: validated.data.type,
      title: validated.data.title,
      body: validated.data.body,
      relatedId: validated.data.relatedId,
    },
  })
}

/**
 * Crée une notification pour le fournisseur quand un magasin envoie une demande.
 * Appelée depuis createRequest() — fire-and-forget.
 */
export async function createNotificationForRequest({
  supplierId,
  requestType,
  storeName,
  storeBrand,
  storeCity,
  offerName,
  requestId,
  message,
}: {
  supplierId: string
  requestType: 'INFO' | 'ORDER'
  storeName: string
  storeBrand: string
  storeCity: string
  offerName: string
  requestId: string
  message: string | null
}): Promise<void> {
  // 1. Notification in-app
  const title = requestType === 'ORDER' ? 'Intention de commande' : 'Nouvelle demande'
  const body = `${storeName} - ${offerName}`

  await createNotification({
    userId: supplierId,
    userType: 'SUPPLIER',
    type: 'NEW_REQUEST',
    title,
    body,
    relatedId: requestId,
  })

  // 2. Fetch supplier email for email notification
  const supplier = await prisma.supplier.findUnique({
    where: { id: supplierId },
    select: { email: true },
  })

  if (!supplier) {
    console.error(`createNotificationForRequest: supplier ${supplierId} not found for email`)
    return
  }

  // 3. Email notification (fire-and-forget)
  sendEmailForRequest({
    supplierEmail: supplier.email,
    requestType,
    storeName,
    storeBrand,
    storeCity,
    offerName,
    requestId,
    message,
  }).catch((error) => {
    console.error('Failed to send email notification:', error)
  })
}

/**
 * Crée une notification pour le magasin quand un fournisseur traite une demande.
 * Appelée depuis updateRequestStatus() — fire-and-forget.
 */
export async function createNotificationForTreatedRequest({
  storeId,
  supplierName,
  offerName,
  requestId,
}: {
  storeId: string
  supplierName: string
  offerName: string
  requestId: string
}): Promise<void> {
  await createNotification({
    userId: storeId,
    userType: 'STORE',
    type: 'REQUEST_TREATED',
    title: 'Demande traitée',
    body: `${supplierName} - ${offerName}`,
    relatedId: requestId,
  })
}

const notificationIdSchema = z.string().uuid()

export async function markNotificationAsRead(
  notificationId: string
): Promise<ActionResult<{ id: string }>> {
  'use server'

  const validated = notificationIdSchema.safeParse(notificationId)
  if (!validated.success) {
    return { success: false, error: 'ID de notification invalide', code: 'VALIDATION_ERROR' }
  }

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Non authentifié', code: 'UNAUTHORIZED' }
    }

    const notification = await prisma.notification.findFirst({
      where: { id: validated.data, userId: user.id },
    })

    if (!notification) {
      return { success: false, error: 'Notification introuvable', code: 'NOT_FOUND' }
    }

    await prisma.notification.update({
      where: { id: validated.data },
      data: { read: true },
    })

    revalidatePath('/notifications')

    return { success: true, data: { id: validated.data } }
  } catch (error) {
    console.error('markNotificationAsRead error:', error)
    return { success: false, error: 'Erreur lors du marquage de la notification', code: 'SERVER_ERROR' }
  }
}

export async function loadMoreNotifications(
  userType: 'SUPPLIER' | 'STORE',
  offset: number
): Promise<ActionResult<{ notifications: SerializedNotification[]; hasMore: boolean }>> {
  'use server'

  if (!['SUPPLIER', 'STORE'].includes(userType)) {
    return { success: false, error: 'Type utilisateur invalide', code: 'VALIDATION_ERROR' }
  }

  if (typeof offset !== 'number' || offset < 0 || !Number.isInteger(offset)) {
    return { success: false, error: 'Paramètre offset invalide', code: 'VALIDATION_ERROR' }
  }

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Non authentifié', code: 'UNAUTHORIZED' }
    }

    const PAGE_SIZE = 50
    const notifications = await getNotifications(user.id, userType, offset, PAGE_SIZE)

    return {
      success: true,
      data: {
        notifications,
        hasMore: notifications.length >= PAGE_SIZE,
      },
    }
  } catch (error) {
    console.error('loadMoreNotifications error:', error)
    return { success: false, error: 'Erreur lors du chargement', code: 'SERVER_ERROR' }
  }
}

export async function markAllNotificationsAsRead(): Promise<ActionResult<{ count: number }>> {
  'use server'

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Non authentifié', code: 'UNAUTHORIZED' }
    }

    const result = await prisma.notification.updateMany({
      where: { userId: user.id, read: false },
      data: { read: true },
    })

    revalidatePath('/notifications')

    return { success: true, data: { count: result.count } }
  } catch (error) {
    console.error('markAllNotificationsAsRead error:', error)
    return { success: false, error: 'Erreur lors du marquage des notifications', code: 'SERVER_ERROR' }
  }
}
