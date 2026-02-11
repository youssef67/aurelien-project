import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatRelativeDate } from '@/lib/utils/format'
import { REQUEST_TYPE_CONFIG, REQUEST_STATUS_CONFIG } from '@/lib/utils/requests'
import type { SerializedStoreRequest } from '@/lib/utils/requests'

interface StoreRequestCardProps {
  request: SerializedStoreRequest
}

export function StoreRequestCard({ request }: StoreRequestCardProps) {
  const typeConfig = REQUEST_TYPE_CONFIG[request.type]
  const statusConfig = REQUEST_STATUS_CONFIG[request.status]

  return (
    <Link href={`/my-requests/${request.id}`}>
      <article>
        <Card className="rounded-[0_16px_16px_16px] border-border transition-shadow duration-200 hover:shadow-[0_4px_12px_rgba(37,34,74,0.08)]">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="font-display text-base font-semibold leading-tight truncate">
                {request.offer.name}
              </h3>
              <Badge variant={typeConfig.variant} className={typeConfig.className}>
                {typeConfig.label}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              {request.supplier.companyName}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {formatRelativeDate(request.createdAt)}
              </span>
              <Badge variant={statusConfig.variant} className={statusConfig.className}>
                {statusConfig.label}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </article>
    </Link>
  )
}
