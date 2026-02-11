import Link from 'next/link'
import { MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function EmptyRequestsState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="rounded-full bg-muted p-6 mb-6">
        <MessageSquare className="h-12 w-12 text-muted-foreground" />
      </div>

      <h2 className="font-display text-lg font-semibold mb-2">
        Vous n&apos;avez pas encore envoyé de demande
      </h2>

      <p className="text-muted-foreground mb-6 max-w-sm">
        Consultez les offres disponibles pour envoyer vos premières demandes
      </p>

      <Button asChild className="h-11">
        <Link href="/offers">
          Découvrir les offres
        </Link>
      </Button>
    </div>
  )
}
