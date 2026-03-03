import Link from "next/link"
import { auth } from "@/auth"
import { HardHat, LogOut } from "lucide-react"
import { handleSignOut } from "@/app/lib/actions"
import NavbarClient from "./navbar-client"

export default async function Navbar() {
    const session = await auth()
    const userRole = (session?.user as any)?.role

    const navItems = [
        { label: "Employé", href: "/" },
    ]

    // Only add Manager link if user is explicitly an ADMIN
    if (userRole === "ADMIN") {
        navItems.push({ label: "Manager", href: "/admin" })
    }

    return (
        <NavbarClient navItems={navItems} isLoggedIn={!!session?.user} />
    )
}
