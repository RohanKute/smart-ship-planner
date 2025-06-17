import tf from "@tensorflow/tfjs";
import prisma from "../../prisma-setup/config.prisma";

export default async function trainMaintenanceModel(): Promise<tf.Sequential | null> {
  try {
    console.log("Training maintenance prediction model from database...");
    let maintenanceModel: tf.Sequential | null;

    const maintRecords = await prisma.maintenance.findMany();

    if (maintRecords.length === 0) {
      console.warn("No maintenance records found to train model. Skipping.");
      return null;
    }

    const ENGINE_LIFESPAN_HOURS = 5000;

    const inputs = maintRecords.map((rec: any) => [rec.totalEngineHours]);
    const outputs = maintRecords.map((rec: any) => [
      ENGINE_LIFESPAN_HOURS - rec.totalEngineHours,
    ]);

    const inputTensor = tf.tensor2d(inputs);
    const outputTensor = tf.tensor2d(outputs);

    maintenanceModel = tf.sequential();
    maintenanceModel.add(
      tf.layers.dense({ inputShape: [1], units: 8, activation: "relu" })
    );
    maintenanceModel.add(tf.layers.dense({ units: 1 }));

    maintenanceModel.compile({
      optimizer: "adam",
      loss: "meanSquaredError",
    });

    await maintenanceModel.fit(inputTensor, outputTensor, {
      epochs: 100,
      verbose: 0,
    });
    console.log(`Maintenance model trained on ${maintRecords.length} records.`);
    return maintenanceModel;
  } catch (error) {
    console.log("error while training maintenenceModel", error);
    return null;
  }
}
