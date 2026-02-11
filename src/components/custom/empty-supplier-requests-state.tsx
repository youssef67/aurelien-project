import { MessageSquare } from 'lucide-react'

export function EmptySupplierRequestsState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="rounded-full bg-muted p-6 mb-6">
        <MessageSquare className="h-12 w-12 text-muted-foreground" />
      </div>

      <h2 className="font-display text-lg font-semibold mb-2">
        Les demandes de vos clients apparaîtront ici
      </h2>

      <p className="text-muted-foreground max-w-sm">
        Publiez des offres pour recevoir des demandes
      </p>
    </div>
  )
}
