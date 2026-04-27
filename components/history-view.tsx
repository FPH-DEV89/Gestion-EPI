"use client"

import { useState } from "react"
import { 
    History, Search, Filter, Download, 
    Calendar, User, Package, ChevronRight, 
    CheckCircle2, XCircle, Clock
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

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
    reason: string
    status: string
    createdAt: string
    validatedBy: string | null
    validatedAt: string | null
}

interface HistoryViewProps {
    requests: Request[]
}

export default function HistoryView({ requests }: HistoryViewProps) {
    const [searchTerm, setSearchTerm] = useState("")
    const [filterCategory, setFilterCategory] = useState("ALL")

    const processedHistory = requests.filter(r => {
        if (r.status === "Pending") return false
        const matchesSearch = r.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.items.some(i => i.category.toLowerCase().includes(searchTerm.toLowerCase()))
        const matchesCategory = filterCategory === "ALL" || r.items.some(i => i.category === filterCategory)
        return matchesSearch && matchesCategory
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    const categories = Array.from(new Set(requests.flatMap(r => r.items.map(i => i.category)))).sort()

    const exportToCSV = () => {
        const headers = ["Date", "Collaborateur", "Service", "Equipement", "Taille", "Statut", "Traitement Par"]
        const rows = processedHistory.flatMap(r => 
            r.items.map(item => [
                new Date(r.createdAt).toLocaleDateString("fr-FR"),
                r.employeeName,
                r.service,
                item.category,
                item.size,
                r.status === "Ordered" ? "Validé" : "Refusé",
                r.validatedBy || "-"
            ])
        )

        const csvContent = "\uFEFF" + [
            headers.join(";"),
            ...rows.map(row => row.join(";"))
        ].join("\n")

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement("a")
        link.href = URL.createObjectURL(blob)
        link.setAttribute("download", `historique_EPI_${new Date().toISOString().split('T')[0]}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    return (
        <div className="space-y-8 pb-32">
            {/* Action Bar / Filters */}
            <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 group w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#135bec] transition-colors" />
                    <Input
                        placeholder="Rechercher un collaborateur ou un EPI..."
                        className="pl-12 h-14 rounded-[20px] border-none shadow-xl bg-white focus-visible:ring-2 focus-visible:ring-[#135bec]/20 transition-all text-slate-600 font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                
                <div className="flex gap-3 w-full md:w-auto">
                    <Select value={filterCategory} onValueChange={setFilterCategory}>
                        <SelectTrigger className="h-14 w-full md:w-[200px] rounded-[20px] border-none shadow-xl bg-white px-6 font-bold text-slate-700">
                            <SelectValue placeholder="Catégorie" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-none shadow-2xl bg-white/95 backdrop-blur-xl">
                            <SelectItem value="ALL" className="font-bold">Toutes catégories</SelectItem>
                            {categories.map(cat => (
                                <SelectItem key={cat} value={cat} className="font-medium">{cat}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Button 
                        onClick={exportToCSV}
                        className="h-14 w-14 rounded-[20px] bg-white hover:bg-slate-50 text-[#135bec] shadow-xl border-none p-0 group"
                        title="Exporter CSV"
                    >
                        <Download className="w-6 h-6 group-hover:scale-110 transition-transform" />
                    </Button>
                </div>
            </div>

            {/* Technical Timeline Content */}
            <div className="relative max-w-2xl mx-auto px-4">
                {/* The Timeline Central String */}
                <div className="absolute left-[27px] top-4 bottom-4 w-0.5 bg-gradient-to-b from-[#135bec]/40 via-[#135bec]/20 to-transparent rounded-full" />

                <div className="space-y-12">
                    {processedHistory.map((req, idx) => {
                        const isOrdered = req.status === "Ordered"
                        const date = new Date(req.createdAt)
                        const day = date.toLocaleDateString('fr-FR', { day: 'numeric' })
                        const month = date.toLocaleDateString('fr-FR', { month: 'short' }).replace('.', '')
                        
                        return (
                            <div key={req.id} className="relative transition-all duration-500 animate-in fade-in slide-in-from-bottom-8" style={{ animationDelay: `${idx * 100}ms` }}>
                                {/* Timeline Node Pin */}
                                <div className={`absolute left-0 top-1.5 w-14 flex flex-col items-center justify-center gap-1 z-10 transition-transform hover:scale-110 duration-300`}>
                                    <div className={`w-10 h-10 rounded-full border-4 border-white shadow-lg flex items-center justify-center transition-colors ${isOrdered ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                                        {isOrdered ? <CheckCircle2 className="w-5 h-5 text-white" /> : <XCircle className="w-5 h-5 text-white" />}
                                    </div>
                                    <div className="flex flex-col items-center leading-none mt-1">
                                        <span className="text-[14px] font-black text-slate-800 tracking-tighter uppercase">{day}</span>
                                        <span className="text-[9px] font-bold text-slate-400 tracking-widest uppercase">{month}</span>
                                    </div>
                                </div>

                                {/* Content Card */}
                                <div className="ml-20 group">
                                    <div className="bg-white/70 backdrop-blur-xl rounded-[32px] p-6 shadow-[0_10px_40px_rgba(0,0,0,0.03)] border border-white hover:shadow-[0_20px_60px_rgba(19,91,236,0.08)] transition-all duration-500 relative overflow-hidden">
                                        {/* Minimalist Accents */}
                                        <div className={`absolute right-0 top-0 w-24 h-24 blur-3xl rounded-full -mr-12 -mt-12 transition-opacity opacity-0 group-hover:opacity-20 ${isOrdered ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                                        
                                        <div className="relative z-20">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h3 className="text-xl font-black text-slate-800 tracking-tight leading-none group-hover:text-[#135bec] transition-colors">
                                                        {req.employeeName}
                                                    </h3>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                                        {req.service}
                                                    </p>
                                                </div>
                                                <Badge variant="secondary" className={`rounded-lg px-2 py-1 text-[9px] font-black tracking-tighter uppercase ${isOrdered ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                                    {isOrdered ? 'Accepté' : 'Refusé'}
                                                </Badge>
                                            </div>

                                            <div className="space-y-4">
                                                {/* Items List */}
                                                <div className="flex flex-wrap gap-2">
                                                    {req.items.map((item, i) => (
                                                        <div key={i} className="bg-slate-50/50 px-3 py-2 rounded-2xl flex items-center gap-2 border border-slate-100/50">
                                                            <div className="w-6 h-6 rounded-lg bg-white flex items-center justify-center shadow-sm">
                                                                <Package className="w-3.5 h-3.5 text-[#135bec]" />
                                                            </div>
                                                            <span className="text-xs font-bold text-slate-600">{item.category}</span>
                                                            <span className="text-[10px] font-black text-slate-400 px-1.5 py-0.5 bg-slate-100 rounded-md">
                                                                {item.size}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Meta Info Footer */}
                                                <div className="flex items-center justify-between pt-4 border-t border-slate-50 mt-4">
                                                    <div className="flex items-center gap-4">
                                                        {req.validatedBy && (
                                                            <div className="flex items-center gap-1.5">
                                                                <User className="w-3.5 h-3.5 text-slate-400" />
                                                                <span className="text-[10px] font-bold text-slate-500 italic">
                                                                    Par {req.validatedBy}
                                                                </span>
                                                            </div>
                                                        )}
                                                        <div className="flex items-center gap-1.5">
                                                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                                                            <span className="text-[10px] font-bold text-slate-500">
                                                                {new Date(req.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="text-right">
                                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Total</span>
                                                        <span className="text-sm font-black text-slate-800">
                                                            {req.items.reduce((sum, item) => sum + item.snapshottedPrice, 0).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}

                    {processedHistory.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 bg-white/50 rounded-[40px] border-2 border-dashed border-slate-200">
                            <History className="w-16 h-16 text-slate-200 mb-4" />
                            <p className="text-slate-400 font-bold text-lg italic">Aucune transaction trouvée</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
