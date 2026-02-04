'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { ActionResult } from '@/types/api'

export async function getSession() {
  const supabase = await createClient()
  const { data: { session }, error } = await supabase.auth.getSession()
  return { session, error }
}

export async function getUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  return { user, error }
}

/**
 * Sign out the current user and redirect to login.
 * Note: This function never returns on success - redirect() throws an exception.
 * On error, returns ActionResult with error details.
 */
export async function signOut(): Promise<ActionResult<null>> {
  const supabase = await createClient()
  const { error } = await supabase.auth.signOut()

  if (error) {
    return { success: false, error: error.message, code: 'SERVER_ERROR' }
  }

  // redirect() throws NEXT_REDIRECT exception - this is intentional Next.js behavior
  // The function will not return after this line on success
  redirect('/login')
}

export async function getUserProfile() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { user: null, profile: null, userType: null }
  }

  // Essayer de trouver le profil fournisseur
  const { data: supplier } = await supabase
    .from('suppliers')
    .select('*')
    .eq('id', user.id)
    .single()

  if (supplier) {
    return { user, profile: supplier, userType: 'supplier' as const }
  }

  // Sinon, chercher le profil magasin
  const { data: store } = await supabase
    .from('stores')
    .select('*')
    .eq('id', user.id)
    .single()

  if (store) {
    return { user, profile: store, userType: 'store' as const }
  }

  return { user, profile: null, userType: null }
}
