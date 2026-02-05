import Link from 'next/link'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface FloatingActionButtonProps {
  href: string
  className?: string
}

export function FloatingActionButton({ href, className }: FloatingActionButtonProps) {
  return (
    <Link
      href={href}
      className={cn(
        'fixed bottom-20 right-4 z-50',
        'flex items-center justify-center',
        'h-14 w-14 rounded-full',
        'bg-primary text-primary-foreground',
        'shadow-lg hover:shadow-xl',
        'transition-all duration-200',
        'hover:scale-105 active:scale-95',
        'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
        className
      )}
      aria-label="Créer une nouvelle offre"
    >
      <Plus className="h-6 w-6" />
    </Link>
  )
}
