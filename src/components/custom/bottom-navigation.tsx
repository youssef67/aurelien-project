'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Package, MessageSquare, Bell, User } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { NotificationBadge } from './notification-badge'

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
  badgeKey?: string
}

const navItems: NavItem[] = [
  { href: '/offers', label: 'Offres', icon: <Package className="h-5 w-5" /> },
  {
    href: '/my-requests',
    label: 'Demandes',
    icon: <MessageSquare className="h-5 w-5" />,
    badgeKey: 'requests',
  },
  { href: '/notifications', label: 'Notifs', icon: <Bell className="h-5 w-5" /> },
  { href: '/profile', label: 'Profil', icon: <User className="h-5 w-5" /> },
]

interface BottomNavigationProps {
  unreadRequestCount?: number
}

export function BottomNavigation({ unreadRequestCount = 0 }: BottomNavigationProps) {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border pb-[env(safe-area-inset-bottom)]"
      role="navigation"
      aria-label="Navigation principale"
    >
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          const badgeCount = item.badgeKey === 'requests' ? unreadRequestCount : 0
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center min-w-[44px] min-h-[44px] px-3 py-2 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              aria-current={isActive ? 'page' : undefined}
              aria-label={badgeCount > 0 ? `${item.label} (${badgeCount} non lues)` : item.label}
            >
              <span className="relative">
                {item.icon}
                <NotificationBadge count={badgeCount} />
              </span>
              <span className={cn('text-xs mt-1', isActive && 'font-medium')}>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
