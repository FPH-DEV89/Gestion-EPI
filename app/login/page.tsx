'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { authenticate } from '@/app/lib/actions'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Lock } from "lucide-react"

export default function LoginPage() {
    const [errorMessage, dispatch, isPending] = useActionState(authenticate, undefined)

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <Card className="w-full max-w-sm shadow-xl border-none">
                <CardHeader className="text-center">
                    <div className="w-12 h-12 bg-brand/10 text-brand rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock className="w-6 h-6" />
                    </div>
                    <CardTitle>Accès Manager</CardTitle>
                    <CardDescription>Saisissez le mot de passe pour accéder au dashboard.</CardDescription>
                </CardHeader>
                <form action={dispatch}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" name="email" placeholder="admin@epi-manager.com" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Mot de passe</Label>
                            <Input id="password" type="password" name="password" placeholder="••••••••" required />
                        </div>
                        <div
                            className="flex h-8 items-end space-x-1"
                            aria-live="polite"
                            aria-atomic="true"
                        >
                            {errorMessage && (
                                <p className="text-sm text-red-500">{errorMessage}</p>
                            )}
                        </div>
                    </CardContent>
                    <CardFooter>
                        <LoginButton />
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}

function LoginButton() {
    const { pending } = useFormStatus()

    return (
        <Button className="w-full" aria-disabled={pending}>
            {pending ? "Connexion..." : "Se connecter"}
        </Button>
    )
}
