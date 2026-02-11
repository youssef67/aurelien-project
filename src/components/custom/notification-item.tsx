'use client'

import { MessageSquare, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { formatRelativeDate } from '@/lib/utils/format'
import { NOTIFICATION_TYPE_CONFIG, type SerializedNotification } from '@/lib/utils/notifications'

interface NotificationItemProps {
  notification: SerializedNotification
  onClick: () => void
}

const ICON_COMPONENTS: Record<string, React.ReactNode> = {
  'message-square': <MessageSquare className="h-5 w-5" data-testid="icon-message-square" />,
  'check-circle': <CheckCircle className="h-5 w-5" data-testid="icon-check-circle" />,
}

export function NotificationItem({ notification, onClick }: NotificationItemProps) {
  const isUnread = !notification.read

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-start gap-3 w-full px-4 py-3 text-left transition-colors',
        isUnread ? 'bg-secondary' : 'text-muted-foreground'
      )}
    >
      <div className="flex-shrink-0 mt-0.5">
        {ICON_COMPONENTS[NOTIFICATION_TYPE_CONFIG[notification.type].icon]}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm truncate">{notification.title}</span>
          {isUnread && (
            <span
              data-testid="unread-dot"
              className="h-2 w-2 rounded-full bg-primary flex-shrink-0"
            />
          )}
        </div>
        <p className="text-sm truncate">{notification.body}</p>
        <time className="text-xs text-muted-foreground">
          {formatRelativeDate(notification.createdAt)}
        </time>
      </div>
    </button>
  )
}
