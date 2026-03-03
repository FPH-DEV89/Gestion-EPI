import { signIn } from '@/auth'
import { PrismaClient } from '@prisma/client'

async function testSignIn() {
    try {
        console.log("Attempting sign in...")

        // Construct the FormData that next-auth expects
        const formData = new FormData()
        formData.append("email", "florian.philibert@stef.com")
        formData.append("password", "Zc4jmx1989@")

        const result = await signIn('credentials', Object.fromEntries(formData))
        console.log("SignIn Result:", result)

    } catch (error) {
        console.error("SignIn Error:")
        console.error(error)
    }
}

testSignIn()
