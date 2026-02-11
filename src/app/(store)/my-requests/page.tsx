import type { Metadata } from 'next'
import { PageHeader } from '@/components/layout/page-header'
import { StoreRequestList } from '@/components/custom/store-request-list'
import { EmptyRequestsState } from '@/components/custom/empty-requests-state'
import { getStoreRequests } from '@/lib/queries/requests'
import { serializeStoreRequest } from '@/lib/utils/requests'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Mes demandes',
}

export default async function MyRequestsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const requests = await getStoreRequests(user!.id)
  const serializedRequests = requests.map(serializeStoreRequest)

  return (
    <>
      <PageHeader title="Mes demandes" />
      <div className="flex-1 overflow-auto p-4 bg-muted">
        {serializedRequests.length === 0 ? (
          <EmptyRequestsState />
        ) : (
          <StoreRequestList requests={serializedRequests} />
        )}
      </div>
    </>
  )
}
