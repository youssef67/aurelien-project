'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger, DialogClose,
} from '@/components/ui/dialog'
import { deleteOffer } from '@/lib/actions/offers'

interface DeleteOfferButtonProps {
  offerId: string
}

export function DeleteOfferButton({ offerId }: DeleteOfferButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    setIsLoading(true)
    try {
      const result = await deleteOffer({ id: offerId })
      if (result.success) {
        setOpen(false)
        toast.success('Offre supprimée')
        router.push('/dashboard')
      } else {
        toast.error(result.error)
      }
    } catch {
      toast.error('Une erreur inattendue est survenue')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(val) => { if (!isLoading) setOpen(val) }}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full h-11 text-destructive border-destructive/30 hover:bg-destructive/10">
          <Trash2 className="mr-2 h-4 w-4" />
          Supprimer cette offre
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display">Êtes-vous sûr de vouloir supprimer cette offre ?</DialogTitle>
          <DialogDescription>
            Cette action est irréversible. L&apos;offre ne sera plus visible par les magasins.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={isLoading}>Annuler</Button>
          </DialogClose>
          <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
            Supprimer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
