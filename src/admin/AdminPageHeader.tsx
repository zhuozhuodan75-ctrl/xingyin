import type { ReactNode } from 'react'

export function AdminPageHeader({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1a1a1a] tracking-tight">{title}</h1>
        {description && (
          <p className="text-sm text-[#888] mt-1.5">{description}</p>
        )}
      </div>
      {action}
    </div>
  )
}

export function AdminEmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof import('lucide-react').FileAudio
  title: string
  description?: string
}) {
  return (
    <div className="py-16 px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[#2D5016]/8 flex items-center justify-center mx-auto mb-4">
        <Icon size={28} className="text-[#2D5016]/60" strokeWidth={1.5} />
      </div>
      <p className="text-base font-medium text-[#555]">{title}</p>
      {description && (
        <p className="text-sm text-[#aaa] mt-1.5 max-w-sm mx-auto">{description}</p>
      )}
    </div>
  )
}

export function AdminCard({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={`bg-white rounded-2xl border border-[#E8EBEF] shadow-[0_1px_3px_rgba(0,0,0,0.04)] ${className}`}>
      {children}
    </div>
  )
}
