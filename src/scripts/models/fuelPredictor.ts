import tf, { any } from "@tensorflow/tfjs";
import prisma from "../../prisma-setup/config.prisma";

export default async function trainFuelModel(): Promise<tf.Sequential | null> {
  try {
    let fuelModel: tf.Sequential | null;

    console.log("Training fuel prediction model from database...");

    const fuelLogs = await prisma.fuelLog.findMany({
      include: {
        voyage: true,
      },
    });
    if (fuelLogs.length === 0) {
      console.warn(
        "⚠️ No fuel logs found in database to train model. Skipping."
      );
      return null;
    }

    const inputs = fuelLogs.map((log) => [
      log.speedKph,
      log.voyage.cargoKg,
      log.voyage.weather === "Stormy"
        ? 1.5
        : log.voyage.weather === "Moderate"
          ? 1.2
          : 1.0,
    ]);

    const outputs = fuelLogs.map((log: any) => [log.fuelBurnRate]);

    const inputTensor = tf.tensor2d(inputs);
    const outputTensor = tf.tensor2d(outputs);

    fuelModel = tf.sequential();
    fuelModel.add(
      tf.layers.dense({ inputShape: [3], units: 8, activation: "relu" })
    );
    fuelModel.add(tf.layers.dense({ units: 1 }));

    fuelModel.compile({
      optimizer: "adam",
      loss: "meanSquaredError",
    });

    await fuelModel.fit(inputTensor, outputTensor, { epochs: 100, verbose: 0 });
    console.log(`Fuel model trained on ${fuelLogs.length} records.`);
    return fuelModel;
  } catch (error) {
    console.log("error while training fuel model", error);
    return null;
  }
}
