'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { generatePdfAction } from '@/app/actions/documents'
import { toast } from 'sonner'
import { FileDown, Loader2 } from 'lucide-react'
import type { Document } from '@prisma/client'

interface GeneratePdfButtonProps {
  deedId: string
  existingDoc: Document | null
}

export function GeneratePdfButton({ deedId, existingDoc }: GeneratePdfButtonProps) {
  const [loading, setLoading] = useState(false)
  const [docId, setDocId] = useState(existingDoc?.id)

  if (docId) {
    return (
      <Button variant="outline" asChild>
        <a href={`/api/documents/${docId}`} target="_blank">
          <FileDown className="h-4 w-4 mr-2" />
          Download PDF
        </a>
      </Button>
    )
  }

  const handleGenerate = async () => {
    setLoading(true)
    const result = await generatePdfAction(deedId)
    setLoading(false)

    if (result.success) {
      setDocId(result.data.documentId)
      toast.success('PDF generated successfully')
    } else {
      toast.error(result.error)
    }
  }

  return (
    <Button variant="outline" onClick={handleGenerate} disabled={loading}>
      {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileDown className="h-4 w-4 mr-2" />}
      Generate PDF
    </Button>
  )
}
