"use client"

import { useRef, useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Eraser, Check, X } from "lucide-react"

interface SignaturePadProps {
    employeeName: string
    onConfirm: (signatureData: string) => void
    onCancel: () => void
    isSubmitting?: boolean
}

export default function SignaturePad({ employeeName, onConfirm, onCancel, isSubmitting = false }: SignaturePadProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [isDrawing, setIsDrawing] = useState(false)
    const [hasDrawn, setHasDrawn] = useState(false)

    // Setup canvas with proper DPI scaling
    const setupCanvas = useCallback(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const container = canvas.parentElement
        if (!container) return

        const dpr = window.devicePixelRatio || 1
        const rect = container.getBoundingClientRect()

        canvas.width = rect.width * dpr
        canvas.height = rect.height * dpr
        canvas.style.width = `${rect.width}px`
        canvas.style.height = `${rect.height}px`

        const ctx = canvas.getContext("2d")
        if (!ctx) return

        ctx.scale(dpr, dpr)
        ctx.lineCap = "round"
        ctx.lineJoin = "round"
        ctx.lineWidth = 2.5
        ctx.strokeStyle = "#1e293b"

        // Draw signature line
        ctx.beginPath()
        ctx.strokeStyle = "#e2e8f0"
        ctx.lineWidth = 1
        ctx.setLineDash([4, 4])
        ctx.moveTo(30, rect.height - 50)
        ctx.lineTo(rect.width - 30, rect.height - 50)
        ctx.stroke()
        ctx.setLineDash([])

        // Reset drawing style
        ctx.strokeStyle = "#1e293b"
        ctx.lineWidth = 2.5
    }, [])

    useEffect(() => {
        setupCanvas()
        window.addEventListener("resize", setupCanvas)
        return () => window.removeEventListener("resize", setupCanvas)
    }, [setupCanvas])

    const getPosition = (e: React.TouchEvent | React.MouseEvent) => {
        const canvas = canvasRef.current
        if (!canvas) return { x: 0, y: 0 }

        const rect = canvas.getBoundingClientRect()

        if ("touches" in e) {
            const touch = e.touches[0]
            return { x: touch.clientX - rect.left, y: touch.clientY - rect.top }
        }
        return { x: (e as React.MouseEvent).clientX - rect.left, y: (e as React.MouseEvent).clientY - rect.top }
    }

    const startDrawing = (e: React.TouchEvent | React.MouseEvent) => {
        e.preventDefault()
        const ctx = canvasRef.current?.getContext("2d")
        if (!ctx) return

        const pos = getPosition(e)
        ctx.beginPath()
        ctx.moveTo(pos.x, pos.y)
        setIsDrawing(true)
        setHasDrawn(true)
    }

    const draw = (e: React.TouchEvent | React.MouseEvent) => {
        e.preventDefault()
        if (!isDrawing) return

        const ctx = canvasRef.current?.getContext("2d")
        if (!ctx) return

        const pos = getPosition(e)
        ctx.lineTo(pos.x, pos.y)
        ctx.stroke()
    }

    const stopDrawing = (e: React.TouchEvent | React.MouseEvent) => {
        e.preventDefault()
        setIsDrawing(false)
    }

    const clearCanvas = () => {
        setHasDrawn(false)
        setupCanvas()
    }

    const handleConfirm = () => {
        const canvas = canvasRef.current
        if (!canvas) return

        const signatureData = canvas.toDataURL("image/png")
        onConfirm(signatureData)
    }

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="text-center pb-5 border-b border-slate-100">
                <div className="w-14 h-14 rounded-[18px] bg-[#135bec] flex items-center justify-center text-white font-black text-xl mx-auto mb-3 shadow-lg shadow-blue-200">
                    {employeeName.charAt(0)}
                </div>
                <h3 className="text-xl font-black text-slate-800 tracking-tight">Signature de remise</h3>
                <p className="text-sm text-slate-400 font-medium mt-1">
                    <span className="font-black text-slate-600">{employeeName}</span> confirme avoir reçu ses EPI
                </p>
            </div>

            {/* Canvas area */}
            <div className="flex-1 my-5 relative">
                <div
                    className="w-full bg-white border-2 border-dashed border-slate-200 rounded-[28px] overflow-hidden relative"
                    style={{ height: "220px" }}
                >
                    <canvas
                        ref={canvasRef}
                        className="absolute inset-0 w-full h-full cursor-crosshair touch-none"
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                    />
                    {!hasDrawn && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <p className="text-slate-300 font-bold text-sm">Signez ici avec le doigt ✍️</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-2">
                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        onClick={clearCanvas}
                        disabled={!hasDrawn || isSubmitting}
                        className="flex-1 rounded-[20px] h-14 text-base font-black border-slate-200 text-slate-500 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all"
                    >
                        <Eraser className="w-5 h-5 mr-2" />
                        Effacer
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={!hasDrawn || isSubmitting}
                        className="flex-[2] rounded-[20px] h-14 text-base font-black bg-emerald-500 hover:bg-emerald-600 text-white shadow-xl shadow-emerald-200 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Check className="w-5 h-5" />
                        )}
                        {isSubmitting ? "Enregistrement..." : "Confirmer la remise"}
                    </Button>
                </div>
                <Button
                    variant="ghost"
                    onClick={onCancel}
                    disabled={isSubmitting}
                    className="w-full rounded-[20px] h-12 text-sm font-bold text-slate-400 hover:text-slate-600"
                >
                    <X className="w-4 h-4 mr-2" />
                    Annuler — ne rien sauvegarder
                </Button>
            </div>
        </div>
    )
}
