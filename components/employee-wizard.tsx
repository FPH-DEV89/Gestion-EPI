"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { createRequests } from "@/app/actions"
import { sortSizes } from "@/lib/utils"
import { ChevronRight, ChevronLeft, CheckCircle2, User, HardHat, Ruler, Info } from "lucide-react"

interface StockItem {
    id: string
    category: string
    label: string
    stock: Record<string, number>
}

export default function EmployeeWizard({ stockItems }: { stockItems: StockItem[] }) {
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [form, setForm] = useState({
        employeeName: "",
        firstName: "",
        service: "",
        categories: [] as string[],
        sizes: {} as Record<string, string>,
        reason: ""
    })

    const next = () => setStep(s => s + 1)
    const back = () => setStep(s => s - 1)

    const toggleCategory = (category: string) => {
        setForm(prev => {
            if (prev.categories.includes(category)) {
                const { [category]: _, ...remainingSizes } = prev.sizes
                return {
                    ...prev,
                    categories: prev.categories.filter(c => c !== category),
                    sizes: remainingSizes
                }
            } else {
                return {
                    ...prev,
                    categories: [...prev.categories, category]
                }
            }
        })
    }

    const setSize = (category: string, size: string) => {
        setForm(prev => ({
            ...prev,
            sizes: { ...prev.sizes, [category]: size }
        }))
    }

    const handleSubmit = async () => {
        setLoading(true)
        const res = await createRequests({
            employeeName: form.employeeName,
            firstName: form.firstName,
            service: form.service,
            reason: form.reason,
            items: form.categories.map(cat => ({
                category: cat,
                size: form.sizes[cat]
            }))
        })
        if (res.success) setSuccess(true)
        setLoading(false)
    }

    if (success) {
        return (
            <Card className="max-w-md mx-auto text-center p-8 mt-10">
                <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <CardTitle className="mb-2">Demande Envoyée !</CardTitle>
                <CardDescription>
                    Tes demandes d'équipement ont bien été enregistrées et seront traitées par ton manager.
                </CardDescription>
                <Button className="mt-6 w-full" onClick={() => window.location.reload()}>
                    Nouvelle Demande
                </Button>
            </Card>
        )
    }

    return (
        <Card className="max-w-md mx-auto mt-10 shadow-2xl border-none rounded-4xl overflow-hidden bg-white dark:bg-slate-900/80 dark:backdrop-blur-2xl dark:ring-1 dark:ring-white/10">
            <CardHeader className="bg-transparent pt-10 pb-2 px-8">
                <CardTitle className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
                    {step === 2 ? "Quels EPI ?" : step === 3 ? "Tailles" : step === 4 ? "Motif" : "Demande EPI"}
                </CardTitle>
            </CardHeader>

            <CardContent className="px-8 pb-10 pt-4">
                {step === 1 && (
                    <div className="space-y-6">
                        <div>
                            <Input
                                className="bg-slate-50 border-none h-16 rounded-2xl px-6 text-lg placeholder:text-slate-300"
                                placeholder="Nom"
                                value={form.employeeName || ""}
                                onChange={e => setForm({ ...form, employeeName: e.target.value })}
                            />
                        </div>
                        <div>
                            <Input
                                className="bg-slate-50 dark:bg-slate-800/50 border-none h-16 rounded-2xl px-6 text-lg placeholder:text-slate-300"
                                placeholder="Prénom"
                                value={form.firstName || ""}
                                onChange={e => setForm({ ...form, firstName: e.target.value })}
                            />
                        </div>
                        <div>
                            <select
                                className="w-full bg-slate-50 dark:bg-slate-800/50 border-none h-16 rounded-2xl px-6 text-lg text-slate-500 dark:text-slate-300 appearance-none outline-none focus:ring-2 focus:ring-brand/20 transition-all font-medium"
                                value={form.service || ""}
                                onChange={e => setForm({ ...form, service: e.target.value })}
                            >
                                <option value="" disabled className="dark:bg-slate-900">Service...</option>
                                {["LAD", "MAG", "REA", "GDS", "EXPE", "RECEP", "TECHNIQUE", "ENCADREMENT"].map(s => (
                                    <option key={s} value={s} className="dark:bg-slate-900">{s}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-4">
                        <Label>Type d'Équipement (plusieurs choix possibles)</Label>
                        <div className="grid grid-cols-1 gap-2">
                            {stockItems.map(item => (
                                <Button
                                    key={item.id}
                                    variant={form.categories.includes(item.category) ? "default" : "outline"}
                                    className="justify-start h-14"
                                    onClick={() => toggleCategory(item.category)}
                                >
                                    <div className="flex items-center justify-between w-full">
                                        <span>{item.label}</span>
                                        {form.categories.includes(item.category) && <CheckCircle2 className="w-4 h-4" />}
                                    </div>
                                </Button>
                            ))}
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-6">
                        {form.categories.map(cat => {
                            const item = stockItems.find(i => i.category === cat)
                            const sizes = item ? sortSizes(Object.keys(item.stock)) : []
                            return (
                                <div key={cat} className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <Label className="font-bold text-slate-700">{item?.label}</Label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {sizes.map(size => {
                                            const isOutOfStock = (item?.stock?.[size] || 0) <= 0
                                            return (
                                                <Button
                                                    key={size}
                                                    variant={form.sizes[cat] === size ? "default" : "outline"}
                                                    disabled={isOutOfStock}
                                                    className={`h-12 relative overflow-hidden transition-all ${isOutOfStock
                                                        ? 'opacity-40 grayscale cursor-not-allowed bg-slate-100 border-dashed border-slate-300'
                                                        : form.sizes[cat] === size
                                                            ? 'ring-2 ring-brand ring-offset-2'
                                                            : 'hover:border-brand/50 hover:bg-brand/5'
                                                        }`}
                                                    onClick={() => setSize(cat, size)}
                                                >
                                                    <span className={isOutOfStock ? "text-xs font-medium" : "text-sm font-bold"}>{size}</span>
                                                    {isOutOfStock && (
                                                        <div className="absolute inset-0 flex items-center justify-center bg-slate-100/80 backdrop-blur-[1px]">
                                                            <Badge variant="destructive" className="h-5 text-[9px] px-1.5 font-black uppercase tracking-wider scale-90">
                                                                Épuisé
                                                            </Badge>
                                                        </div>
                                                    )}
                                                </Button>
                                            )
                                        })}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}

                {step === 4 && (
                    <div className="space-y-4">
                        <div>
                            <select
                                className="w-full bg-slate-50 dark:bg-slate-800/50 border-none h-16 rounded-2xl px-6 text-lg text-slate-500 dark:text-slate-300 appearance-none outline-none focus:ring-2 focus:ring-brand/20 transition-all font-medium"
                                value={form.reason || ""}
                                onChange={e => setForm({ ...form, reason: e.target.value })}
                            >
                                <option value="" disabled className="dark:bg-slate-900">Pourquoi cette demande ?</option>
                                <option value="Usure" className="dark:bg-slate-900">Usure</option>
                                <option value="Perte" className="dark:bg-slate-900">Perte</option>
                                <option value="Nouvel arrivant" className="dark:bg-slate-900">Nouvel arrivant</option>
                            </select>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800/30 rounded-3xl p-6 space-y-4 border border-slate-100 dark:border-white/5 max-h-[300px] overflow-y-auto">
                            <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-2">
                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Info className="w-3 h-3" /> Récapitulatif
                                </h4>
                            </div>

                            <div className="grid gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-100">
                                        <User className="w-4 h-4 text-slate-400" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Collaborateur</p>
                                        <p className="text-sm font-bold text-slate-700">{form.firstName} {form.employeeName}</p>
                                    </div>
                                </div>

                                {form.categories.map(cat => {
                                    const item = stockItems.find(i => i.category === cat)
                                    return (
                                        <div key={cat} className="flex items-center gap-4 border-t border-slate-100 pt-2">
                                            <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-100">
                                                <HardHat className="w-4 h-4 text-slate-400" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Équipement</p>
                                                <p className="text-sm font-bold text-slate-700">{item?.label}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Taille</p>
                                                <Badge variant="secondary" className="font-bold">{form.sizes[cat]}</Badge>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>

            <CardFooter className="flex justify-end border-t border-slate-100 dark:border-white/5 p-8">
                {step > 1 && (
                    <Button variant="ghost" className="mr-auto text-slate-400 hover:text-slate-600" onClick={back} disabled={loading}>
                        <ChevronLeft className="w-4 h-4 mr-2" /> Retour
                    </Button>
                )}

                {step < 4 ? (
                    (() => {
                        const isValid = (step === 1 && form.employeeName && form.firstName && form.service) ||
                            (step === 2 && form.categories.length > 0) ||
                            (step === 3 && form.categories.every(cat => form.sizes[cat]));
                        return (
                            <Button
                                className={`rounded-2xl h-14 px-8 text-lg font-bold shadow-md transition-all flex items-center gap-2 ${isValid
                                    ? "bg-brand hover:bg-brand/90 text-white"
                                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                                    }`}
                                onClick={() => isValid && next()}
                                disabled={!isValid}
                            >
                                Continuer <ChevronRight className="w-4 h-4" />
                            </Button>
                        );
                    })()
                ) : (
                    (() => {
                        const isValid = !!form.reason;
                        return (
                            <Button
                                className={`rounded-2xl h-14 px-8 text-lg font-bold shadow-md transition-all ${isValid
                                    ? "bg-brand hover:bg-brand/90 text-white"
                                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                                    }`}
                                onClick={() => isValid && !loading && handleSubmit()}
                                disabled={loading || !isValid}
                            >
                                {loading ? "Envoi..." : "Confirmer la demande"}
                            </Button>
                        );
                    })()
                )}
            </CardFooter>
        </Card>
    )
}
