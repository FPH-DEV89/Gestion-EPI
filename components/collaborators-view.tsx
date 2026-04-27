"use client"

import { useState } from "react"
import { 
    Users, User, Package, Calendar, 
    Search, TrendingUp, ArrowRight,
    Euro, Mail, Phone, MapPin
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface RequestItem {
    category: string
    size: string
    snapshottedPrice: number
}

interface Request {
    id: string
    employeeName: string
    service: string
    items: RequestItem[]
    status: string
    createdAt: string
}

interface CollaboratorsViewProps {
    requests: Request[]
}

export default function CollaboratorsView({ requests }: CollaboratorsViewProps) {
    const [searchTerm, setSearchTerm] = useState("")

    // Aggregate data per employee
    const collaboratorsMap = requests.reduce((acc: any, req) => {
        const name = req.employeeName
        if (!acc[name]) {
            acc[name] = {
                name,
                service: req.service,
                totalEpi: 0,
                totalCost: 0,
                lastActivity: req.createdAt,
                requests: [] as Request[]
            }
        }
        
        acc[name].requests.push(req)
        
        if (req.status === "Ordered") {
            req.items.forEach(item => {
                acc[name].totalEpi += 1
                acc[name].totalCost += item.snapshottedPrice
            })
        }

        if (new Date(req.createdAt) > new Date(acc[name].lastActivity)) {
            acc[name].lastActivity = req.createdAt
        }

        return acc
    }, {})

    const collaborators = Object.values(collaboratorsMap)
        .filter((c: any) => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.service.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a: any, b: any) => b.totalEpi - a.totalEpi)

    const totalStaff = Object.keys(collaboratorsMap).length

    return (
        <div className="space-y-10 pb-32 max-w-5xl mx-auto px-4">
            {/* Header / Search Area */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                    <h2 className="text-4xl font-black text-slate-800 tracking-tighter mb-1">Collaborateurs</h2>
                    <p className="text-slate-400 font-bold text-sm uppercase tracking-widest flex items-center gap-2">
                        <Users className="w-4 h-4 text-[#135bec]" />
                        {totalStaff} Membres Actifs
                    </p>
                </div>
                
                <div className="relative group w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#135bec] transition-colors" />
                    <Input
                        placeholder="Rechercher un membre..."
                        className="pl-12 h-14 rounded-[22px] border-none shadow-xl bg-white focus-visible:ring-2 focus-visible:ring-[#135bec]/20 text-slate-700 font-bold"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Collaborators Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {collaborators.map((collab: any, idx) => (
                    <Card key={collab.name} className="relative overflow-hidden border-none shadow-[0_20px_50px_rgba(0,0,0,0.05)] bg-white rounded-[40px] group transition-all duration-500 hover:shadow-blue-900/10 hover:-translate-y-2">
                        {/* Decorative Gradient Background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        
                        <CardContent className="p-8 relative z-20">
                            {/* Profile Header */}
                            <div className="flex items-center gap-5 mb-8">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-[#135bec] blur-xl opacity-20 rounded-full scale-110 group-hover:scale-125 transition-transform duration-700" />
                                    <Avatar className="w-16 h-16 border-4 border-white shadow-xl relative z-10">
                                        <AvatarFallback className="bg-gradient-to-tr from-[#135bec] to-blue-400 text-white font-black text-xl">
                                            {collab.name.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-xl font-black text-slate-800 leading-none truncate group-hover:text-[#135bec] transition-colors">
                                        {collab.name}
                                    </h3>
                                    <Badge variant="secondary" className="mt-2 text-[9px] font-black uppercase tracking-widest bg-blue-50 text-[#135bec] rounded-lg px-2 py-0.5 border-none">
                                        {collab.service}
                                    </Badge>
                                </div>
                            </div>

                            {/* Core Metrics Grid */}
                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="bg-slate-50/80 p-4 rounded-[28px] border border-slate-100/50">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Package className="w-3.5 h-3.5 text-slate-400" />
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Dotation</span>
                                    </div>
                                    <p className="text-2xl font-black text-slate-800">
                                        {collab.totalEpi} <span className="text-[10px] text-slate-400 uppercase">EPIs</span>
                                    </p>
                                </div>
                                <div className="bg-slate-50/80 p-4 rounded-[28px] border border-slate-100/50">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Euro className="w-3.5 h-3.5 text-slate-400" />
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Investis</span>
                                    </div>
                                    <p className="text-lg font-black text-[#135bec]">
                                        {collab.totalCost.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
                                    </p>
                                </div>
                            </div>

                            {/* Footer / Last Activity */}
                            <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-slate-300" />
                                    <div>
                                        <span className="text-[9px] font-bold text-slate-300 uppercase tracking-tighter block mb-[-2px]">Dernier mouvement</span>
                                        <span className="text-[11px] font-bold text-slate-500">
                                            {new Date(collab.lastActivity).toLocaleDateString('fr-FR')}
                                        </span>
                                    </div>
                                </div>
                                
                                <Button size="icon" variant="ghost" className="rounded-2xl w-10 h-10 bg-slate-50 text-slate-400 hover:bg-[#135bec] hover:text-white transition-all shadow-sm">
                                    <ArrowRight className="w-5 h-5" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {collaborators.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center py-20 bg-white/50 rounded-[50px] border-2 border-dashed border-slate-200">
                        <Users className="w-16 h-16 text-slate-200 mb-4" />
                        <p className="text-slate-400 font-bold text-lg italic tracking-tight">Aucun collaborateur trouvé</p>
                    </div>
                )}
            </div>
        </div>
    )
}
