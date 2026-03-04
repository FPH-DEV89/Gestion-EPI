"use client"

import { useState, useEffect, useRef } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Package, CheckCircle, Building2, Clock, TrendingUp } from "lucide-react"
import {
    PieChart, Pie, Cell, BarChart, Bar, AreaChart, Area,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    Sector
} from 'recharts'

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

// ─── Custom Tooltip for Donut ──────────────────────────────────────────────
const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const d = payload[0]
        return (
            <div className="bg-white border border-slate-200 shadow-xl rounded-xl px-4 py-3 text-sm">
                <p className="font-bold text-slate-800">{d.name}</p>
                <p className="text-brand font-semibold mt-1">{d.value} demandes</p>
                <p className="text-slate-400 text-xs mt-0.5">
                    {Math.round((d.value / (d.payload?.total || 1)) * 100)}% du total
                </p>
            </div>
        )
    }
    return null
}

// ─── Custom Tooltip for Bar Charts ──────────────────────────────────────────
const BarTooltip = ({ active, payload, label, isCost }: any) => {
    if (active && payload && payload.length) {
        const val = payload[0].value
        return (
            <div className="bg-white border border-slate-200 shadow-xl rounded-xl px-4 py-3 text-sm min-w-[140px]">
                <p className="font-bold text-slate-800 mb-1">{label}</p>
                <p className="font-semibold" style={{ color: payload[0].fill || payload[0].stroke }}>
                    {isCost ? `${Number(val).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}` : `${val} EPI`}
                </p>
            </div>
        )
    }
    return null
}

// ─── Custom Tooltip for Area Chart ──────────────────────────────────────────
const AreaTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white border border-slate-200 shadow-xl rounded-xl px-4 py-3 text-sm">
                <p className="text-slate-500 text-xs mb-1">Le {label}</p>
                <p className="font-bold text-blue-600">{payload[0].value} demande{payload[0].value > 1 ? 's' : ''}</p>
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
            <text x={cx} y={cy - 14} textAnchor="middle" fill="#1e293b" style={{ fontSize: 12, fontWeight: 700 }}>
                {payload.name.length > 12 ? payload.name.slice(0, 12) + '…' : payload.name}
            </text>
            <text x={cx} y={cy + 8} textAnchor="middle" fill="#3b82f6" style={{ fontSize: 22, fontWeight: 800 }}>
                {value}
            </text>
            <text x={cx} y={cy + 26} textAnchor="middle" fill="#94a3b8" style={{ fontSize: 13, fontWeight: 600 }}>
                {(percent * 100).toFixed(0)}%
            </text>
            <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 8} startAngle={startAngle} endAngle={endAngle} fill={fill} />
            <Sector cx={cx} cy={cy} innerRadius={outerRadius + 11} outerRadius={outerRadius + 14} startAngle={startAngle} endAngle={endAngle} fill={fill} opacity={0.5} />
        </g>
    )
}

// ─── Gradient defs ──────────────────────────────────────────────────────────
const GradientDefs = () => (
    <defs>
        <linearGradient id="blueGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
        <linearGradient id="greenGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#34d399" />
        </linearGradient>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
        </linearGradient>
    </defs>
)

// ─── Colour palette ─────────────────────────────────────────────────────────
const PIE_COLORS = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ec4899']

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

    // ─── KPIs ────────────────────────────────────────────────────────────────
    const orderedRequests = requests.filter(r => r.status === "Ordered")
    const totalEPI = orderedRequests.reduce((acc, r) => acc + r.items.length, 0)
    const totalRequests = requests.length
    const validationRate = totalRequests > 0 ? Math.round((orderedRequests.length / totalRequests) * 100) : 0
    const activeServices = new Set(orderedRequests.map(r => r.service)).size
    const totalBudget = orderedRequests.reduce((total, req) =>
        total + req.items.reduce((sum, item) => sum + (item.snapshottedPrice || 0), 0), 0)

    // Monthly Comparison logic
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

    // Animated KPI counters (must be after KPI calculations)
    const animBudget = useAnimatedCounter(Math.round(totalBudget))
    const animEPI = useAnimatedCounter(totalEPI)
    const animRate = useAnimatedCounter(validationRate)
    const animServices = useAnimatedCounter(activeServices)




    // ─── Top 5 EPI ───────────────────────────────────────────────────────────
    const epiCounts = orderedRequests.reduce((acc: Record<string, number>, r) => {
        r.items.forEach(item => { acc[item.category] = (acc[item.category] || 0) + 1 })
        return acc
    }, {})
    const topTotal = Object.values(epiCounts).reduce((a, b) => a + b, 0)
    const topEPIData = Object.entries(epiCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, value]) => ({ name, value, total: topTotal }))

    // ─── Cost per EPI ─────────────────────────────────────────────────────────
    const epiCosts = orderedRequests.reduce((acc: Record<string, number>, r) => {
        r.items.forEach(item => {
            acc[item.category] = (acc[item.category] || 0) + ((item.snapshottedPrice || 0) * (item.quantity || 1))
        })
        return acc
    }, {})
    const costEPIData = Object.entries(epiCosts)
        .sort((a, b) => b[1] - a[1])
        .map(([name, value]) => ({ name, value }))

    // ─── Service consumption ──────────────────────────────────────────────────
    const serviceData = Object.entries(
        orderedRequests.reduce((acc: Record<string, number>, r) => {
            r.items.forEach(() => { acc[r.service] = (acc[r.service] || 0) + 1 })
            return acc
        }, {})
    ).map(([service, count]) => ({ service, count }))
        .sort((a, b) => b.count - a.count)

    // ─── Timeline ─────────────────────────────────────────────────────────────
    const timelineData = Array.from({ length: 30 }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() - (29 - i))
        const dayRequests = requests.filter(r => new Date(r.createdAt).toDateString() === date.toDateString()).length
        return { date: `${date.getDate()}/${date.getMonth() + 1}`, requests: dayRequests }
    })

    return (
        <div className={`max-w-7xl mx-auto px-4 space-y-6 ${showHeader ? 'py-10' : 'pt-2 pb-10'}`}>
            {showHeader && (
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Statistiques de Consommation</h1>
                        <p className="text-gray-500 mt-1">Analyse des distributions d'EPI par service et collaborateur</p>
                    </div>
                </div>
            )}

            {/* ─── KPIs ──────────────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {[
                    {
                        label: "Budget Total", value: animBudget.toLocaleString('fr-FR') + ' €',
                        icon: <TrendingUp className="w-5 h-5" />, color: "brand", bg: "bg-brand/10", text: "text-brand", border: "border-l-brand",
                        subtitle: budgetDelta !== 0 ? (
                            <span className={`text-[10px] font-bold ${budgetDelta > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                                {budgetDelta > 0 ? '+' : ''}{budgetDelta}% vs mois-1
                            </span>
                        ) : <span className="text-[10px] text-gray-400">Stable vs mois-1</span>
                    },
                    {
                        label: "EPI Distribués", value: String(animEPI),
                        icon: <Package className="w-5 h-5" />, color: "blue", bg: "bg-blue-50", text: "text-blue-600", border: "border-l-blue-500"
                    },
                    {
                        label: "Validation", value: `${animRate}%`,
                        icon: <CheckCircle className="w-5 h-5" />, color: "green", bg: "bg-green-50", text: "text-green-600", border: "border-l-green-500"
                    },
                    {
                        label: "Services actifs", value: String(animServices),
                        icon: <Building2 className="w-5 h-5" />, color: "purple", bg: "bg-purple-50", text: "text-purple-600", border: "border-l-purple-500"
                    },
                    {
                        label: "Délai moyen", value: "2.3j",
                        icon: <Clock className="w-5 h-5" />, color: "orange", bg: "bg-orange-50", text: "text-orange-500", border: "border-l-orange-500"
                    },
                ].map((item, i) => (
                    <Card key={i} className={`relative overflow-hidden border-0 border-l-4 shadow-sm hover:shadow-md transition-all duration-200 ${item.border}`}>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                                <div className={`p-2 rounded-lg ${item.bg} ${item.text}`}>
                                    {item.icon}
                                </div>
                                {item.subtitle}
                            </div>
                            <div className="space-y-0.5">
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{item.label}</p>
                                <p className="text-2xl font-black text-gray-900 tracking-tight">{item.value}</p>
                            </div>
                        </CardContent>
                        {item.color === 'brand' && (
                            <div className="absolute top-0 right-0 w-16 h-16 -mr-8 -mt-8 bg-brand/5 rounded-full" />
                        )}
                    </Card>
                ))}
            </div>

            {/* ─── 3 Charts ─────────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Donut – Top 5 EPI */}
                <Card className="hover:shadow-lg transition-shadow duration-200">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">Top 5 EPI</CardTitle>
                        <CardDescription>Cliquez sur un segment pour le mettre en valeur</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {topEPIData.length > 0 ? (
                            <>
                                <ResponsiveContainer width="100%" height={260}>
                                    <PieChart>
                                        <GradientDefs />
                                        <Pie
                                            activeIndex={activePieIndex}
                                            activeShape={renderActiveShape}
                                            data={topEPIData}
                                            cx="50%" cy="50%"
                                            innerRadius={65} outerRadius={95}
                                            paddingAngle={4}
                                            dataKey="value"
                                            onMouseEnter={(_, index) => setActivePieIndex(index)}
                                            onClick={(_, index) => setActivePieIndex(index)}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            {topEPIData.map((_, index) => (
                                                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} stroke="none" />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<PieTooltip />} />
                                    </PieChart>
                                </ResponsiveContainer>
                                {/* Legend dots */}
                                <div className="flex flex-col gap-1.5 mt-1 px-2">
                                    {topEPIData.map((entry, i) => (
                                        <div
                                            key={entry.name}
                                            className={`flex items-center gap-2 text-xs cursor-pointer rounded-md px-2 py-1 transition-colors ${activePieIndex === i ? 'bg-slate-100' : 'hover:bg-slate-50'}`}
                                            onMouseEnter={() => setActivePieIndex(i)}
                                            onClick={() => setActivePieIndex(i)}
                                        >
                                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                                            <span className="text-slate-600 truncate flex-1">{entry.name}</span>
                                            <span className="font-semibold text-slate-800">{entry.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="h-[260px] flex items-center justify-center text-gray-400">Aucune donnée</div>
                        )}
                    </CardContent>
                </Card>

                {/* Bar – Consommation par Service */}
                <Card className="hover:shadow-lg transition-shadow duration-200">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">Consommation par Service</CardTitle>
                        <CardDescription>Passez la souris sur une barre pour le détail</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {serviceData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={340}>
                                <BarChart data={serviceData} layout="vertical" margin={{ left: 0, right: 16, top: 4, bottom: 4 }}>
                                    <GradientDefs />
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                                    <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                    <YAxis
                                        dataKey="service" type="category" width={80}
                                        tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }}
                                        axisLine={false} tickLine={false}
                                    />
                                    <Tooltip content={<BarTooltip isCost={false} />} cursor={{ fill: '#f1f5f9', radius: 6 }} />
                                    <Bar
                                        dataKey="count"
                                        fill="url(#blueGrad)"
                                        radius={[0, 8, 8, 0]}
                                        isAnimationActive={true}
                                        animationDuration={800}
                                        onMouseEnter={(d) => setHighlightedService(d.service)}
                                        onMouseLeave={() => setHighlightedService(null)}
                                    >
                                        {serviceData.map((entry) => (
                                            <Cell
                                                key={entry.service}
                                                fill={highlightedService === null || highlightedService === entry.service
                                                    ? "url(#blueGrad)"
                                                    : '#cbd5e1'
                                                }
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-[340px] flex items-center justify-center text-gray-400">Aucune donnée</div>
                        )}
                    </CardContent>
                </Card>

                {/* Bar – Dépenses par EPI */}
                <Card className="hover:shadow-lg transition-shadow duration-200">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">Dépenses par EPI</CardTitle>
                        <CardDescription>Coût total validé par équipement</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {costEPIData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={340}>
                                <BarChart data={costEPIData} layout="vertical" margin={{ left: 0, right: 16, top: 4, bottom: 4 }}>
                                    <GradientDefs />
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                                    <XAxis
                                        type="number"
                                        tick={{ fontSize: 11, fill: '#94a3b8' }}
                                        tickFormatter={(v) => `${v}€`}
                                        axisLine={false} tickLine={false}
                                    />
                                    <YAxis
                                        dataKey="name" type="category" width={90}
                                        tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }}
                                        axisLine={false} tickLine={false}
                                    />
                                    <Tooltip content={<BarTooltip isCost={true} />} cursor={{ fill: '#f0fdf4', radius: 6 }} />
                                    <Bar
                                        dataKey="value"
                                        fill="url(#greenGrad)"
                                        radius={[0, 8, 8, 0]}
                                        isAnimationActive={true}
                                        animationDuration={1000}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-[340px] flex items-center justify-center text-gray-400">Aucune donnée</div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* ─── Area Chart – Timeline ──────────────────────────────────── */}
            <Card className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div>
                        <CardTitle className="text-base">Évolution des Demandes (30 derniers jours)</CardTitle>
                        <CardDescription>Tendance de consommation sur le dernier mois</CardDescription>
                    </div>
                    <Button
                        variant="outline" size="sm"
                        className="text-brand border-brand/30 hover:bg-brand/5 gap-2 shrink-0"
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
                                `consommation_epi_${new Date().toISOString().split('T')[0]}.csv`)
                        }}
                        disabled={orderedRequests.length === 0}
                    >
                        <Download className="w-4 h-4" /> Exporter CSV
                    </Button>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={260}>
                        <AreaChart data={timelineData} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
                            <defs>
                                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                            <XAxis
                                dataKey="date"
                                tick={{ fontSize: 10, fill: '#94a3b8' }}
                                axisLine={false} tickLine={false}
                                interval={4}
                            />
                            <YAxis
                                tick={{ fontSize: 11, fill: '#94a3b8' }}
                                axisLine={false} tickLine={false}
                                allowDecimals={false}
                            />
                            <Tooltip content={<AreaTooltip />} />
                            <Area
                                type="monotone"
                                dataKey="requests"
                                stroke="#3b82f6"
                                strokeWidth={2.5}
                                fill="url(#areaGrad)"
                                dot={false}
                                activeDot={{ r: 5, strokeWidth: 0, fill: '#3b82f6' }}
                                isAnimationActive={true}
                                animationDuration={1200}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    )
}
