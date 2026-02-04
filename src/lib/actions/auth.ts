'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import {
  registerSupplierServerSchema,
  type RegisterSupplierServerInput,
  registerStoreServerSchema,
  type RegisterStoreServerInput,
} from '@/lib/validations/auth'
import type { ActionResult } from '@/types/api'

export async function registerSupplier(
  input: RegisterSupplierServerInput
): Promise<ActionResult<{ userId: string }>> {
  // 1. Validation serveur (double validation)
  const validated = registerSupplierServerSchema.safeParse(input)
  if (!validated.success) {
    const issues = JSON.parse(validated.error.message)
    return {
      success: false,
      error: issues[0]?.message || 'Données invalides',
      code: 'VALIDATION_ERROR'
    }
  }

  const { companyName, email, phone, password } = validated.data

  try {
    const supabase = await createClient()

    // 2. Créer l'utilisateur dans Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          user_type: 'supplier',
          company_name: companyName,
        }
      }
    })

    if (authError) {
      // Gérer l'erreur "email déjà utilisé"
      if (authError.message.includes('already registered') ||
          authError.message.includes('already exists') ||
          authError.message.includes('User already registered')) {
        return {
          success: false,
          error: 'Cet email est déjà utilisé',
          code: 'VALIDATION_ERROR'
        }
      }
      return {
        success: false,
        error: authError.message,
        code: 'SERVER_ERROR'
      }
    }

    if (!authData.user) {
      return {
        success: false,
        error: 'Erreur lors de la création du compte',
        code: 'SERVER_ERROR'
      }
    }

    // 3. Créer le profil dans la table suppliers (avec client admin pour bypasser RLS)
    const adminClient = createAdminClient()
    const now = new Date().toISOString()
    const { error: profileError } = await adminClient
      .from('suppliers')
      .insert({
        id: authData.user.id,
        email,
        company_name: companyName,
        phone: phone || null,
        created_at: now,
        updated_at: now,
      })

    if (profileError) {
      // Rollback: supprimer l'utilisateur Auth si le profil échoue
      await adminClient.auth.admin.deleteUser(authData.user.id)
      return {
        success: false,
        error: 'Erreur lors de la création du profil',
        code: 'SERVER_ERROR'
      }
    }

    return {
      success: true,
      data: { userId: authData.user.id }
    }
  } catch {
    return {
      success: false,
      error: 'Une erreur inattendue s\'est produite',
      code: 'SERVER_ERROR'
    }
  }
}

export async function registerStore(
  input: RegisterStoreServerInput
): Promise<ActionResult<{ userId: string }>> {
  // 1. Validation serveur (double validation)
  const validated = registerStoreServerSchema.safeParse(input)
  if (!validated.success) {
    const issues = JSON.parse(validated.error.message)
    return {
      success: false,
      error: issues[0]?.message || 'Données invalides',
      code: 'VALIDATION_ERROR'
    }
  }

  const { name, brand, email, city, phone, password } = validated.data

  try {
    const supabase = await createClient()

    // 2. Créer l'utilisateur dans Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          user_type: 'store',
          store_name: name,
          brand: brand,
        }
      }
    })

    if (authError) {
      // Gérer l'erreur "email déjà utilisé"
      if (authError.message.includes('already registered') ||
          authError.message.includes('already exists') ||
          authError.message.includes('User already registered')) {
        return {
          success: false,
          error: 'Cet email est déjà utilisé',
          code: 'VALIDATION_ERROR'
        }
      }
      return {
        success: false,
        error: authError.message,
        code: 'SERVER_ERROR'
      }
    }

    if (!authData.user) {
      return {
        success: false,
        error: 'Erreur lors de la création du compte',
        code: 'SERVER_ERROR'
      }
    }

    // 3. Créer le profil dans la table stores (avec client admin pour bypasser RLS)
    const adminClient = createAdminClient()
    const now = new Date().toISOString()
    const { error: profileError } = await adminClient
      .from('stores')
      .insert({
        id: authData.user.id,
        email,
        name,
        brand,
        city,
        phone: phone || null,
        created_at: now,
        updated_at: now,
      })

    if (profileError) {
      // Rollback: supprimer l'utilisateur Auth si le profil échoue
      await adminClient.auth.admin.deleteUser(authData.user.id)
      return {
        success: false,
        error: 'Erreur lors de la création du profil',
        code: 'SERVER_ERROR'
      }
    }

    return {
      success: true,
      data: { userId: authData.user.id }
    }
  } catch {
    return {
      success: false,
      error: 'Une erreur inattendue s\'est produite',
      code: 'SERVER_ERROR'
    }
  }
}
