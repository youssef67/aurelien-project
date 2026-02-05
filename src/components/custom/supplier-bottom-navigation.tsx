'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Package, MessageSquare, User } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Offres', icon: <Package className="h-5 w-5" /> },
  {
    href: '/requests',
    label: 'Demandes',
    icon: <MessageSquare className="h-5 w-5" />,
  },
  { href: '/profile', label: 'Profil', icon: <User className="h-5 w-5" /> },
]

export function SupplierBottomNavigation() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-background border-t border-border"
      role="navigation"
      aria-label="Navigation fournisseur"
    >
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
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
            >
              {item.icon}
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
