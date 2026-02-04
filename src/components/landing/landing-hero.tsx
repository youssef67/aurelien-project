import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Package, Store } from 'lucide-react'

export default function LandingHero() {
  return (
    <div
      data-testid="landing-hero"
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
    >
      {/* Header */}
      <h1 className="text-3xl md:text-4xl font-bold text-center text-foreground">
        Connectez fournisseurs et magasins
      </h1>
      <p className="mt-4 text-lg text-muted-foreground text-center max-w-md">
        La plateforme qui simplifie les offres promotionnelles
      </p>

      {/* Value props */}
      <div
        data-testid="value-props"
        className="mt-12 grid gap-8 md:grid-cols-2 max-w-2xl"
      >
        <div className="p-6 border rounded-lg">
          <Package className="h-8 w-8 text-primary mb-4" aria-hidden="true" />
          <h2 className="font-semibold text-lg">Fournisseurs</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Publiez vos offres promotionnelles et recevez des demandes de magasins intéressés
          </p>
        </div>
        <div className="p-6 border rounded-lg">
          <Store className="h-8 w-8 text-primary mb-4" aria-hidden="true" />
          <h2 className="font-semibold text-lg">Magasins</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Découvrez les offres de vos fournisseurs et commandez en quelques clics
          </p>
        </div>
      </div>

      {/* CTAs */}
      <div className="mt-12 flex flex-col items-center gap-4">
        <Button asChild size="lg" className="min-h-[44px] min-w-[200px]">
          <Link href="/register">Créer un compte</Link>
        </Button>
        <Link
          href="/login"
          className="text-sm text-muted-foreground hover:underline min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          Déjà inscrit ? Se connecter
        </Link>
      </div>
    </div>
  )
}
