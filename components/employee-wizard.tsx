"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { createRequests } from "@/app/actions"
import { sortSizes } from "@/lib/utils"
import { offlineDB } from "@/lib/offline-db"
import { ChevronRight, ChevronLeft, CheckCircle2, User, HardHat, Ruler, Info, Plus, CloudOff, WifiOff, Wifi } from "lucide-react"

export interface StockItem {
    id: string
    category: string
    label: string
    minThreshold?: number
    stock: Record<string, number>
}

export default function EmployeeWizard({ stockItems: initialStockItems }: { stockItems: StockItem[] }) {
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [offlineSuccess, setOfflineSuccess] = useState(false)
    const [isOffline, setIsOffline] = useState(false)
    const [stockItems, setStockItems] = useState<StockItem[]>(initialStockItems)
    const [syncNotification, setSyncNotification] = useState<string | null>(null)
    const [form, setForm] = useState({
        employeeName: "",
        firstName: "",
        service: "",
        categories: [] as string[],
        sizes: {} as Record<string, string>,
        reason: ""
    })

    // Routine de synchronisation des requêtes hors-ligne en file d'attente
    const syncOfflineRequests = async () => {
        if (typeof window === "undefined" || !navigator.onLine) return;
        const queue = await offlineDB.getQueue();
        if (queue.length === 0) return;

        let successCount = 0;
        for (const req of queue) {
            try {
                const res = await createRequests({
                    employeeName: req.employeeName,
                    firstName: req.firstName,
                    service: req.service,
                    reason: req.reason,
                    items: req.items
                });
                if (res.success) {
                    await offlineDB.dequeueRequest(req.id);
                    successCount += 1;
                }
            } catch (e) {
                console.error("Échec de synchronisation d'une demande en cache:", e);
            }
        }

        if (successCount > 0) {
            setSyncNotification(`${successCount} demande(s) en attente synchronisée(s) avec succès !`);
            setTimeout(() => setSyncNotification(null), 5000);
        }
    };

    useEffect(() => {
        if (typeof window === "undefined") return;

        // Détection de l'état réseau initial
        const updateNetworkStatus = () => {
            const offline = !navigator.onLine;
            setIsOffline(offline);
            if (!offline) {
                syncOfflineRequests();
            }
        };

        updateNetworkStatus();
        window.addEventListener("online", updateNetworkStatus);
        window.addEventListener("offline", updateNetworkStatus);

        // Sauvegarder les stocks reçus du serveur en cache local
        if (initialStockItems && initialStockItems.length > 0) {
            offlineDB.saveStock(initialStockItems);
            setStockItems(initialStockItems);
        } else {
            // Si la base distante est injoignable, charger le stock depuis IndexedDB
            const loadCachedStock = async () => {
                const cached = await offlineDB.getStock();
                if (cached && cached.length > 0) {
                    setStockItems(cached);
                }
            };
            loadCachedStock();
        }

        // Routine périodique de synchronisation légère en arrière-plan toutes les 15 secondes
        const syncInterval = setInterval(() => {
            if (navigator.onLine) {
                syncOfflineRequests();
            }
        }, 15000);

        return () => {
            window.removeEventListener("online", updateNetworkStatus);
            window.removeEventListener("offline", updateNetworkStatus);
            clearInterval(syncInterval);
        };
    }, [initialStockItems]);

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
        const reqData = {
            employeeName: form.employeeName,
            firstName: form.firstName,
            service: form.service,
            reason: form.reason,
            items: form.categories.map(cat => ({
                category: cat,
                size: form.sizes[cat]
            }))
        };

        if (typeof window !== "undefined" && !navigator.onLine) {
            // Sauvegarder dans IndexedDB en mode hors-ligne
            try {
                await offlineDB.enqueueRequest(reqData);
                setOfflineSuccess(true);
            } catch (err) {
                console.error("Échec de sauvegarde hors-ligne:", err);
            } finally {
                setLoading(false);
            }
            return;
        }

        try {
            const res = await createRequests(reqData);
            if (res.success) {
                setSuccess(true);
            } else {
                // En cas d'erreur de base de données (si gérée comme un échec)
                await offlineDB.enqueueRequest(reqData);
                setOfflineSuccess(true);
            }
        } catch (error) {
            // Erreur réseau (serveur indisponible)
            await offlineDB.enqueueRequest(reqData);
            setOfflineSuccess(true);
        } finally {
            setLoading(false);
        }
    }

    if (success) {
        return (
            <div className="max-w-md md:max-w-3xl mx-auto min-h-screen bg-slate-50 pb-10 relative">
                {/* Header matching the wizard steps */}
                <div className="bg-[#135bec] text-white pt-10 pb-20 px-8 rounded-b-[40px] shadow-lg mb-8 relative">
                    <div className="flex justify-between items-center mb-6">
                        <Button variant="ghost" className="text-white hover:bg-white/10 p-2" onClick={() => window.location.reload()}>
                             <ChevronLeft className="w-6 h-6" />
                        </Button>
                        <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center">
                            <img 
                                src="/logo-stef.png" 
                                alt="STEF" 
                                className="h-8 w-auto object-contain brightness-0 invert" 
                            />
                            <span className="text-[10px] font-bold tracking-[0.3em] uppercase mt-1 opacity-70">EPI Manager</span>
                        </div>
                        <Link href="/admin">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm hover:bg-white/30 transition-colors cursor-pointer">
                                <User className="w-6 h-6" />
                            </div>
                        </Link>
                    </div>
                </div>

                <Card className="mx-6 -mt-16 shadow-2xl border-none rounded-[32px] overflow-hidden bg-white/95 backdrop-blur-xl">
                    <CardContent className="px-8 pb-10 pt-10 text-center">
                        <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                            <CheckCircle2 className="w-10 h-10 text-emerald-500 animate-bounce" />
                        </div>
                        <CardTitle className="mb-2 text-2xl font-black text-slate-800 tracking-tight">Demande Envoyée !</CardTitle>
                        <CardDescription className="text-slate-500 font-medium px-4 mb-6">
                            {"Tes demandes d'équipement ont bien été enregistrées et seront traitées par ton manager."}
                        </CardDescription>

                        {/* Order Recap card */}
                        <div className="bg-slate-50 rounded-3xl p-6 space-y-4 border border-slate-100 text-left">
                            <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-2">
                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Info className="w-3 h-3" /> Résumé de la Demande
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
                                        <p className="text-[10px] font-semibold text-slate-500">Service: {form.service}</p>
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

                        <Button className="mt-8 w-full rounded-2xl h-14 bg-brand hover:bg-brand/90 font-bold shadow-md transition-all text-white" onClick={() => window.location.reload()}>
                             Nouvelle Demande
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (offlineSuccess) {
        return (
            <Card className="max-w-md md:max-w-xl mx-auto text-center p-8 mt-10 shadow-2xl rounded-[32px] border-none bg-white">
                <div className="w-20 h-20 bg-blue-50 text-brand rounded-full flex items-center justify-center mx-auto mb-6">
                    <CloudOff className="w-10 h-10 text-[#135bec]" />
                </div>
                <CardTitle className="mb-2 text-2xl font-black text-slate-800">Demande Enregistrée Hors-ligne !</CardTitle>
                <CardDescription className="text-slate-500 font-medium px-4">
                    Pas de connexion internet. Ta demande a été sauvegardée en toute sécurité sur ton appareil et sera transmise automatiquement dès que le réseau sera rétabli.
                </CardDescription>
                <Button className="mt-8 w-full rounded-2xl h-14 bg-brand hover:bg-brand/90 font-bold" onClick={() => window.location.reload()}>
                    Nouvelle Demande
                </Button>
            </Card>
        )
    }

    return (
        <div className="max-w-md md:max-w-3xl mx-auto min-h-screen bg-slate-50 pb-10 relative">
            {/* Toast de notification de synchronisation réussie */}
            {syncNotification && (
                <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-5 py-3 rounded-2xl shadow-[0_12px_40px_rgba(16,185,129,0.3)] z-[100] flex items-center gap-2 border border-emerald-400/20 font-bold text-xs animate-in fade-in slide-in-from-top-4 duration-300">
                    <CheckCircle2 className="w-4 h-4 text-white animate-bounce" />
                    <span>{syncNotification}</span>
                </div>
            )}

            {/* Bannière de Mode Hors-ligne en haut de l'écran */}
            {isOffline && (
                <div className="mx-6 mt-4 bg-amber-500/15 border border-amber-500/20 text-amber-700 px-4 py-3.5 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold shadow-sm animate-pulse">
                    <WifiOff className="w-4 h-4 shrink-0 text-amber-600" />
                    <span>Mode Hors-ligne actif — Formulaire disponible</span>
                </div>
            )}

            {/* Stitch Wizard Header (Screenshot 4) */}
            <div className="bg-[#135bec] text-white pt-10 pb-20 px-8 rounded-b-[40px] shadow-lg mb-8 relative">
                <div className="flex justify-between items-center mb-6">
                    <Button variant="ghost" className="text-white hover:bg-white/10 p-2" onClick={() => window.location.reload()}>
                         <ChevronLeft className="w-6 h-6" />
                    </Button>
                    <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center">
                        <img 
                            src="/logo-stef.png" 
                            alt="STEF" 
                            className="h-8 w-auto object-contain brightness-0 invert" 
                        />
                        <span className="text-[10px] font-bold tracking-[0.3em] uppercase mt-1 opacity-70">EPI Manager</span>
                    </div>
                    <Link href="/admin">
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm hover:bg-white/30 transition-colors cursor-pointer">
                            <User className="w-6 h-6" />
                        </div>
                    </Link>
                </div>
            </div>

            <Card className="mx-6 -mt-16 shadow-2xl border-none rounded-[32px] overflow-hidden bg-white/95 backdrop-blur-xl">
                <CardHeader className="bg-transparent pt-8 pb-2 px-8">
                    <div className="flex gap-1 mb-2">
                        {[1,2,3,4].map(s => (
                            <div key={s} className={`h-1.5 flex-1 rounded-full ${s <= step ? 'bg-brand' : 'bg-slate-100'}`} />
                        ))}
                    </div>
                    <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{step}. Informations</CardDescription>
                    <CardTitle className="text-2xl font-black text-slate-800 tracking-tight">
                        {step === 2 ? "Quels EPI ?" : step === 3 ? "Tailles" : step === 4 ? "Motif" : "Nouvelle Demande"}
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
                                className="w-full bg-slate-50 border-none h-16 rounded-2xl px-6 text-lg text-slate-500 appearance-none outline-none focus:ring-2 focus:ring-brand/20 transition-all font-medium"
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
                        <Label>{"Type d'Équipement (plusieurs choix possibles)"}</Label>
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
                                                         ? 'disabled:opacity-100 border-dashed border-red-300 bg-red-50/50 text-red-700 cursor-not-allowed'
                                                         : form.sizes[cat] === size
                                                             ? 'ring-2 ring-brand ring-offset-2'
                                                             : 'hover:border-brand/50 hover:bg-brand/5'
                                                         }`}
                                                     onClick={() => setSize(cat, size)}
                                                 >
                                                     <span className={isOutOfStock ? "text-xs font-semibold text-red-700/80" : "text-sm font-bold"}>{size}</span>
                                                     {isOutOfStock && (
                                                         <div className="absolute inset-0 flex items-center justify-center bg-red-50/20 backdrop-blur-[0.5px]">
                                                             <Badge className="bg-red-600 hover:bg-red-600 text-white border-none h-5 text-[9px] px-1.5 font-black uppercase tracking-wider scale-90">
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
                                className="w-full bg-slate-50 border-none h-16 rounded-2xl px-6 text-lg text-slate-500 appearance-none outline-none focus:ring-2 focus:ring-brand/20 transition-all font-medium"
                                value={form.reason || ""}
                                onChange={e => setForm({ ...form, reason: e.target.value })}
                            >
                                <option value="" disabled>Pourquoi cette demande ?</option>
                                <option value="Usure">Usure</option>
                                <option value="Perte">Perte</option>
                                <option value="Nouvel arrivant">Nouvel arrivant</option>
                            </select>
                        </div>
                        <div className="bg-slate-50 rounded-3xl p-6 space-y-4 border border-slate-100 max-h-[300px] overflow-y-auto">
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

            <CardFooter className="flex justify-end border-t border-slate-100 p-8">
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
        </div>
    )
}
