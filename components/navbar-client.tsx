"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { HardHat, LogOut, Menu, X } from "lucide-react"
import { handleSignOut } from "@/app/lib/actions"

export default function NavbarClient({ navItems, isLoggedIn }: { navItems: { label: string, href: string }[], isLoggedIn: boolean }) {
    const pathname = usePathname()
    const [mobileOpen, setMobileOpen] = useState(false)

    return (
        <header className="bg-brand text-white py-3 px-4 md:py-4 md:px-10 shadow-md">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-white p-2 rounded-xl shadow-sm">
                        <HardHat className="text-brand w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <h1 className="text-lg md:text-xl font-black uppercase tracking-tight leading-tight">EPI MANAGER</h1>
                </div>

                {/* Desktop nav */}
                <nav className="hidden md:flex gap-2 items-center">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${isActive
                                    ? "bg-white text-brand shadow-sm"
                                    : "text-white hover:bg-white/10"
                                    }`}
                            >
                                {item.label}
                            </Link>
                        )
                    })}
                    {isLoggedIn && (
                        <form action={handleSignOut}>
                            <button type="submit" className="ml-2 p-2 rounded-lg text-white hover:bg-white/10 transition-all" title="Déconnexion">
                                <LogOut className="w-5 h-5" />
                            </button>
                        </form>
                    )}
                </nav>

                {/* Mobile hamburger */}
                <button
                    className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-all"
                    onClick={() => setMobileOpen(!mobileOpen)}
                    aria-label="Menu"
                >
                    {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Mobile dropdown */}
            {mobileOpen && (
                <nav className="md:hidden mt-3 pt-3 border-t border-white/20 flex flex-col gap-1 animate-in slide-in-from-top-2 duration-200">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setMobileOpen(false)}
                                className={`px-4 py-3 rounded-lg text-sm font-bold transition-all ${isActive
                                    ? "bg-white text-brand shadow-sm"
                                    : "text-white hover:bg-white/10"
                                    }`}
                            >
                                {item.label}
                            </Link>
                        )
                    })}
                    {isLoggedIn && (
                        <form action={handleSignOut}>
                            <button
                                type="submit"
                                className="w-full text-left px-4 py-3 rounded-lg text-sm font-bold text-white hover:bg-white/10 transition-all flex items-center gap-2"
                            >
                                <LogOut className="w-4 h-4" /> Déconnexion
                            </button>
                        </form>
                    )}
                </nav>
            )}
        </header>
    )
}
