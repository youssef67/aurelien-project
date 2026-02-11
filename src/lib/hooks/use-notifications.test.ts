import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useNotifications } from './use-notifications'

// Mock sonner
vi.mock('sonner', () => ({
  toast: vi.fn(),
}))

// Mock Supabase realtime
let capturedCallback: ((notification: Record<string, unknown>) => void) | null = null
const mockUnsubscribe = vi.fn()
const mockChannel = { unsubscribe: mockUnsubscribe }

vi.mock('@/lib/supabase/realtime', () => ({
  subscribeToNotifications: vi.fn((_userId: string, callback: (notification: Record<string, unknown>) => void) => {
    capturedCallback = callback
    return mockChannel
  }),
  unsubscribeFromNotifications: vi.fn(),
}))

describe('useNotifications', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    capturedCallback = null
  })

  it('returns initial count', () => {
    const { result } = renderHook(() => useNotifications('user-123', 5))

    expect(result.current.unreadCount).toBe(5)
  })

  it('subscribes to notifications when userId is provided', async () => {
    const { subscribeToNotifications } = await import('@/lib/supabase/realtime')

    renderHook(() => useNotifications('user-123', 0))

    expect(subscribeToNotifications).toHaveBeenCalledWith('user-123', expect.any(Function))
  })

  it('does not subscribe when userId is null', async () => {
    const { subscribeToNotifications } = await import('@/lib/supabase/realtime')

    renderHook(() => useNotifications(null, 0))

    expect(subscribeToNotifications).not.toHaveBeenCalled()
  })

  it('increments count when new notification arrives', async () => {
    const { result } = renderHook(() => useNotifications('user-123', 3))

    act(() => {
      capturedCallback?.({
        title: 'Nouvelle demande',
        body: 'Mon Magasin - Promo',
      })
    })

    expect(result.current.unreadCount).toBe(4)
  })

  it('shows toast when new notification arrives', async () => {
    const { toast } = await import('sonner')

    renderHook(() => useNotifications('user-123', 0))

    act(() => {
      capturedCallback?.({
        title: 'Nouvelle demande',
        body: 'Mon Magasin - Promo Biscuits',
      })
    })

    expect(toast).toHaveBeenCalledWith('Nouvelle demande', {
      description: 'Mon Magasin - Promo Biscuits',
    })
  })

  it('unsubscribes on unmount', async () => {
    const { unsubscribeFromNotifications } = await import('@/lib/supabase/realtime')

    const { unmount } = renderHook(() => useNotifications('user-123', 0))
    unmount()

    expect(unsubscribeFromNotifications).toHaveBeenCalledWith(mockChannel)
  })

  it('exposes decrementCount function', () => {
    const { result } = renderHook(() => useNotifications('user-123', 5))

    expect(result.current.decrementCount).toBeTypeOf('function')
  })

  it('decrementCount reduces count by 1', () => {
    const { result } = renderHook(() => useNotifications('user-123', 5))

    act(() => {
      result.current.decrementCount()
    })

    expect(result.current.unreadCount).toBe(4)
  })

  it('decrementCount does not go below 0', () => {
    const { result } = renderHook(() => useNotifications('user-123', 0))

    act(() => {
      result.current.decrementCount()
    })

    expect(result.current.unreadCount).toBe(0)
  })

  it('exposes resetCount function', () => {
    const { result } = renderHook(() => useNotifications('user-123', 5))

    expect(result.current.resetCount).toBeTypeOf('function')
  })

  it('resetCount sets count to 0', () => {
    const { result } = renderHook(() => useNotifications('user-123', 8))

    act(() => {
      result.current.resetCount()
    })

    expect(result.current.unreadCount).toBe(0)
  })

  it('calls onNewNotification callback when new notification arrives', () => {
    const onNew = vi.fn()
    renderHook(() => useNotifications('user-123', 0, { onNewNotification: onNew }))

    act(() => {
      capturedCallback?.({
        title: 'Nouvelle demande',
        body: 'Mon Magasin - Promo',
      })
    })

    expect(onNew).toHaveBeenCalledWith({
      title: 'Nouvelle demande',
      body: 'Mon Magasin - Promo',
    })
  })

  it('does not fail when onNewNotification is not provided', () => {
    renderHook(() => useNotifications('user-123', 0))

    expect(() => {
      act(() => {
        capturedCallback?.({
          title: 'Test',
          body: 'Test body',
        })
      })
    }).not.toThrow()
  })

  it('syncs unreadCount when initialCount prop changes', () => {
    const { result, rerender } = renderHook(
      ({ count }) => useNotifications('user-123', count),
      { initialProps: { count: 5 } }
    )

    expect(result.current.unreadCount).toBe(5)

    rerender({ count: 2 })

    expect(result.current.unreadCount).toBe(2)
  })
})
