"use server";

import { PrismaClient } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";

const prisma = new PrismaClient();

export type CBCRecordInput = {
  date: string;
  hemoglobin: number;
  wbc: number;
  platelets: number;
  rbc: number;
  mcv: number;
  mch: number;
  mchc: number;
};

export async function getUserRecords() {
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        records: {
          orderBy: { date: "asc" },
        },
      },
    });

    return { records: user?.records || [] };
  } catch (error) {
    console.error("Failed to fetch records:", error);
    return { error: "Failed to fetch records" };
  }
}

export async function saveUserRecords(records: CBCRecordInput[]) {
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

  try {
    // Upsert user to ensure they exist in DB
    await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: { id: userId },
    });

    // Option A: Delete existing records and replace with new ones (easier for sync)
    // Option B: Just add them. We will replace to match the UI state perfectly.
    await prisma.record.deleteMany({
      where: { userId },
    });

    if (records.length > 0) {
      await prisma.record.createMany({
        data: records.map((r) => ({
          ...r,
          userId,
        })),
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to save records:", error);
    return { error: "Failed to save records" };
  }
}
