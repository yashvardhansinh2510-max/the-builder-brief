'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

export type Customer = {
  id: number | string
  date: string
  status: 'Shipped' | 'Building' | 'Ref'
  statusVariant: 'success' | 'warning' | 'info'
  name: string
  avatar: string
  revenue: string
}

export type CustomersTableCardProps = {
  title?: string
  subtitle?: string
  className?: string
  customers?: Customer[]
}

const DEFAULT_CUSTOMERS: Customer[] = [
  {
    id: 1,
    date: '10/31/2023',
    status: 'Shipped',
    statusVariant: 'success',
    name: 'Saurabh, CEO',
    avatar: 'https://avatars.githubusercontent.com/u/47919550?v=4',
    revenue: '$43.9k',
  },
  {
    id: 2,
    date: '10/21/2023',
    status: 'Building',
    statusVariant: 'warning',
    name: 'Alex Rodriguez',
    avatar: 'https://avatars.githubusercontent.com/u/31113941?v=4',
    revenue: '$12.4k',
  },
  {
    id: 3,
    date: '10/15/2023',
    status: 'Shipped',
    statusVariant: 'success',
    name: 'Sarah Chen',
    avatar: 'https://avatars.githubusercontent.com/u/68236786?v=4',
    revenue: '$99.1k',
  },
  {
    id: 4,
    date: '10/12/2023',
    status: 'Building',
    statusVariant: 'warning',
    name: 'David Kim',
    avatar: 'https://avatars.githubusercontent.com/u/99137927?v=4',
    revenue: '$8.2k',
  },
]

const Badge = ({
  children,
  variant,
}: {
  children: React.ReactNode
  variant: 'success' | 'danger' | 'warning' | 'info'
}) => {
  const styles =
    variant === 'success'
      ? 'bg-lime-500/15 text-lime-800 dark:text-lime-300'
      : variant === 'danger'
      ? 'bg-red-500/15 text-red-800 dark:text-red-300'
      : variant === 'warning'
      ? 'bg-yellow-500/15 text-yellow-800 dark:text-yellow-300'
      : 'bg-blue-500/15 text-blue-800 dark:text-blue-300'

  return (
    <span className={cn('rounded-full px-2 py-1 text-xs font-medium', styles)}>
      {children}
    </span>
  )
}

export default function CustomersTableCard({
  title = 'Recently Shipped Projects',
  subtitle = 'Founders using our blueprints to ship real products in record time.',
  customers = DEFAULT_CUSTOMERS,
  className,
}: CustomersTableCardProps) {
  return (
    <section
      className={cn(
        'bg-card shadow-foreground/5 inset-ring-1 inset-ring-background ring-foreground/5 relative w-full overflow-hidden rounded-2xl border border-border/60 shadow-md ring-1',
        className
      )}
      aria-label={title}
    >
      {/* Header */}
      <div className="space-y-1 border-b border-border/60 p-6">
        <div className="flex items-center gap-1.5">
          <span className="bg-primary/40 size-2 rounded-full border border-black/5" />
          <span className="bg-primary/40 size-2 rounded-full border border-black/5" />
          <span className="bg-primary/40 size-2 rounded-full border border-black/5" />
        </div>
        <h2 className="text-lg font-semibold leading-none tracking-tight">{title}</h2>
        <p className="text-muted-foreground text-sm">{subtitle}</p>
      </div>

      {/* Table wrapper for responsive overflow */}
      <div className="overflow-x-auto">
        <table className="min-w-[640px] w-full border-collapse text-sm">
          <thead className="bg-muted/50 supports-[backdrop-filter]:backdrop-blur-sm sticky top-0 z-10">
            <tr className="text-muted-foreground *:text-left *:px-3 *:py-3 *:font-medium">
              <th className="w-12">#</th>
              <th className="min-w-[120px]">Date</th>
              <th className="min-w-[120px]">Status</th>
              <th className="min-w-[220px]">Founder</th>
              <th className="min-w-[120px] text-right pr-4">Project Revenue</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer, idx) => (
              <tr
                key={customer.id}
                className="hover:bg-muted/30 transition-colors *:px-3 *:py-2 border-b border-border/60 last:border-0"
              >
                <td className="text-muted-foreground">{idx + 1}</td>
                <td className="whitespace-nowrap">{customer.date}</td>
                <td>
                  <Badge variant={customer.statusVariant as any}>{customer.status}</Badge>
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    <div className="size-7 overflow-hidden rounded-full ring-1 ring-border/60">
                      <img
                        src={customer.avatar}
                        alt={customer.name}
                        width={28}
                        height={28}
                        loading="lazy"
                      />
                    </div>
                    <span className="text-foreground font-medium truncate">{customer.name}</span>
                  </div>
                </td>
                <td className="text-right pr-4 font-medium tabular-nums">{customer.revenue}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer (optional) */}
      <div className="flex items-center justify-between border-t border-border/60 p-4 text-xs text-muted-foreground">
        <span>
          Tracking <strong>{customers.length}</strong> active builds
        </span>
        <span>Updated live</span>
      </div>
    </section>
  )
}
