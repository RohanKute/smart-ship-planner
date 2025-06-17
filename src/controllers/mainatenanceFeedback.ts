import { Request, Response } from "express";
import { aiEngine } from "../scripts/aiModel";
import prisma from "../prisma-setup/config.prisma";

export const getMaintenanceAlerts = async (req: Request, res: Response) => {
  try {
    const maintenanceRecords = await prisma.maintenance.findMany({
      include: { ship: true },
    });

    const alerts = maintenanceRecords
      .map((record) => {
        const prediction = aiEngine.predictMaintenance({
          totalEngineHours: record.totalEngineHours,
          lastServiceDate: record.lastServiceDate,
        });

        return {
          shipId: record.ship.id,
          shipEngineType: record.ship.engineType,
          alertLevel: prediction.alertLevel,
          reason: prediction.reason,
          predictedNextServiceDate: prediction.predictedNextServiceDate,
        };
      })
      .filter((alert) => alert.alertLevel !== "OK");

    res.status(200).json(alerts);
  } catch (error) {
    console.error("Error in /maintenance-alerts:", error);
    res.status(500).json({ error: "Failed to fetch maintenance alerts." });
  }
};
