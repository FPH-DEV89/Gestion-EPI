"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, Plus, Trash2, Edit2, Check, AlertTriangle, Loader2, Sparkles, Layers } from "lucide-react"

interface ManageSizesDialogProps {
    isOpen: boolean
    onClose: () => void
    item: {
        id: string
        category: string
        label: string
        stock: Record<string, number>
        skuMetadata?: Record<string, any>
    }
    onSave: (itemId: string, newStock: Record<string, number>, newSkuMetadata?: Record<string, any>) => Promise<void>
}

interface SizeItemState {
    originalSizeKey: string // Key in existing stock, or empty for newly added
    currentSizeKey: string  // Current display/edited size key name
    qty: number
    isEditingKey: boolean
    tempKeyInput: string
}

export function ManageSizesDialog({ isOpen, onClose, item, onSave }: ManageSizesDialogProps) {
    const [sizesList, setSizesList] = useState<SizeItemState[]>([])
    const [newSizeName, setNewSizeName] = useState("")
    const [newSizeQty, setNewSizeQty] = useState<number>(0)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (item && item.stock) {
            const list: SizeItemState[] = Object.entries(item.stock).map(([size, qty]) => ({
                originalSizeKey: size,
                currentSizeKey: size,
                qty: qty,
                isEditingKey: false,
                tempKeyInput: size
            }))
            setSizesList(list)
        }
    }, [item, isOpen])

    if (!isOpen) return null

    const handleAddSize = () => {
        const key = newSizeName.trim().toUpperCase()
        if (!key) {
            setError("Le nom de la taille ne peut pas être vide.")
            return
        }
        if (sizesList.some(s => s.currentSizeKey === key)) {
            setError(`La taille '${key}' existe déjà.`)
            return
        }
        setError(null)
        setSizesList(prev => [
            ...prev,
            {
                originalSizeKey: "",
                currentSizeKey: key,
                qty: Math.max(0, newSizeQty),
                isEditingKey: false,
                tempKeyInput: key
            }
        ])
        setNewSizeName("")
        setNewSizeQty(0)
    }

    const handleRemoveSize = (index: number) => {
        if (sizesList.length <= 1) {
            setError("Un EPI doit conserver au moins une taille.")
            return
        }
        setError(null)
        setSizesList(prev => prev.filter((_, i) => i !== index))
    }

    const handleQtyChange = (index: number, valStr: string) => {
        const val = valStr === "" ? 0 : Math.max(0, parseInt(valStr) || 0)
        setSizesList(prev => prev.map((s, i) => i === index ? { ...s, qty: val } : s))
    }

    const handleStartEditingKey = (index: number) => {
        setSizesList(prev => prev.map((s, i) => i === index ? { ...s, isEditingKey: true, tempKeyInput: s.currentSizeKey } : s))
    }

    const handleSaveKeyEdit = (index: number) => {
        setError(null)
        const target = sizesList[index]
        const newKey = target.tempKeyInput.trim().toUpperCase()
        
        if (!newKey) {
            setError("Le nom de la taille ne peut pas être vide.")
            return
        }

        if (sizesList.some((s, i) => i !== index && s.currentSizeKey === newKey)) {
            setError(`La taille '${newKey}' existe déjà.`)
            return
        }

        setSizesList(prev => prev.map((s, i) => i === index ? { ...s, currentSizeKey: newKey, isEditingKey: false } : s))
    }

    const handleCancelKeyEdit = (index: number) => {
        setSizesList(prev => prev.map((s, i) => i === index ? { ...s, isEditingKey: false, tempKeyInput: s.currentSizeKey } : s))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        if (sizesList.length === 0) {
            setError("Au moins une taille est requise.")
            return
        }

        // Build new stock object
        const newStock: Record<string, number> = {}
        const newSkuMetadata: Record<string, any> = { ...(item.skuMetadata || {}) }

        for (const itemState of sizesList) {
            const finalKey = itemState.currentSizeKey
            newStock[finalKey] = itemState.qty

            // If key was renamed, copy metadata from original key if existed
            if (itemState.originalSizeKey && itemState.originalSizeKey !== finalKey) {
                if (newSkuMetadata[itemState.originalSizeKey]) {
                    newSkuMetadata[finalKey] = newSkuMetadata[itemState.originalSizeKey]
                    delete newSkuMetadata[itemState.originalSizeKey]
                }
            }
        }

        // Clean up deleted size keys from metadata
        const currentKeysSet = new Set(sizesList.map(s => s.currentSizeKey))
        Object.keys(newSkuMetadata).forEach(k => {
            if (!currentKeysSet.has(k)) {
                delete newSkuMetadata[k]
            }
        })

        setLoading(true)
        try {
            await onSave(item.id, newStock, newSkuMetadata)
            onClose()
        } catch (err: any) {
            setError(err?.message || "Erreur lors de l'enregistrement des tailles.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                            <Layers className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black tracking-tight">Gérer les tailles</h2>
                            <p className="text-xs text-blue-100 font-medium">
                                Modification des tailles pour : <span className="underline font-bold">{item.label}</span>
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        type="button"
                        className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center text-white"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {error && (
                        <div className="bg-red-50 text-red-700 border border-red-200 rounded-2xl p-4 text-xs font-bold flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 flex-shrink-0 text-red-500" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Add new size panel */}
                    <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-100 space-y-3">
                        <span className="text-xs font-black text-brand uppercase tracking-wider block">Ajouter une nouvelle taille</span>
                        <div className="flex items-center gap-2">
                            <Input
                                placeholder="Taille (ex: XL, 44, TU)"
                                value={newSizeName}
                                onChange={(e) => setNewSizeName(e.target.value)}
                                className="h-9 text-xs rounded-xl bg-white border-blue-200 font-bold uppercase"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault()
                                        handleAddSize()
                                    }
                                }}
                            />
                            <div className="w-32 flex-shrink-0">
                                <Input
                                    type="number"
                                    min="0"
                                    placeholder="Qté initial"
                                    value={newSizeQty === 0 ? "" : newSizeQty}
                                    onChange={(e) => setNewSizeQty(e.target.value === "" ? 0 : parseInt(e.target.value) || 0)}
                                    className="h-9 text-xs rounded-xl bg-white border-blue-200 font-bold text-center"
                                />
                            </div>
                            <Button
                                type="button"
                                onClick={handleAddSize}
                                className="h-9 bg-brand hover:bg-brand/90 text-white rounded-xl text-xs font-black px-4 flex-shrink-0"
                            >
                                <Plus className="w-4 h-4 mr-1 stroke-[3]" /> Ajouter
                            </Button>
                        </div>
                    </div>

                    {/* Existing sizes list */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center px-1">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tailles actuelles ({sizesList.length})</span>
                            <span className="text-[10px] text-slate-400 font-semibold">Stock total : {sizesList.reduce((acc, s) => acc + s.qty, 0)}</span>
                        </div>

                        <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                            {sizesList.map((sItem, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100 group transition-all hover:bg-slate-100/70">
                                    <div className="flex items-center gap-3 flex-1 mr-4">
                                        {sItem.isEditingKey ? (
                                            <div className="flex items-center gap-1">
                                                <Input
                                                    autoFocus
                                                    className="h-8 text-xs font-black text-slate-800 bg-white border-brand uppercase w-28 p-1"
                                                    value={sItem.tempKeyInput}
                                                    onChange={(e) => setSizesList(prev => prev.map((s, i) => i === idx ? { ...s, tempKeyInput: e.target.value } : s))}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault()
                                                            handleSaveKeyEdit(idx)
                                                        }
                                                        if (e.key === 'Escape') {
                                                            handleCancelKeyEdit(idx)
                                                        }
                                                    }}
                                                />
                                                <Button
                                                    type="button"
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-8 w-8 text-emerald-600 hover:bg-emerald-50"
                                                    onClick={() => handleSaveKeyEdit(idx)}
                                                >
                                                    <Check className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    type="button"
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-8 w-8 text-slate-400 hover:bg-slate-100"
                                                    onClick={() => handleCancelKeyEdit(idx)}
                                                >
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-black text-slate-800 bg-white px-3 py-1 rounded-xl border border-slate-200 shadow-sm min-w-[3rem] text-center">
                                                    {sItem.currentSizeKey}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleStartEditingKey(idx)}
                                                    className="text-slate-400 hover:text-brand p-1 rounded-lg hover:bg-slate-200/50 transition-colors"
                                                    title="Renommer la taille"
                                                >
                                                    <Edit2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase">Stock:</span>
                                            <Input
                                                type="number"
                                                min="0"
                                                className="h-8 w-20 text-xs font-black text-center bg-white border-slate-200 rounded-xl"
                                                value={sItem.qty}
                                                onChange={(e) => handleQtyChange(idx, e.target.value)}
                                            />
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => handleRemoveSize(idx)}
                                            className="text-slate-400 hover:text-red-600 p-2 rounded-xl hover:bg-red-50 transition-colors"
                                            title="Supprimer cette taille"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onClose}
                            className="rounded-xl font-bold text-slate-500"
                        >
                            Annuler
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="bg-brand hover:bg-brand/90 text-white rounded-xl px-6 font-bold shadow-md transition-all flex items-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Enregistrement...
                                </>
                            ) : (
                                <>
                                    <Check className="w-4 h-4 stroke-[3]" />
                                    Enregistrer les modifications
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
