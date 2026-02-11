'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'

interface PageHeaderProps {
  title: string
  actions?: React.ReactNode
  showBack?: boolean
  backHref?: string
  onBack?: () => void
}

export function PageHeader({
  title,
  actions,
  showBack,
  backHref,
  onBack,
}: PageHeaderProps) {
  const router = useRouter()

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      router.back()
    }
  }

  const backButtonClasses = "min-w-[44px] min-h-[44px] flex items-center justify-center -ml-2 rounded-md hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"

  return (
    <div className="flex items-center justify-between h-14 px-4">
      <div className="flex items-center gap-2">
        {showBack && (
          backHref ? (
            <Link href={backHref} className={backButtonClasses} aria-label="Retour">
              <ChevronLeft className="h-6 w-6" />
            </Link>
          ) : (
            <button
              onClick={handleBack}
              className={backButtonClasses}
              aria-label="Retour"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )
        )}
        <h1 className="font-display text-xl font-bold">{title}</h1>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}
