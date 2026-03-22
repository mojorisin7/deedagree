import { notFound } from 'next/navigation'
import Link from 'next/link'
import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { DeedStatusBadge } from '@/components/deeds/deed-status-badge'
import { formatCurrency, formatDate, formatGoverningLaw, formatGuaranteeType } from '@/lib/formatting'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { GuarantorStatusPanel } from '@/components/guarantors/guarantor-status-panel'
import { SendInvitesButton } from '@/components/deeds/send-invites-button'
import { GeneratePdfButton } from '@/components/deeds/generate-pdf-button'
import { Edit, Building2, Home, FileText, Users, ClipboardList } from 'lucide-react'
import type { DeedWithRelations } from '@/types'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function DeedDetailPage({ params }: PageProps) {
  const { id } = await params
  const session = await auth()

  const deed = await prisma.deed.findUnique({
    where: { id, deletedAt: null },
    include: {
      guarantors: { orderBy: { sortOrder: 'asc' } },
      createdBy: true,
      organisation: true,
      documents: { orderBy: { createdAt: 'desc' } },
    },
  })

  if (!deed) notFound()

  const auditLogs = await prisma.auditLog.findMany({
    where: { deedId: id },
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: { user: { select: { name: true, email: true } } },
  })

  const canEdit = deed.status === 'DRAFT'
  const canSendInvites = ['DRAFT', 'PENDING_SIGNATURES', 'PARTIALLY_SIGNED'].includes(deed.status)

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="font-mono text-sm text-slate-500">{deed.reference}</span>
            <DeedStatusBadge status={deed.status} />
          </div>
          <h2 className="text-2xl font-serif font-bold text-slate-900">{deed.companyName}</h2>
          <p className="text-slate-500 text-sm mt-1">{deed.propertyAddress}</p>
        </div>
        <div className="flex gap-2">
          {canEdit && (
            <Button variant="outline" asChild>
              <Link href={`/deeds/${id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Link>
            </Button>
          )}
          {canSendInvites && <SendInvitesButton deedId={id} />}
          {['FULLY_SIGNED', 'COMPLETED'].includes(deed.status) && (
            <GeneratePdfButton deedId={id} existingDoc={deed.documents[0] ?? null} />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Company Details */}
          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Building2 className="h-4 w-4 text-slate-500" />
                Company Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div><span className="text-slate-500">Company Name</span><p className="font-medium">{deed.companyName}</p></div>
                <div><span className="text-slate-500">Reg. Number</span><p className="font-medium font-mono">{deed.companyRegNumber}</p></div>
              </div>
              <div><span className="text-slate-500">Registered Address</span><p className="font-medium whitespace-pre-line">{deed.companyAddress}</p></div>
              {deed.directorName && <div><span className="text-slate-500">Director</span><p className="font-medium">{deed.directorName}</p></div>}
            </CardContent>
          </Card>

          {/* Property & Mortgage */}
          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Home className="h-4 w-4 text-slate-500" />
                Property & Mortgage
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div><span className="text-slate-500">Property Address</span><p className="font-medium whitespace-pre-line">{deed.propertyAddress}</p></div>
              {deed.titleNumber && <div><span className="text-slate-500">Title Number</span><p className="font-medium font-mono">{deed.titleNumber}</p></div>}
              <div className="grid grid-cols-2 gap-2">
                <div><span className="text-slate-500">Mortgage Amount</span><p className="font-bold text-lg text-blue-900">{formatCurrency(deed.mortgageAmount)}</p></div>
                <div><span className="text-slate-500">Lender</span><p className="font-medium">{deed.lender}</p></div>
              </div>
              {deed.mortgageStartDate && (
                <div><span className="text-slate-500">Start Date</span><p className="font-medium">{formatDate(deed.mortgageStartDate)}</p></div>
              )}
            </CardContent>
          </Card>

          {/* Guarantee Terms */}
          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4 text-slate-500" />
                Guarantee Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div><span className="text-slate-500">Guarantee Type</span><p className="font-medium">{formatGuaranteeType(deed.guaranteeType)}</p></div>
                {deed.limitedAmount && <div><span className="text-slate-500">Max Guarantee</span><p className="font-medium">{formatCurrency(deed.limitedAmount)}</p></div>}
                <div><span className="text-slate-500">Governing Law</span><p className="font-medium">{formatGoverningLaw(deed.governingLaw)}</p></div>
              </div>
              <div className="flex gap-4 flex-wrap mt-2">
                {deed.jointAndSeveral && <span className="text-xs bg-slate-100 px-2 py-1 rounded">Joint & Several</span>}
                {deed.includesInterest && <span className="text-xs bg-slate-100 px-2 py-1 rounded">Includes Interest</span>}
                {deed.includesCosts && <span className="text-xs bg-slate-100 px-2 py-1 rounded">Includes Costs</span>}
                {deed.requiresILA && <span className="text-xs bg-slate-100 px-2 py-1 rounded">ILA Required</span>}
              </div>
              {deed.specialConditions && (
                <div className="mt-2">
                  <span className="text-slate-500">Special Conditions</span>
                  <p className="font-medium whitespace-pre-line mt-1">{deed.specialConditions}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Documents */}
          {deed.documents.length > 0 && (
            <Card className="border-slate-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Documents</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {deed.documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                    <div>
                      <p className="text-sm font-medium">{doc.filename}</p>
                      <p className="text-xs text-slate-500">{formatDate(doc.createdAt)} · {Math.round(doc.sizeBytes / 1024)} KB</p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <a href={`/api/documents/${doc.id}`} target="_blank">Download</a>
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Audit Log */}
          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-slate-500" />
                Audit Trail
              </CardTitle>
            </CardHeader>
            <CardContent>
              {auditLogs.length === 0 ? (
                <p className="text-sm text-slate-500">No audit records.</p>
              ) : (
                <div className="space-y-2">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="flex items-start gap-3 py-2 border-b border-slate-50 last:border-0">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-mono font-medium text-slate-700">{log.action}</p>
                        {log.user && <p className="text-xs text-slate-500">{log.user.name ?? log.user.email}</p>}
                        {log.metadata && Object.keys(log.metadata as object).length > 0 && (
                          <p className="text-xs text-slate-400 mt-0.5 truncate">
                            {JSON.stringify(log.metadata)}
                          </p>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 shrink-0">{formatDate(log.createdAt)}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <GuarantorStatusPanel deed={deed as DeedWithRelations} />

          <Card className="border-slate-200">
            <CardContent className="p-4 text-sm space-y-2">
              <div><span className="text-slate-500 text-xs">Created by</span><p className="font-medium">{deed.createdBy.name ?? deed.createdBy.email}</p></div>
              <div><span className="text-slate-500 text-xs">Created on</span><p className="font-medium">{formatDate(deed.createdAt)}</p></div>
              <div><span className="text-slate-500 text-xs">Last updated</span><p className="font-medium">{formatDate(deed.updatedAt)}</p></div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
