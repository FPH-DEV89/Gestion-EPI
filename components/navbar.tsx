"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { HardHat, LogOut } from "lucide-react"
import { logout } from "@/app/actions"

export default function Navbar() {
    const pathname = usePathname()

    const navItems = [
        { label: "Employé", href: "/" },
        { label: "Manager", href: "/admin" },
    ]

    return (
        <header className="bg-brand text-white py-4 px-6 md:px-10 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-4">
                <div className="bg-white p-2 rounded-xl shadow-sm">
                    <HardHat className="text-brand w-6 h-6" />
                </div>
                <h1 className="text-xl font-black uppercase tracking-tight leading-tight">EPI MANAGER</h1>
            </div>

            <nav className="flex gap-2 items-center">
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

                {pathname.startsWith("/admin") && (
                    <button
                        onClick={() => logout()}
                        className="ml-2 p-2 rounded-lg text-white hover:bg-white/10 transition-all"
                        title="Déconnexion"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                )}
            </nav>
        </header>
    )
}
