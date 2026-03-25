"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, User, ClipboardList, Clock, ChevronRight, HardHat, Footprints, Hand } from "lucide-react"
import EmployeeWizard from "./employee-wizard"

interface StockItem {
    id: string
    category: string
    label: string
    stock: Record<string, number>
}

export default function EmployeeDashboard({ stockItems }: { stockItems: StockItem[] }) {
    const [showWizard, setShowWizard] = useState(false)

    if (showWizard) {
        return (
            <div className="relative pt-16">
                <Button 
                    variant="ghost" 
                    className="absolute top-4 left-4 text-slate-500 hover:text-brand z-50 flex items-center gap-2"
                    onClick={() => setShowWizard(false)}
                >
                    &larr; Retour Dashboard
                </Button>
                <EmployeeWizard stockItems={stockItems} />
            </div>
        )
    }

    return (
        <div className="max-w-md mx-auto min-h-screen bg-slate-50 pb-20">
            {/* Blue Header Section (Screenshot 1 alignment) */}
            <div className="bg-[#135bec] text-white pt-12 pb-20 px-6 rounded-b-[40px] shadow-lg">
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                            <User className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black tracking-tight leading-tight">Bonjour, Jean Dupont</h2>
                            <p className="text-blue-100/80 text-xs font-medium uppercase tracking-wider">Gérez vos équipements de protection.</p>
                        </div>
                    </div>
                </div>

                <Button 
                    className="w-full bg-white text-[#135bec] hover:bg-blue-50 h-16 rounded-2xl font-black text-lg shadow-xl shadow-blue-900/10 flex items-center justify-center gap-3 border-none transition-transform active:scale-[0.98]"
                    onClick={() => setShowWizard(true)}
                >
                    DEMANDER UN NOUVEL EPI <Plus className="w-6 h-6 stroke-[3]" />
                </Button>
            </div>

            {/* Current PPE List (Screenshot 1 alignment) */}
            <div className="px-6 -mt-10 space-y-4">
                <h3 className="text-slate-900 font-black text-xl mb-4 tracking-tight">Mes Équipements Actuels</h3>
                
                <Card className="border-none shadow-sm rounded-3xl overflow-hidden hover:shadow-md transition-shadow">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center shrink-0">
                            <Footprints className="w-8 h-8 text-[#135bec]" />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold text-slate-800 leading-tight">Chaussures de sécurité (S)</h4>
                            <p className="text-slate-400 text-[10px] font-medium mt-0.5">Attribué le 15/01/2024</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-300" />
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm rounded-3xl overflow-hidden hover:shadow-md transition-shadow">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center shrink-0">
                            <Hand className="w-8 h-8 text-slate-600" />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold text-slate-800 leading-tight">Gants de protection (M)</h4>
                            <p className="text-slate-400 text-[10px] font-medium mt-0.5">Attribué le 20/02/2024</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-300" />
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm rounded-3xl overflow-hidden hover:shadow-md transition-shadow">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center shrink-0">
                            <HardHat className="w-8 h-8 text-slate-600" />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold text-slate-800 leading-tight">Gilet haute visibilité (L)</h4>
                            <Badge variant="secondary" className="bg-amber-100 text-amber-700 text-[9px] font-black uppercase tracking-tighter mt-1 h-5">
                                À renouveler bientôt
                            </Badge>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-300" />
                    </CardContent>
                </Card>
            </div>

            {/* Quick Links */}
            <div className="px-6 mt-10 space-y-4">
                <h3 className="text-slate-900 font-black text-xl mb-4 tracking-tight">Liens Rapides</h3>
                
                <Card className="border-none shadow-sm rounded-3xl overflow-hidden hover:shadow-md transition-shadow">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shrink-0 border border-slate-100 shadow-sm">
                            <Clock className="w-5 h-5 text-slate-400" />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold text-sm text-slate-800">Historique des Demandes</h4>
                            <p className="text-slate-400 text-[9px] font-medium leading-tight">Dernière demande : Casque (En attente)</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-300 transition-transform group-hover:translate-x-1" />
                    </CardContent>
                </Card>
            </div>

            {/* Bottom Navigation Mockup */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-slate-100 h-20 flex items-center justify-around px-2 z-40">
                <div className="flex flex-col items-center gap-1.5 text-[#135bec] w-1/3">
                    <ClipboardList className="w-6 h-6 stroke-[2.5]" />
                    <span className="text-[10px] font-extrabold uppercase tracking-widest">Accueil</span>
                </div>
                <div 
                    className="flex flex-col items-center gap-1.5 text-slate-400 w-1/3 cursor-pointer hover:text-[#135bec] transition-colors"
                    onClick={() => setShowWizard(true)}
                >
                    <Plus className="w-6 h-6 stroke-[2.5]" />
                    <span className="text-[10px] font-extrabold uppercase tracking-widest">Demandes</span>
                </div>
                <div className="flex flex-col items-center gap-1.5 text-slate-400 w-1/3">
                    <User className="w-6 h-6 stroke-[2.5]" />
                    <span className="text-[10px] font-extrabold uppercase tracking-widest">Profil</span>
                </div>
            </div>
        </div>
    )
}
