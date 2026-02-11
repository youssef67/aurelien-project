import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('@/lib/queries/offers', () => ({
  getOfferForStoreDetail: vi.fn(),
}))

vi.mock('@/lib/queries/requests', () => ({
  getExistingRequestTypes: vi.fn(),
}))

const mockGetUser = vi.fn()
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve({
    auth: {
      getUser: mockGetUser,
    },
  })),
}))

const mockNotFound = vi.fn()
vi.mock('next/navigation', () => ({
  notFound: () => {
    mockNotFound()
    throw new Error('NEXT_NOT_FOUND')
  },
  useRouter: () => ({
    back: vi.fn(),
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}))

vi.mock('next/image', () => ({
  default: (props: Record<string, unknown>) => {
    const { fill, ...rest } = props
    // eslint-disable-next-line jsx-a11y/alt-text, @next/next/no-img-element
    return <img {...rest} data-fill={fill ? 'true' : undefined} />
  },
}))

vi.mock('@/components/custom/request-sheet', () => ({
  RequestSheet: ({ trigger, disabled, type }: { trigger: React.ReactNode; disabled?: boolean; offerId: string; supplierName: string; type: string }) => (
    <div data-testid="request-sheet" data-disabled={disabled} data-type={type}>
      {trigger}
    </div>
  ),
}))

import { Decimal } from '@prisma/client/runtime/library'
import { getOfferForStoreDetail } from '@/lib/queries/offers'
import { getExistingRequestTypes } from '@/lib/queries/requests'
import StoreOfferDetailPage, { generateMetadata } from './page'

type MockOffer = NonNullable<Awaited<ReturnType<typeof getOfferForStoreDetail>>>

function createMockOffer(overrides: Partial<MockOffer> = {}): MockOffer {
  return {
    id: 'offer-1',
    supplierId: 'supplier-1',
    name: 'Pommes Golden Bio',
    promoPrice: new Decimal('2.49'),
    discountPercent: 25,
    startDate: new Date('2026-02-01'),
    endDate: new Date('2099-12-31'),
    category: 'EPICERIE',
    subcategory: null,
    photoUrl: null,
    margin: null,
    volume: null,
    conditions: null,
    animation: null,
    status: 'ACTIVE',
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    deletedAt: null,
    supplier: { companyName: 'Bio Fruits SARL' },
    ...overrides,
  } as MockOffer
}

async function renderPage(id = 'offer-1') {
  const result = await StoreOfferDetailPage({ params: Promise.resolve({ id }) })
  return render(result as React.ReactElement)
}

describe('StoreOfferDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useRealTimers()
    mockGetUser.mockResolvedValue({ data: { user: { id: 'store-1' } } })
    vi.mocked(getExistingRequestTypes).mockResolvedValue([])
  })

  // AC1: Navigation + AC2: Affichage
  it('renders the product name as heading', async () => {
    vi.mocked(getOfferForStoreDetail).mockResolvedValue(createMockOffer())

    await renderPage()

    expect(screen.getAllByText('Pommes Golden Bio').length).toBeGreaterThanOrEqual(1)
  })

  it('renders the supplier name', async () => {
    vi.mocked(getOfferForStoreDetail).mockResolvedValue(createMockOffer())

    await renderPage()

    expect(screen.getByText('Bio Fruits SARL')).toBeInTheDocument()
  })

  // AC2: Prix et remise
  it('renders the formatted price and discount', async () => {
    vi.mocked(getOfferForStoreDetail).mockResolvedValue(createMockOffer())

    await renderPage()

    expect(screen.getByText('2,49 €')).toBeInTheDocument()
    expect(screen.getByText('Remise : -25%')).toBeInTheDocument()
  })

  // AC3: Marge visible
  it('renders the margin when provided', async () => {
    vi.mocked(getOfferForStoreDetail).mockResolvedValue(
      createMockOffer({ margin: new Decimal('22') })
    )

    await renderPage()

    expect(screen.getByText('22%')).toBeInTheDocument()
    expect(screen.getByText(/Marge proposée/)).toBeInTheDocument()
  })

  // AC3: Marge absente
  it('does not render margin section when margin is null', async () => {
    vi.mocked(getOfferForStoreDetail).mockResolvedValue(
      createMockOffer({ margin: null })
    )

    await renderPage()

    expect(screen.queryByText(/Marge proposée/)).not.toBeInTheDocument()
  })

  // AC5: Placeholder photo
  it('renders Package placeholder when photoUrl is null', async () => {
    vi.mocked(getOfferForStoreDetail).mockResolvedValue(
      createMockOffer({ photoUrl: null })
    )

    await renderPage()

    // Package icon renders as an svg, check the placeholder container exists
    const placeholder = document.querySelector('.bg-muted')
    expect(placeholder).toBeInTheDocument()
    // No img tag should be present
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  // AC7: Expired banner
  it('renders expired banner when offer is expired', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-01'))

    vi.mocked(getOfferForStoreDetail).mockResolvedValue(
      createMockOffer({
        endDate: new Date('2026-01-01'),
        status: 'EXPIRED',
      })
    )

    await renderPage()

    expect(screen.getByText('Cette offre a expiré')).toBeInTheDocument()

    vi.useRealTimers()
  })

  // AC7: CTA disabled when expired
  it('disables CTA buttons when offer is expired', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-01'))

    vi.mocked(getOfferForStoreDetail).mockResolvedValue(
      createMockOffer({
        endDate: new Date('2026-01-01'),
        status: 'EXPIRED',
      })
    )

    await renderPage()

    const buttons = screen.getAllByRole('button')
    const ctaRenseignements = buttons.find(b => b.textContent === 'Demande de renseignements')
    const ctaCommander = buttons.find(b => b.textContent === 'Souhaite commander')

    expect(ctaRenseignements).toBeDisabled()
    expect(ctaCommander).toBeDisabled()

    vi.useRealTimers()
  })

  // AC4: CTA enabled when active
  it('enables CTA buttons when offer is active', async () => {
    vi.mocked(getOfferForStoreDetail).mockResolvedValue(createMockOffer())

    await renderPage()

    const buttons = screen.getAllByRole('button')
    const ctaRenseignements = buttons.find(b => b.textContent === 'Demande de renseignements')
    const ctaCommander = buttons.find(b => b.textContent === 'Souhaite commander')

    expect(ctaRenseignements).not.toBeDisabled()
    expect(ctaCommander).not.toBeDisabled()
  })

  // AC2: Optional details displayed
  it('renders category, volume, conditions, animation when provided', async () => {
    vi.mocked(getOfferForStoreDetail).mockResolvedValue(
      createMockOffer({
        subcategory: 'Fruits frais',
        volume: '500 caisses',
        conditions: 'Livraison franco',
        animation: 'Tête de gondole',
      })
    )

    await renderPage()

    expect(screen.getByText('Fruits frais')).toBeInTheDocument()
    expect(screen.getByText('500 caisses')).toBeInTheDocument()
    expect(screen.getByText('Livraison franco')).toBeInTheDocument()
    expect(screen.getByText('Tête de gondole')).toBeInTheDocument()
  })

  // AC2: Optional details hidden when null
  it('does not render optional details card when all optional fields are null', async () => {
    vi.mocked(getOfferForStoreDetail).mockResolvedValue(
      createMockOffer({
        subcategory: null,
        volume: null,
        conditions: null,
        animation: null,
      })
    )

    await renderPage()

    expect(screen.queryByText('Sous-catégorie')).not.toBeInTheDocument()
    expect(screen.queryByText('Volume estimé')).not.toBeInTheDocument()
    expect(screen.queryByText('Conditions commerciales')).not.toBeInTheDocument()
    expect(screen.queryByText('Animation prévue')).not.toBeInTheDocument()
  })

  // AC2: Category always displayed in price card
  it('renders category label in price card', async () => {
    vi.mocked(getOfferForStoreDetail).mockResolvedValue(createMockOffer())

    await renderPage()

    expect(screen.getByText(/Catégorie : Épicerie/)).toBeInTheDocument()
  })

  // AC2: Category visible even when all optional fields are null
  it('renders category even when optional details are all null', async () => {
    vi.mocked(getOfferForStoreDetail).mockResolvedValue(
      createMockOffer({ subcategory: null, volume: null, conditions: null, animation: null })
    )

    await renderPage()

    expect(screen.getByText(/Catégorie : Épicerie/)).toBeInTheDocument()
  })

  // AC5: Photo with URL
  it('renders image when photoUrl is provided', async () => {
    vi.mocked(getOfferForStoreDetail).mockResolvedValue(
      createMockOffer({ photoUrl: 'https://example.com/photo.jpg' })
    )

    await renderPage()

    const img = screen.getByRole('img')
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', 'https://example.com/photo.jpg')
  })

  // generateMetadata tests
  it('generates metadata with offer name', async () => {
    vi.mocked(getOfferForStoreDetail).mockResolvedValue(createMockOffer())

    const metadata = await generateMetadata({ params: Promise.resolve({ id: 'offer-1' }) })

    expect(metadata.title).toBe('Pommes Golden Bio - aurelien-project')
  })

  it('generates fallback metadata when offer not found', async () => {
    vi.mocked(getOfferForStoreDetail).mockResolvedValue(null)

    const metadata = await generateMetadata({ params: Promise.resolve({ id: 'nonexistent' }) })

    expect(metadata.title).toBe('Offre introuvable - aurelien-project')
  })

  // AC8: Not found
  it('calls notFound when query returns null', async () => {
    vi.mocked(getOfferForStoreDetail).mockResolvedValue(null)

    await expect(renderPage('nonexistent')).rejects.toThrow('NEXT_NOT_FOUND')
    expect(mockNotFound).toHaveBeenCalled()
  })

  // Story 4.1 — AC6: "Demande envoyée" when INFO already sent, ORDER still available
  it('renders "Demande envoyée" when hasInfoRequest is true and ORDER RequestSheet still available', async () => {
    vi.mocked(getOfferForStoreDetail).mockResolvedValue(createMockOffer())
    vi.mocked(getExistingRequestTypes).mockResolvedValue(['INFO'])

    await renderPage()

    expect(screen.getByText('Demande envoyée')).toBeInTheDocument()
    // INFO RequestSheet should not be present, but ORDER RequestSheet must be
    const sheets = screen.getAllByTestId('request-sheet')
    expect(sheets.every(s => s.getAttribute('data-type') !== 'INFO')).toBe(true)
    const orderSheet = sheets.find(s => s.getAttribute('data-type') === 'ORDER')
    expect(orderSheet).toBeInTheDocument()
  })

  // Story 4.1 — AC6: "Demande envoyée" button is disabled
  it('disables "Demande envoyée" button', async () => {
    vi.mocked(getOfferForStoreDetail).mockResolvedValue(createMockOffer())
    vi.mocked(getExistingRequestTypes).mockResolvedValue(['INFO'])

    await renderPage()

    const btn = screen.getByText('Demande envoyée')
    expect(btn).toBeDisabled()
  })

  // Story 4.1 — AC3: Shows RequestSheet when no INFO sent
  it('renders RequestSheet when hasInfoRequest is false', async () => {
    vi.mocked(getOfferForStoreDetail).mockResolvedValue(createMockOffer())
    vi.mocked(getExistingRequestTypes).mockResolvedValue([])

    await renderPage()

    const sheets = screen.getAllByTestId('request-sheet')
    const infoSheet = sheets.find(s => s.getAttribute('data-type') === 'INFO')
    expect(infoSheet).toBeInTheDocument()
    expect(screen.getByText('Demande de renseignements')).toBeInTheDocument()
    expect(screen.queryByText('Demande envoyée')).not.toBeInTheDocument()
  })

  // Story 4.2 — AC4: "Commande envoyée" when ORDER already sent, INFO still available
  it('renders "Commande envoyée" when hasOrderRequest is true and INFO RequestSheet still available', async () => {
    vi.mocked(getOfferForStoreDetail).mockResolvedValue(createMockOffer())
    vi.mocked(getExistingRequestTypes).mockResolvedValue(['ORDER'])

    await renderPage()

    expect(screen.getByText('Commande envoyée')).toBeInTheDocument()
    const btn = screen.getByText('Commande envoyée')
    expect(btn).toBeDisabled()
    // AC4: INFO RequestSheet must still be available
    const sheets = screen.getAllByTestId('request-sheet')
    const infoSheet = sheets.find(s => s.getAttribute('data-type') === 'INFO')
    expect(infoSheet).toBeInTheDocument()
    expect(screen.getByText('Demande de renseignements')).toBeInTheDocument()
  })

  // Story 4.2 — AC1: Shows RequestSheet ORDER when no ORDER sent
  it('renders RequestSheet ORDER when hasOrderRequest is false', async () => {
    vi.mocked(getOfferForStoreDetail).mockResolvedValue(createMockOffer())
    vi.mocked(getExistingRequestTypes).mockResolvedValue([])

    await renderPage()

    const sheets = screen.getAllByTestId('request-sheet')
    const orderSheet = sheets.find(s => s.getAttribute('data-type') === 'ORDER')
    expect(orderSheet).toBeInTheDocument()
    expect(screen.getByText('Souhaite commander')).toBeInTheDocument()
  })

  // Story 4.2 — AC4: Both INFO and ORDER already sent
  it('renders "Demande envoyée" and "Commande envoyée" when both types sent', async () => {
    vi.mocked(getOfferForStoreDetail).mockResolvedValue(createMockOffer())
    vi.mocked(getExistingRequestTypes).mockResolvedValue(['INFO', 'ORDER'])

    await renderPage()

    expect(screen.getByText('Demande envoyée')).toBeInTheDocument()
    expect(screen.getByText('Commande envoyée')).toBeInTheDocument()
    expect(screen.getByText('Demande envoyée')).toBeDisabled()
    expect(screen.getByText('Commande envoyée')).toBeDisabled()
    // No request sheets should be visible
    expect(screen.queryByTestId('request-sheet')).not.toBeInTheDocument()
  })

  // Story 4.1 — AC8: Expired offer disables RequestSheet
  it('passes disabled to RequestSheet when offer is expired', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-01'))

    vi.mocked(getOfferForStoreDetail).mockResolvedValue(
      createMockOffer({
        endDate: new Date('2026-01-01'),
        status: 'EXPIRED',
      })
    )

    await renderPage()

    const sheets = screen.getAllByTestId('request-sheet')
    sheets.forEach(sheet => {
      expect(sheet).toHaveAttribute('data-disabled', 'true')
    })

    vi.useRealTimers()
  })
})
