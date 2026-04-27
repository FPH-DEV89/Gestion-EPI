"use client"

import { 
    ShieldCheck, AlertTriangle, User, 
    Calendar, ClipboardList, Package,
    CheckCircle2, XCircle, RefreshCw
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface AuditLog {
    id: string
    userName: string
    action: string
    details: any
    createdAt: string
}

interface AuditLogViewProps {
    logs: AuditLog[]
}

export default function AuditLogView({ logs }: AuditLogViewProps) {
    const totalActions = logs.length
    const criticalActions = logs.filter(l => l.action === "REJECT_REQUEST" || l.action === "UPDATE_STOCK").length
    
    // Sort logs by date (newest first)
    const sortedLogs = [...logs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    const getActionIcon = (action: string) => {
        switch (action) {
            case "VALIDATE_REQUEST": return <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            case "REJECT_REQUEST": return <XCircle className="w-5 h-5 text-rose-500" />
            case "UPDATE_STOCK": return <RefreshCw className="w-5 h-5 text-amber-500" />
            default: return <ClipboardList className="w-5 h-5 text-slate-400" />
        }
    }

    const getActionColor = (action: string) => {
        switch (action) {
            case "VALIDATE_REQUEST": return "border-emerald-100 bg-emerald-50/30"
            case "REJECT_REQUEST": return "border-rose-100 bg-rose-50/30"
            case "UPDATE_STOCK": return "border-amber-100 bg-amber-50/30"
            default: return "border-slate-100 bg-slate-50/30"
        }
    }

    return (
        <div className="space-y-8 pb-32 max-w-4xl mx-auto px-4">
            {/* KPI Summary Bar */}
            <div className="grid grid-cols-2 gap-4">
                <Card className="rounded-[32px] border-none shadow-xl bg-[#135bec] text-white p-6 relative overflow-hidden group">
                    <div className="absolute right-[-10px] top-[-10px] opacity-10 group-hover:scale-110 transition-transform duration-700">
                        <ShieldCheck className="w-24 h-24" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70 mb-1">Actions Totales</p>
                    <h3 className="text-4xl font-black">{totalActions}</h3>
                </Card>
                <Card className="rounded-[32px] border-none shadow-xl bg-white p-6 relative overflow-hidden group">
                    <div className="absolute right-[-10px] top-[-10px] opacity-10 text-amber-500 group-hover:scale-110 transition-transform duration-700">
                        <AlertTriangle className="w-24 h-24" />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Points Vigilance</p>
                    <h3 className="text-4xl font-black text-slate-800">{criticalActions}</h3>
                </Card>
            </div>

            {/* Audit Timeline */}
            <div className="relative pt-4">
                {/* Timeline Line */}
                <div className="absolute left-[27px] top-0 bottom-0 w-0.5 bg-slate-200 rounded-full" />

                <div className="space-y-8">
                    {sortedLogs.map((log, idx) => (
                        <div key={log.id} className="relative pl-16 group">
                            {/* Node Icon */}
                            <div className="absolute left-0 top-1.5 w-14 flex items-center justify-center z-10">
                                <div className="w-10 h-10 rounded-full bg-white border-2 border-slate-100 shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                                    {getActionIcon(log.action)}
                                </div>
                            </div>

                            {/* Content Card */}
                            <div className={`rounded-[28px] border p-5 transition-all duration-300 hover:shadow-lg ${getActionColor(log.action)}`}>
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border-slate-200 bg-white text-slate-500 mb-2">
                                            {log.action.replace('_', ' ')}
                                        </Badge>
                                        <div className="flex items-center gap-2 text-slate-800">
                                            <User className="w-3.5 h-3.5 text-[#135bec]" />
                                            <span className="font-black text-sm">{log.userName}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[10px] font-black text-slate-400 flex items-center gap-1 justify-end">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(log.createdAt).toLocaleDateString('fr-FR')}
                                        </div>
                                        <div className="text-[10px] font-bold text-slate-300">
                                            {new Date(log.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white/50 rounded-2xl p-4 border border-white/50">
                                    <p className="text-xs text-slate-600 font-medium leading-relaxed">
                                        {log.action === "VALIDATE_REQUEST" && `Validation de la demande pour ${log.details.employeeName}`}
                                        {log.action === "REJECT_REQUEST" && `Rejet de la demande pour ${log.details.employeeName}`}
                                        {log.action === "UPDATE_STOCK" && (
                                            <>
                                                Mise à jour du stock : <span className="font-black text-slate-800">{log.details.category}</span>
                                                <br />
                                                <span className="text-[10px] opacity-60">Modification : {log.details.oldQuantity} → {log.details.newQuantity} (Taille {log.details.size})</span>
                                            </>
                                        )}
                                        {!["VALIDATE_REQUEST", "REJECT_REQUEST", "UPDATE_STOCK"].includes(log.action) && JSON.stringify(log.details)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}

                    {sortedLogs.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200">
                            <ShieldCheck className="w-16 h-16 text-slate-200 mb-4" />
                            <p className="text-slate-400 font-bold text-lg italic">Aucune action enregistrée</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
