import { Request, Response } from "express";
import { aiEngine } from "../scripts/aiModel";
import prisma from "../prisma-setup/config.prisma";

export const getPlanHistory = async (req: Request, res: Response) => {
  try {
    const voyages = await prisma.voyage.findMany({
      orderBy: { departureTime: "desc" },
      include: { ship: true },
    });
    res.status(200).json(voyages);
  } catch (error) {
    console.error("Error in /plan-history:", error);
    res.status(500).json({ error: "Failed to fetch voyage history." });
  }
};
