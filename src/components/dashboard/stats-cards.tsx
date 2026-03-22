import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Clock, CheckCircle, FileEdit } from 'lucide-react'

interface StatsCardsProps {
  total: number
  pending: number
  completed: number
  drafts: number
}

export function StatsCards({ total, pending, completed, drafts }: StatsCardsProps) {
  const stats = [
    {
      title: 'Total Deeds',
      value: total,
      icon: FileText,
      description: 'All deeds in the system',
      color: 'text-blue-900',
      bg: 'bg-blue-50',
    },
    {
      title: 'Awaiting Signatures',
      value: pending,
      icon: Clock,
      description: 'Pending guarantor signatures',
      color: 'text-amber-700',
      bg: 'bg-amber-50',
    },
    {
      title: 'Completed',
      value: completed,
      icon: CheckCircle,
      description: 'Fully signed deeds',
      color: 'text-green-700',
      bg: 'bg-green-50',
    },
    {
      title: 'Drafts',
      value: drafts,
      icon: FileEdit,
      description: 'Deeds in draft status',
      color: 'text-slate-600',
      bg: 'bg-slate-100',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title} className="border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">{stat.title}</CardTitle>
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <p className={`text-3xl font-bold font-serif ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-slate-500 mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
