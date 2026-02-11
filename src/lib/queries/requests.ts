import { cache } from 'react'
import type { RequestType } from '@prisma/client'
import { prisma } from '@/lib/prisma/client'

export const getExistingRequestTypes = cache(
  async (storeId: string, offerId: string): Promise<RequestType[]> => {
    const requests = await prisma.request.findMany({
      where: { storeId, offerId },
      select: { type: true },
    })
    return requests.map((r) => r.type)
  }
)

export const getStoreRequests = cache(async (storeId: string) => {
  return prisma.request.findMany({
    where: { storeId },
    include: {
      offer: { select: { id: true, name: true, promoPrice: true } },
      supplier: { select: { companyName: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
})

export type StoreRequestWithRelations = Awaited<ReturnType<typeof getStoreRequests>>[number]

export const getStoreRequestDetail = cache(async (requestId: string, storeId: string) => {
  return prisma.request.findFirst({
    where: { id: requestId, storeId },
    include: {
      offer: {
        select: {
          id: true,
          name: true,
          promoPrice: true,
          discountPercent: true,
          startDate: true,
          endDate: true,
          category: true,
          photoUrl: true,
        },
      },
      supplier: { select: { companyName: true } },
    },
  })
})

export type StoreRequestDetailWithRelations = NonNullable<Awaited<ReturnType<typeof getStoreRequestDetail>>>

export const getSupplierRequests = cache(async (supplierId: string) => {
  return prisma.request.findMany({
    where: { supplierId },
    include: {
      store: { select: { name: true, brand: true, city: true } },
      offer: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
})

export type SupplierRequestWithRelations = Awaited<ReturnType<typeof getSupplierRequests>>[number]

export const getSupplierRequestDetail = cache(async (requestId: string, supplierId: string) => {
  return prisma.request.findFirst({
    where: { id: requestId, supplierId },
    include: {
      store: { select: { name: true, brand: true, city: true, email: true, phone: true } },
      offer: { select: { id: true, name: true, promoPrice: true } },
    },
  })
})

export type SupplierRequestDetailWithRelations = NonNullable<Awaited<ReturnType<typeof getSupplierRequestDetail>>>
