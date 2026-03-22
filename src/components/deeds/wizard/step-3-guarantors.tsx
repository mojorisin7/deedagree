'use client'

import { useState } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Button } from '@/components/ui/button'
import { GuarantorFormDialog } from './guarantor-form-dialog'
import { GripVertical, Plus, Pencil, Trash2, Mail, User } from 'lucide-react'
import type { GuarantorFormData } from '@/types'
import { nanoid } from 'nanoid'

function SortableGuarantor({
  guarantor,
  onEdit,
  onRemove,
}: {
  guarantor: GuarantorFormData
  onEdit: () => void
  onRemove: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: guarantor.id!,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg"
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab text-slate-400 hover:text-slate-600"
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-900">{guarantor.fullName}</p>
        <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
          <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{guarantor.email}</span>
          {guarantor.relationshipToCompany && (
            <span className="flex items-center gap-1"><User className="h-3 w-3" />{guarantor.relationshipToCompany}</span>
          )}
        </div>
      </div>
      <div className="flex gap-1">
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onEdit}>
          <Pencil className="h-3 w-3" />
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-700" onClick={onRemove}>
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}

interface Step3Props {
  initialData: GuarantorFormData[]
  onNext: (data: GuarantorFormData[]) => void
  onBack: () => void
}

export function Step3Guarantors({ initialData, onNext, onBack }: Step3Props) {
  const [guarantors, setGuarantors] = useState<GuarantorFormData[]>(
    initialData.map((g) => ({ ...g, id: g.id ?? nanoid() }))
  )
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<GuarantorFormData | undefined>()
  const [error, setError] = useState('')

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = guarantors.findIndex((g) => g.id === active.id)
      const newIndex = guarantors.findIndex((g) => g.id === over.id)
      setGuarantors(arrayMove(guarantors, oldIndex, newIndex))
    }
  }

  const handleSave = (data: GuarantorFormData) => {
    if (data.id && guarantors.some((g) => g.id === data.id)) {
      setGuarantors(guarantors.map((g) => (g.id === data.id ? data : g)))
    } else {
      setGuarantors([...guarantors, { ...data, id: nanoid() }])
    }
  }

  const handleRemove = (id: string) => {
    setGuarantors(guarantors.filter((g) => g.id !== id))
  }

  const handleNext = () => {
    if (guarantors.length === 0) {
      setError('At least one guarantor is required')
      return
    }
    setError('')
    onNext(guarantors)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">
          Add guarantors and drag to set signing order.
        </p>
        <Button
          type="button"
          size="sm"
          onClick={() => { setEditTarget(undefined); setDialogOpen(true) }}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Guarantor
        </Button>
      </div>

      {guarantors.length === 0 ? (
        <div className="border-2 border-dashed border-slate-200 rounded-lg p-8 text-center text-slate-400">
          <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No guarantors added yet</p>
          <p className="text-xs mt-1">Click "Add Guarantor" to get started</p>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={guarantors.map((g) => g.id!)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {guarantors.map((g) => (
                <SortableGuarantor
                  key={g.id}
                  guarantor={g}
                  onEdit={() => { setEditTarget(g); setDialogOpen(true) }}
                  onRemove={() => handleRemove(g.id!)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex justify-between pt-2">
        <Button type="button" variant="outline" onClick={onBack}>← Back</Button>
        <Button type="button" onClick={handleNext}>Next: Terms →</Button>
      </div>

      <GuarantorFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleSave}
        initialData={editTarget}
      />
    </div>
  )
}
