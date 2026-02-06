"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { createRequest } from "@/app/actions"
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
        category: "",
        size: "",
        reason: ""
    })

    const selectedCategory = stockItems.find(item => item.category === form.category)
    const sizes = (selectedCategory && selectedCategory.stock) ? sortSizes(Object.keys(selectedCategory.stock)) : []

    const next = () => setStep(s => s + 1)
    const back = () => setStep(s => s - 1)

    const handleSubmit = async () => {
        setLoading(true)
        const res = await createRequest(form)
        if (res.success) setSuccess(true)
        setLoading(false)
    }

    if (success) {
        return (
            <Card className="max-w-md mx-auto text-center p-8 mt-10">
                <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <CardTitle className="mb-2">Demande Envoyée !</CardTitle>
                <CardDescription>
                    Ta demande d'équipement a bien été enregistrée et sera traitée par ton manager.
                </CardDescription>
                <Button className="mt-6 w-full" onClick={() => window.location.reload()}>
                    Nouvelle Demande
                </Button>
            </Card>
        )
    }

    return (
        <Card className="max-w-md mx-auto mt-10 shadow-2xl border-none rounded-4xl overflow-hidden">
            <CardHeader className="bg-white pt-10 pb-2 px-8">
                <CardTitle className="text-3xl font-black text-slate-800 tracking-tight">
                    {step === 2 ? "Quelle EPI" : step === 3 ? "Taille" : step === 4 ? "Motif" : "Demande EPI"}
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
                                className="bg-slate-50 border-none h-16 rounded-2xl px-6 text-lg placeholder:text-slate-300"
                                placeholder="Prénom"
                                value={form.firstName || ""}
                                onChange={e => setForm({ ...form, firstName: e.target.value })}
                            />
                        </div>
                        <div>
                            <select
                                className="w-full bg-slate-50 border-none h-16 rounded-2xl px-6 text-lg text-slate-500 appearance-none outline-none focus:ring-2 focus:ring-brand/20 transition-all"
                                value={form.service || ""}
                                onChange={e => setForm({ ...form, service: e.target.value })}
                            >
                                <option value="" disabled>Service...</option>
                                {["LAD", "MAG", "REA", "GDS", "EXPE", "RECEP", "TECHNIQUE", "ENCADREMENT"].map(s => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-4">
                        <Label>Type d'Équipement</Label>
                        <div className="grid grid-cols-1 gap-2">
                            {stockItems.map(item => (
                                <Button
                                    key={item.id}
                                    variant={form.category === item.category ? "default" : "outline"}
                                    className="justify-start h-14"
                                    onClick={() => setForm({ ...form, category: item.category, size: "" })}
                                >
                                    {item.label}
                                </Button>
                            ))}
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-4">
                        <Label>Taille Disponible</Label>
                        <div className="grid grid-cols-3 gap-2">
                            {sizes.map(size => {
                                const isOutOfStock = (selectedCategory?.stock?.[size] || 0) <= 0
                                return (
                                    <Button
                                        key={size}
                                        variant={form.size === size ? "default" : "outline"}
                                        disabled={isOutOfStock}
                                        className={`h-12 ${isOutOfStock ? 'opacity-50 cursor-not-allowed bg-gray-100' : ''}`}
                                        onClick={() => setForm({ ...form, size })}
                                    >
                                        {size}
                                        {isOutOfStock && <span className="block text-[8px] font-bold">OUT</span>}
                                    </Button>
                                )
                            })}
                        </div>
                    </div>
                )}

                {step === 4 && (
                    <div className="space-y-4">
                        <div>
                            <select
                                className="w-full bg-slate-50 border-none h-16 rounded-2xl px-6 text-lg text-slate-500 appearance-none outline-none focus:ring-2 focus:ring-brand/20 transition-all"
                                value={form.reason || ""}
                                onChange={e => setForm({ ...form, reason: e.target.value })}
                            >
                                <option value="" disabled>Pourquoi cette demande ?</option>
                                <option value="Usure">Usure</option>
                                <option value="Perte">Perte</option>
                                <option value="Nouvel arrivant">Nouvel arrivant</option>
                            </select>
                        </div>
                        <div className="bg-slate-50 rounded-3xl p-6 space-y-4 border border-slate-100">
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

                                <div className="flex items-center gap-4">
                                    <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-100">
                                        <HardHat className="w-4 h-4 text-slate-400" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Équipement</p>
                                        <p className="text-sm font-bold text-slate-700">{selectedCategory?.label}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-100">
                                        <Ruler className="w-4 h-4 text-slate-400" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Taille</p>
                                        <p className="text-sm font-bold text-slate-700">{form.size}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>

            <CardFooter className="flex justify-end border-t border-slate-100 p-8">
                {step > 1 && (
                    <Button variant="ghost" className="mr-auto text-slate-400 hover:text-slate-600" onClick={back} disabled={loading}>
                        <ChevronLeft className="w-4 h-4 mr-2" /> Retour
                    </Button>
                )}

                {step < 4 ? (
                    (() => {
                        const isValid = (step === 1 && form.employeeName && form.firstName && form.service) ||
                            (step === 2 && form.category) ||
                            (step === 3 && form.size);
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
