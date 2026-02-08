'use server'

import { revalidatePath } from 'next/cache'
import { createOfferSchema, type CreateOfferInput, updateOfferSchema, type UpdateOfferInput, deleteOfferSchema, type DeleteOfferInput } from '@/lib/validations/offers'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma/client'
import type { ActionResult } from '@/types/api'
import type { SupabaseClient } from '@supabase/supabase-js'

async function deleteOfferPhoto(supabase: SupabaseClient, photoUrl: string): Promise<void> {
  try {
    const url = new URL(photoUrl)
    const pathParts = url.pathname.split('/storage/v1/object/public/offer-photos/')
    const filePath = pathParts[1]
    if (filePath) {
      await supabase.storage.from('offer-photos').remove([filePath])
    }
  } catch {
    console.error('Failed to delete offer photo:', photoUrl)
  }
}

export async function createOffer(
  input: CreateOfferInput
): Promise<ActionResult<{ offerId: string }>> {
  // 1. Server-side validation (OBLIGATOIRE même si validé côté client)
  const validated = createOfferSchema.safeParse(input)
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

    // 3. Vérifier rôle fournisseur
    const supplier = await prisma.supplier.findUnique({
      where: { id: user.id },
    })

    if (!supplier) {
      return { success: false, error: 'Accès fournisseur requis', code: 'FORBIDDEN' }
    }

    // 4. Créer l'offre — supplierId TOUJOURS depuis auth, JAMAIS depuis input
    const {
      name, promoPrice, discountPercent, startDate, endDate, category,
      subcategory, margin, volume, conditions, animation, photoUrl,
    } = validated.data

    const offer = await prisma.offer.create({
      data: {
        supplierId: user.id,
        name,
        promoPrice,
        discountPercent,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        category,
        status: 'ACTIVE',
        subcategory: subcategory || undefined,
        margin: margin ?? undefined,
        volume: volume || undefined,
        conditions: conditions || undefined,
        animation: animation || undefined,
        photoUrl: photoUrl || undefined,
      },
    })

    revalidatePath('/dashboard')
    revalidatePath('/offers')

    return { success: true, data: { offerId: offer.id } }
  } catch (error) {
    console.error('createOffer error:', error)
    return { success: false, error: "Erreur lors de la création de l'offre", code: 'SERVER_ERROR' }
  }
}

export async function updateOffer(
  input: UpdateOfferInput
): Promise<ActionResult<{ offerId: string }>> {
  // 1. Server-side validation
  const validated = updateOfferSchema.safeParse(input)
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

    // 3. Vérifier rôle fournisseur
    const supplier = await prisma.supplier.findUnique({
      where: { id: user.id },
    })

    if (!supplier) {
      return { success: false, error: 'Accès fournisseur requis', code: 'FORBIDDEN' }
    }

    // 4. Fetch offre existante et vérifier propriété
    const existingOffer = await prisma.offer.findUnique({
      where: { id: validated.data.id },
    })

    if (!existingOffer || existingOffer.deletedAt) {
      return { success: false, error: 'Offre introuvable', code: 'NOT_FOUND' }
    }

    if (existingOffer.supplierId !== user.id) {
      return { success: false, error: 'Accès interdit', code: 'FORBIDDEN' }
    }

    // 5. AC7: Si l'offre n'a pas encore commencé, startDate doit être >= aujourd'hui
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const existingStart = new Date(existingOffer.startDate)
    existingStart.setHours(0, 0, 0, 0)

    if (existingStart >= today) {
      const newStart = new Date(validated.data.startDate)
      newStart.setHours(0, 0, 0, 0)
      if (newStart < today) {
        return {
          success: false,
          error: "La date de début doit être aujourd'hui ou dans le futur",
          code: 'VALIDATION_ERROR',
        }
      }
    }

    // 6. Mettre à jour l'offre
    const {
      id, name, promoPrice, discountPercent, startDate, endDate, category,
      subcategory, margin, volume, conditions, animation, photoUrl,
    } = validated.data

    await prisma.offer.update({
      where: { id },
      data: {
        name,
        promoPrice,
        discountPercent,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        category,
        subcategory: subcategory || null,
        margin: margin ?? null,
        volume: volume || null,
        conditions: conditions || null,
        animation: animation || null,
        photoUrl: photoUrl || null,
      },
    })

    // 7. Supprimer l'ancienne photo du Storage si elle a changé
    if (existingOffer.photoUrl && existingOffer.photoUrl !== (photoUrl || null)) {
      await deleteOfferPhoto(supabase, existingOffer.photoUrl)
    }

    revalidatePath('/dashboard')
    revalidatePath('/offers')
    revalidatePath(`/offers/${id}`)

    return { success: true, data: { offerId: id } }
  } catch (error) {
    console.error('updateOffer error:', error)
    return { success: false, error: "Erreur lors de la modification de l'offre", code: 'SERVER_ERROR' }
  }
}

export async function deleteOffer(
  input: DeleteOfferInput
): Promise<ActionResult<{ offerId: string }>> {
  // 1. Server-side validation
  const validated = deleteOfferSchema.safeParse(input)
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

    // 3. Vérifier rôle fournisseur
    const supplier = await prisma.supplier.findUnique({
      where: { id: user.id },
    })

    if (!supplier) {
      return { success: false, error: 'Accès fournisseur requis', code: 'FORBIDDEN' }
    }

    // 4. Fetch offre existante et vérifier propriété + non-supprimée
    const existingOffer = await prisma.offer.findUnique({
      where: { id: validated.data.id },
    })

    if (!existingOffer || existingOffer.deletedAt) {
      return { success: false, error: 'Offre introuvable', code: 'NOT_FOUND' }
    }

    if (existingOffer.supplierId !== user.id) {
      return { success: false, error: 'Accès interdit', code: 'FORBIDDEN' }
    }

    // 5. Supprimer la photo du Storage si elle existe (best-effort)
    if (existingOffer.photoUrl) {
      await deleteOfferPhoto(supabase, existingOffer.photoUrl)
    }

    // 6. SOFT DELETE — ne pas utiliser prisma.offer.delete()
    await prisma.offer.update({
      where: { id: validated.data.id },
      data: { deletedAt: new Date() },
    })

    // 7. Revalidate
    revalidatePath('/dashboard')
    revalidatePath('/offers')
    revalidatePath(`/offers/${validated.data.id}`)

    return { success: true, data: { offerId: validated.data.id } }
  } catch (error) {
    console.error('deleteOffer error:', error)
    return { success: false, error: "Erreur lors de la suppression de l'offre", code: 'SERVER_ERROR' }
  }
}
