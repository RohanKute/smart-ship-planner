import { Request, Response } from "express";
import { aiEngine } from "../scripts/aiModel";
import prisma from "../prisma-setup/config.prisma";

export const submitFeedback = async (req: Request, res: Response) => {
  try {
    const { voyageId, actualFuelUsed, actualTimeTaken, notes } = req.body;

    if (!voyageId || !actualFuelUsed || !actualTimeTaken) {
      res
        .status(400)
        .json({
          error:
            "Missing required fields: voyageId, actualFuelUsed, actualTimeTaken.",
        });
      return;
    }

    const updatedVoyage = await prisma.voyage.update({
      where: { id: voyageId },
      data: {
        actuals: {
          eta: new Date(actualTimeTaken),
          fuelKg: parseFloat(actualFuelUsed),
          notes: notes || "",
        },
      },
    });

    const plan = updatedVoyage.plan as any;
    await prisma.fuelLog.create({
      data: {
        voyageId: updatedVoyage.id,
        timestamp: new Date(),
        fuelBurnRate:
          parseFloat(actualFuelUsed) /
          ((new Date(actualTimeTaken).getTime() -
            updatedVoyage.departureTime.getTime()) /
            (1000 * 60 * 60)),
        speedKph: plan.speedScheduleKph,
      },
    });
    console.log(`New FuelLog created from feedback for Voyage ${voyageId}`);

    res.status(200).json(updatedVoyage);
  } catch (error) {
    console.error("Error in /feedback:", error);
    res.status(500).json({ error: "Failed to submit feedback." });
  }
};
