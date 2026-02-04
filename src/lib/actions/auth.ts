'use server'

import { z } from 'zod'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import {
  registerSupplierServerSchema,
  type RegisterSupplierServerInput,
  registerStoreServerSchema,
  type RegisterStoreServerInput,
  loginSchema,
  type LoginInput,
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

export async function login(
  input: LoginInput
): Promise<ActionResult<{ userType: 'supplier' | 'store'; redirectUrl: string }>> {
  // 1. Validation serveur
  const validated = loginSchema.safeParse(input)
  if (!validated.success) {
    const issues = JSON.parse(validated.error.message)
    return {
      success: false,
      error: issues[0]?.message || 'Données invalides',
      code: 'VALIDATION_ERROR'
    }
  }

  const { email, password } = validated.data

  try {
    const supabase = await createClient()

    // 2. Authentification avec Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      // Gérer email non confirmé
      if (error.message.includes('Email not confirmed')) {
        return {
          success: false,
          error: 'Veuillez confirmer votre email avant de vous connecter',
          code: 'UNAUTHORIZED'
        }
      }

      // Identifiants incorrects
      return {
        success: false,
        error: 'Email ou mot de passe incorrect',
        code: 'UNAUTHORIZED'
      }
    }

    if (!data.user) {
      return {
        success: false,
        error: 'Email ou mot de passe incorrect',
        code: 'UNAUTHORIZED'
      }
    }

    // 3. Récupérer le type d'utilisateur depuis les metadata
    const userType = data.user.user_metadata?.user_type as 'supplier' | 'store' | undefined

    if (!userType) {
      return {
        success: false,
        error: 'Type d\'utilisateur non défini',
        code: 'SERVER_ERROR'
      }
    }

    // 4. Déterminer l'URL de redirection selon le rôle
    const redirectUrl = userType === 'supplier' ? '/dashboard' : '/offers'

    return {
      success: true,
      data: { userType, redirectUrl }
    }
  } catch {
    return {
      success: false,
      error: 'Une erreur inattendue s\'est produite',
      code: 'SERVER_ERROR'
    }
  }
}

export async function resendConfirmationEmail(
  email: string
): Promise<ActionResult<void>> {
  if (!email || !z.string().email().safeParse(email).success) {
    return {
      success: false,
      error: 'Email invalide',
      code: 'VALIDATION_ERROR'
    }
  }

  try {
    const supabase = await createClient()

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
    })

    if (error) {
      // Rate limit ou autre erreur
      if (error.message.includes('rate limit')) {
        return {
          success: false,
          error: 'Veuillez patienter avant de renvoyer un email',
          code: 'SERVER_ERROR'
        }
      }
      return {
        success: false,
        error: 'Impossible de renvoyer l\'email',
        code: 'SERVER_ERROR'
      }
    }

    return {
      success: true,
      data: undefined
    }
  } catch {
    return {
      success: false,
      error: 'Une erreur inattendue s\'est produite',
      code: 'SERVER_ERROR'
    }
  }
}
