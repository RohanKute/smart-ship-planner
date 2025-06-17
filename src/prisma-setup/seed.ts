import fs from "fs";
import path from "path";
import prisma from "./config.prisma";

function getRandomNumber(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

async function generateFuelLogsForVoyage(
  voyageId: string,
  departureTime: Date,
  cargoKg: number
) {
  let currentTimestamp = new Date(departureTime);
  const logCount = 150;

  for (let i = 0; i < logCount; i++) {
    const speed = getRandomNumber(35, 45);
    const fuelBurn = 150 + speed * 8 + cargoKg / 1500;

    await prisma.fuelLog.create({
      data: {
        timestamp: currentTimestamp,
        fuelBurnRate: parseFloat(fuelBurn.toFixed(2)),
        speedKph: parseFloat(speed.toFixed(2)),
        voyageId: voyageId,
      },
    });

    currentTimestamp = new Date(
      currentTimestamp.getTime() + 2 * 60 * 60 * 1000
    );
  }
}

export async function seedDB() {
  console.log("--- Starting database seeding from JSON file ---");

  console.log("Deleting old data...");
  await prisma.fuelLog.deleteMany();
  await prisma.voyage.deleteMany();
  await prisma.maintenance.deleteMany();
  await prisma.ship.deleteMany();

  const seedDataPath = path.join(__dirname, "../../data/seed-data.json");
  const seedData = JSON.parse(fs.readFileSync(seedDataPath, "utf-8"));

  console.log("Creating ships and maintenance records...");
  const createdShips = [];
  for (const shipData of seedData.ships) {
    const ship = await prisma.ship.create({ data: shipData });
    createdShips.push(ship);

    await prisma.maintenance.create({
      data: {
        shipId: ship.id,
        lastServiceDate: new Date(
          new Date().setMonth(new Date().getMonth() - 6)
        ), // 6 months ago
        totalEngineHours: getRandomNumber(500, 2500),
        predictedNextService: new Date(),
      },
    });
  }

  console.log(`Creating ${seedData.voyages.length} voyages...`);
  for (const voyageData of seedData.voyages) {
    const departure = new Date(voyageData.departureTime);
    // Rough ETA calculation for the plan
    const plannedEta = new Date(
      departure.getTime() + getRandomNumber(8, 25) * 24 * 60 * 60 * 1000
    );

    const voyage = await prisma.voyage.create({
      data: {
        shipId: createdShips[voyageData.shipRef].id,
        origin: voyageData.origin,
        destination: voyageData.destination,
        departureTime: departure,
        cargoKg: voyageData.cargoKg,
        weather: voyageData.weather,
        plan: {
          eta: plannedEta,
          fuelKg: voyageData.plan.fuelKg,
          route: [voyageData.origin, "Midpoint", voyageData.destination],
          speedScheduleKph: voyageData.plan.speedScheduleKph,
        },
        ...(voyageData.actuals && {
          actuals: {
            eta: new Date(
              plannedEta.getTime() + getRandomNumber(-12, 24) * 60 * 60 * 1000
            ),
            fuelKg: voyageData.actuals.fuelKg,
            notes: voyageData.actuals.notes,
          },
        }),
      },
    });

    // If the voyage was completed (has actuals), generate fuel logs for it
    if (voyage.actuals) {
      await generateFuelLogsForVoyage(
        voyage.id,
        voyage.departureTime,
        voyage.cargoKg
      );
    }
  }

  console.log("--- ✅ Seeding finished successfully! ---");
}
