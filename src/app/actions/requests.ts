"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Types
export interface RequestData {
  employeeName: string;
  service: string;
  category: string;
  size: string;
  reason: string;
}

export interface StockUpdateData {
  category: string;
  size: string;
  quantity: number;
}

// Create a new request
export async function createRequest(data: RequestData) {
  try {
    const request = await prisma.request.create({
      data: {
        employeeName: data.employeeName,
        service: data.service,
        category: data.category,
        size: data.size,
        reason: data.reason,
        status: "Pending",
      },
    });

    revalidatePath("/manager");
    return { success: true, request };
  } catch (error) {
    console.error("Error creating request:", error);
    return { success: false, error: "Failed to create request" };
  }
}

// Get all requests
export async function getRequests() {
  try {
    const requests = await prisma.request.findMany({
      orderBy: { createdAt: "desc" },
    });
    return { success: true, requests };
  } catch (error) {
    console.error("Error fetching requests:", error);
    return { success: false, error: "Failed to fetch requests" };
  }
}

// Get pending requests
export async function getPendingRequests() {
  try {
    const requests = await prisma.request.findMany({
      where: { status: "Pending" },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, requests };
  } catch (error) {
    console.error("Error fetching pending requests:", error);
    return { success: false, error: "Failed to fetch pending requests" };
  }
}

// Validate (approve) a request - Critical business logic
export async function validateRequest(requestId: string) {
  try {
    // Get the request
    const request = await prisma.request.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      return { success: false, error: "Request not found" };
    }

    if (request.status !== "Pending") {
      return { success: false, error: "Request is not pending" };
    }

    // Get the stock item for this category
    const stockItem = await prisma.stockItem.findUnique({
      where: { category: request.category },
    });

    if (!stockItem) {
      return { success: false, error: "Stock item not found" };
    }

    // Parse the stock JSON
    const stock = stockItem.stock as Record<string, number>;
    const sizeStock = stock[request.size];

    // Check if stock is available
    if (sizeStock === undefined || sizeStock <= 0) {
      return { success: false, error: "Stock épuisé" };
    }

    // Decrement the stock for this specific size
    const updatedStock = {
      ...stock,
      [request.size]: sizeStock - 1,
    };

    // Update stock item
    await prisma.stockItem.update({
      where: { category: request.category },
      data: { stock: updatedStock },
    });

    // Update request status to "Ordered"
    const updatedRequest = await prisma.request.update({
      where: { id: requestId },
      data: { status: "Ordered" },
    });

    revalidatePath("/manager");
    return { success: true, request: updatedRequest };
  } catch (error) {
    console.error("Error validating request:", error);
    return { success: false, error: "Failed to validate request" };
  }
}

// Reject a request
export async function rejectRequest(requestId: string) {
  try {
    const request = await prisma.request.update({
      where: { id: requestId },
      data: { status: "Rejected" },
    });

    revalidatePath("/manager");
    return { success: true, request };
  } catch (error) {
    console.error("Error rejecting request:", error);
    return { success: false, error: "Failed to reject request" };
  }
}

// Get all stock items
export async function getStockItems() {
  try {
    const items = await prisma.stockItem.findMany({
      orderBy: { label: "asc" },
    });
    return { success: true, items };
  } catch (error) {
    console.error("Error fetching stock items:", error);
    return { success: false, error: "Failed to fetch stock items" };
  }
}

// Get single stock item by category
export async function getStockItem(category: string) {
  try {
    const item = await prisma.stockItem.findUnique({
      where: { category },
    });
    return { success: true, item };
  } catch (error) {
    console.error("Error fetching stock item:", error);
    return { success: false, error: "Failed to fetch stock item" };
  }
}

// Update stock quantity for a specific size
export async function updateStockSize(data: StockUpdateData) {
  try {
    const stockItem = await prisma.stockItem.findUnique({
      where: { category: data.category },
    });

    if (!stockItem) {
      return { success: false, error: "Stock item not found" };
    }

    const stock = stockItem.stock as Record<string, number>;
    const updatedStock = {
      ...stock,
      [data.size]: data.quantity,
    };

    const updatedItem = await prisma.stockItem.update({
      where: { category: data.category },
      data: { stock: updatedStock },
    });

    revalidatePath("/manager");
    return { success: true, item: updatedItem };
  } catch (error) {
    console.error("Error updating stock:", error);
    return { success: false, error: "Failed to update stock" };
  }
}
