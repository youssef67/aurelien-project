'use server'

import { revalidatePath } from 'next/cache'
import { createOfferSchema, type CreateOfferInput } from '@/lib/validations/offers'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma/client'
import type { ActionResult } from '@/types/api'

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
