"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createNewStockItem } from "@/app/actions"
import { Plus, X, ShieldAlert, Sparkles, Loader2 } from "lucide-react"

interface AddEpiDialogProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: (newItem: any) => void
}

type SizePreset = 'TU' | 'CLOTHING' | 'SHOES' | 'CUSTOM'

const CLOTHING_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "3XL"]
const SHOE_SIZES = ["35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46", "47", "48"]

export function AddEpiDialog({ isOpen, onClose, onSuccess }: AddEpiDialogProps) {
    const [label, setLabel] = useState("")
    const [category, setCategory] = useState("")
    const [autoCategory, setAutoCategory] = useState(true)
    const [price, setPrice] = useState<number | "">(10)
    const [minThreshold, setMinThreshold] = useState<number | "">(5)
    const [sizePreset, setSizePreset] = useState<SizePreset>('TU')
    const [customStock, setCustomStock] = useState<Record<string, number>>({ "TU": 10 })
    const [defaultQty, setDefaultQty] = useState<number>(10)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    if (!isOpen) return null

    // Auto-generate category code based on label
    const handleLabelChange = (val: string) => {
        setLabel(val)
        if (autoCategory) {
            const slug = val
                .toUpperCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/[^A-Z0-9\s]/g, "")
                .trim()
                .replace(/\s+/g, "_")
            setCategory(slug)
        }
    }

    const handlePresetChange = (preset: SizePreset) => {
        setSizePreset(preset)
        if (preset === 'TU') {
            setCustomStock({ "TU": defaultQty })
        } else if (preset === 'CLOTHING') {
            const stockObj: Record<string, number> = {}
            CLOTHING_SIZES.forEach(s => stockObj[s] = defaultQty)
            setCustomStock(stockObj)
        } else if (preset === 'SHOES') {
            const stockObj: Record<string, number> = {}
            SHOE_SIZES.forEach(s => stockObj[s] = defaultQty)
            setCustomStock(stockObj)
        }
    }

    const handleQtyChange = (sizeKey: string, qtyVal: string) => {
        const val = qtyVal === "" ? 0 : Math.max(0, parseInt(qtyVal) || 0)
        setCustomStock(prev => ({
            ...prev,
            [sizeKey]: val
        }))
    }

    const handleAddCustomSize = (sizeName: string) => {
        const key = sizeName.trim().toUpperCase()
        if (key && !(key in customStock)) {
            setCustomStock(prev => ({
                ...prev,
                [key]: defaultQty
            }))
        }
    }

    const handleRemoveSize = (sizeKey: string) => {
        setCustomStock(prev => {
            const next = { ...prev }
            delete next[sizeKey]
            return next
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        if (!label.trim()) {
            setError("Le nom de l'équipement est obligatoire.")
            return
        }

        if (!category.trim()) {
            setError("Le code catégorie est obligatoire.")
            return
        }

        if (Object.keys(customStock).length === 0) {
            setError("Au moins une taille doit être définie.")
            return
        }

        setLoading(true)

        try {
            const res = await createNewStockItem({
                label: label.trim(),
                category: category.trim(),
                minThreshold: typeof minThreshold === "number" ? minThreshold : 5,
                price: typeof price === "number" ? price : 0,
                stock: customStock
            })

            if (res.success) {
                onSuccess(res.item)
                onClose()
            } else {
                setError(res.error || "Erreur lors de la création de l'EPI.")
            }
        } catch (err: any) {
            setError("Erreur inattendue : " + err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8">
                {/* Modal Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black tracking-tight">Ajouter un nouvel EPI</h2>
                            <p className="text-xs text-blue-100 font-medium">Ajoutez un nouvel équipement au catalogue global de l&apos;entrepôt</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center text-white"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Modal Body / Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {error && (
                        <div className="bg-red-50 text-red-700 border border-red-200 rounded-2xl p-4 text-xs font-bold flex items-center gap-2">
                            <ShieldAlert className="w-4 h-4 flex-shrink-0 text-red-500" />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold text-slate-700">Nom de l&apos;EPI *</Label>
                            <Input
                                placeholder="ex: Casque anti-bruit SNR 32dB"
                                value={label}
                                onChange={(e) => handleLabelChange(e.target.value)}
                                className="rounded-xl border-slate-200"
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex justify-between items-center">
                                <Label className="text-xs font-bold text-slate-700">Code Catégorie *</Label>
                                <button
                                    type="button"
                                    onClick={() => setAutoCategory(!autoCategory)}
                                    className="text-[10px] font-bold text-brand hover:underline"
                                >
                                    {autoCategory ? "Manuel" : "Auto"}
                                </button>
                            </div>
                            <Input
                                placeholder="ex: PROTECTION_AUDITIVE"
                                value={category}
                                onChange={(e) => {
                                    setAutoCategory(false)
                                    setCategory(e.target.value.toUpperCase().replace(/\s+/g, '_'))
                                }}
                                className="rounded-xl border-slate-200 font-mono text-xs uppercase"
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold text-slate-700">Prix unitaire (€) *</Label>
                            <Input
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="10.00"
                                value={price}
                                onChange={(e) => setPrice(e.target.value === "" ? "" : parseFloat(e.target.value) || 0)}
                                className="rounded-xl border-slate-200"
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold text-slate-700">Seuil d&apos;alerte stock min *</Label>
                            <Input
                                type="number"
                                min="0"
                                placeholder="5"
                                value={minThreshold}
                                onChange={(e) => setMinThreshold(e.target.value === "" ? "" : parseInt(e.target.value) || 0)}
                                className="rounded-xl border-slate-200"
                                required
                            />
                        </div>
                    </div>

                    {/* Size Presets Selection */}
                    <div className="space-y-3 pt-2 border-t border-slate-100">
                        <Label className="text-xs font-bold text-slate-700">Configuration des Tailles & Stock Initial</Label>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            <button
                                type="button"
                                onClick={() => handlePresetChange('TU')}
                                className={`p-3 rounded-2xl border text-center text-xs font-bold transition-all ${
                                    sizePreset === 'TU'
                                        ? 'border-brand bg-blue-50 text-brand shadow-sm ring-2 ring-brand/20'
                                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-600'
                                }`}
                            >
                                Taille Unique (TU)
                            </button>
                            <button
                                type="button"
                                onClick={() => handlePresetChange('CLOTHING')}
                                className={`p-3 rounded-2xl border text-center text-xs font-bold transition-all ${
                                    sizePreset === 'CLOTHING'
                                        ? 'border-brand bg-blue-50 text-brand shadow-sm ring-2 ring-brand/20'
                                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-600'
                                }`}
                            >
                                Vêtements (XS-3XL)
                            </button>
                            <button
                                type="button"
                                onClick={() => handlePresetChange('SHOES')}
                                className={`p-3 rounded-2xl border text-center text-xs font-bold transition-all ${
                                    sizePreset === 'SHOES'
                                        ? 'border-brand bg-blue-50 text-brand shadow-sm ring-2 ring-brand/20'
                                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-600'
                                }`}
                            >
                                Pointures (35-48)
                            </button>
                            <button
                                type="button"
                                onClick={() => handlePresetChange('CUSTOM')}
                                className={`p-3 rounded-2xl border text-center text-xs font-bold transition-all ${
                                    sizePreset === 'CUSTOM'
                                        ? 'border-brand bg-blue-50 text-brand shadow-sm ring-2 ring-brand/20'
                                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-600'
                                }`}
                            >
                                Personnalisé
                            </button>
                        </div>

                        {/* Quantities Grid */}
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Quantités initiales par taille</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-slate-400 font-semibold">Qté par défaut:</span>
                                    <input
                                        type="number"
                                        min="0"
                                        className="w-14 h-6 text-xs text-center border border-slate-200 rounded-lg bg-white font-bold"
                                        value={defaultQty}
                                        onChange={(e) => {
                                            const newDef = parseInt(e.target.value) || 0
                                            setDefaultQty(newDef)
                                            setCustomStock(prev => {
                                                const updated: Record<string, number> = {}
                                                Object.keys(prev).forEach(k => updated[k] = newDef)
                                                return updated
                                            })
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 max-h-48 overflow-y-auto p-1">
                                {Object.entries(customStock).map(([sKey, qty]) => (
                                    <div key={sKey} className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center space-y-1 relative group">
                                        <span className="text-[11px] font-black text-slate-700">{sKey}</span>
                                        <input
                                            type="number"
                                            min="0"
                                            className="w-full h-7 text-xs text-center font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg"
                                            value={qty}
                                            onChange={(e) => handleQtyChange(sKey, e.target.value)}
                                        />
                                        {Object.keys(customStock).length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveSize(sKey)}
                                                className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                ×
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {sizePreset === 'CUSTOM' && (
                                <div className="flex gap-2 pt-2 border-t border-slate-200/60">
                                    <Input
                                        placeholder="Nouvelle taille (ex: XL, 42...)"
                                        id="new-size-input"
                                        className="h-8 text-xs rounded-lg bg-white"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault()
                                                handleAddCustomSize((e.target as HTMLInputElement).value)
                                                ;(e.target as HTMLInputElement).value = ""
                                            }
                                        }}
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="h-8 text-xs font-bold rounded-lg"
                                        onClick={() => {
                                            const inputEl = document.getElementById('new-size-input') as HTMLInputElement
                                            if (inputEl && inputEl.value) {
                                                handleAddCustomSize(inputEl.value)
                                                inputEl.value = ""
                                            }
                                        }}
                                    >
                                        <Plus className="w-3.5 h-3.5 mr-1" /> Ajouter taille
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Modal Footer */}
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
                                    Création en cours...
                                </>
                            ) : (
                                <>
                                    <Plus className="w-4 h-4 stroke-[3]" />
                                    Créer cet EPI
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
