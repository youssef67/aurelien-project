import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StoreNavWrapper } from './store-nav-wrapper'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/offers',
}))

// Mock sonner
vi.mock('sonner', () => ({
  toast: vi.fn(),
}))

// Mock Supabase realtime
vi.mock('@/lib/supabase/realtime', () => ({
  subscribeToNotifications: vi.fn(() => ({ unsubscribe: vi.fn() })),
  unsubscribeFromNotifications: vi.fn(),
}))

describe('StoreNavWrapper', () => {
  it('renders BottomNavigation with notification count', () => {
    render(<StoreNavWrapper userId="user-123" initialUnreadCount={3} />)

    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('renders navigation links', () => {
    render(<StoreNavWrapper userId="user-123" initialUnreadCount={0} />)

    expect(screen.getByRole('link', { name: /offres/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /demandes/i })).toBeInTheDocument()
  })
})
