import { BottomNavigation } from '@/components/custom/bottom-navigation'

interface MobileLayoutProps {
  children: React.ReactNode
  header?: React.ReactNode
  showBottomNav?: boolean
}

export function MobileLayout({
  children,
  header,
  showBottomNav = true,
}: MobileLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {header && (
        <header className="sticky top-0 z-50 bg-background border-b border-border">
          {header}
        </header>
      )}
      <main className="flex-1 overflow-auto pb-16">{children}</main>
      {showBottomNav && <BottomNavigation />}
    </div>
  )
}
