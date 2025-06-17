import { seedDB } from "./prisma-setup/seed";
import { aiEngine } from "./scripts/aiModel";
import app from "./server/server";

async function bootstrap() {
  try {
    const models = aiEngine;
    await seedDB();
    await models.initialize();
    app.listen(3000, () => {
      console.log("Backend running on port 3000");
    });
  } catch (err) {
    console.error("Initialization error:", err);
    process.exit(1);
  }
}
//to check workflow 
bootstrap();
