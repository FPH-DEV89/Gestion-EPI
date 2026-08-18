import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { z } from "zod"
import { authConfig } from "./auth.config"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const { handlers, signIn, signOut, auth } = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            credentials: {
                email: {},
                password: {},
            },
            authorize: async (credentials) => {
                const parsedCredentials = z
                    .object({ email: z.string().email(), password: z.string().min(6) })
                    .safeParse(credentials)

                if (parsedCredentials.success) {
                    const { email, password } = parsedCredentials.data
                    const normalizedEmail = email.toLowerCase()

                    let user = await prisma.user.findUnique({
                        where: { email: normalizedEmail }
                    })

                    // Auto-seed key admin accounts on-the-fly during login if provided credentials match
                    const defaultAdmins: Record<string, { pass: string; name: string }> = {
                        "florian.philibert@stef.com": { pass: "Stef2026!", name: "Florian Philibert" },
                        "director@example.com": { pass: "DemoDirecteur2026!", name: "Directeur STEF" },
                    }

                    const defaultAccount = defaultAdmins[normalizedEmail]
                    if (defaultAccount && password === defaultAccount.pass) {
                        const hashedPassword = await bcrypt.hash(defaultAccount.pass, 10)
                        user = await prisma.user.upsert({
                            where: { email: normalizedEmail },
                            update: { password: hashedPassword, role: "ADMIN", name: defaultAccount.name },
                            create: { email: normalizedEmail, password: hashedPassword, role: "ADMIN", name: defaultAccount.name },
                        })
                    }

                    if (!user) return null

                    const passwordsMatch = await bcrypt.compare(password, user.password)

                    if (passwordsMatch) {
                        return {
                            id: user.id,
                            name: user.name,
                            email: user.email,
                            role: user.role,
                        }
                    }
                }

                console.log("Invalid credentials")
                return null
            },
        }),
    ],
})
