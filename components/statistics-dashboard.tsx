"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Download, Package, CheckCircle, Building2, Clock, TrendingUp, TrendingDown } from "lucide-react"
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface RequestItem {
    category: string
    size: string
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

export default function StatisticsDashboard({
    requests,
    showHeader = true
}: {
    requests: Request[],
    showHeader?: boolean
}) {

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

    // KPIs Calculation
    const orderedRequests = requests.filter(r => r.status === "Ordered")
    const totalEPI = orderedRequests.reduce((acc, r) => acc + r.items.length, 0)
    const totalRequests = requests.length
    const validationRate = totalRequests > 0 ? Math.round((orderedRequests.length / totalRequests) * 100) : 0
    const activeServices = new Set(orderedRequests.map(r => r.service)).size

    // Average delay calculation (mock for now)
    const avgDelay = "2.3j"

    // Top 5 EPI Data
    const epiCounts = orderedRequests.reduce((acc: Record<string, number>, r) => {
        r.items.forEach(item => {
            acc[item.category] = (acc[item.category] || 0) + 1
        })
        return acc
    }, {})

    const topEPIData = Object.entries(epiCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, value]) => ({ name, value }))

    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899']

    // Service consumption data
    const serviceData = Object.entries(
        orderedRequests.reduce((acc: Record<string, number>, r) => {
            r.items.forEach(() => {
                acc[r.service] = (acc[r.service] || 0) + 1
            })
            return acc
        }, {})
    ).map(([service, count]) => ({ service, count }))
        .sort((a, b) => b.count - a.count)

    // Timeline data (30 days)
    const timelineData = Array.from({ length: 30 }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() - (29 - i))
        const dayRequests = requests.filter(r => {
            const reqDate = new Date(r.createdAt)
            return reqDate.toDateString() === date.toDateString()
        }).length
        return {
            date: `${date.getDate()}/${date.getMonth() + 1}`,
            requests: dayRequests
        }
    })

    return (
        <div className={`max-w-6xl mx-auto px-4 space-y-6 ${showHeader ? 'py-10' : 'pt-2 pb-10'}`}>
            {showHeader && (
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Statistiques de Consommation</h1>
                        <p className="text-gray-500">Analyse des distributions d'EPI par service et collaborateur</p>
                    </div>
                </div>
            )}

            {/* KPIs Section */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-l-4 border-l-blue-500">
                    <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-blue-50 rounded-lg">
                                    <Package className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">EPI Distribués</p>
                                    <p className="text-3xl font-bold text-gray-900">{totalEPI}</p>
                                </div>
                            </div>
                            <Badge className="bg-green-100 text-green-700 border-green-200">
                                <TrendingUp className="w-3 h-3 mr-1" /> +12%
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-green-500">
                    <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-green-50 rounded-lg">
                                    <CheckCircle className="w-6 h-6 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Taux Validation</p>
                                    <p className="text-3xl font-bold text-gray-900">{validationRate}%</p>
                                </div>
                            </div>
                            <Badge className="bg-green-100 text-green-700 border-green-200">
                                <TrendingUp className="w-3 h-3 mr-1" /> +3%
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-purple-500">
                    <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-purple-50 rounded-lg">
                                    <Building2 className="w-6 h-6 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Services Actifs</p>
                                    <p className="text-3xl font-bold text-gray-900">{activeServices}</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-orange-500">
                    <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-orange-50 rounded-lg">
                                    <Clock className="w-6 h-6 text-orange-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Délai Moyen</p>
                                    <p className="text-3xl font-bold text-gray-900">{avgDelay}</p>
                                </div>
                            </div>
                            <Badge className="bg-green-100 text-green-700 border-green-200">
                                <TrendingDown className="w-3 h-3 mr-1" /> -0.5j
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Donut Chart - Top 5 EPI */}
                <Card>
                    <CardHeader>
                        <CardTitle>Top 5 EPI</CardTitle>
                        <CardDescription>Les équipements les plus demandés</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {topEPIData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={topEPIData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        paddingAngle={5}
                                        dataKey="value"
                                        label={(entry) => `${entry.name} (${entry.value})`}
                                    >
                                        {topEPIData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-[300px] flex items-center justify-center text-gray-400">
                                Aucune donnée disponible
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Bar Chart - Service Consumption */}
                <Card>
                    <CardHeader>
                        <CardTitle>Consommation par Service</CardTitle>
                        <CardDescription>Nombre d'EPI validés par département</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {serviceData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={serviceData} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" />
                                    <YAxis dataKey="service" type="category" width={100} />
                                    <Tooltip />
                                    <Bar dataKey="count" fill="#3b82f6" radius={[0, 8, 8, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-[300px] flex items-center justify-center text-gray-400">
                                Aucune donnée disponible
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Timeline Chart */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <div>
                        <CardTitle>Évolution des Demandes (30 derniers jours)</CardTitle>
                        <CardDescription>Tendance de consommation sur le dernier mois</CardDescription>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        className="text-brand border-brand/20 hover:bg-brand/5"
                        onClick={() => {
                            const consumed = requests.filter(r => r.status === "Ordered")
                            const headers = ["Date", "Collaborateur", "Service", "Equipement", "Taille"]
                            const rows: string[][] = []
                            consumed.forEach(r => {
                                r.items.forEach(item => {
                                    rows.push([
                                        new Date(r.createdAt).toLocaleDateString("fr-FR"),
                                        r.employeeName,
                                        r.service,
                                        item.category,
                                        item.size
                                    ])
                                })
                            })
                            const csvContent = [headers.join(";"), ...rows.map(row => row.join(";"))].join("\n")
                            downloadCSV(csvContent, `consommation_epi_${new Date().toISOString().split('T')[0]}.csv`)
                        }}
                        disabled={orderedRequests.length === 0}
                    >
                        <Download className="w-4 h-4 mr-2" /> Exporter Rapport
                    </Button>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={timelineData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="requests" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    )
}
