"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function createRequest(formData: {
    employeeName: string;
    firstName: string;
    service: string;
    category: string;
    size: string;
    reason: string;
}) {
    try {
        const { firstName, ...rest } = formData;
        const request = await prisma.request.create({
            data: {
                ...rest,
                employeeName: `${firstName} ${rest.employeeName}`,
                status: "Pending",
            },
        });
        revalidatePath("/");
        return { success: true, data: request };
    } catch (error) {
        console.error("Failed to create request:", error);
        return { success: false, error: "Erreur lors de la création de la demande" };
    }
}

export async function validateRequest(requestId: string) {
    try {
        const request = await prisma.request.findUnique({
            where: { id: requestId },
        });

        if (!request) return { success: false, error: "Demande introuvable" };

        const stockItem = await prisma.stockItem.findUnique({
            where: { category: request.category },
        });

        if (!stockItem) return { success: false, error: "Équipement introuvable" };

        const stock = (stockItem.stock as Record<string, number>) || {};
        const currentQuantity = stock[request.size] || 0;

        if (currentQuantity <= 0) {
            return { success: false, error: "Stock épuisé pour cette taille" };
        }

        // Decrement stock
        const newStock = { ...stock, [request.size]: currentQuantity - 1 };

        await prisma.$transaction([
            prisma.stockItem.update({
                where: { id: stockItem.id },
                data: { stock: newStock },
            }),
            prisma.request.update({
                where: { id: requestId },
                data: { status: "Ordered" },
            }),
        ]);

        revalidatePath("/");
        return { success: true };
    } catch (error) {
        console.error("Failed to validate request:", error);
        return { success: false, error: "Erreur lors de la validation" };
    }
}

export async function rejectRequest(requestId: string) {
    try {
        await prisma.request.update({
            where: { id: requestId },
            data: { status: "Rejected" },
        });
        revalidatePath("/");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Erreur lors du rejet" };
    }
}

export async function updateStock(categoryId: string, size: string, quantity: number) {
    try {
        const stockItem = await prisma.stockItem.findUnique({
            where: { id: categoryId },
        });

        if (!stockItem) return { success: false, error: "Équipement introuvable" };

        const stock = (stockItem.stock as Record<string, number>) || {};
        const newStock = { ...stock, [size]: quantity };

        await prisma.stockItem.update({
            where: { id: categoryId },
            data: { stock: newStock },
        });

        revalidatePath("/");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Erreur lors de la mise à jour du stock" };
    }
}

export async function login(password: string) {
    if (password === "admin") {
        const cookieStore = await cookies();
        cookieStore.set("admin_auth", "true", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24, // 1 day
        });
        return { success: true };
    }
    return { success: false, error: "Mot de passe incorrect" };
}

export async function logout() {
    const cookieStore = await cookies();
    cookieStore.delete("admin_auth");
    redirect("/login");
}
