import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Package, Store, ArrowRight } from 'lucide-react'

export default function LandingHero() {
  return (
    <div data-testid="landing-hero" className="flex flex-col">
      {/* Hero section - dark bg */}
      <section className="bg-hero-bg text-hero-foreground px-4 py-16 flex flex-col items-center text-center">
        <h1 className="font-display text-4xl font-extrabold leading-tight max-w-md">
          Connectez fournisseurs et magasins
        </h1>
        <p className="mt-4 text-lg text-hero-foreground/70 max-w-md">
          La plateforme qui simplifie les offres promotionnelles
        </p>

        <div className="mt-8 flex flex-col items-center gap-4">
          <Button asChild size="lg" className="min-h-[44px] min-w-[200px]">
            <Link href="/register">
              Créer un compte
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Link
            href="/login"
            className="text-sm text-hero-foreground/60 hover:text-hero-foreground hover:underline min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
          >
            Déjà inscrit ? Se connecter
          </Link>
        </div>
      </section>

      {/* Value props - alternating bg */}
      <section className="bg-secondary px-4 py-12">
        <div
          data-testid="value-props"
          className="grid gap-6 md:grid-cols-2 max-w-2xl mx-auto"
        >
          <div className="rounded-[0_1rem_1rem_1rem] bg-card border border-border p-6">
            <Package className="h-8 w-8 text-primary mb-4" aria-hidden="true" />
            <h2 className="font-display font-semibold text-lg">Fournisseurs</h2>
            <p className="text-sm text-muted-foreground mt-2">
              Publiez vos offres promotionnelles et recevez des demandes de magasins intéressés
            </p>
          </div>
          <div className="rounded-[0_1rem_1rem_1rem] bg-card border border-border p-6">
            <Store className="h-8 w-8 text-primary mb-4" aria-hidden="true" />
            <h2 className="font-display font-semibold text-lg">Magasins</h2>
            <p className="text-sm text-muted-foreground mt-2">
              Découvrez les offres de vos fournisseurs et commandez en quelques clics
            </p>
          </div>
        </div>
      </section>

      {/* CTA section - dark bg */}
      <section className="bg-hero-bg text-hero-foreground px-4 py-12 flex flex-col items-center text-center">
        <h2 className="font-display text-2xl font-bold">Prêt à commencer ?</h2>
        <p className="mt-2 text-hero-foreground/70">Rejoignez la plateforme dès maintenant</p>
        <div className="mt-6">
          <Button asChild size="lg" className="min-h-[44px] min-w-[200px]">
            <Link href="/register">
              S&apos;inscrire
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
