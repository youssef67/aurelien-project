import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import LandingHero from '@/components/landing/landing-hero'

export const metadata: Metadata = {
  title: 'Aurelien Project - Offres promotionnelles fournisseurs-magasins',
  description:
    'Plateforme de mise en relation entre fournisseurs et magasins pour les offres promotionnelles. Publiez vos promos ou découvrez les offres disponibles.',
}

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    const userType = user.user_metadata?.user_type
    if (userType === 'supplier') {
      redirect('/dashboard')
    } else if (userType === 'store') {
      redirect('/offers')
    }
  }

  return <LandingHero />
}
