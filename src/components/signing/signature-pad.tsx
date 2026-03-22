'use client'

import { useRef, forwardRef, useImperativeHandle } from 'react'
import { Button } from '@/components/ui/button'
import { Eraser } from 'lucide-react'

export interface SignaturePadHandle {
  getDataUrl: () => string | null
  isEmpty: () => boolean
  clear: () => void
}

interface SignaturePadProps {
  label?: string
}

export const SignaturePad = forwardRef<SignaturePadHandle, SignaturePadProps>(
  function SignaturePad({ label }, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const drawingRef = useRef(false)
    const hasDrawnRef = useRef(false)
    const pointsRef = useRef<{ x: number; y: number; color: string }[]>([])

    useImperativeHandle(ref, () => ({
      getDataUrl: () => {
        if (!hasDrawnRef.current || !canvasRef.current) return null
        return canvasRef.current.toDataURL('image/png')
      },
      isEmpty: () => !hasDrawnRef.current,
      clear: () => {
        if (!canvasRef.current) return
        const ctx = canvasRef.current.getContext('2d')
        if (ctx) {
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
        }
        hasDrawnRef.current = false
        pointsRef.current = []
      },
    }))

    const getPos = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
      const rect = canvas.getBoundingClientRect()
      const scaleX = canvas.width / rect.width
      const scaleY = canvas.height / rect.height
      if ('touches' in e) {
        return {
          x: (e.touches[0].clientX - rect.left) * scaleX,
          y: (e.touches[0].clientY - rect.top) * scaleY,
        }
      }
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      }
    }

    const startDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
      e.preventDefault()
      drawingRef.current = true
      hasDrawnRef.current = true
      const canvas = canvasRef.current!
      const ctx = canvas.getContext('2d')!
      const pos = getPos(e, canvas)
      ctx.beginPath()
      ctx.moveTo(pos.x, pos.y)
    }

    const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
      e.preventDefault()
      if (!drawingRef.current || !canvasRef.current) return
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')!
      const pos = getPos(e, canvas)
      ctx.lineWidth = 2
      ctx.lineCap = 'round'
      ctx.strokeStyle = '#1a237e'
      ctx.lineTo(pos.x, pos.y)
      ctx.stroke()
    }

    const stopDraw = () => {
      drawingRef.current = false
    }

    const handleClear = () => {
      if (!canvasRef.current) return
      const ctx = canvasRef.current.getContext('2d')
      if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
      hasDrawnRef.current = false
    }

    return (
      <div className="space-y-2">
        {label && <p className="text-sm font-medium text-slate-700">{label}</p>}
        <div className="border border-slate-300 rounded-lg bg-white overflow-hidden">
          <canvas
            ref={canvasRef}
            width={600}
            height={160}
            style={{ width: '100%', height: '160px', touchAction: 'none', cursor: 'crosshair' }}
            onMouseDown={startDraw}
            onMouseMove={draw}
            onMouseUp={stopDraw}
            onMouseLeave={stopDraw}
            onTouchStart={startDraw}
            onTouchMove={draw}
            onTouchEnd={stopDraw}
          />
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="text-slate-500"
        >
          <Eraser className="h-3 w-3 mr-1" />
          Clear
        </Button>
      </div>
    )
  }
)
