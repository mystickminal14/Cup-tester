import { statusLabel, type Status } from './api'

const styles: Record<Status, string> = {
  interested: 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400',
  registered: 'bg-green-50 text-green-600 dark:bg-green-950/60 dark:text-green-400',
}

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ${styles[status]}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {statusLabel[status]}
    </span>
  )
}
