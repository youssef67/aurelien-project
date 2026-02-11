import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getSupplierRequestDetail } from '@/lib/queries/requests'
import { serializeSupplierRequestDetail, REQUEST_TYPE_CONFIG, SUPPLIER_REQUEST_STATUS_CONFIG } from '@/lib/utils/requests'
import { formatRelativeDate, formatAbsoluteDate, formatPrice } from '@/lib/utils/format'
import { createClient } from '@/lib/supabase/server'
import { RequestDetailActions } from '@/components/custom/request-detail-actions'

export const metadata: Metadata = {
  title: 'Détail de la demande',
}

export default async function RequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const request = await getSupplierRequestDetail(id, user!.id)

  if (!request) {
    notFound()
    return null
  }

  const serialized = serializeSupplierRequestDetail(request)
  const typeConfig = REQUEST_TYPE_CONFIG[serialized.type]
  const statusConfig = SUPPLIER_REQUEST_STATUS_CONFIG[serialized.status]

  return (
    <>
      <PageHeader title="Détail de la demande" showBack backHref="/requests" />
      <div className="flex-1 overflow-auto p-4 bg-muted space-y-4">
        <Card className="rounded-[0_16px_16px_16px] border-border">
          <CardContent className="p-4">
            <h2 className="font-display text-lg font-semibold mb-1">
              {serialized.store.name}
            </h2>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline">{serialized.store.brand}</Badge>
              <span className="text-sm text-muted-foreground">{serialized.store.city}</span>
            </div>
            <div className="space-y-1 text-sm">
              <p>
                <a href={`mailto:${serialized.store.email}`} className="text-primary underline">
                  {serialized.store.email}
                </a>
              </p>
              <p>
                {serialized.store.phone ? (
                  <a href={`tel:${serialized.store.phone}`} className="text-primary underline">
                    {serialized.store.phone}
                  </a>
                ) : (
                  <span className="text-muted-foreground">Non renseigné</span>
                )}
              </p>
            </div>
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

        <Card className="rounded-[0_16px_16px_16px] border-border">
          <CardContent className="p-4">
            <h2 className="font-display text-base font-semibold mb-2">
              Offre concernée
            </h2>
            <Link href={`/my-offers/${serialized.offer.id}`} className="text-primary underline text-sm">
              {serialized.offer.name}
            </Link>
            <p className="text-sm font-semibold mt-1">
              {formatPrice(serialized.offer.promoPrice)}
            </p>
          </CardContent>
        </Card>

        <RequestDetailActions
          requestId={serialized.id}
          status={serialized.status}
          phone={serialized.store.phone}
          updatedAt={serialized.updatedAt}
        />
      </div>
    </>
  )
}
