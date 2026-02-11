import type { Metadata } from 'next'
import { PageHeader } from '@/components/layout/page-header'
import { SupplierRequestList } from '@/components/custom/supplier-request-list'
import { EmptySupplierRequestsState } from '@/components/custom/empty-supplier-requests-state'
import { getSupplierRequests } from '@/lib/queries/requests'
import { serializeSupplierRequest } from '@/lib/utils/requests'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Demandes reçues',
}

export default async function RequestsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const requests = await getSupplierRequests(user!.id)
  const serializedRequests = requests.map(serializeSupplierRequest)

  return (
    <>
      <PageHeader title="Demandes reçues" />
      <div className="flex-1 overflow-auto p-4 bg-muted">
        {serializedRequests.length === 0 ? (
          <EmptySupplierRequestsState />
        ) : (
          <SupplierRequestList requests={serializedRequests} />
        )}
      </div>
    </>
  )
}
