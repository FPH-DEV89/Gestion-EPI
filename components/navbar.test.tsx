import { expect, test, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import NavbarClient from './navbar-client'

// Mocks
vi.mock("next/navigation", () => ({
    usePathname: () => "/",
    useRouter: () => ({
        push: vi.fn(),
        refresh: vi.fn(),
    }),
}))

vi.mock("next/link", () => ({
    default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}))

vi.mock("@/app/lib/actions", () => ({
    handleSignOut: vi.fn(),
}))

test('Navbar renders correctly for User', () => {
    const navItems = [{ label: "Employé", href: "/" }]
    render(<NavbarClient navItems={navItems} isLoggedIn={true} />)

    expect(screen.getByText('EPI MANAGER')).toBeDefined()
    expect(screen.getByText('Employé')).toBeDefined()
    expect(screen.queryByText('Manager')).toBeNull()
})

test('Navbar renders correctly for Admin', () => {
    const navItems = [{ label: "Employé", href: "/" }, { label: "Manager", href: "/admin" }]
    render(<NavbarClient navItems={navItems} isLoggedIn={true} />)

    expect(screen.getByText('EPI MANAGER')).toBeDefined()
    expect(screen.getByText('Employé')).toBeDefined()
    expect(screen.getByText('Manager')).toBeDefined()
})
