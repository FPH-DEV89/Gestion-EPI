"use client"

import { useState, useEffect, useRef } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Package, CheckCircle, Building2, Clock, TrendingUp, Zap, BarChart3, PieChart as PieIcon } from "lucide-react"
import {
    PieChart, Pie, Cell, BarChart, Bar, AreaChart, Area,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    Sector
} from 'recharts'

const PieAny: any = Pie;
const BarAny: any = Bar;
const TooltipAny: any = Tooltip;

// ─── Animated Counter Hook (Effet Waou) ─────────────────────────────────────
function useAnimatedCounter(end: number, duration = 1200) {
    const [count, setCount] = useState(0)
    const prevEnd = useRef(0)

    useEffect(() => {
        if (end === prevEnd.current) return
        prevEnd.current = end
        const start = 0
        const startTime = performance.now()
        const step = (now: number) => {
            const progress = Math.min((now - startTime) / duration, 1)
            // Ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3)
            setCount(Math.round(start + (end - start) * eased))
            if (progress < 1) requestAnimationFrame(step)
        }
        requestAnimationFrame(step)
    }, [end, duration])

    return count
}

interface RequestItem {
    category: string
    size: string
    snapshottedPrice: number
    quantity?: number
}

interface Request {
    id: string
    employeeName: string
    service: string
    items: RequestItem[]
    reason: string
    status: string
    createdAt: string
}

// ─── STEF Insights / Glass Tooltip ──────────────────────────────────────────
const GlassTooltip = ({ active, payload, label, isCost, isDonut }: any) => {
    if (active && payload && payload.length) {
        const d = payload[0]
        return (
            <div className="backdrop-blur-xl bg-white/80 border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.12)] rounded-3xl p-4 min-w-[160px]">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                    {label || d.name}
                </p>
                <div className="flex items-baseline gap-2">
                    <p className="text-xl font-black text-slate-900 leading-none">
                        {isCost 
                            ? `${Number(d.value).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}` 
                            : `${d.value} ${isDonut ? 'Demandes' : 'Unités'}`}
                    </p>
                </div>
                {isDonut && d.payload?.total && (
                    <p className="text-[11px] font-semibold text-brand mt-2 bg-brand/10 w-fit px-2 py-0.5 rounded-full">
                        {Math.round((d.value / d.payload.total) * 100)}% du total
                    </p>
                )}
            </div>
        )
    }
    return null
}

// ─── Active Slice for Donut ─────────────────────────────────────────────────
const renderActiveShape = (props: any) => {
    const {
        cx, cy, innerRadius, outerRadius, startAngle, endAngle,
        fill, payload, percent, value
    } = props
    return (
        <g>
            <text x={cx} y={cy - 12} textAnchor="middle" fill="#64748b" style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {payload.name.length > 15 ? payload.name.slice(0, 15) + '…' : payload.name}
            </text>
            <text x={cx} y={cy + 12} textAnchor="middle" fill="#0f172a" style={{ fontSize: 28, fontVariantNumeric: 'tabular-nums', fontWeight: 900 }}>
                {value}
            </text>
            <text x={cx} y={cy + 32} textAnchor="middle" fill="#135bec" style={{ fontSize: 13, fontWeight: 700 }}>
                {(percent * 100).toFixed(0)}%
            </text>
            <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 6} startAngle={startAngle} endAngle={endAngle} fill="url(#brandGrad)" />
            <Sector cx={cx} cy={cy} innerRadius={outerRadius + 10} outerRadius={outerRadius + 13} startAngle={startAngle} endAngle={endAngle} fill="url(#brandGrad)" opacity={0.3} />
        </g>
    )
}

// ─── Gradient defs ──────────────────────────────────────────────────────────
const GradientDefs = () => (
    <defs>
        <linearGradient id="brandGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#135bec" />
            <stop offset="100%" stopColor="#0045bd" />
        </linearGradient>
        <linearGradient id="emeraldGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#059669" />
        </linearGradient>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#135bec" stopOpacity={0.15} />
            <stop offset="100%" stopColor="#135bec" stopOpacity={0} />
        </linearGradient>
    </defs>
)

const PIE_COLORS = ['#135bec', '#3b82f6', '#10b981', '#f59e0b', '#ec4899']

export default function StatisticsDashboard({
    requests,
    showHeader = true
}: {
    requests: Request[],
    showHeader?: boolean
}) {
    const [activePieIndex, setActivePieIndex] = useState(0)
    const [highlightedService, setHighlightedService] = useState<string | null>(null)

    const downloadCSV = (content: string, filename: string) => {
        const blob = new Blob(["\uFEFF" + content], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement("a")
        const url = URL.createObjectURL(blob)
        link.setAttribute("href", url)
        link.setAttribute("download", filename)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    // ─── KPIs Calculation ───────────────────────────────────────────────────
    const orderedRequests = requests.filter(r => r.status === "Ordered")
    const totalEPI = orderedRequests.reduce((acc, r) => acc + r.items.length, 0)
    const totalRequests = requests.length
    const validationRate = totalRequests > 0 ? Math.round((orderedRequests.length / totalRequests) * 100) : 0
    const activeServices = new Set(orderedRequests.map(r => r.service)).size
    const totalBudget = orderedRequests.reduce((total, req) =>
        total + req.items.reduce((sum, item) => sum + (item.snapshottedPrice || 0), 0), 0)

    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1
    const prevMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear

    const currentMonthBudget = orderedRequests
        .filter(r => {
            const d = new Date(r.createdAt)
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear
        })
        .reduce((total, req) => total + req.items.reduce((sum, item) => sum + (item.snapshottedPrice || 0), 0), 0)

    const prevMonthBudget = orderedRequests
        .filter(r => {
            const d = new Date(r.createdAt)
            return d.getMonth() === prevMonth && d.getFullYear() === prevMonthYear
        })
        .reduce((total, req) => total + req.items.reduce((sum, item) => sum + (item.snapshottedPrice || 0), 0), 0)

    const budgetDelta = prevMonthBudget > 0
        ? Math.round(((currentMonthBudget - prevMonthBudget) / prevMonthBudget) * 100)
        : 0

    // Animated Counters
    const animBudget = useAnimatedCounter(Math.round(totalBudget))
    const animEPI = useAnimatedCounter(totalEPI)
    const animRate = useAnimatedCounter(validationRate)

    // ─── Data Aggregation ────────────────────────────────────────────────────
    const epiCounts = orderedRequests.reduce((acc: Record<string, number>, r) => {
        r.items.forEach(item => { acc[item.category] = (acc[item.category] || 0) + 1 })
        return acc
    }, {})
    const totalRequestsCount = Object.values(epiCounts).reduce((a, b) => a + b, 0)
    const topEPIData = Object.entries(epiCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, value]) => ({ name, value, total: totalRequestsCount }))

    const serviceData = Object.entries(
        orderedRequests.reduce((acc: Record<string, number>, r) => {
            r.items.forEach(() => { acc[r.service] = (acc[r.service] || 0) + 1 })
            return acc
        }, {})
    ).map(([service, count]) => ({ service, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 6)

    const timelineData = Array.from({ length: 30 }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() - (29 - i))
        const dayRequests = requests.filter(r => new Date(r.createdAt).toDateString() === date.toDateString()).length
        return { date: `${date.getDate()}/${date.getMonth() + 1}`, requests: dayRequests }
    })

    return (
        <div className={`max-w-7xl mx-auto px-4 space-y-8 ${showHeader ? 'py-10' : 'pt-2 pb-10'}`}>
            
            {/* ─── Hero Header & AI Insights ─────────────────────────────────── */}
            <div className="flex flex-col lg:flex-row gap-6">
                
                {/* Visual Header */}
                <div className="flex-1 space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/5 border border-brand/10 text-brand text-[10px] uppercase font-black tracking-widest leading-none">
                        <Zap className="w-3 h-3" /> Analyse en Temps Réel
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-none">
                        Tableau <span className="text-brand">Analytique</span>
                    </h1>
                    <p className="text-slate-500 font-medium text-lg lg:max-w-md">
                        Pilotez votre budget EPI avec une précision chirurgicale et des prévisions assistées par IA.
                    </p>
                </div>

                {/* STEF Insights Card */}
                <div className="lg:w-80 group">
                    <div className="relative overflow-hidden backdrop-blur-3xl bg-slate-900 rounded-[32px] p-6 shadow-2xl border border-slate-800 transition-all duration-500 hover:scale-[1.02]">
                        <div className="absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 bg-brand/20 blur-[60px] rounded-full group-hover:bg-brand/40 transition-colors" />
                        <div className="relative flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-brand/20 rounded-xl">
                                    <Zap className="w-5 h-5 text-brand" />
                                </div>
                                <span className="text-sm font-bold text-white tracking-tight">STEF Insights</span>
                            </div>
                            <div className="animate-pulse flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-brand" />
                                <span className="text-[10px] font-black text-brand uppercase tracking-wider">Prediction</span>
                            </div>
                        </div>
                        <div className="relative space-y-3">
                            <p className="text-sm text-slate-300 font-medium leading-snug">
                                Basé sur les tendances actuelles, prévoyez un pic de demandes de <span className="text-white font-bold">+15%</span> pour le mois d'avril.
                            </p>
                            <div className="h-[2px] w-full bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-brand w-[65%] rounded-full shadow-[0_0_12px_#135bec]" />
                            </div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Confiance IA: 88%</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── Premium Metric Cards ─────────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    {
                        label: "Consommation Budgétaire", 
                        value: animBudget.toLocaleString('fr-FR') + ' €',
                        icon: <TrendingUp className="w-6 h-6" />,
                        trend: budgetDelta,
                        color: "brand"
                    },
                    {
                        label: "Équipements Délivrés", 
                        value: String(animEPI),
                        icon: <Package className="w-6 h-6" />,
                        trend: null,
                        color: "slate"
                    },
                    {
                        label: "Taux d'Approbation", 
                        value: `${animRate}%`,
                        icon: <CheckCircle className="w-6 h-6" />,
                        trend: null,
                        color: "brand"
                    }
                ].map((item, i) => (
                    <div key={i} className="group relative">
                        <div className={`absolute inset-0 bg-brand/5 rounded-[40px] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                        <Card className="relative overflow-hidden rounded-[40px] border-none shadow-[0_2px_24px_rgba(0,0,0,0.04)] bg-white p-2 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_12px_48px_rgba(19,91,236,0.12)]">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start mb-6">
                                    <div className={`p-4 rounded-2xl ${item.color === 'brand' ? 'bg-brand text-white' : 'bg-slate-100 text-slate-900'}`}>
                                        {item.icon}
                                    </div>
                                    {item.trend !== null && (
                                        <div className={`px-3 py-1 rounded-full text-[11px] font-black tracking-tight ${item.trend > 0 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                            {item.trend > 0 ? '↑' : '↓'} {Math.abs(item.trend)}%
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{item.label}</p>
                                    <p className="text-4xl font-black text-slate-900 tracking-tighter leading-none">{item.value}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                ))}
            </div>

            {/* ─── Data Viz Grid ────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Donut Chart: Distribution */}
                <Card className="rounded-[40px] border-none shadow-[0_2px_24px_rgba(0,0,0,0.04)] bg-white overflow-hidden">
                    <CardHeader className="p-8 pb-0 flex flex-row items-center justify-between">
                        <div className="space-y-1">
                            <CardTitle className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-2">
                                <PieIcon className="w-5 h-5 text-brand" /> Répartition EPI
                            </CardTitle>
                            <CardDescription className="text-slate-400 font-medium">Top 5 des équipements les plus demandés</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8 flex flex-col items-center">
                        <div className="w-full h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <GradientDefs />
                                    <PieAny
                                        activeIndex={activePieIndex}
                                        activeShape={renderActiveShape}
                                        data={topEPIData}
                                        cx="50%" cy="50%"
                                        innerRadius={70} outerRadius={100}
                                        paddingAngle={6}
                                        dataKey="value"
                                        onMouseEnter={(_: any, index: any) => setActivePieIndex(index)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        {topEPIData.map((_: any, index: any) => (
                                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} stroke="none" />
                                        ))}
                                    </PieAny>
                                    <TooltipAny content={<GlassTooltip isDonut />} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="grid grid-cols-2 gap-3 w-full mt-6">
                            {topEPIData.map((entry, i) => (
                                <div key={i} className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100 group cursor-pointer transition-colors hover:bg-slate-100"
                                    onMouseEnter={() => setActivePieIndex(i)}>
                                    <div className="w-3 h-3 rounded-full shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                                    <div className="min-w-0">
                                        <p className="text-[11px] font-bold text-slate-900 truncate tracking-tight uppercase leading-none">{entry.name}</p>
                                        <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mt-1">{entry.value} Demandes</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Bar Chart: Services */}
                <Card className="rounded-[40px] border-none shadow-[0_2px_24px_rgba(0,0,0,0.04)] bg-white overflow-hidden">
                    <CardHeader className="p-8 pb-0">
                        <div className="space-y-1">
                            <CardTitle className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-2">
                                <Building2 className="w-5 h-5 text-brand" /> Impact par Service
                            </CardTitle>
                            <CardDescription className="text-slate-400 font-medium">Consommation d'EPI par département</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8 pt-12">
                        <ResponsiveContainer width="100%" height={380}>
                            <BarChart data={serviceData} layout="vertical" margin={{ left: -10, right: 20 }}>
                                <GradientDefs />
                                <CartesianGrid strokeDasharray="8 8" stroke="#f1f5f9" horizontal={false} />
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="service" 
                                    type="category" 
                                    width={100}
                                    tick={{ fontSize: 11, fill: '#64748b', fontWeight: 'bold' }}
                                    axisLine={false} 
                                    tickLine={false}
                                />
                                <TooltipAny cursor={{ fill: '#f8fafc', radius: 12 }} content={<GlassTooltip />} />
                                <BarAny
                                    dataKey="count"
                                    fill="url(#brandGrad)"
                                    radius={[0, 16, 16, 0]}
                                    barSize={24}
                                >
                                    {serviceData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={highlightedService === null || highlightedService === entry.service ? 'url(#brandGrad)' : '#cbd5e1'}
                                            onMouseEnter={() => setHighlightedService(entry.service)}
                                            onMouseLeave={() => setHighlightedService(null)} 
                                        />
                                    ))}
                                </BarAny>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* ─── Timeline Activity ─────────────────────────────────────────── */}
            <Card className="rounded-[40px] border-none shadow-[0_2px_24px_rgba(0,0,0,0.04)] bg-white overflow-hidden">
                <CardHeader className="p-8 flex flex-row items-center justify-between">
                    <div className="space-y-1">
                        <CardTitle className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-brand" /> Fréquence des Demandes
                        </CardTitle>
                        <CardDescription className="text-slate-400 font-medium">Historique d'activité sur les 30 derniers jours</CardDescription>
                    </div>
                    <Button
                        variant="ghost" size="icon"
                        className="rounded-full w-12 h-12 bg-slate-50 text-slate-900 hover:bg-brand hover:text-white transition-all duration-300"
                        onClick={() => {
                            const consumed = requests.filter(r => r.status === "Ordered")
                            const headers = ["Date", "Collaborateur", "Service", "Equipement", "Taille", "Prix unitaire"]
                            const rows: string[][] = []
                            consumed.forEach(r => {
                                r.items.forEach(item => {
                                    rows.push([
                                        new Date(r.createdAt).toLocaleDateString("fr-FR"),
                                        r.employeeName, r.service, item.category, item.size,
                                        `${item.snapshottedPrice}€`
                                    ])
                                })
                            })
                            downloadCSV([headers.join(";"), ...rows.map(row => row.join(";"))].join("\n"),
                                `stef_analytic_extract_${new Date().toISOString().split('T')[0]}.csv`)
                        }}
                    >
                        <Download className="w-5 h-5" />
                    </Button>
                </CardHeader>
                <CardContent className="p-8 pt-0">
                    <div className="w-full h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={timelineData} margin={{ top: 20, right: 20, bottom: 0, left: 0 }}>
                                <GradientDefs />
                                <CartesianGrid strokeDasharray="8 8" stroke="#f1f5f9" vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
                                    axisLine={false} 
                                    tickLine={false}
                                    interval={4}
                                />
                                <YAxis hide />
                                <TooltipAny content={<GlassTooltip />} />
                                <Area
                                    type="monotone"
                                    dataKey="requests"
                                    stroke="#135bec"
                                    strokeWidth={4}
                                    fill="url(#areaGrad)"
                                    dot={false}
                                    activeDot={{ r: 8, strokeWidth: 0, fill: '#135bec' }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
