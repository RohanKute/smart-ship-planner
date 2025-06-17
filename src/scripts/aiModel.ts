import tf from "@tensorflow/tfjs";
import trainFuelModel from "./models/fuelPredictor";
import trainMaintenanceModel from "./models/maintenanceModel";

export interface RouteInput {
  origin: string;
  destination: string;
  weather: "Calm" | "Moderate" | "Stormy";
  cargoKg: number;
}

export interface OptimizedRoute {
  etaHours: number;
  distanceKm: number;
  suggestedSpeedKph: number;
  route: string[];
  warnings: string[];
}

export interface FuelInput {
  speedKph: number;
  cargoKg: number;
  weatherFactor: number;
}

export interface MaintenanceInput {
  totalEngineHours: number;
  lastServiceDate: Date;
}

export interface MaintenanceAlert {
  alertLevel: "OK" | "WARNING" | "CRITICAL";
  predictedNextServiceDate: Date | null;
  reason: string;
}

class AIEngine {
  private fuelModel: tf.Sequential | null = null;
  private maintenanceModel: tf.Sequential | null = null;

  public async initialize() {
    console.log("AI Engine initialization started...");
    this.fuelModel = await trainFuelModel();
    this.maintenanceModel = await trainMaintenanceModel();
    console.log("AI Engine initialized successfully.");
  }

  public planRoute(input: RouteInput): OptimizedRoute {
    // This is a simplified logic model, not a TF model.
    const warnings: string[] = [];

    const baseDistance = (input.origin.length + input.destination.length) * 50;
    const distanceKm = Math.max(500, baseDistance);

    const baseSpeedKph = 40;
    let effectiveSpeedKph = baseSpeedKph;

    if (input.weather === "Stormy") {
      effectiveSpeedKph *= 0.75;
      warnings.push("Stormy weather will significantly increase travel time.");
    } else if (input.weather === "Moderate") {
      effectiveSpeedKph *= 0.9;
    }

    const cargoFactor = 1 - input.cargoKg / 1000000;
    effectiveSpeedKph *= Math.max(0.8, cargoFactor);

    const etaHours = distanceKm / effectiveSpeedKph;

    return {
      etaHours: parseFloat(etaHours.toFixed(2)),
      distanceKm: distanceKm,
      suggestedSpeedKph: parseFloat(effectiveSpeedKph.toFixed(2)),
      route: [input.origin, "Waypoint-A", "Waypoint-B", input.destination],
      warnings,
    };
  }

  public predictFuel(input: FuelInput): number | null {
    if (!this.fuelModel) {
      console.error("Fuel model not initialized!");
      return null;
    }

    const inputTensor = tf.tensor2d([
      [input.speedKph, input.cargoKg, input.weatherFactor],
    ]);
    const prediction = this.fuelModel.predict(inputTensor) as tf.Tensor;
    console.log("prediction", prediction.print());

    const fuelBurnRate = prediction.dataSync()[0];

    return parseFloat(fuelBurnRate.toFixed(2));
  }

  public predictMaintenance(input: MaintenanceInput): MaintenanceAlert {
    const hoursSinceLastService =
      (new Date().getTime() - input.lastServiceDate.getTime()) /
      (1000 * 60 * 60);
    const CRITICAL_THRESHOLD_HOURS = 3000;
    if (hoursSinceLastService > CRITICAL_THRESHOLD_HOURS) {
      return {
        alertLevel: "CRITICAL",
        predictedNextServiceDate: null,
        reason: `Engine has run for over ${CRITICAL_THRESHOLD_HOURS} hours since last service. Immediate inspection required.`,
      };
    }

    if (!this.maintenanceModel) {
      throw new Error("Maintenance model is not initialized.");
    }
    const inputTensor = tf.tensor2d([[input.totalEngineHours]]);
    const prediction = this.maintenanceModel.predict(inputTensor) as tf.Tensor;
    const remainingHours = prediction.dataSync()[0];

    const WARNING_THRESHOLD_HOURS = 500;
    const predictedServiceDate = new Date();
    predictedServiceDate.setHours(
      predictedServiceDate.getHours() + remainingHours
    );

    if (remainingHours < WARNING_THRESHOLD_HOURS) {
      return {
        alertLevel: "WARNING",
        predictedNextServiceDate: predictedServiceDate,
        reason: `Predicted remaining engine life is less than ${WARNING_THRESHOLD_HOURS} hours. Schedule maintenance soon.`,
      };
    }

    return {
      alertLevel: "OK",
      predictedNextServiceDate: predictedServiceDate,
      reason: "Engine operating within normal parameters.",
    };
  }
}

export const aiEngine = new AIEngine();
