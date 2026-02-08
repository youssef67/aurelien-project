import { prisma } from '@/lib/prisma/client'

export async function getActiveOffers() {
  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)

  return prisma.offer.findMany({
    where: {
      status: 'ACTIVE',
      deletedAt: null,
      endDate: { gte: today },
    },
    include: {
      supplier: {
        select: { companyName: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export type OfferWithSupplier = Awaited<ReturnType<typeof getActiveOffers>>[number]
