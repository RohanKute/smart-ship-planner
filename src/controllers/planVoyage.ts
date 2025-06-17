import { Request, Response } from "express";
import { aiEngine } from "../scripts/aiModel";
import prisma from "../prisma-setup/config.prisma";

export const planVoyage = async (req: Request, res: Response) => {
  try {
    const { origin, destination, departureTime, weather, cargoKg, shipId } =
      req.body;

    if (
      !origin ||
      !destination ||
      !departureTime ||
      !weather ||
      cargoKg === undefined ||
      !shipId
    ) {
      res
        .status(400)
        .json({
          error:
            "Missing required fields: origin, destination, departureTime, weather, cargoKg, shipId.",
        });
      return;
    }

    const routePlan = aiEngine.planRoute({
      origin,
      destination,
      weather,
      cargoKg,
    });
    const weatherFactor =
      weather === "Stormy" ? 1.5 : weather === "Moderate" ? 1.2 : 1.0;
    const fuelBurnRate = aiEngine.predictFuel({
      speedKph: routePlan.suggestedSpeedKph,
      cargoKg,
      weatherFactor,
    });

    if (fuelBurnRate === null) {
      throw new Error("AI Fuel Prediction model is not ready.");
    }

    const departure = new Date(departureTime);
    const plannedEta = new Date(
      departure.getTime() + routePlan.etaHours * 60 * 60 * 1000
    );
    const planObject = {
      eta: plannedEta,
      fuelKg: parseFloat((fuelBurnRate * routePlan.etaHours).toFixed(2)),
      route: routePlan.route,
      speedScheduleKph: routePlan.suggestedSpeedKph,
    };

    const newVoyage = await prisma.voyage.create({
      data: {
        shipId,
        origin,
        destination,
        departureTime: departure,
        cargoKg,
        weather,
        plan: planObject,
      },
      include: { ship: true },
    });
    res.status(201).json(planObject);
  } catch (error) {
    console.error("Error in /plan-voyage:", error);
    res.status(500).json({ error: "Failed to create voyage plan." });
  }
};
