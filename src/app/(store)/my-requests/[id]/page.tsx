import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getStoreRequestDetail } from '@/lib/queries/requests'
import { serializeStoreRequestDetail, REQUEST_TYPE_CONFIG, REQUEST_STATUS_CONFIG } from '@/lib/utils/requests'
import { formatRelativeDate, formatAbsoluteDate, formatPrice } from '@/lib/utils/format'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Détail de la demande',
}

export default async function MyRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const request = await getStoreRequestDetail(id, user!.id)

  if (!request) {
    notFound()
    return null
  }

  const serialized = serializeStoreRequestDetail(request)
  const typeConfig = REQUEST_TYPE_CONFIG[serialized.type]
  const statusConfig = REQUEST_STATUS_CONFIG[serialized.status]

  return (
    <>
      <PageHeader title="Détail de la demande" showBack />
      <div className="flex-1 overflow-auto p-4 bg-muted space-y-4">
        <Card className="rounded-[0_16px_16px_16px] border-border">
          <CardContent className="p-4">
            <h2 className="font-display text-lg font-semibold mb-1">
              {serialized.offer.name}
            </h2>
            <p className="text-sm text-muted-foreground mb-2">
              {serialized.supplier.companyName}
            </p>
            <p className="text-sm font-semibold">
              {formatPrice(serialized.offer.promoPrice)}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-[0_16px_16px_16px] border-border">
          <CardContent className="p-4">
            <h2 className="font-display text-base font-semibold mb-3">
              Informations de la demande
            </h2>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={typeConfig.variant} className={typeConfig.className}>
                {typeConfig.label}
              </Badge>
              <Badge variant={statusConfig.variant} className={statusConfig.className}>
                {statusConfig.label}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Envoyé {formatRelativeDate(serialized.createdAt)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {formatAbsoluteDate(serialized.createdAt)}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-[0_16px_16px_16px] border-border">
          <CardContent className="p-4">
            <h2 className="font-display text-base font-semibold mb-2">
              Message
            </h2>
            <p className="text-sm text-muted-foreground">
              {serialized.message ?? 'Aucun message'}
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
