"use server";

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

export async function createRequests(formData: {
    employeeName: string;
    firstName: string;
    service: string;
    items: { category: string; size: string }[];
    reason: string;
}) {
    try {
        const { firstName, employeeName, service, items, reason } = formData;
        const fullName = `${firstName} ${employeeName}`;

        // Récupérer les prix actuels du stock pour chaque item
        const stockItems = await prisma.stockItem.findMany({
            where: { category: { in: items.map(i => i.category) } }
        });

        const request = await prisma.request.create({
            data: {
                employeeName: fullName,
                firstName,
                service,
                reason,
                status: "Pending",
                items: {
                    create: items.map(item => {
                        const stockInfo = stockItems.find(s => s.category === item.category);
                        return {
                            category: item.category,
                            size: item.size,
                            snapshottedPrice: stockInfo?.price || 0
                        };
                    })
                }
            },
            include: { items: true }
        });

        revalidatePath("/");
        revalidatePath("/admin");
        return { success: true, count: 1 };
    } catch (error) {
        console.error("Failed to create requests:", error);
        return { success: false, error: "Erreur lors de la création de la demande" };
    }
}

export async function createRequest(formData: {
    employeeName: string;
    firstName: string;
    service: string;
    category: string;
    size: string;
    reason: string;
}) {
    return createRequests({
        ...formData,
        items: [{ category: formData.category, size: formData.size }]
    });
}

async function recordAuditLog(tx: Prisma.TransactionClient, userId: string, action: string, details: any) {
    await tx.auditLog.create({
        data: {
            userId,
            action,
            details: details || {}
        }
    });
}

export async function validateRequest(requestId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Vous devez être connecté pour valider une demande" };
        }

        const request = await prisma.request.findUnique({
            where: { id: requestId },
            include: { items: true }
        });

        if (!request) return { success: false, error: "Demande introuvable" };

        // Check stock for all items
        for (const item of request.items) {
            const stockItem = await prisma.stockItem.findFirst({
                where: { category: item.category },
            });

            if (!stockItem) return { success: false, error: `Équipement ${item.category} introuvable` };

            const stock = (stockItem.stock as Record<string, number>) || {};
            const currentQuantity = stock[item.size] || 0;

            if (currentQuantity <= 0) {
                return { success: false, error: `Stock épuisé pour ${item.category} (${item.size})` };
            }
        }

        await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            for (const item of request.items) {
                const stockItem = await tx.stockItem.findFirst({
                    where: { category: item.category },
                });

                if (stockItem) {
                    const stock = (stockItem.stock as Record<string, number>) || {};
                    const newStock = { ...stock, [item.size]: (stock[item.size] || 0) - 1 };

                    await tx.stockItem.update({
                        where: { id: stockItem.id },
                        data: { stock: newStock }
                    });
                }
            }

            await tx.request.update({
                where: { id: requestId },
                data: {
                    status: "Ordered",
                    validatedById: session.user.id,
                    validatedAt: new Date()
                },
            });

            await recordAuditLog(tx, session.user.id as string, "VALIDATE_REQUEST", {
                requestId,
                employeeName: request.employeeName,
                items: request.items.map(i => ({ category: i.category, size: i.size }))
            });
        });

        revalidatePath("/");
        revalidatePath("/admin");
        return { success: true };
    } catch (error) {
        console.error("Failed to validate request:", error);
        return { success: false, error: "Erreur lors de la validation" };
    }
}

export async function rejectRequest(requestId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Vous devez être connecté pour rejeter une demande" };
        }

        await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            const request = await tx.request.update({
                where: { id: requestId },
                data: {
                    status: "Rejected",
                    validatedById: session.user.id,
                    validatedAt: new Date()
                },
            });

            await recordAuditLog(tx, session.user.id as string, "REJECT_REQUEST", {
                requestId,
                employeeName: request.employeeName
            });
        });

        revalidatePath("/");
        revalidatePath("/admin");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Erreur lors du rejet" };
    }
}

export async function updateStock(categoryId: string, size: string, quantity: number) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Vous devez être connecté pour modifier le stock" };
        }

        const success = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            const stockItem = await tx.stockItem.findUnique({
                where: { id: categoryId },
            });

            if (!stockItem) return null;

            const stock = (stockItem.stock as Record<string, number>) || {};
            const oldQuantity = stock[size] || 0;
            const newStock = { ...stock, [size]: quantity };

            await tx.stockItem.update({
                where: { id: categoryId },
                data: { stock: newStock },
            });

            await recordAuditLog(tx, session.user.id as string, "UPDATE_STOCK", {
                category: stockItem.category,
                size,
                oldQuantity,
                newQuantity: quantity
            });

            return true;
        });

        if (!success) return { success: false, error: "Équipement introuvable" };

        revalidatePath("/");
        revalidatePath("/admin");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Erreur lors de la mise à jour du stock" };
    }
}

