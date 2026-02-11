import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('@/lib/queries/notifications', () => ({
  getNotifications: vi.fn(),
  getUnreadNotificationCount: vi.fn(),
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'store-1' } } }),
    },
  }),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  redirect: vi.fn(),
}))

vi.mock('@/lib/utils/format', () => ({
  formatRelativeDate: () => 'il y a 5min',
}))

vi.mock('@/lib/hooks/use-notifications', () => ({
  useNotifications: () => ({
    unreadCount: 0,
    decrementCount: vi.fn(),
    resetCount: vi.fn(),
  }),
}))

vi.mock('@/lib/actions/notifications', () => ({
  markNotificationAsRead: vi.fn(),
  markAllNotificationsAsRead: vi.fn(),
}))

import { getNotifications, getUnreadNotificationCount } from '@/lib/queries/notifications'
import StoreNotificationsPage from './page'

describe('StoreNotificationsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders page header with title "Notifications"', async () => {
    vi.mocked(getNotifications).mockResolvedValue([])
    vi.mocked(getUnreadNotificationCount).mockResolvedValue(0)

    const result = await StoreNotificationsPage()
    render(result as React.ReactElement)

    expect(screen.getByText('Notifications')).toBeInTheDocument()
  })

  it('renders store-specific empty state message', async () => {
    vi.mocked(getNotifications).mockResolvedValue([])
    vi.mocked(getUnreadNotificationCount).mockResolvedValue(0)

    const result = await StoreNotificationsPage()
    render(result as React.ReactElement)

    expect(screen.getByText(/fournisseur traitera votre demande/)).toBeInTheDocument()
  })

  it('calls getNotifications with STORE userType', async () => {
    vi.mocked(getNotifications).mockResolvedValue([])
    vi.mocked(getUnreadNotificationCount).mockResolvedValue(0)

    await StoreNotificationsPage()

    expect(getNotifications).toHaveBeenCalledWith('store-1', 'STORE', 0, 50)
  })
})
