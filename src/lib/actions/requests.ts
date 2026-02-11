'use server'

import { revalidatePath } from 'next/cache'
import { createRequestSchema, updateRequestStatusSchema, type CreateRequestInput } from '@/lib/validations/requests'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma/client'
import { Prisma } from '@prisma/client'
import type { ActionResult } from '@/types/api'
import { createNotificationForRequest, createNotificationForTreatedRequest } from './notifications'

export async function createRequest(
  input: CreateRequestInput
): Promise<ActionResult<{ requestId: string }>> {
  // 1. Validation Zod serveur
  const validated = createRequestSchema.safeParse(input)
  if (!validated.success) {
    const issues = JSON.parse(validated.error.message)
    return {
      success: false,
      error: issues[0]?.message || 'Données invalides',
      code: 'VALIDATION_ERROR',
    }
  }

  try {
    // 2. Auth check
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Non authentifié', code: 'UNAUTHORIZED' }
    }

    // 3. Vérifier rôle magasin
    const store = await prisma.store.findUnique({
      where: { id: user.id },
    })

    if (!store) {
      return { success: false, error: 'Accès magasin requis', code: 'FORBIDDEN' }
    }

    // 4. Vérifier que l'offre existe, est active et non supprimée
    const today = new Date()
    today.setUTCHours(0, 0, 0, 0)

    const offer = await prisma.offer.findFirst({
      where: { id: validated.data.offerId, deletedAt: null },
      select: { id: true, supplierId: true, status: true, endDate: true, name: true },
    })

    if (!offer) {
      return { success: false, error: 'Offre introuvable', code: 'NOT_FOUND' }
    }

    if (offer.status !== 'ACTIVE' || new Date(offer.endDate) < today) {
      return { success: false, error: "Cette offre n'est plus disponible", code: 'VALIDATION_ERROR' }
    }

    // 5. Vérifier absence de doublon (même type sur même offre)
    const existing = await prisma.request.findFirst({
      where: { storeId: user.id, offerId: validated.data.offerId, type: validated.data.type },
    })

    if (existing) {
      return { success: false, error: 'Vous avez déjà envoyé une demande de ce type', code: 'VALIDATION_ERROR' }
    }

    // 6. Créer la demande — supplierId depuis l'offre (dénormalisé)
    const request = await prisma.request.create({
      data: {
        storeId: user.id,
        offerId: validated.data.offerId,
        supplierId: offer.supplierId,
        type: validated.data.type,
        message: validated.data.message || null,
        status: 'PENDING',
      },
    })

    // 7. Créer notification + email (fire-and-forget, ne PAS bloquer le retour)
    createNotificationForRequest({
      supplierId: offer.supplierId,
      requestType: validated.data.type,
      storeName: store.name,
      storeBrand: store.brand,
      storeCity: store.city,
      offerName: offer.name,
      requestId: request.id,
      message: validated.data.message || null,
    }).catch((error) => {
      console.error('Failed to create notification:', error)
    })

    // 8. Revalidate la page détail
    revalidatePath(`/offers/${validated.data.offerId}`)

    // 9. Retourner le résultat
    return { success: true, data: { requestId: request.id } }
  } catch (error) {
    // Race condition: unique constraint violation = duplicate request
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return { success: false, error: 'Vous avez déjà envoyé une demande de ce type', code: 'VALIDATION_ERROR' }
    }
    console.error('createRequest error:', error)
    return { success: false, error: "Erreur lors de l'envoi de la demande", code: 'SERVER_ERROR' }
  }
}

export async function updateRequestStatus(
  input: { requestId: string }
): Promise<ActionResult<{ requestId: string }>> {
  const validated = updateRequestStatusSchema.safeParse(input)
  if (!validated.success) {
    return { success: false, error: 'Données invalides', code: 'VALIDATION_ERROR' }
  }

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Non authentifié', code: 'UNAUTHORIZED' }
    }

    const request = await prisma.request.findFirst({
      where: { id: validated.data.requestId, supplierId: user.id },
      include: { offer: { select: { name: true } } },
    })

    if (!request) {
      return { success: false, error: 'Demande introuvable', code: 'NOT_FOUND' }
    }

    if (request.status === 'TREATED') {
      return { success: false, error: 'Cette demande a déjà été traitée', code: 'VALIDATION_ERROR' }
    }

    await prisma.request.update({
      where: { id: request.id },
      data: { status: 'TREATED' },
    })

    // Notification pour le magasin (fire-and-forget)
    const supplier = await prisma.supplier.findUnique({
      where: { id: user.id },
      select: { companyName: true },
    })

    if (supplier) {
      createNotificationForTreatedRequest({
        storeId: request.storeId,
        supplierName: supplier.companyName,
        offerName: request.offer.name,
        requestId: request.id,
      }).catch((error) => {
        console.error('Failed to create treated request notification:', error)
      })
    }

    revalidatePath('/requests')
    revalidatePath(`/requests/${request.id}`)
    revalidatePath('/my-requests')

    return { success: true, data: { requestId: request.id } }
  } catch (error) {
    console.error('updateRequestStatus error:', error)
    return { success: false, error: 'Erreur lors du traitement de la demande', code: 'SERVER_ERROR' }
  }
}
