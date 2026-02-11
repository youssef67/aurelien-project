'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { createRequest } from '@/lib/actions/requests'

interface RequestSheetProps {
  offerId: string
  supplierName: string
  type: 'INFO' | 'ORDER'
  trigger: React.ReactNode
  disabled?: boolean
}

const TITLES: Record<RequestSheetProps['type'], string> = {
  INFO: 'Demande de renseignements',
  ORDER: 'Intention de commande',
}

const PLACEHOLDERS: Record<RequestSheetProps['type'], string> = {
  INFO: 'Précisez votre question (optionnel)',
  ORDER: 'Précisez quantité ou conditions (optionnel)',
}

export function RequestSheet({
  offerId,
  supplierName,
  type,
  trigger,
  disabled,
}: RequestSheetProps) {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleSubmit() {
    startTransition(async () => {
      const result = await createRequest({ offerId, type, message: message.trim() || undefined })

      if (result.success) {
        setOpen(false)
        setMessage('')
        const successMessage = type === 'ORDER'
          ? 'Intention de commande envoyée !'
          : `Demande envoyée à ${supplierName}`
        toast.success(successMessage)
        router.refresh()
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <Sheet open={disabled ? false : open} onOpenChange={(val) => { if (!disabled) setOpen(val) }}>
      <SheetTrigger asChild>
        {trigger}
      </SheetTrigger>
      <SheetContent side="bottom" className="max-h-[80vh]">
        <SheetHeader>
          <SheetTitle className="font-display">{TITLES[type]}</SheetTitle>
          <SheetDescription>Envoyer une demande à {supplierName}</SheetDescription>
        </SheetHeader>

        <div className="px-4 py-4">
          <Textarea
            placeholder={PLACEHOLDERS[type]}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            maxLength={1000}
            disabled={isPending}
          />
        </div>

        <SheetFooter className="px-4">
          <Button
            onClick={handleSubmit}
            disabled={isPending}
            className="w-full rounded-[0_0.5rem_0.5rem_0.5rem]"
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Envoyer
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
