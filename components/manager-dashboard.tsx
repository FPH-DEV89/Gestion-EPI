"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { validateRequest, rejectRequest, updateStock } from "@/app/actions"
import { sortSizes } from "@/lib/utils"
import { Package, ClipboardList, Settings, Save, X, Check, History, Download, BarChart3 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import StatisticsDashboard from "./statistics-dashboard"
import { useToast } from "@/components/ui/use-toast"

interface Request {
    id: string
    employeeName: string
    service: string
    items: { category: string; size: string }[]
    reason: string
    status: string
    createdAt: string
}

interface StockItem {
    id: string
    category: string
    label: string
    minThreshold: number
    stock: Record<string, number>
}

export default function ManagerDashboard({
    initialRequests,
    initialStock
}: {
    initialRequests: Request[],
    initialStock: StockItem[]
}) {
    const [requests, setRequests] = useState(initialRequests)
    const [stock, setStock] = useState(initialStock)
    const [searchTerm, setSearchTerm] = useState("")
    const [filterCategory, setFilterCategory] = useState("ALL")

    const filteredStock = stock.filter(item => {
        const matchesSearch = item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.category.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesCategory = filterCategory === "ALL" || item.category === filterCategory
        return matchesSearch && matchesCategory
    })

    const [historySearchTerm, setHistorySearchTerm] = useState("")
    const [historyFilterCategory, setHistoryFilterCategory] = useState("ALL")

    const filteredHistory = requests.filter(r => {
        if (r.status === "Pending") return false // Only history
        const matchesSearch = r.employeeName.toLowerCase().includes(historySearchTerm.toLowerCase()) ||
            r.items.some(i => i.category.toLowerCase().includes(historySearchTerm.toLowerCase()))
        const matchesCategory = historyFilterCategory === "ALL" || r.items.some(i => i.category === historyFilterCategory)
        return matchesSearch && matchesCategory
    })

    // Sync state with props when router.refresh() is called
    useEffect(() => {
        setRequests(initialRequests)
    }, [initialRequests])

    useEffect(() => {
        setStock(initialStock)
    }, [initialStock])

    const [editingStockId, setEditingStockId] = useState<string | null>(null)
    const [editValues, setEditValues] = useState<Record<string, number>>({})
    const [activeTab, setActiveTab] = useState("requests")
    const router = useRouter()
    const { toast } = useToast()
    // Auth is now handled by the proxy middleware
    const isAuthorized = true

    if (!isAuthorized) return null

    const handleValidate = async (id: string, employeeName: string) => {
        if (!window.confirm(`Voulez-vous vraiment valider la demande de ${employeeName} ?`)) {
            return
        }

        const res = await validateRequest(id)
        if (res.success) {
            toast({
                title: "Demande validée",
                description: `La demande de ${employeeName} a été validée avec succès.`,
                className: "bg-emerald-50 border-emerald-200 text-emerald-800",
            })
            router.refresh()
        } else {
            toast({
                variant: "destructive",
                title: "Erreur",
                description: res.error || "Une erreur est survenue.",
            })
        }
    }

    const handleReject = async (id: string, employeeName: string) => {
        if (!window.confirm(`Voulez-vous vraiment refuser la demande de ${employeeName} ?`)) {
            return
        }

        const res = await rejectRequest(id)
        if (res.success) {
            toast({
                title: "Demande refusée",
                description: `La demande de ${employeeName} a été refusée.`,
            })
            router.refresh()
        } else {
            toast({
                variant: "destructive",
                title: "Erreur",
                description: res.error || "Une erreur est survenue.",
            })
        }
    }

    const startEditing = (item: StockItem) => {
        setEditingStockId(item.id)
        setEditValues(item.stock)
    }

    const saveStock = async (itemId: string) => {
        // Optimistic update: update local state immediately
        setStock(prevStock => prevStock.map(item => {
            if (item.id === itemId) {
                return { ...item, stock: { ...item.stock, ...editValues } }
            }
            return item
        }))

        // Collect all size updates
        for (const [size, qty] of Object.entries(editValues)) {
            await updateStock(itemId, size, Number(qty))
        }
        setEditingStockId(null)

        toast({
            title: "Stock mis à jour",
            description: "Les quantités ont été enregistrées.",
            className: "bg-blue-50 border-blue-200 text-blue-800",
        })
        router.refresh()
    }

    const exportRequestsToCSV = () => {
        const pendingRequests = requests.filter(r => r.status === "Pending")
        const headers = ["Date", "Collaborateur", "Service", "Equipement", "Taille", "Raison"]
        const rows: string[][] = []
        pendingRequests.forEach(r => {
            r.items.forEach(item => {
                rows.push([
                    new Date(r.createdAt).toLocaleDateString("fr-FR"),
                    r.employeeName,
                    r.service,
                    item.category,
                    item.size,
                    r.reason || ""
                ])
            })
        })

        const csvContent = [
            headers.join(";"),
            ...rows.map(row => row.join(";"))
        ].join("\n")

        downloadCSV(csvContent, `demandes_en_cours_${new Date().toISOString().split('T')[0]}.csv`)
        toast({
            title: "Export CSV",
            description: "Le fichier des demandes en cours a été généré.",
        })
    }

    const exportInventoryToCSV = () => {
        const headers = ["Equipement", "Categorie", "Taille", "Quantite", "Seuil Min", "Alerte"]
        const rows: string[][] = []

        stock.forEach(item => {
            Object.entries(item.stock).forEach(([size, qty]: [string, any]) => {
                rows.push([
                    item.label,
                    item.category,
                    size,
                    qty.toString(),
                    item.minThreshold.toString(),
                    qty < item.minThreshold ? "OUI" : "NON"
                ])
            })
        })

        const csvContent = [
            headers.join(";"),
            ...rows.map(row => row.join(";"))
        ].join("\n")

        downloadCSV(csvContent, `inventaire_stock_${new Date().toISOString().split('T')[0]}.csv`)
        toast({
            title: "Export CSV",
            description: "L'inventaire a été exporté avec succès.",
        })
    }

    const exportToCSV = () => {
        const processedRequests = requests.filter(r => r.status !== "Pending")
        const headers = ["Date", "Collaborateur", "Service", "Equipement", "Taille", "Statut"]
        const rows: string[][] = []
        processedRequests.forEach(r => {
            r.items.forEach(item => {
                rows.push([
                    new Date(r.createdAt).toLocaleDateString("fr-FR"),
                    r.employeeName,
                    r.service,
                    item.category,
                    item.size,
                    r.status === "Ordered" ? "Validé" : "Refusé"
                ])
            })
        })

        const csvContent = [
            headers.join(";"),
            ...rows.map(row => row.join(";"))
        ].join("\n")

        downloadCSV(csvContent, `historique_demandes_epi_${new Date().toISOString().split('T')[0]}.csv`)
        toast({
            title: "Export CSV",
            description: "L'historique a été exporté avec succès.",
        })
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

    return (
        <div className="max-w-6xl mx-auto py-10 px-4">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard Manager</h1>
                    <p className="text-gray-500">Gestion des stocks et demandes d'EPI</p>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="bg-white border shadow-sm h-12">
                    <TabsTrigger value="requests" className="data-[state=active]:text-brand">
                        <ClipboardList className="w-4 h-4 mr-2" /> Demandes
                    </TabsTrigger>
                    <TabsTrigger value="history" className="data-[state=active]:text-brand">
                        <History className="w-4 h-4 mr-2" /> Historique
                    </TabsTrigger>
                    <TabsTrigger value="inventory" className="data-[state=active]:text-brand">
                        <Package className="w-4 h-4 mr-2" /> Inventaire
                    </TabsTrigger>
                    <TabsTrigger value="statistics" className="data-[state=active]:text-brand">
                        <BarChart3 className="w-4 h-4 mr-2" /> Statistiques
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="requests">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0">
                            <div>
                                <CardTitle>Demandes en cours</CardTitle>
                                <CardDescription>Validez ou refusez les demandes de vos collaborateurs.</CardDescription>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                className="text-brand border-brand/20 hover:bg-brand/5"
                                onClick={exportRequestsToCSV}
                                disabled={requests.filter(r => r.status === "Pending").length === 0}
                            >
                                <Download className="w-4 h-4 mr-2" /> Exporter CSV
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Collaborateur</TableHead>
                                        <TableHead>Équipement</TableHead>
                                        <TableHead>Taille</TableHead>
                                        <TableHead>Statut</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {requests.filter(r => r.status === "Pending").map(req => (
                                        <TableRow key={req.id}>
                                            <TableCell>
                                                <div className="font-medium">{req.employeeName}</div>
                                                <div className="text-xs text-gray-500">{req.service}</div>
                                                <div className="text-[10px] text-gray-400 mt-1 italic">"{req.reason}"</div>
                                            </TableCell>
                                            <TableCell colSpan={2}>
                                                <div className="space-y-1">
                                                    {req.items.map((item, i) => (
                                                        <div key={i} className="flex items-center justify-between text-sm bg-slate-50 p-1 rounded">
                                                            <span>{item.category}</span>
                                                            <Badge variant="secondary" className="text-[10px] h-5">{item.size}</Badge>
                                                        </div>
                                                    ))}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">{req.status}</Badge>
                                            </TableCell>
                                            <TableCell className="text-right space-x-2">
                                                <Button
                                                    size="sm"
                                                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                                    onClick={() => handleValidate(req.id, req.employeeName)}
                                                >
                                                    Valider
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="text-red-600 border-red-200 hover:bg-red-50"
                                                    onClick={() => handleReject(req.id, req.employeeName)}
                                                >
                                                    Refuser
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {requests.filter(r => r.status === "Pending").length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-10 text-gray-400">
                                                Aucune demande en attente.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="history">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0">
                            <div>
                                <CardTitle>Historique des demandes</CardTitle>
                                <CardDescription>Consultez l'historique des demandes traitées.</CardDescription>
                            </div>
                            {requests.filter(r => r.status !== "Pending").length > 0 && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-brand border-brand/20 hover:bg-brand/5"
                                    onClick={exportToCSV}
                                >
                                    <Download className="w-4 h-4 mr-2" /> Exporter CSV
                                </Button>
                            )}
                        </CardHeader>

                        <div className="flex gap-4 mb-6 px-6">
                            <div className="flex-1">
                                <Input
                                    placeholder="Rechercher par collaborateur ou équipement..."
                                    value={historySearchTerm}
                                    onChange={(e) => setHistorySearchTerm(e.target.value)}
                                    className="bg-white"
                                />
                            </div>
                            <Select value={historyFilterCategory} onValueChange={setHistoryFilterCategory}>
                                <SelectTrigger className="w-[200px] bg-white">
                                    <SelectValue placeholder="Catégorie" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">Toutes catégories</SelectItem>
                                    {Array.from(new Set(requests.flatMap(r => r.items.map(i => i.category)))).sort().map(cat => (
                                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Collaborateur</TableHead>
                                        <TableHead>Équipement</TableHead>
                                        <TableHead>Taille</TableHead>
                                        <TableHead>Statut</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredHistory.map(req => (
                                        <TableRow key={req.id}>
                                            <TableCell className="text-xs text-gray-500">
                                                {new Date(req.createdAt).toLocaleDateString("fr-FR")}
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium text-sm">{req.employeeName}</div>
                                                <div className="text-[10px] text-gray-400 uppercase font-bold">{req.service}</div>
                                            </TableCell>
                                            <TableCell colSpan={2}>
                                                <div className="space-y-1">
                                                    {req.items.map((item, i) => (
                                                        <div key={i} className="flex items-center gap-2 text-sm">
                                                            <span>{item.category}</span>
                                                            <Badge variant="outline" className="text-[10px] h-5">{item.size}</Badge>
                                                        </div>
                                                    ))}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={`text-[10px] font-black uppercase tracking-widest ${req.status === "Ordered" ? "bg-green-100 text-green-700 border-green-200" : "bg-red-100 text-red-700 border-red-200"
                                                    }`}>
                                                    {req.status === "Ordered" ? "Validé" : "Refusé"}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {filteredHistory.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-10 text-gray-400">
                                                Aucune demande dans l'historique.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="inventory" className="space-y-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0">
                            <div>
                                <CardTitle>État des stocks</CardTitle>
                                <CardDescription>Consultez et modifiez les quantités en stock.</CardDescription>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                className="text-brand border-brand/20 hover:bg-brand/5"
                                onClick={exportInventoryToCSV}
                            >
                                <Download className="w-4 h-4 mr-2" /> Exporter Inventaire
                            </Button>
                        </CardHeader>
                    </Card>

                    <div className="flex gap-4 mb-6">
                        <div className="flex-1">
                            <Input
                                placeholder="Rechercher un équipement..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="bg-white"
                            />
                        </div>
                        <Select value={filterCategory} onValueChange={setFilterCategory}>
                            <SelectTrigger className="w-[200px] bg-white">
                                <SelectValue placeholder="Catégorie" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">Toutes catégories</SelectItem>
                                {Array.from(new Set(stock.map(i => i.category))).map(cat => (
                                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {filteredStock.map(item => (
                            <Card key={item.id} className="overflow-hidden">
                                <CardHeader className="border-b bg-gray-50/50">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle>{item.label}</CardTitle>
                                            <CardDescription>{item.category}</CardDescription>
                                        </div>
                                        {editingStockId === item.id ? (
                                            <div className="flex gap-2">
                                                <Button size="sm" variant="ghost" onClick={() => setEditingStockId(null)}><X className="w-4 h-4" /></Button>
                                                <Button size="sm" onClick={() => saveStock(item.id)}><Save className="w-4 h-4" /></Button>
                                            </div>
                                        ) : (
                                            <Button size="sm" variant="ghost" onClick={() => startEditing(item)}>
                                                <Settings className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-4 gap-2">
                                            {sortSizes(item.stock ? Object.keys(item.stock) : []).map((size) => {
                                                const qty = item.stock?.[size] || 0
                                                const isLow = qty < item.minThreshold
                                                return (
                                                    <div key={size} className={`p-2 rounded-lg border text-center ${isLow ? 'bg-red-50 border-red-200' : 'bg-white'}`}>
                                                        <div className="text-[10px] text-gray-400 uppercase font-bold">{size}</div>
                                                        {editingStockId === item.id ? (
                                                            <Input
                                                                type="number"
                                                                className="h-7 text-center px-1 mt-1"
                                                                value={editValues[size]}
                                                                onChange={e => setEditValues({ ...editValues, [size]: Number(e.target.value) })}
                                                            />
                                                        ) : (
                                                            <div className={`text-lg font-bold ${isLow ? 'text-red-700' : 'text-gray-900'}`}>{qty}</div>
                                                        )}
                                                    </div>
                                                )
                                            })}
                                        </div>
                                        {Object.values(item.stock || {}).some((q: any) => q < item.minThreshold) && (
                                            <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 p-2 rounded-lg">
                                                <Check className="w-3 h-3 rotate-180" /> Stock critique : Réapprovisionnement nécessaire.
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>


                <TabsContent value="statistics">
                    <StatisticsDashboard requests={requests} showHeader={false} />
                </TabsContent>

            </Tabs>
        </div>
    )
}
