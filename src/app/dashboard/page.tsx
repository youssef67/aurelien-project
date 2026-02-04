import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tableau de bord - Fournisseur',
}

export default function DashboardPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Tableau de bord Fournisseur</h1>
        <p className="text-muted-foreground mt-2">Page en construction</p>
      </div>
    </div>
  )
}
