'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Phone, CheckCircle, CheckCircle2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { updateRequestStatus } from '@/lib/actions/requests'
import { formatAbsoluteDate } from '@/lib/utils/format'

interface RequestDetailActionsProps {
  requestId: string
  status: 'PENDING' | 'TREATED'
  phone: string | null
  updatedAt: string
}

export function RequestDetailActions({
  requestId,
  status,
  phone,
  updatedAt,
}: RequestDetailActionsProps) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleCall() {
    if (!phone) return
    const isTouchDevice = navigator.maxTouchPoints > 0
    if (isTouchDevice) {
      window.location.href = `tel:${phone}`
    } else {
      navigator.clipboard.writeText(phone).then(() => {
        toast.success('Numéro copié')
      }).catch(() => {
        toast.error('Impossible de copier le numéro')
      })
    }
  }

  function handleTreat() {
    startTransition(async () => {
      try {
        const result = await updateRequestStatus({ requestId })
        if (result.success) {
          toast.success('Demande marquée comme traitée')
          router.refresh()
        } else {
          toast.error(result.error)
        }
      } catch {
        toast.error('Une erreur est survenue')
      }
    })
  }

  if (status === 'TREATED') {
    return (
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2 text-success">
          <CheckCircle2 className="h-5 w-5" />
          <span className="text-sm font-medium">
            Traitée le {formatAbsoluteDate(updatedAt)}
          </span>
        </div>
        {phone && (
          <Button
            variant="outline"
            onClick={handleCall}
            className="w-full min-h-[44px]"
          >
            <Phone className="mr-2 h-4 w-4" />
            Appeler
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="p-4 flex gap-3">
      {phone && (
        <Button
          variant="outline"
          onClick={handleCall}
          className="flex-1 min-h-[44px]"
        >
          <Phone className="mr-2 h-4 w-4" />
          Appeler
        </Button>
      )}
      <Button
        onClick={handleTreat}
        disabled={isPending}
        className="flex-1 min-h-[44px] rounded-[0_8px_8px_8px]"
      >
        {isPending ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <CheckCircle className="mr-2 h-4 w-4" />
        )}
        Marquer comme traitée
      </Button>
    </div>
  )
}
