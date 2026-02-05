import Link from 'next/link'
import { Package, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function EmptyOffersState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="rounded-full bg-muted p-6 mb-6">
        <Package className="h-12 w-12 text-muted-foreground" />
      </div>

      <h2 className="text-xl font-semibold mb-2">
        Aucune offre pour le moment
      </h2>

      <p className="text-muted-foreground mb-6 max-w-sm">
        Publiez votre première offre pour la rendre visible aux magasins
      </p>

      <Button asChild className="h-11">
        <Link href="/offers/new">
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle offre
        </Link>
      </Button>
    </div>
  )
}
