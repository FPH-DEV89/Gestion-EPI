"use client"

import { useState, useEffect, useRef } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Package, CheckCircle, Building2, Clock, TrendingUp, Zap, BarChart3, PieChart as PieIcon, AlertTriangle, ShieldAlert } from "lucide-react"
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
    firstName?: string | null
    service: string
    items: RequestItem[]
    reason: string
    status: string
    createdAt: string
    validatedBy?: string | null
    validatedAt?: string | null
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

import { useMemo } from 'react'

export default function StatisticsDashboard({
    requests,
    stock,
    showHeader = true
}: {
    requests: Request[],
    stock?: any[],
    showHeader?: boolean
}) {
    const [activePieIndex, setActivePieIndex] = useState(0)
    const [highlightedService, setHighlightedService] = useState<string | null>(null)
    const [showBudget, setShowBudget] = useState(false)
    const [selectedMonth, setSelectedMonth] = useState<Date | null>(null) // null = all data

    // Month navigation helpers
    const navigateMonth = (direction: number) => {
        setSelectedMonth(prev => {
            const base = prev || new Date()
            const newDate = new Date(base.getFullYear(), base.getMonth() + direction, 1)
            return newDate
        })
    }

    const getMonthLabel = (date: Date) => {
        return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
            .replace(/^\w/, c => c.toUpperCase())
    }

    const isCurrentMonth = (date: Date | null) => {
        if (!date) return false
        const now = new Date()
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
    }

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

    // Filter by selected month if one is chosen
    const filteredOrdered = selectedMonth 
        ? orderedRequests.filter(r => {
            const d = new Date(r.createdAt)
            return d.getMonth() === selectedMonth.getMonth() && d.getFullYear() === selectedMonth.getFullYear()
        })
        : orderedRequests

    const totalEPI = filteredOrdered.reduce((acc, r) => acc + r.items.length, 0)
    const totalRequests = requests.length
    const validationRate = totalRequests > 0 ? Math.round((orderedRequests.length / totalRequests) * 100) : 0
    const activeServices = new Set(filteredOrdered.map(r => r.service)).size
    const totalBudget = filteredOrdered.reduce((total, req) =>
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
    const categoryLabelMap = useMemo(() => {
        const map: Record<string, string> = {}
        stock?.forEach(item => {
            map[item.category] = item.label || item.category
        })
        return map
    }, [stock])

    const epiCounts = filteredOrdered.reduce((acc: Record<string, number>, r) => {
        r.items.forEach(item => { 
            const label = categoryLabelMap[item.category] || item.category
            acc[label] = (acc[label] || 0) + 1 
        })
        return acc
    }, {})
    const totalRequestsCount = Object.values(epiCounts).reduce((a: number, b: number) => a + b, 0)
    const topEPIData = Object.entries(epiCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, value]) => ({ name, value, total: totalRequestsCount }))

    const serviceData = Object.entries(
        filteredOrdered.reduce((acc: Record<string, { count: number; cost: number }>, r) => {
            if (!acc[r.service]) {
                acc[r.service] = { count: 0, cost: 0 }
            }
            r.items.forEach(item => {
                acc[r.service].count += 1
                acc[r.service].cost += (item.snapshottedPrice || 0)
            })
            return acc
        }, {})
    ).map(([service, { count, cost }]) => ({ 
        service, 
        count, 
        cost,
        value: showBudget ? cost : count 
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6)

    // ─── Durability & Anomaly Analysis ───────────────────────────────────────
    const durabilityAnomalies = useMemo(() => {
        const anomalies: Array<{
            employee: string
            category: string
            count: number
            dates: string[]
            averageInterval: number
        }> = []

        const allocations: Record<string, Record<string, Array<Date>>> = {}

        filteredOrdered.forEach(r => {
            const employeeKey = r.firstName ? `${r.firstName} ${r.employeeName}` : r.employeeName
            if (!allocations[employeeKey]) {
                allocations[employeeKey] = {}
            }
            r.items.forEach(item => {
                if (!allocations[employeeKey][item.category]) {
                    allocations[employeeKey][item.category] = []
                }
                allocations[employeeKey][item.category].push(new Date(r.createdAt))
            })
        })

        Object.entries(allocations).forEach(([employee, catMap]) => {
            Object.entries(catMap).forEach(([category, dates]) => {
                dates.sort((a, b) => a.getTime() - b.getTime())

                if (dates.length < 3) return

                let flagged = false
                for (let i = 2; i < dates.length; i++) {
                    const diffTime = dates[i].getTime() - dates[i-2].getTime()
                    const diffDays = diffTime / (1000 * 60 * 60 * 24)
                    if (diffDays <= 30) {
                        flagged = true
                        break
                    }
                }

                if (flagged) {
                    let totalDiff = 0
                    for (let i = 1; i < dates.length; i++) {
                        totalDiff += (dates[i].getTime() - dates[i-1].getTime())
                    }
                    const avgIntervalDays = Math.round(totalDiff / (dates.length - 1) / (1000 * 60 * 60 * 24))

                    anomalies.push({
                        employee,
                        category: categoryLabelMap[category] || category,
                        count: dates.length,
                        dates: dates.map(d => d.toLocaleDateString("fr-FR", { day: '2-digit', month: '2-digit' })),
                        averageInterval: avgIntervalDays
                    })
                }
            })
        })

        return anomalies
    }, [filteredOrdered, categoryLabelMap])

    // ─── Budget by Reason Analysis ───────────────────────────────────────────
    const budgetByReason = useMemo(() => {
        const breakdown: Record<string, number> = {
            "Usure": 0,
            "Perte": 0,
            "Nouvel Arrivant": 0,
            "Autre": 0
        }

        filteredOrdered.forEach(r => {
            const lower = (r.reason || "").toLowerCase()
            let norm = "Autre"
            if (lower.includes("usure")) norm = "Usure"
            else if (lower.includes("perte")) norm = "Perte"
            else if (lower.includes("arrivant") || lower.includes("nouveau") || lower.includes("recrutement")) norm = "Nouvel Arrivant"

            const cost = r.items.reduce((sum, item) => sum + (item.snapshottedPrice || 0), 0)
            breakdown[norm] = (breakdown[norm] || 0) + cost
        })

        const total = Object.values(breakdown).reduce((a, b) => a + b, 0)

        return Object.entries(breakdown)
            .map(([name, value]) => ({
                name,
                value,
                percentage: total > 0 ? Math.round((value / total) * 100) : 0
            }))
            .sort((a, b) => b.value - a.value)
    }, [filteredOrdered])

    const timelineData = Array.from({ length: 30 }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() - (29 - i))
        const dayRequests = requests.filter(r => new Date(r.createdAt).toDateString() === date.toDateString()).length
        return { date: `${date.getDate()}/${date.getMonth() + 1}`, requests: dayRequests }
    })

    // ─── STEF AI Predictive Stock Calculations (Dynamique) ───────────────────
    const aiPrediction = useMemo(() => {
        if (!stock || stock.length === 0) {
            return {
                text: "Données de stock insuffisantes pour générer des prévisions précises d'autonomie.",
                progress: 50,
                confidence: 50,
                isAlert: false
            };
        }

        // 1. Calculer la vitesse d'attribution (quantité d'EPI validés par semaine par catégorie au cours des 30 derniers jours)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const recentRequests = requests.filter(r => r.status === "Ordered" && new Date(r.createdAt) >= thirtyDaysAgo);
        const categoryWeeklyRates: Record<string, number> = {};

        recentRequests.forEach(r => {
            r.items.forEach(item => {
                categoryWeeklyRates[item.category] = (categoryWeeklyRates[item.category] || 0) + 1;
            });
        });

        // Diviser par 4.28 (environ 30 jours divisés par 7) pour avoir le taux hebdomadaire
        Object.keys(categoryWeeklyRates).forEach(cat => {
            categoryWeeklyRates[cat] = categoryWeeklyRates[cat] / 4.28;
        });

        // 2. Calculer le stock actuel total par catégorie
        const categoryStocks: Record<string, number> = {};
        stock.forEach(item => {
            const totalQty = Object.values(item.stock as Record<string, number>).reduce((a, b) => a + b, 0);
            categoryStocks[item.category] = totalQty;
        });

        // 3. Calculer les semaines d'autonomie
        let criticalCategory = "";
        let criticalLabel = "";
        let minWeeks = Infinity;

        stock.forEach(item => {
            const currentStock = categoryStocks[item.category] || 0;
            const weeklyRate = categoryWeeklyRates[item.category] || 0;

            if (weeklyRate > 0) {
                const weeks = currentStock / weeklyRate;
                if (weeks < minWeeks) {
                    minWeeks = weeks;
                    criticalCategory = item.category;
                    criticalLabel = item.label || item.category;
                }
            }
        });

        // 4. Formuler le message
        if (criticalCategory && minWeeks < 4) {
            const daysLeft = Math.round(minWeeks * 7);
            return {
                text: `Attention : Au rythme d'attribution actuel, le stock de ${criticalLabel} sera épuisé d'ici environ ${minWeeks.toFixed(1)} semaines (${daysLeft} jours).`,
                progress: Math.max(10, Math.min(45, Math.round((minWeeks / 4) * 100))),
                confidence: 92,
                isAlert: true
            };
        } else if (criticalCategory && minWeeks !== Infinity) {
            return {
                text: `Autonomie saine : Le produit le plus demandé (${criticalLabel}) dispose de ${minWeeks.toFixed(1)} semaines d'autonomie. Aucune rupture immédiate en vue.`,
                progress: Math.max(50, Math.min(100, Math.round((minWeeks / 12) * 100))),
                confidence: 85,
                isAlert: false
            };
        }

        return {
            text: "Le rythme d'attribution des EPI est stable. Vos réserves actuelles garantissent une autonomie globale moyenne confortable.",
            progress: 80,
            confidence: 75,
            isAlert: false
        };
    }, [requests, stock]);

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
                                <span className={`w-1.5 h-1.5 rounded-full ${aiPrediction.isAlert ? 'bg-rose-500 shadow-[0_0_8px_#f43f5e]' : 'bg-brand'}`} />
                                <span className={`text-[10px] font-black uppercase tracking-wider ${aiPrediction.isAlert ? 'text-rose-400' : 'text-brand'}`}>
                                    {aiPrediction.isAlert ? 'Attention' : 'Prévision'}
                                </span>
                            </div>
                        </div>
                        <div className="relative space-y-3">
                            <p className="text-sm text-slate-300 font-medium leading-snug">
                                {aiPrediction.text}
                            </p>
                            <div className="h-[2px] w-full bg-slate-800 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full rounded-full transition-all duration-500 ${aiPrediction.isAlert ? 'bg-rose-500 shadow-[0_0_12px_#f43f5e]' : 'bg-brand shadow-[0_0_12px_#135bec]'}`} 
                                    style={{ width: `${aiPrediction.progress}%` }} 
                                />
                            </div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Confiance IA : {aiPrediction.confidence}%</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── Month Navigation ─────────────────────────────────────── */}
            <div className="flex items-center justify-between bg-white rounded-[32px] shadow-[0_2px_24px_rgba(0,0,0,0.04)] p-4 border border-slate-100">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => navigateMonth(-1)}
                        className="w-10 h-10 rounded-full bg-slate-100 hover:bg-brand hover:text-white text-slate-600 flex items-center justify-center transition-all duration-200 active:scale-95"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <div className="px-6 py-2 min-w-[200px] text-center">
                        <p className="text-lg font-black text-slate-900 tracking-tight">
                            {selectedMonth ? getMonthLabel(selectedMonth) : 'Toutes les données'}
                        </p>
                        {selectedMonth && (
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                {isCurrentMonth(selectedMonth) ? 'Mois en cours' : 'Mois sélectionné'}
                            </p>
                        )}
                    </div>
                    <button
                        onClick={() => navigateMonth(1)}
                        disabled={selectedMonth && isCurrentMonth(selectedMonth) || false}
                        className="w-10 h-10 rounded-full bg-slate-100 hover:bg-brand hover:text-white text-slate-600 flex items-center justify-center transition-all duration-200 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                    </button>
                </div>
                <div className="flex items-center gap-2">
                    {selectedMonth && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-full text-xs font-black text-slate-500 hover:text-brand"
                            onClick={() => setSelectedMonth(null)}
                        >
                            Vue globale
                        </Button>
                    )}
                    {!selectedMonth && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-full text-xs font-black bg-brand/5 text-brand hover:bg-brand/10"
                            onClick={() => setSelectedMonth(new Date())}
                        >
                            Mois en cours
                        </Button>
                    )}
                    {selectedMonth && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-full bg-brand text-white hover:bg-brand/90 text-xs font-black flex items-center gap-1.5"
                            onClick={() => {
                                const consumed = filteredOrdered
                                const headers = ["Date", "Collaborateur", "Service", "Equipement", "Taille", "Prix unitaire", "Quantité", "Motif", "Validateur"]
                                const rows: string[][] = []
                                consumed.forEach(r => {
                                    r.items.forEach(item => {
                                        rows.push([
                                            new Date(r.createdAt).toLocaleDateString("fr-FR"),
                                            r.employeeName,
                                            r.service,
                                            categoryLabelMap[item.category] || item.category,
                                            item.size,
                                            `${item.snapshottedPrice || 0} €`,
                                            String(item.quantity || 1),
                                            r.reason || "",
                                            r.validatedBy || ""
                                        ])
                                    })
                                })
                                const csvContent = [headers.join(";"), ...rows.map(row => row.join(";"))].join("\n")
                                const monthStr = selectedMonth.toLocaleDateString('fr-FR', { month: '2-digit', year: 'numeric' }).replace('/', '-')
                                downloadCSV(csvContent, `budget-epi-${monthStr}.csv`)
                            }}
                        >
                            <Download className="w-3.5 h-3.5" />
                            Exporter {getMonthLabel(selectedMonth)} (CSV)
                        </Button>
                    )}
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
                    <CardHeader className="p-8 pb-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <CardTitle className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-2">
                                <Building2 className="w-5 h-5 text-brand" /> Impact par Service
                            </CardTitle>
                            <CardDescription className="text-slate-400 font-medium">
                                {showBudget ? "Budget dépensé en Euros (€)" : "Quantité d'EPI distribués"} par service
                            </CardDescription>
                        </div>
                        <div className="flex bg-slate-100 p-1 rounded-full border border-slate-200/50 shadow-inner">
                            <button
                                onClick={() => setShowBudget(false)}
                                className={`px-4 py-1.5 rounded-full text-xs font-black tracking-tight transition-all duration-300 ${!showBudget ? 'bg-white text-brand shadow-sm scale-105' : 'text-slate-500 hover:text-slate-905'}`}
                            >
                                Unités
                            </button>
                            <button
                                onClick={() => setShowBudget(true)}
                                className={`px-4 py-1.5 rounded-full text-xs font-black tracking-tight transition-all duration-300 ${showBudget ? 'bg-brand text-white shadow-sm scale-105' : 'text-slate-500 hover:text-slate-905'}`}
                            >
                                Budget (€)
                            </button>
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
                                <TooltipAny cursor={{ fill: '#f8fafc', radius: 12 }} content={<GlassTooltip isCost={showBudget} />} />
                                <BarAny
                                    dataKey="value"
                                    fill="url(#brandGrad)"
                                    radius={[0, 16, 16, 0]}
                                    barSize={24}
                                >
                                    {serviceData.map((entry: any, index: any) => (
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

            {/* ─── Financial Audit & Durability Section ─────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Budget Distribution by Reason */}
                <Card className="rounded-[40px] border-none shadow-[0_2px_24px_rgba(0,0,0,0.04)] bg-white overflow-hidden flex flex-col justify-between">
                    <CardHeader className="p-8 pb-0">
                        <div className="space-y-1">
                            <CardTitle className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-2">
                                <BarChart3 className="w-5 h-5 text-brand" /> Budget par Motif
                            </CardTitle>
                            <CardDescription className="text-slate-400 font-medium">Répartition des dépenses selon l'origine du besoin</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8 space-y-8 flex-1 flex flex-col justify-center">
                        {/* Stacked Progress Bar */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
                                <span>Distribution Visuelle</span>
                                <span>Total: {Math.round(totalBudget).toLocaleString('fr-FR')} €</span>
                            </div>
                            <div className="h-4 w-full bg-slate-100 rounded-full flex overflow-hidden shadow-inner">
                                {budgetByReason.map((item, i) => {
                                    const colors = ["bg-[#135bec]", "bg-[#10b981]", "bg-[#f43f5e]", "bg-[#64748b]"]
                                    return item.percentage > 0 && (
                                        <div 
                                            key={i} 
                                            className={`${colors[i % colors.length]} h-full transition-all duration-500`}
                                            style={{ width: `${item.percentage}%` }}
                                            title={`${item.name} : ${item.percentage}%`}
                                        />
                                    )
                                })}
                            </div>
                        </div>

                        {/* List of Reasons details */}
                        <div className="grid gap-3">
                            {budgetByReason.map((item, i) => {
                                const colors = ["bg-[#135bec]", "bg-[#10b981]", "bg-[#f43f5e]", "bg-[#64748b]"]
                                const textColors = ["text-[#135bec]", "text-[#10b981]", "text-[#f43f5e]", "text-[#64748b]"]
                                const bgColors = ["bg-[#135bec]/10", "bg-[#10b981]/10", "bg-[#f43f5e]/10", "bg-[#64748b]/10"]
                                return (
                                    <div key={i} className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-100 transition-all duration-300 hover:bg-slate-100/80">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-3.5 h-3.5 rounded-full shrink-0 ${colors[i % colors.length]}`} />
                                            <div>
                                                <p className="text-[11px] font-extrabold text-slate-900 uppercase tracking-tight leading-none">{item.name}</p>
                                                <p className="text-[10px] font-medium text-slate-400 mt-1">Impact sur le stock global</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-black text-slate-900 tracking-tight">{Math.round(item.value).toLocaleString('fr-FR')} €</p>
                                            <span className={`inline-block text-[9px] font-black px-2 py-0.5 rounded-full mt-1 ${bgColors[i % bgColors.length]} ${textColors[i % textColors.length]}`}>
                                                {item.percentage}%
                                            </span>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Durability Anomalies Widget */}
                <Card className="rounded-[40px] border-none shadow-[0_2px_24px_rgba(0,0,0,0.04)] bg-white overflow-hidden flex flex-col justify-between">
                    <CardHeader className="p-8 pb-0">
                        <div className="space-y-1">
                            <CardTitle className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-2">
                                <ShieldAlert className="w-5 h-5 text-rose-500" /> Alertes Durabilité & Anomalies
                            </CardTitle>
                            <CardDescription className="text-slate-400 font-medium">Usures prématurées : EPI demandés &gt; 2 fois en 30 jours</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8 space-y-4 flex-1 flex flex-col justify-center overflow-y-auto max-h-[380px]">
                        {durabilityAnomalies.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 text-center space-y-3">
                                <div className="p-4 rounded-full bg-emerald-50 text-emerald-505 shadow-sm border border-emerald-100">
                                    <CheckCircle className="w-8 h-8 text-emerald-500" />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-slate-950">Aucune usure prématurée</p>
                                    <p className="text-xs text-slate-400 font-medium max-w-xs mt-1">
                                        Tous les renouvellements d'équipements s'effectuent selon des cycles normaux.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {durabilityAnomalies.slice(0, 4).map((anomaly, i) => (
                                    <div key={i} className="relative overflow-hidden backdrop-blur-3xl bg-rose-50/50 border border-rose-100/80 rounded-3xl p-4 transition-all duration-300 hover:scale-[1.01]">
                                        {/* Pulse Alert Tag */}
                                        <div className="absolute top-4 right-4 flex items-center gap-1">
                                            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                                            <span className="w-2 h-2 rounded-full bg-rose-500 absolute" />
                                            <span className="text-[9px] font-black text-rose-600 uppercase tracking-widest ml-2 bg-rose-100 px-2 py-0.5 rounded-full">
                                                Alerte {anomaly.count}x
                                            </span>
                                        </div>

                                        <div className="space-y-3">
                                            <div>
                                                <p className="text-xs font-black text-slate-900 tracking-tight">{anomaly.employee}</p>
                                                <p className="text-[10px] font-bold text-rose-500 uppercase tracking-wider mt-0.5">{anomaly.category}</p>
                                            </div>

                                            <div className="flex items-center justify-between border-t border-rose-200/30 pt-2.5">
                                                <div>
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Cycle moyen</span>
                                                    <span className="text-xs font-black text-slate-900 flex items-center gap-1 mt-0.5">
                                                        <Clock className="w-3.5 h-3.5 text-slate-400" /> {anomaly.averageInterval} jours
                                                    </span>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Dotations récentes</span>
                                                    <span className="text-[10px] font-black text-slate-700 bg-white/80 px-2 py-0.5 rounded-md mt-0.5 inline-block">
                                                        {anomaly.dates.join(" ➔ ")}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
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
                            const headers = ["Date", "Collaborateur", "Service", "Equipement", "Taille", "Prix unitaire", "Motif", "Validateur"]
                            const rows: string[][] = []
                            consumed.forEach(r => {
                                r.items.forEach(item => {
                                    rows.push([
                                        new Date(r.createdAt).toLocaleDateString("fr-FR"),
                                        r.employeeName, 
                                        r.service, 
                                        categoryLabelMap[item.category] || item.category, 
                                        item.size,
                                        `${item.snapshottedPrice || 0} €`,
                                        r.reason || "Non spécifié",
                                        r.validatedBy || "Automatique"
                                    ])
                                })
                            })
                            downloadCSV([headers.join(";"), ...rows.map(row => row.join(";"))].join("\n"),
                                `stef_financial_audit_${new Date().toISOString().split('T')[0]}.csv`)
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

            {/* ─── Stock Forecast Table ─────────────────────────────────── */}
            {stock && stock.length > 0 && (
                <Card className="rounded-[40px] border-none shadow-[0_2px_24px_rgba(0,0,0,0.04)] bg-white overflow-hidden">
                    <CardHeader className="p-8 pb-0">
                        <div className="space-y-1">
                            <CardTitle className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-brand" /> Prévision de Stock
                            </CardTitle>
                            <CardDescription className="text-slate-400 font-medium">Consommation moyenne sur 90 jours et estimation des jours restants</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="space-y-3">
                            {(() => {
                                const ninetyDaysAgo = new Date();
                                ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
                                const recentOrdered = orderedRequests.filter(r => new Date(r.createdAt) >= ninetyDaysAgo);
                                
                                const catConsumption: Record<string, number> = {};
                                recentOrdered.forEach(r => {
                                    r.items.forEach(item => {
                                        catConsumption[item.category] = (catConsumption[item.category] || 0) + (item.quantity || 1);
                                    });
                                });

                                return (stock || []).map((item: any, i: number) => {
                                    const totalStock = Object.values(item.stock as Record<string, number>).reduce((a: number, b: number) => a + b, 0);
                                    const consumed = catConsumption[item.category] || 0;
                                    const dailyRate = consumed / 90;
                                    const daysRemaining = dailyRate > 0 ? Math.round(totalStock / dailyRate) : -1;
                                    const monthlyRate = Math.round(dailyRate * 30 * 10) / 10;

                                    const statusEmoji = daysRemaining === -1 ? '⏸️' : daysRemaining < 30 ? '🔴' : daysRemaining < 60 ? '🟡' : '🟢';
                                    const statusBg = daysRemaining === -1 ? 'bg-slate-50' : daysRemaining < 30 ? 'bg-red-50/50 border-red-100' : daysRemaining < 60 ? 'bg-amber-50/50 border-amber-100' : 'bg-emerald-50/50 border-emerald-100';
                                    const progressWidth = daysRemaining === -1 ? 100 : Math.min(100, Math.round((daysRemaining / 120) * 100));
                                    const progressColor = daysRemaining === -1 ? 'bg-slate-200' : daysRemaining < 30 ? 'bg-red-500' : daysRemaining < 60 ? 'bg-amber-500' : 'bg-emerald-500';

                                    return (
                                        <div key={i} className={`flex items-center gap-4 p-4 rounded-2xl border transition-all hover:shadow-sm ${statusBg}`}>
                                            <div className="text-2xl w-8 text-center">{statusEmoji}</div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <p className="text-sm font-black text-slate-900 truncate">{item.label || item.category}</p>
                                                    <div className="flex items-center gap-3 text-right flex-shrink-0 ml-4">
                                                        <div>
                                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Stock</p>
                                                            <p className="text-sm font-black text-slate-800">{totalStock}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Conso/mois</p>
                                                            <p className="text-sm font-black text-slate-800">{monthlyRate > 0 ? monthlyRate : '—'}</p>
                                                        </div>
                                                        <div className="min-w-[70px]">
                                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Jours</p>
                                                            <p className="text-sm font-black text-slate-800">
                                                                {daysRemaining === -1 ? '∞' : `~${daysRemaining}j`}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                                    <div className={`h-full rounded-full transition-all duration-700 ${progressColor}`} style={{ width: `${progressWidth}%` }} />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                });
                            })()}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
