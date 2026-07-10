"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { validateRequest, rejectRequest, updateStock, updateSkuMetadata, updateMinThreshold } from "@/app/actions"
import { handleSignOut } from "@/app/lib/actions"
import { sortSizes } from "@/lib/utils"
import { 
    Package, ClipboardList, Settings, Save, X, Check, History, Download, 
    BarChart3, ShieldAlert, Users, LogOut, ChevronLeft, MoreHorizontal,
    Bell, Plus, Minus, PenLine, Shirt, Footprints, Hand, HardHat, Eye, EyeOff
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import StatisticsDashboard from "./statistics-dashboard"
import HistoryView from "./history-view"
import AuditLogView from "./audit-log-view"
import CollaboratorsView from "./collaborators-view"
import { useToast } from "@/components/ui/use-toast"
import SignaturePad from "./signature-pad"
import { addOfflineAction, getOfflineActions, removeOfflineAction, getOfflineQueueCount, OfflineAction } from "@/app/lib/offline-queue"

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"

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

interface StockItem {
    id: string
    category: string
    label: string
    minThreshold: number
    price: number
    stock: Record<string, number>
    skuMetadata?: Record<string, { ref: string; location: string }>
}

interface AuditLog {
    id: string
    userName: string
    action: string
    details: any
    createdAt: string
}

interface AuditLog {
    id: string
    userName: string
    action: string
    details: any
    createdAt: string
}

const BonnetIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <circle cx="12" cy="5" r="2.5" />
        <path d="M5 16.5C5 10 8.5 7.5 12 7.5C15.5 7.5 19 10 19 16.5" />
        <rect x="3" y="16.5" width="18" height="4" rx="2" />
    </svg>
)

const SocksIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M9 4h6v8l4 3v5h-6v-3l-4-3V4Z" />
        <line x1="9" y1="7" x2="15" y2="7" />
    </svg>
)

const NeckWarmerIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <ellipse cx="12" cy="7" rx="8" ry="3" />
        <path d="M4 7v9c0 1.66 3.58 3 8 3s8-1.34 8-3V7" />
        <ellipse cx="12" cy="16" rx="8" ry="3" strokeDasharray="3 3" />
    </svg>
)

function getCategoryIcon(category: string) {
    const cat = category.toLowerCase()
    if (cat.includes('chaussure') || cat.includes('basket') || cat.includes('botte')) {
        return {
            Icon: Footprints,
            colorClass: "text-amber-600",
            bgClass: "bg-amber-50"
        }
    }
    if (cat.includes('gant')) {
        return {
            Icon: Hand,
            colorClass: "text-emerald-600",
            bgClass: "bg-emerald-50"
        }
    }
    if (cat.includes('veste') || cat.includes('polaire') || cat.includes('parka') || cat.includes('gilet')) {
        return {
            Icon: Shirt,
            colorClass: "text-blue-600",
            bgClass: "bg-blue-50"
        }
    }
    if (cat.includes('casque') || cat.includes('protection')) {
        return {
            Icon: HardHat,
            colorClass: "text-orange-600",
            bgClass: "bg-orange-50"
        }
    }
    if (cat.includes('bonnet')) {
        return {
            Icon: BonnetIcon,
            colorClass: "text-cyan-600",
            bgClass: "bg-cyan-50"
        }
    }
    if (cat.includes('chaussette')) {
        return {
            Icon: SocksIcon,
            colorClass: "text-rose-600",
            bgClass: "bg-rose-50"
        }
    }
    if (cat.includes('cou')) {
        return {
            Icon: NeckWarmerIcon,
            colorClass: "text-indigo-600",
            bgClass: "bg-indigo-50"
        }
    }
    return {
        Icon: Package,
        colorClass: "text-slate-400",
        bgClass: "bg-slate-100"
    }
}

interface StockItemCardProps {
    item: StockItem
    showStockImages: boolean
    handleAdjustStock: (itemId: string, size: string, delta: number) => Promise<void>
    handleSkuMetadataUpdate: (itemId: string, size: string, field: 'ref' | 'location', value: string) => Promise<void>
    handleUpdateMinThreshold: (itemId: string, threshold: number) => Promise<void>
}

function StockItemCard({
    item,
    showStockImages,
    handleAdjustStock,
    handleSkuMetadataUpdate,
    handleUpdateMinThreshold
}: StockItemCardProps) {
    const [selectedSize, setSelectedSize] = useState<string | null>(null)
    const [editingSkuField, setEditingSkuField] = useState<'ref' | 'location' | null>(null)
    const [editMetadataValue, setEditMetadataValue] = useState("")
    const [editingThreshold, setEditingThreshold] = useState(false)
    const [editThresholdValue, setEditThresholdValue] = useState<number | "">(item.minThreshold)

    useEffect(() => {
        setEditThresholdValue(item.minThreshold)
    }, [item.minThreshold])

    const totalQuantity = Object.values(item.stock).reduce((a, b) => a + b, 0)
    const hasLowStock = Object.entries(item.stock).some(([size, qty]) => qty < item.minThreshold)
    const sortedSizesList = sortSizes(Object.keys(item.stock))

    // image
    let image = 'https://images.unsplash.com/photo-1532634922-8fe0b757fb13?auto=format&fit=crop&q=80&w=200'
    const cat = item.category.toLowerCase()
    if (cat.includes('chaussure') || cat.includes('basket')) image = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=200'
    else if (cat.includes('gant')) image = 'https://images.unsplash.com/photo-1590856029826-c7a73142bbf1?auto=format&fit=crop&q=80&w=200'
    else if (cat.includes('veste') || cat.includes('polaire') || cat.includes('parka')) image = 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=200'
    else if (cat.includes('pantalon')) image = 'https://images.unsplash.com/photo-1624371414361-e6e8ea7c7526?auto=format&fit=crop&q=80&w=200'
    else if (cat.includes('casque') || cat.includes('protection')) image = 'https://images.unsplash.com/photo-1595165997096-3b6045d44810?auto=format&fit=crop&q=80&w=200'
    else if (cat.includes('gilet')) image = 'https://images.unsplash.com/photo-1614786269829-d34618e8c84b?auto=format&fit=crop&q=80&w=200'

    // If size is selected, we show the sub-tile
    if (selectedSize) {
        const qty = item.stock[selectedSize] || 0
        const isLow = qty < item.minThreshold
        const progress = Math.min(100, Math.round((qty / (item.minThreshold * 2)) * 100))
        const metadata = (item.skuMetadata as Record<string, any>)?.[selectedSize] || {}
        const ref = metadata.ref || `${item.category.substring(0, 2).toUpperCase()}-${selectedSize}-TEMP`
        const location = metadata.location || `ZONE-A-01`

        return (
            <Card className="overflow-hidden border-0 shadow-2xl bg-white rounded-[40px] transition-all hover:shadow-blue-900/5 group">
                <div className="p-6">
                    {/* Top Section: Back Button, Title & Status */}
                    <div className="flex justify-between items-start mb-4">
                        <div className="space-y-1">
                            <button 
                                onClick={() => {
                                    setSelectedSize(null)
                                    setEditingSkuField(null)
                                }}
                                className="flex items-center gap-1 text-xs font-black text-[#135bec] uppercase tracking-wider mb-2 hover:opacity-80 active:scale-95 transition-all"
                            >
                                <ChevronLeft className="w-4 h-4" /> Retour
                            </button>
                            <h3 className="text-xl font-black text-slate-800 leading-tight tracking-tight">
                                {item.label}
                            </h3>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-slate-400 capitalize">Taille: {selectedSize}</span>
                            </div>
                        </div>
                        {isLow && (
                            <Badge variant="destructive" className="bg-red-50 text-red-500 border-red-100 rounded-full px-3 py-1 text-[10px] font-black uppercase flex items-center gap-1 animate-pulse">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                Critique
                            </Badge>
                        )}
                    </div>

                    {/* Middle Section: Image & Circular progress */}
                    <div className="flex items-center justify-between gap-6 mb-8 mt-2">
                        <div className="relative w-32 h-32 rounded-3xl overflow-hidden shadow-inner bg-slate-50 border border-slate-100 flex-shrink-0 flex items-center justify-center">
                            {showStockImages ? (
                                <img 
                                    src={image} 
                                    alt={item.label}
                                    className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500"
                                />
                            ) : (
                                 (() => {
                                    const { Icon, colorClass, bgClass } = getCategoryIcon(item.category)
                                    return (
                                        <div className={`w-full h-full flex items-center justify-center ${bgClass} transition-colors group-hover:bg-opacity-80`}>
                                            <Icon className={`w-14 h-14 ${colorClass}`} />
                                        </div>
                                    )
                                })()
                            )}
                        </div>

                        <div className="flex-1 space-y-3">
                            <div className="relative w-24 h-24 mx-auto">
                                <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                                    <circle
                                        className="text-slate-100"
                                        strokeWidth="10"
                                        stroke="currentColor"
                                        fill="transparent"
                                        r="40"
                                        cx="50"
                                        cy="50"
                                    />
                                    <circle
                                        className={isLow ? "text-red-500" : "text-brand"}
                                        strokeWidth="10"
                                        strokeDasharray={251.2}
                                        strokeDashoffset={251.2 - (251.2 * progress) / 100}
                                        strokeLinecap="round"
                                        stroke="currentColor"
                                        fill="transparent"
                                        r="40"
                                        cx="50"
                                        cy="50"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-xl font-black text-slate-800">{progress}%</span>
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Stock</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Physical Metadata */}
                    <div className="grid grid-cols-1 gap-2 mb-8 bg-slate-50/50 p-4 rounded-3xl border border-slate-100/50">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Référence</span>
                            {editingSkuField === 'ref' ? (
                                <Input
                                    autoFocus
                                    className="h-6 text-xs font-black text-slate-700 font-mono text-right bg-white border-brand w-24 p-1"
                                    value={editMetadataValue}
                                    onChange={(e) => setEditMetadataValue(e.target.value)}
                                    onBlur={() => {
                                        handleSkuMetadataUpdate(item.id, selectedSize, 'ref', editMetadataValue)
                                        setEditingSkuField(null)
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            handleSkuMetadataUpdate(item.id, selectedSize, 'ref', editMetadataValue)
                                            setEditingSkuField(null)
                                        }
                                    }}
                                />
                            ) : (
                                <span 
                                    className="text-xs font-black text-slate-700 font-mono cursor-pointer hover:text-brand transition-colors"
                                    onClick={() => {
                                        setEditingSkuField('ref')
                                        setEditMetadataValue(ref)
                                    }}
                                >
                                    {ref}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Emplacement</span>
                            {editingSkuField === 'location' ? (
                                <Input
                                    autoFocus
                                    className="h-6 text-xs font-black text-brand font-mono text-right bg-white border-brand w-24 p-1"
                                    value={editMetadataValue}
                                    onChange={(e) => setEditMetadataValue(e.target.value)}
                                    onBlur={() => {
                                        handleSkuMetadataUpdate(item.id, selectedSize, 'location', editMetadataValue)
                                        setEditingSkuField(null)
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            handleSkuMetadataUpdate(item.id, selectedSize, 'location', editMetadataValue)
                                            setEditingSkuField(null)
                                        }
                                    }}
                                />
                            ) : (
                                <span 
                                    className="text-xs font-black text-brand font-mono cursor-pointer hover:underline"
                                    onClick={() => {
                                        setEditingSkuField('location')
                                        setEditMetadataValue(location)
                                    }}
                                >
                                    {location}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Seuil Alerte</span>
                            {editingThreshold ? (
                                <Input
                                    autoFocus
                                    type="number"
                                    className="h-6 text-xs font-black text-[#135bec] text-right bg-white border-brand w-24 p-1"
                                    value={editThresholdValue}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setEditThresholdValue(val === "" ? "" : (parseInt(val) || 0));
                                    }}
                                    onBlur={() => {
                                        const finalVal = editThresholdValue === "" ? 0 : editThresholdValue;
                                        handleUpdateMinThreshold(item.id, finalVal)
                                        setEditingThreshold(false)
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            const finalVal = editThresholdValue === "" ? 0 : editThresholdValue;
                                            handleUpdateMinThreshold(item.id, finalVal)
                                            setEditingThreshold(false)
                                        }
                                    }}
                                />
                            ) : (
                                <span 
                                    className="text-xs font-black text-[#135bec] cursor-pointer hover:underline"
                                    onClick={() => {
                                        setEditingThreshold(true)
                                        setEditThresholdValue(item.minThreshold)
                                    }}
                                >
                                    {item.minThreshold} articles
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Action Control Bar */}
                    <div className="bg-slate-100 rounded-full p-2 flex items-center justify-between shadow-inner h-20">
                        <Button 
                            size="icon" 
                            variant="ghost" 
                            className="w-16 h-16 rounded-full bg-brand shadow-lg hover:bg-brand/90 transition-all active:scale-95 text-white disabled:opacity-20"
                            onClick={() => handleAdjustStock(item.id, selectedSize, -1)}
                            disabled={qty === 0}
                        >
                            <Minus className="w-8 h-8 font-black" />
                        </Button>

                        <div className="flex flex-col items-center flex-1">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-[-2px]">Actuel</span>
                            <input
                                type="number"
                                value={qty}
                                onChange={(e) => {
                                    const val = parseInt(e.target.value) || 0
                                    handleAdjustStock(item.id, selectedSize, val - qty)
                                }}
                                className="w-20 text-center bg-transparent border-0 focus:ring-0 text-3xl font-black text-slate-900 p-0"
                            />
                        </div>

                        <Button 
                            size="icon" 
                            variant="ghost" 
                            className="w-16 h-16 rounded-full bg-brand shadow-lg hover:bg-brand/90 transition-all active:scale-95 text-white"
                            onClick={() => handleAdjustStock(item.id, selectedSize, 1)}
                        >
                            <Plus className="w-8 h-8 font-black" />
                        </Button>
                    </div>
                </div>
            </Card>
        )
    }

    // Default view: parent item card with size dropdown & quick action buttons
    return (
        <Card className="overflow-hidden border-0 shadow-2xl bg-white rounded-[40px] transition-all hover:shadow-blue-900/5 group">
            <div className="p-6 flex flex-col h-full justify-between">
                <div>
                    {/* Top Section: Title & Status */}
                    <div className="flex justify-between items-start mb-4">
                        <div className="space-y-1">
                            <h3 className="text-xl font-black text-slate-800 leading-tight tracking-tight">
                                {item.label}
                            </h3>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{item.category}</span>
                                <span className="text-slate-300">•</span>
                                {editingThreshold ? (
                                    <Input
                                        type="number"
                                        autoFocus
                                        className="h-5 text-[10px] font-black text-[#135bec] bg-white border-brand w-12 p-0.5 text-center inline-block"
                                        value={editThresholdValue}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setEditThresholdValue(val === "" ? "" : (parseInt(val) || 0));
                                        }}
                                        onBlur={() => {
                                            const finalVal = editThresholdValue === "" ? 0 : editThresholdValue;
                                            handleUpdateMinThreshold(item.id, finalVal)
                                            setEditingThreshold(false)
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                const finalVal = editThresholdValue === "" ? 0 : editThresholdValue;
                                                handleUpdateMinThreshold(item.id, finalVal)
                                                setEditingThreshold(false)
                                            }
                                        }}
                                    />
                                ) : (
                                    <button 
                                        className="text-[10px] font-bold text-slate-500 hover:text-brand cursor-pointer flex items-center gap-0.5 border-none bg-transparent p-0"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            setEditingThreshold(true)
                                            setEditThresholdValue(item.minThreshold)
                                        }}
                                        title="Modifier le seuil d'alerte"
                                    >
                                        Seuil: {item.minThreshold}
                                        <PenLine className="w-2.5 h-2.5 inline" />
                                    </button>
                                )}
                            </div>
                        </div>
                        {hasLowStock && (
                            <Badge variant="destructive" className="bg-red-50 text-red-500 border-red-100 rounded-full px-3 py-1 text-[10px] font-black uppercase flex items-center gap-1 animate-pulse">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                Alerte Taille
                            </Badge>
                        )}
                    </div>

                    {/* Middle Section: Image & Stats */}
                    <div className="flex items-center gap-4 my-4">
                        <div className="relative w-20 h-20 rounded-2xl overflow-hidden shadow-inner bg-slate-50 border border-slate-100 flex-shrink-0 flex items-center justify-center">
                            {showStockImages ? (
                                <img 
                                    src={image} 
                                    alt={item.label}
                                    className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500"
                                />
                            ) : (
                                (() => {
                                    const { Icon, colorClass, bgClass } = getCategoryIcon(item.category)
                                    return (
                                        <div className={`w-full h-full flex items-center justify-center ${bgClass} transition-colors group-hover:bg-opacity-80`}>
                                            <Icon className={`w-10 h-10 ${colorClass}`} />
                                        </div>
                                    )
                                })()
                            )}
                        </div>

                        <div className="flex-1">
                            <p className="text-2xl font-black text-slate-800 leading-none">{totalQuantity}</p>
                            <p className="text-xs font-bold text-slate-400 mt-1">Articles au total</p>
                        </div>
                    </div>

                    {/* Sizes Selection Dropdown */}
                    <div className="mt-4">
                        <Select onValueChange={(val) => setSelectedSize(val)}>
                            <SelectTrigger className="w-full bg-slate-50 border-slate-200 text-slate-700 font-bold rounded-2xl h-12">
                                <SelectValue placeholder="Choisir une taille..." />
                            </SelectTrigger>
                            <SelectContent className="bg-white rounded-xl shadow-lg border border-slate-100">
                                {sortedSizesList.map(size => {
                                    const qty = item.stock[size] || 0
                                    return (
                                        <SelectItem key={size} value={size} className="font-semibold text-slate-700">
                                            Taille {size} ({qty} en stock)
                                        </SelectItem>
                                    )
                                })}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Quick Select Buttons Grid */}
                <div className="mt-4 pt-4 border-t border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Accès rapide par taille</p>
                    <div className="flex flex-wrap gap-1.5">
                        {sortedSizesList.map(size => {
                            const qty = item.stock[size] || 0
                            const isLow = qty < item.minThreshold
                            return (
                                <button
                                    key={size}
                                    onClick={() => setSelectedSize(size)}
                                    className={`h-8 px-2.5 rounded-lg text-xs font-black transition-all border flex items-center gap-1 cursor-pointer active:scale-95 ${
                                        qty <= 0 
                                            ? "bg-red-50 text-red-500 border-red-100 hover:bg-red-100/50" 
                                            : isLow 
                                                ? "bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100/50" 
                                                : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-800"
                                    }`}
                                >
                                    <span>T.{size}</span>
                                    <span className="opacity-60">({qty})</span>
                                </button>
                            )
                        })}
                    </div>
                </div>
            </div>
        </Card>
    )
}

export default function ManagerDashboard({
    initialRequests,
    initialStock,
    initialAuditLogs = [],
    userRole = "USER",
    userEmail = null,
    userName = null
}: {
    initialRequests: Request[],
    initialStock: StockItem[],
    initialAuditLogs?: AuditLog[],
    userRole?: string,
    userEmail?: string | null,
    userName?: string | null
}) {
    const [requests, setRequests] = useState(initialRequests)
    const [stock, setStock] = useState(initialStock)
    const [searchTerm, setSearchTerm] = useState("")
    const [filterCategory, setFilterCategory] = useState("ALL")
    const [showStockImages, setShowStockImages] = useState(false)

    const userInitials = useMemo(() => {
        if (userName && userName.toLowerCase() !== "inconnu") {
            const parts = userName.trim().split(/\s+/)
            if (parts.length >= 2) {
                return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
            }
            return parts[0].substring(0, 2).toUpperCase()
        }
        if (userEmail) {
            const localPart = userEmail.split('@')[0]
            const parts = localPart.split(/[._-]/)
            if (parts.length >= 2) {
                return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase()
            }
            return localPart.substring(0, 2).toUpperCase()
        }
        return "M"
    }, [userName, userEmail])

    // Performance: memoize to avoid recalculating on every render/keystroke
    const flattenedStock = useMemo(() => stock.flatMap(item => 
        Object.keys(item.stock).map(size => {
            const metadata = (item.skuMetadata as Record<string, any>)?.[size] || {}
            
            // Fixed image logic for better visual quality
            let image = 'https://images.unsplash.com/photo-1532634922-8fe0b757fb13?auto=format&fit=crop&q=80&w=200'
            const cat = item.category.toLowerCase()
            if (cat.includes('chaussure') || cat.includes('basket')) image = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=200'
            else if (cat.includes('gant')) image = 'https://images.unsplash.com/photo-1590856029826-c7a73142bbf1?auto=format&fit=crop&q=80&w=200'
            else if (cat.includes('veste') || cat.includes('polaire') || cat.includes('parka')) image = 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=200'
            else if (cat.includes('pantalon')) image = 'https://images.unsplash.com/photo-1624371414361-e6e8ea7c7526?auto=format&fit=crop&q=80&w=200'
            else if (cat.includes('casque') || cat.includes('protection')) image = 'https://images.unsplash.com/photo-1595165997096-3b6045d44810?auto=format&fit=crop&q=80&w=200'
            else if (cat.includes('gilet')) image = 'https://images.unsplash.com/photo-1614786269829-d34618e8c84b?auto=format&fit=crop&q=80&w=200'

            return {
                ...item,
                size,
                quantity: item.stock[size],
                ref: metadata.ref || `${item.category.substring(0, 2).toUpperCase()}-${size}-TEMP`,
                location: metadata.location || `ZONE-A-01`,
                image
            }
        })
    ), [stock])

    // Performance: memoize filtered results
    const filteredStock = useMemo(() => flattenedStock.filter(item => {
        const matchesSearch = item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.ref.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesCategory = filterCategory === "ALL" || item.category === filterCategory
        return matchesSearch && matchesCategory
    }), [flattenedStock, searchTerm, filterCategory])

    const filteredParentItems = useMemo(() => {
        return stock.filter(item => {
            const matchesSearch = item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                Object.entries(item.stock).some(([size, qty]) => {
                    const metadata = (item.skuMetadata as Record<string, any>)?.[size] || {}
                    const ref = metadata.ref || `${item.category.substring(0, 2).toUpperCase()}-${size}-TEMP`
                    return ref.toLowerCase().includes(searchTerm.toLowerCase())
                })
            const matchesCategory = filterCategory === "ALL" || item.category === filterCategory
            return matchesSearch && matchesCategory
        })
    }, [stock, searchTerm, filterCategory])

    const [activeTab, setActiveTab] = useState("requests")

    // Sync state with props when router.refresh() is called
    useEffect(() => {
        setRequests(initialRequests)
    }, [initialRequests])

    useEffect(() => {
        setStock(initialStock)
    }, [initialStock])

    // Pagination Inventaire
    const [inventoryPage, setInventoryPage] = useState(1)
    const inventoryItemsPerPage = 10
    const totalInventoryPages = Math.ceil(filteredStock.length / 10)

    // Reset page on filter change
    useEffect(() => {
        setInventoryPage(1)
    }, [searchTerm, filterCategory])

    const currentStockItems = filteredStock.slice(
        (inventoryPage - 1) * inventoryItemsPerPage,
        inventoryPage * inventoryItemsPerPage
    )

    const [editingStockId, setEditingStockId] = useState<string | null>(null)
    const [editValues, setEditValues] = useState<Record<string, number>>({})
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [showMoreMenu, setShowMoreMenu] = useState(false)
    const [editingSku, setEditingSku] = useState<{ id: string, size: string, field: 'ref' | 'location' } | null>(null)
    const [editMetadataValue, setEditMetadataValue] = useState("")
    const { toast } = useToast()

    const [showNotifications, setShowNotifications] = useState(false)
    const [showProfileCard, setShowProfileCard] = useState(false)

    // Calcul mémoïsé des articles sous le seuil critique (Alerte de Stock)
    const lowStockItems = useMemo(() => {
        return flattenedStock.filter(item => item.quantity < item.minThreshold)
    }, [flattenedStock])

    // Signature dialog state
    const [signatureDialog, setSignatureDialog] = useState<{ open: boolean, requestId: string, employeeName: string } | null>(null)
    const [isSubmittingSignature, setIsSubmittingSignature] = useState(false)

    // Offline sync state
    const [isOnline, setIsOnline] = useState(true)
    const [offlineQueueCount, setOfflineQueueCount] = useState(0)
    const [isSyncing, setIsSyncing] = useState(false)

    const navItems = [
        { id: 'requests', label: 'Demandes', icon: ClipboardList, isPrimary: true },
        { id: 'inventory', label: 'Stock', icon: Package, isPrimary: true },
        { id: 'statistics', label: 'Stats', icon: BarChart3, isPrimary: true },
        { id: 'employees', label: 'Collab', icon: Users, isPrimary: false },
        { id: 'history', label: 'Historique', icon: History, isPrimary: false },
        { id: 'audit', label: 'Audit', icon: ShieldAlert, isPrimary: false },
    ]

    // Auth is handled by the parent AdminPage and middleware, but we enforce ADMIN role rigorously here.
    const isAuthorized = userRole === "ADMIN"

    // Opens the signature dialog instead of validating directly
    const handleValidate = (id: string, employeeName: string) => {
        setSignatureDialog({ open: true, requestId: id, employeeName })
    }

    // Called when the employee confirms their signature
    const handleSignatureConfirm = async (signatureData: string) => {
        if (!signatureDialog) return
        setIsSubmittingSignature(true)

        if (!isOnline) {
            try {
                // Save locally if offline
                await addOfflineAction({
                    id: signatureDialog.requestId,
                    type: 'VALIDATE_REQUEST',
                    payload: {
                        requestId: signatureDialog.requestId,
                        signatureData,
                        employeeName: signatureDialog.employeeName
                    },
                    timestamp: Date.now()
                })
                
                // Update local state immediately for instant feedback
                setRequests(prev => prev.map(req => req.id === signatureDialog.requestId ? { ...req, status: "Ordered" } : req))
                setOfflineQueueCount(prev => prev + 1)
                
                toast({
                    title: "💾 Sauvegardé hors-ligne",
                    description: `La demande de ${signatureDialog.employeeName} sera synchronisée au retour du réseau.`,
                    className: "bg-blue-50 border-blue-200 text-blue-800",
                })
            } catch (error) {
                console.error("Erreur de sauvegarde locale:", error);
                toast({
                    variant: "destructive",
                    title: "Erreur de stockage",
                    description: "Impossible d'enregistrer la signature hors-ligne (espace disque plein ou mode navigation privée stricte).",
                })
            } finally {
                setIsSubmittingSignature(false)
                setSignatureDialog(null)
            }
            return
        }

        const res = await validateRequest(signatureDialog.requestId, signatureData)
        if (res.success) {
            toast({
                title: "✅ Remise confirmée",
                description: `${signatureDialog.employeeName} a signé la réception de ses EPI.`,
                className: "bg-emerald-50 border-emerald-200 text-emerald-800",
            })
        } else {
            toast({
                variant: "destructive",
                title: "Erreur",
                description: res.error || "Une erreur est survenue.",
            })
        }
        setIsSubmittingSignature(false)
        setSignatureDialog(null)
    }

    // Sync offline actions
    const syncOfflineActions = async () => {
        if (isSyncing) return
        setIsSyncing(true)
        
        try {
            const actions = await getOfflineActions()
            if (actions.length === 0) {
                setOfflineQueueCount(0)
                setIsSyncing(false)
                return
            }
            
            toast({
                title: "🔄 Synchronisation...",
                description: `${actions.length} action(s) en cours d'envoi.`,
            })

            let successCount = 0
            let errorCount = 0
            for (const action of actions) {
                if (action.type === 'VALIDATE_REQUEST') {
                    const res = await validateRequest(action.payload.requestId, action.payload.signatureData)
                    if (res.success) {
                        await removeOfflineAction(action.id)
                        successCount++
                    } else if (res.error?.includes("introuvable") || res.error?.includes("épuisé")) {
                        // Request deleted, invalid, or out of stock. Remove from queue to prevent infinite loop.
                        await removeOfflineAction(action.id)
                        errorCount++
                        toast({
                            variant: "destructive",
                            title: "Synchronisation échouée",
                            description: `La demande de ${action.payload.employeeName} n'a pas pu être validée : ${res.error}`,
                        })
                    } else {
                        // Other errors (e.g., 500) might be temporary, leave in queue.
                    }
                }
            }

            const newCount = await getOfflineQueueCount()
            setOfflineQueueCount(newCount)

            if (successCount > 0) {
                toast({
                    title: "✅ Synchronisation terminée",
                    description: `${successCount} validation(s) hors-ligne synchronisée(s).`,
                    className: "bg-emerald-50 border-emerald-200 text-emerald-800",
                })
            } else if (errorCount > 0) {
                 toast({
                    variant: "destructive",
                    title: "⚠️ Synchronisation partielle",
                    description: `${errorCount} demande(s) ont été rejetées par le serveur (voir notifications précédentes).`,
                })
            }
        } catch (error) {
            console.error("Erreur lors de la synchronisation:", error)
        } finally {
            setIsSyncing(false)
        }
    }

    // Network status listener & initial sync
    useEffect(() => {
        // Set initial state
        setIsOnline(navigator.onLine)
        getOfflineQueueCount().then(setOfflineQueueCount)

        const handleOnline = () => {
            setIsOnline(true)
            syncOfflineActions()
        }
        const handleOffline = () => setIsOnline(false)

        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)

        // Try syncing initially if online
        if (navigator.onLine) {
            syncOfflineActions()
        }

        return () => {
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
        }
    }, [])

    const handleReject = async (id: string, employeeName: string) => {
        setIsRefreshing(true)
        const res = await rejectRequest(id)
        if (res.success) {
            toast({
                title: "Demande refusée",
                description: `La demande de ${employeeName} a été refusée.`,
            })
            // router.refresh()
        } else {
            toast({
                variant: "destructive",
                title: "Erreur",
                description: res.error || "Une erreur est survenue.",
            })
        }
        setIsRefreshing(false)
    }

    const startEditing = (item: StockItem) => {
        setEditingStockId(item.id)
        setEditValues(item.stock)
    }

    const handleAdjustStock = async (itemId: string, size: string, delta: number) => {
        setStock(prev => prev.map(item => {
            if (item.id === itemId) {
                const currentQty = item.stock[size] || 0
                const newQty = Math.max(0, currentQty + delta)
                
                updateStock(itemId, size, newQty).then(res => {
                    if (!res.success) {
                        toast({
                            variant: "destructive",
                            title: "Erreur de mise à jour",
                            description: `Échec de l'ajustement du stock pour ${item.label} (${size}).`,
                        })
                    }
                })

                return { ...item, stock: { ...item.stock, [size]: newQty } }
            }
            return item
        }))
    }

    const handleSkuMetadataUpdate = async (itemId: string, size: string, field: 'ref' | 'location', value: string) => {
        setStock(prev => prev.map(item => {
            if (item.id === itemId) {
                const currentMetadata = (item.skuMetadata as Record<string, any>) || {}
                const currentSkuData = currentMetadata[size] || { ref: "", location: "" }
                const newSkuData = { ...currentSkuData, [field]: value }
                
                updateSkuMetadata(itemId, size, newSkuData.ref, newSkuData.location).then(res => {
                    if (!res.success) {
                        toast({
                            variant: "destructive",
                            title: "Erreur",
                            description: "Impossible de mettre à jour les informations physiques."
                        })
                    }
                })

                return { ...item, skuMetadata: { ...currentMetadata, [size]: newSkuData } }
            }
            return item
        }))
        setEditingSku(null)
    }

    const handleUpdateMinThreshold = async (itemId: string, threshold: number) => {
        setStock(prev => prev.map(item => {
            if (item.id === itemId) {
                updateMinThreshold(itemId, threshold).then(res => {
                    if (!res.success) {
                        toast({
                            variant: "destructive",
                            title: "Erreur",
                            description: res.error || "Impossible de mettre à jour le seuil d'alerte."
                        })
                    } else {
                        toast({
                            title: "✅ Seuil mis à jour",
                            description: `Le seuil d'alerte pour ${item.label} a été défini à ${threshold}.`,
                            className: "bg-emerald-50 border-emerald-200 text-emerald-800",
                        })
                    }
                })
                return { ...item, minThreshold: threshold }
            }
            return item
        }))
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

    if (!isAuthorized) return null

    return (
        <div className="max-w-7xl mx-auto min-h-screen bg-slate-50 pb-20 relative">
            {/* World-Class STEF Header (Action Feed Style) */}
            <div className="bg-[#135bec] text-white pt-8 pb-32 px-6 rounded-b-[40px] shadow-lg mb-8 relative">
                <div className="flex justify-between items-center mb-6">
                    <Button 
                        variant="ghost" 
                        size="icon"
                        className="text-white hover:bg-white/20 rounded-full w-10 h-10 cursor-pointer"
                        asChild
                    >
                        <Link href="/">
                            <ChevronLeft className="w-6 h-6" />
                        </Link>
                    </Button>
                    
                    <div className="flex flex-col items-center">
                        <h1 className="text-4xl font-black tracking-tighter text-white">STEF</h1>
                        <span className="text-lg font-bold opacity-90 mt-[-4px]">
                            {navItems.find(i => i.id === activeTab)?.label} Feed
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Centre de notifications pour le Stock Critique */}
                        <div className="relative">
                            <Button 
                                variant="ghost" 
                                size="icon"
                                className="text-white hover:bg-white/20 rounded-full w-10 h-10 relative transition-all"
                                onClick={() => {
                                    setShowNotifications(!showNotifications)
                                    setShowMoreMenu(false)
                                    setShowProfileCard(false)
                                }}
                            >
                                <Bell className="w-5 h-5" />
                                {lowStockItems.length > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-[9px] font-black items-center justify-center text-white">
                                            {lowStockItems.length}
                                        </span>
                                    </span>
                                )}
                            </Button>
                            
                            {/* Menu Déroulant des Alertes (Glassmorphic) */}
                            {showNotifications && (
                                <div className="absolute right-0 mt-3 w-80 bg-white/95 backdrop-blur-xl rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 p-4 z-[100] animate-in slide-in-from-top-2 duration-300 origin-top-right text-slate-800">
                                    <div className="flex justify-between items-center border-b border-slate-100 pb-2 mb-2">
                                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Alertes de Stock</span>
                                        <Badge variant="destructive" className="bg-red-50 text-red-500 rounded-lg px-2 text-[10px] font-black uppercase">
                                            {lowStockItems.length} articles
                                        </Badge>
                                    </div>
                                    <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                                        {lowStockItems.length === 0 ? (
                                            <p className="text-xs font-semibold text-slate-400 text-center py-4">Aucune alerte de stock en cours ! 🎉</p>
                                        ) : (
                                            lowStockItems.map((item, idx) => (
                                                <div 
                                                    key={`${item.id}-${item.size}-${idx}`} 
                                                    className="flex items-center justify-between p-2 rounded-xl bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 cursor-pointer transition-colors"
                                                    onClick={() => {
                                                        setActiveTab("inventory");
                                                        setSearchTerm(item.label);
                                                        setShowNotifications(false);
                                                    }}
                                                >
                                                    <div className="min-w-0">
                                                        <p className="text-xs font-bold text-slate-800 truncate">{item.label}</p>
                                                        <p className="text-[10px] font-medium text-slate-400">Taille : {item.size} • Seuil : {item.minThreshold}</p>
                                                    </div>
                                                    <Badge variant="destructive" className="bg-red-500 text-white font-black text-[10px] px-2 py-0.5 rounded-full shrink-0">
                                                        {item.quantity} restants
                                                    </Badge>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Menu d'actions rapides (trois points) */}
                        <div className="relative">
                            <Button 
                                variant="ghost" 
                                size="icon"
                                className="text-white hover:bg-white/10 rounded-full w-10 h-10 flex items-center justify-center cursor-pointer"
                                onClick={() => {
                                    setShowMoreMenu(!showMoreMenu)
                                    setShowNotifications(false)
                                    setShowProfileCard(false)
                                }}
                            >
                                <MoreHorizontal className="w-6 h-6 rotate-90" />
                            </Button>
                            
                            {showMoreMenu && (
                                <div className="absolute right-0 mt-3 w-64 bg-white/95 backdrop-blur-xl rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 p-3 z-[100] animate-in slide-in-from-top-2 duration-300 origin-top-right text-slate-800">
                                    <div className="border-b border-slate-100 pb-2 mb-2 px-2">
                                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Options & Actions</span>
                                    </div>
                                    <div className="space-y-1">
                                        <Link 
                                            href="/" 
                                            className="flex items-center gap-3 w-full p-2.5 rounded-xl hover:bg-slate-100 transition-colors text-left text-sm font-bold text-slate-700"
                                            onClick={() => setShowMoreMenu(false)}
                                        >
                                            <Package className="w-4 h-4 text-[#135bec]" />
                                            <span>Saisie Collaborateur</span>
                                        </Link>
                                        <button 
                                            onClick={() => {
                                                exportRequestsToCSV();
                                                setShowMoreMenu(false);
                                            }}
                                            className="flex items-center gap-3 w-full p-2.5 rounded-xl hover:bg-slate-100 transition-colors text-left text-sm font-bold text-slate-700 cursor-pointer"
                                        >
                                            <Download className="w-4 h-4 text-[#135bec]" />
                                            <span>Export Demandes (CSV)</span>
                                        </button>
                                        <button 
                                            onClick={() => {
                                                exportInventoryToCSV();
                                                setShowMoreMenu(false);
                                            }}
                                            className="flex items-center gap-3 w-full p-2.5 rounded-xl hover:bg-slate-100 transition-colors text-left text-sm font-bold text-slate-700 cursor-pointer"
                                        >
                                            <Download className="w-4 h-4 text-[#135bec]" />
                                            <span>Export Inventaire (CSV)</span>
                                        </button>
                                        
                                        {offlineQueueCount > 0 && (
                                            <button 
                                                onClick={() => {
                                                    if (isOnline) {
                                                        syncOfflineActions();
                                                    }
                                                    setShowMoreMenu(false);
                                                }}
                                                className="flex items-center gap-3 w-full p-2.5 rounded-xl hover:bg-slate-100 transition-colors text-left text-sm font-bold text-slate-700 cursor-pointer"
                                            >
                                                <Save className="w-4 h-4 text-emerald-500" />
                                                <span>Synchroniser ({offlineQueueCount})</span>
                                            </button>
                                        )}

                                        <div className="border-t border-slate-100 my-1 pt-1" />
                                        
                                        <form action={handleSignOut} className="w-full">
                                            <button 
                                                type="submit"
                                                className="flex items-center gap-3 w-full p-2.5 rounded-xl hover:bg-red-50 text-red-600 transition-colors text-left text-sm font-bold w-full cursor-pointer"
                                            >
                                                <LogOut className="w-4 h-4 text-red-500" />
                                                <span>Déconnexion</span>
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Profil utilisateur (initiales) */}
                        <div className="relative">
                            <button 
                                onClick={() => {
                                    setShowProfileCard(!showProfileCard)
                                    setShowNotifications(false)
                                    setShowMoreMenu(false)
                                }}
                                className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 active:scale-95 transition-all backdrop-blur-md flex items-center justify-center border border-white/30 text-sm font-bold cursor-pointer" 
                                title={userName || userEmail || "Manager"}
                            >
                                {userInitials}
                            </button>

                            {showProfileCard && (
                                <div className="absolute right-0 mt-3 w-80 bg-white/95 backdrop-blur-xl rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 p-5 z-[100] animate-in slide-in-from-top-2 duration-300 origin-top-right text-slate-800">
                                    <div className="flex flex-col items-center text-center space-y-3 pb-4 border-b border-slate-100">
                                        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#135bec] to-blue-400 flex items-center justify-center text-white font-black text-2xl shadow-lg">
                                            {userInitials}
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-black text-slate-800 leading-tight">{userName || "Manager"}</h4>
                                            <p className="text-xs font-bold text-slate-400 mt-1">{userEmail || "Pas d'adresse e-mail"}</p>
                                        </div>
                                        <Badge className="bg-blue-50 text-[#135bec] hover:bg-blue-100 border-none font-black text-[10px] px-3 py-1 rounded-full uppercase tracking-wider">
                                            {userRole === "ADMIN" ? "Administrateur" : userRole}
                                        </Badge>
                                    </div>
                                    <div className="pt-3">
                                        <form action={handleSignOut} className="w-full">
                                            <Button 
                                                type="submit"
                                                variant="outline"
                                                className="w-full border-red-100 hover:border-red-200 text-red-600 hover:bg-red-50 rounded-xl h-10 font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                                            >
                                                <LogOut className="w-4 h-4" />
                                                Se déconnecter
                                            </Button>
                                        </form>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Search / Filter Bar */}
                <div className="relative max-w-md mx-auto">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        <MoreHorizontal className="w-4 h-4 text-white/50 rotate-90" />
                    </div>
                    <Input
                        placeholder="Rechercher..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white/10 border-white/20 text-white placeholder:text-white/50 rounded-2xl pl-12 h-12 backdrop-blur-md focus:bg-white/20 transition-all"
                    />
                </div>

                {/* Desktop Navigation Menu (hidden on mobile) */}
                <div className="hidden md:flex justify-center gap-2 max-w-2xl mx-auto mt-6 bg-white/10 p-1.5 rounded-2xl border border-white/10 backdrop-blur-md">
                    {navItems.map((item) => {
                        const isActive = activeTab === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => {
                                    setActiveTab(item.id);
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 relative font-bold text-sm ${
                                    isActive ? "bg-white text-[#135bec] shadow-sm" : "text-white/80 hover:text-white hover:bg-white/10"
                                }`}
                            >
                                <item.icon className="w-4 h-4" />
                                <span>{item.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="mt-8 px-4">

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                {/* Radix TabsList is now hidden because we use our custom Nav components */}
                <TabsList className="hidden h-0 w-0 p-0 overflow-hidden">
                    {navItems.map(item => (
                        <TabsTrigger key={item.id} value={item.id}>{item.label}</TabsTrigger>
                    ))}
                </TabsList>

                {/* Dashboard tab removed — Demandes is now the landing page */}

                <TabsContent value="requests" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="max-w-7xl mx-auto space-y-6 pb-24 px-4">
                        <div className="flex items-start justify-between px-4 mb-2">
                            <div>
                                <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                                    Demandes en cours
                                    {!isOnline && (
                                        <Badge variant="secondary" className="bg-orange-50 text-orange-600 rounded-lg px-2 py-0.5 text-[10px] uppercase tracking-wide gap-1 border border-orange-200 flex items-center shadow-sm ml-2">
                                            <span className="relative flex h-2 w-2">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                                            </span>
                                            Hors Ligne
                                        </Badge>
                                    )}
                                    {offlineQueueCount > 0 && (
                                        <Badge variant="secondary" className="bg-blue-50 text-blue-600 rounded-lg px-2 py-0.5 text-[10px] uppercase tracking-wide gap-1 border border-blue-200 flex items-center shadow-sm cursor-pointer hover:bg-blue-100 transition-colors" onClick={isOnline ? syncOfflineActions : undefined}>
                                            {isSyncing ? (
                                                <div className="w-3 h-3 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
                                            ) : (
                                                <Save className="w-3 h-3" />
                                            )}
                                            {offlineQueueCount} en attente
                                        </Badge>
                                    )}
                                </h2>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Flux d'approbation rapide</p>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                className="rounded-xl border-slate-200 text-slate-500 hover:text-[#135bec] hover:border-[#135bec]"
                                onClick={exportRequestsToCSV}
                                disabled={requests.filter(r => r.status === "Pending").length === 0}
                            >
                                <Download className="w-4 h-4 mr-2" /> CSV
                            </Button>
                        </div>

                        {requests.filter(r => r.status === "Pending").length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-24 text-slate-300 space-y-4">
                                <div className="w-20 h-20 rounded-full border-2 border-slate-100 flex items-center justify-center">
                                    <Check className="w-10 h-10 opacity-30" />
                                </div>
                                <p className="font-black text-lg">Tout est validé !</p>
                                <p className="text-sm font-bold opacity-60">Aucune demande en attente pour le moment.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {requests.filter(r => r.status === "Pending").map(req => (
                                <div key={req.id} className="bg-white border-none shadow-[0_10px_40px_rgba(0,0,0,0.04)] rounded-[40px] overflow-hidden group hover:shadow-[0_20px_60px_rgba(19,91,236,0.08)] transition-all duration-500 border border-transparent hover:border-blue-100/50">
                                    {/* Header de la carte */}
                                    <div className="p-8 border-b border-slate-50 flex justify-between items-start bg-gradient-to-br from-white to-slate-50/30">
                                        <div className="flex items-center gap-5">
                                            <div className="w-16 h-16 rounded-[22px] bg-[#135bec] flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-blue-200">
                                                {req.employeeName.charAt(0)}
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">{req.employeeName}</h3>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{req.service}</span>
                                                    <div className="w-1.5 h-1.5 bg-blue-100 rounded-full" />
                                                    <Badge className="bg-blue-50 text-[#135bec] border-none px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter">Urgent</Badge>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-3xl font-black text-slate-900 leading-none tracking-tighter">
                                                {req.items.reduce((sum, item) => sum + item.snapshottedPrice, 0)}€
                                            </div>
                                            <div className="text-[11px] font-bold text-slate-400 uppercase mt-2 tracking-widest">Valeur Estimée</div>
                                        </div>
                                    </div>

                                    {/* Contenu - Liste des items */}
                                    <div className="p-8 space-y-6">
                                        <div className="grid grid-cols-1 gap-3">
                                            {req.items.map((item, i) => (
                                                <div key={i} className="flex items-center justify-between p-5 bg-slate-50/50 rounded-[28px] border border-slate-100/50 group/item hover:bg-white hover:shadow-md transition-all duration-300">
                                                    <div className="flex items-center gap-5">
                                                        <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-600">
                                                            <Package className="w-6 h-6" />
                                                        </div>
                                                        <div>
                                                            <span className="block text-lg font-black text-slate-800 tracking-tight">{item.category}</span>
                                                            <span className="text-xs font-bold text-slate-400">Taille: <span className="text-[#135bec]">{item.size}</span></span>
                                                        </div>
                                                    </div>
                                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 text-xs font-black">
                                                        × 1
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        
                                        {/* Motif de la demande */}
                                        <div className="bg-blue-50/20 p-6 rounded-[28px] border border-blue-50/50 relative overflow-hidden">
                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#135bec]/20" />
                                            <div className="flex items-start gap-4">
                                                <div className="text-[#135bec] mt-1">
                                                    <ClipboardList className="w-5 h-5 opacity-40" />
                                                </div>
                                                <p className="text-sm text-slate-600 font-medium leading-relaxed italic">
                                                    <span className="font-black text-[#135bec] not-italic mr-2">Motif :</span>
                                                    "{req.reason || "Renouvellement annuel"}"
                                                </p>
                                            </div>
                                        </div>

                                        {/* Actions ergonomiques */}
                                        <div className="pt-4 flex gap-5">
                                            <Button
                                                variant="outline"
                                                className="flex-1 border-slate-200 text-red-500 rounded-[24px] h-16 text-lg font-black hover:bg-red-50 hover:border-red-100 active:scale-95 transition-all shadow-sm"
                                                onClick={() => handleReject(req.id, req.employeeName)}
                                            >
                                                Refuser
                                            </Button>
                                            <Button
                                                className="flex-[2] bg-[#135bec] hover:bg-[#0045bd] text-white rounded-[24px] h-16 text-lg font-black shadow-xl shadow-blue-200 active:scale-95 transition-all flex items-center justify-center gap-3"
                                                onClick={() => handleValidate(req.id, req.employeeName)}
                                            >
                                                <PenLine className="w-6 h-6" />
                                                Valider & Signer
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                                ))}
                            </div>
                        )}
                    </div>
                </TabsContent>



                <TabsContent value="history">
                    <HistoryView requests={requests} />
                </TabsContent>



                <TabsContent value="employees">
                    <CollaboratorsView requests={requests} />
                </TabsContent>


                <TabsContent value="inventory" className="space-y-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0">
                            <div>
                                <CardTitle>État des stocks</CardTitle>
                                <CardDescription>Consultez et modifiez les quantités en stock.</CardDescription>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-brand border-brand/20 hover:bg-brand/5 rounded-xl"
                                    onClick={exportInventoryToCSV}
                                >
                                    <Download className="w-4 h-4 mr-2" /> Exporter Inventaire
                                </Button>
                            </div>
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
                            <SelectTrigger className="w-[180px] bg-white border-0 shadow-sm rounded-xl">
                                <SelectValue placeholder="Catégorie" />
                            </SelectTrigger>
                            <SelectContent className="bg-white rounded-xl border-gray-100 shadow-xl">
                                <SelectItem value="ALL">Toutes les catégories</SelectItem>
                                {Array.from(new Set(stock.map(i => i.category))).map(cat => (
                                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-32 max-w-7xl mx-auto">
                        {filteredParentItems.map((item) => (
                            <StockItemCard
                                key={item.id}
                                item={item}
                                showStockImages={showStockImages}
                                handleAdjustStock={handleAdjustStock}
                                handleSkuMetadataUpdate={handleSkuMetadataUpdate}
                                handleUpdateMinThreshold={handleUpdateMinThreshold}
                            />
                        ))}
                    </div>
                </TabsContent>


                <TabsContent value="statistics">
                    <StatisticsDashboard requests={requests} stock={stock} showHeader={false} />
                </TabsContent>

                {userRole === "ADMIN" && (
                    <TabsContent value="audit">
                        <AuditLogView logs={initialAuditLogs} />
                    </TabsContent>
                )}

            </Tabs>
        </div>
            {/* World-Class Mobile Bottom Navigation Dock */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full px-4 max-w-md md:hidden">
                <div className="bg-white/95 backdrop-blur-xl rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-white/20 p-2 flex items-center justify-between mx-auto max-w-md">
                    {navItems.filter(i => i.isPrimary).map((item) => {
                        const isActive = activeTab === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => {
                                    setActiveTab(item.id);
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-[20px] transition-all duration-300 relative ${
                                    isActive ? "text-[#135bec]" : "text-slate-400 hover:text-slate-600"
                                }`}
                            >
                                {isActive && (
                                    <div className="absolute top-1 w-8 h-1 bg-[#135bec] rounded-full blur-[1px]" />
                                )}
                                <item.icon className={`w-6 h-6 ${isActive ? "scale-110" : ""}`} />
                                <span className={`text-[10px] font-bold tracking-tight ${isActive ? "opacity-100" : "opacity-80"}`}>
                                    {item.label}
                                </span>
                                {isActive && (
                                    <div className="absolute inset-0 bg-blue-50/50 rounded-[20px] -z-10" />
                                )}
                            </button>
                        );
                    })}
                    
                    {/* More Menu Toggle */}
                    <div className="relative">
                        <button
                            onClick={() => setShowMoreMenu(!showMoreMenu)}
                            className={`flex-1 min-w-[64px] flex flex-col items-center gap-1.5 py-3 rounded-[20px] transition-all duration-300 ${
                                navItems.filter(i => !i.isPrimary).some(i => i.id === activeTab) || showMoreMenu
                                    ? "text-[#135bec]" : "text-slate-400"
                            }`}
                        >
                            <MoreHorizontal className="w-6 h-6" />
                            <span className="text-[10px] font-bold">Plus</span>
                            {(navItems.filter(i => !i.isPrimary).some(i => i.id === activeTab) || showMoreMenu) && (
                                <div className="absolute inset-0 bg-blue-50/50 rounded-[20px] -z-10" />
                            )}
                        </button>

                        {/* Popover Menu for Secondary Items */}
                        {showMoreMenu && (
                            <div className="absolute bottom-full right-0 mb-4 w-48 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-100 p-2 animate-in slide-in-from-bottom-2 duration-300 origin-bottom-right">
                                {navItems.filter(i => !i.isPrimary).map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => {
                                            setActiveTab(item.id);
                                            setShowMoreMenu(false);
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                        }}
                                        className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                                            activeTab === item.id 
                                                ? "bg-blue-50 text-[#135bec]" 
                                                : "text-slate-600 hover:bg-slate-50"
                                        }`}
                                    >
                                        <item.icon className="w-5 h-5" />
                                        <span className="text-sm font-bold">{item.label}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            {/* Click overlay to close menu */}
            {showMoreMenu && (
                <div 
                    className="fixed inset-0 z-40 md:hidden" 
                    onClick={() => setShowMoreMenu(false)}
                />
            )}
            
            {/* Signature Dialog */}
            <AlertDialog open={!!signatureDialog?.open} onOpenChange={(open) => { if (!open) setSignatureDialog(null) }}>
                <AlertDialogContent className="max-w-md mx-auto rounded-[36px] border-none shadow-2xl p-8">
                    <SignaturePad
                        employeeName={signatureDialog?.employeeName || ""}
                        onConfirm={handleSignatureConfirm}
                        onCancel={() => setSignatureDialog(null)}
                        isSubmitting={isSubmittingSignature}
                    />
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
