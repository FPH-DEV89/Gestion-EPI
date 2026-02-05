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
import { Package, ClipboardList, Settings, Save, X, Check, History, Download } from "lucide-react"

interface Request {
    id: string
    employeeName: string
    service: string
    category: string
    size: string
    reason: string
    status: string
    createdAt: Date
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
    initialRequests: any[],
    initialStock: any[]
}) {
    const [requests, setRequests] = useState(initialRequests)
    const [stock, setStock] = useState(initialStock)
    const [editingStockId, setEditingStockId] = useState<string | null>(null)
    const [editValues, setEditValues] = useState<Record<string, number>>({})
    const [showSuccess, setShowSuccess] = useState(false)
    const router = useRouter()
    // Auth is now handled by the proxy middleware
    const isAuthorized = true

    if (!isAuthorized) return null

    const handleValidate = async (id: string) => {
        const res = await validateRequest(id)
        if (res.success) {
            window.location.reload()
        } else {
            alert(res.error)
        }
    }

    const handleReject = async (id: string) => {
        await rejectRequest(id)
        window.location.reload()
    }

    const startEditing = (item: StockItem) => {
        setEditingStockId(item.id)
        setEditValues(item.stock)
    }

    const saveStock = async (itemId: string) => {
        // Collect all size updates (this is a simplified demo)
        for (const [size, qty] of Object.entries(editValues)) {
            await updateStock(itemId, size, Number(qty))
        }
        setEditingStockId(null)
        setShowSuccess(true)
        router.refresh()

        // Hide success message after 3 seconds
        setTimeout(() => {
            setShowSuccess(false)
        }, 3000)
    }

    const exportToCSV = () => {
        const processedRequests = requests.filter(r => r.status !== "Pending")
        const headers = ["Date", "Collaborateur", "Service", "Equipement", "Taille", "Statut"]
        const rows = processedRequests.map(r => [
            new Date(r.createdAt).toLocaleDateString("fr-FR"),
            r.employeeName,
            r.service,
            r.category,
            r.size,
            r.status === "Ordered" ? "Validé" : "Refusé"
        ])

        const csvContent = [
            headers.join(";"),
            ...rows.map(row => row.join(";"))
        ].join("\n")

        const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement("a")
        const url = URL.createObjectURL(blob)
        link.setAttribute("href", url)
        link.setAttribute("download", `historique_demandes_epi_${new Date().toISOString().split('T')[0]}.csv`)
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
                <Badge className="bg-brand text-white px-4 py-1 text-sm">ADMIN MODE</Badge>
            </div>

            {showSuccess && (
                <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="bg-emerald-500 text-white px-6 py-3 rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-2 border border-emerald-400">
                        <Check className="w-5 h-5" />
                        <span className="font-bold uppercase tracking-wide text-sm">Modifications enregistrées !</span>
                    </div>
                </div>
            )}

            <Tabs defaultValue="requests" className="space-y-6">
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
                </TabsList>

                <TabsContent value="requests">
                    <Card>
                        <CardHeader>
                            <CardTitle>Demandes en cours</CardTitle>
                            <CardDescription>Validez ou refusez les demandes de vos collaborateurs.</CardDescription>
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
                                            </TableCell>
                                            <TableCell>{req.category}</TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">{req.size}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">{req.status}</Badge>
                                            </TableCell>
                                            <TableCell className="text-right space-x-2">
                                                <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleReject(req.id)}>
                                                    Refuser
                                                </Button>
                                                <Button size="sm" onClick={() => handleValidate(req.id)}>
                                                    Valider
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
                                    {requests.filter(r => r.status !== "Pending").map(req => (
                                        <TableRow key={req.id}>
                                            <TableCell className="text-xs text-gray-500">
                                                {new Date(req.createdAt).toLocaleDateString("fr-FR")}
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium text-sm">{req.employeeName}</div>
                                                <div className="text-[10px] text-gray-400 uppercase font-bold">{req.service}</div>
                                            </TableCell>
                                            <TableCell className="text-sm">{req.category}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="text-[10px] font-bold">{req.size}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={`text-[10px] font-black uppercase tracking-widest ${req.status === "Ordered" ? "bg-green-100 text-green-700 border-green-200" : "bg-red-100 text-red-700 border-red-200"
                                                    }`}>
                                                    {req.status === "Ordered" ? "Validé" : "Refusé"}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {requests.filter(r => r.status !== "Pending").length === 0 && (
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

                <TabsContent value="inventory">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {stock.map(item => (
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
                                            {Object.entries(item.stock).map(([size, qty]: [string, any]) => {
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
                                        {Object.values(item.stock).some((q: any) => q < item.minThreshold) && (
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
            </Tabs>
        </div>
    )
}
