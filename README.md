# Smart Ship Planning & Optimization System

This project is the backend for the "Planning Brain" of a smart ship. It's a Node.js service designed to optimize voyage planning, fuel usage, and maintenance schedules for commercial vessels using a set of predictive AI models.

Instead of relying on static calculations, this system uses historical data to make intelligent, dynamic recommendations, and it's designed to get smarter over time.

## ✨ Key Features

* **AI-Powered Voyage Planning:** Generates optimized route plans based on destination, weather, and cargo load.
* **Intelligent Fuel Prediction:** Estimates fuel needs using a regression model trained on past journeys.
* **Proactive Maintenance Alerts:** Predicts potential maintenance needs based on engine usage analytics.
* **Continuous Learning Loop:** Uses feedback from actual voyages to improve the accuracy of future predictions.
* **Fully Containerized:** Runs on Docker for easy setup and consistent environments.

## 🛠️ Tech Stack

* **Backend:** Node.js, Express.js
* **Database:** MongoDB
* **ORM:** Prisma
* **AI / Machine Learning:** TensorFlow.js
* **Containerization:** Docker, Docker Compose
* **Language:** TypeScript
---

## 🚀 Getting Started

You can get the entire application and its database running in minutes with Docker.

### Setup Instructions (Docker - Recommended)

This is the easiest and recommended way to run the project.

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/RohanKute/smart-ship-planner.git](https://github.com/RohanKute/smart-ship-planner.git)
    cd smart-ship-planner
    ```

2.  **Create your environment file:**
    Copy the example template to create your own local environment file.
    ```bash
    cp .env.example .env
    ```
    Now, open the `.env` file and set the `DATABASE_URL` for the **local Docker database**:
    ```ini
    # .env
    DATABASE_URL="mongodb://root:example@mongo:27017/smart-ship?authSource=admin"
    ```

3.  **Run with Docker Compose:**
    This single command builds the application image, starts the app and database containers, and automatically seeds the database on startup.
    ```bash
    docker-compose up --build
    ```

Your API is now running and available at `http://localhost:3000`.

---

## 📚 API Documentation

Use these endpoints to interact with the Planning Brain.

### 1. Plan a New Voyage

Creates a new voyage plan using AI predictions.

* **Endpoint:** `POST /api/plan-voyage`
* **Body (JSON):**
    ```json
    {
      "origin": "Port of Antwerp",
      "destination": "Port of Halifax",
      "departureTime": "2025-09-15T12:00:00Z",
      "weather": "Moderate",
      "cargoKg": 165000,
      "shipId": "YOUR_SHIP_ID_FROM_DB"
    }
    ```

### 2. Get Voyage History

Lists all past and present voyages with their planned vs. actual metrics. Use this to find a `voyageId` or `shipId` for other requests.

* **Endpoint:** `GET /api/plan-history`

### 3. Submit Voyage Feedback

Submits the actual results of a completed voyage. This is how the system learns.

* **Endpoint:** `POST /api/feedback`
* **Body (JSON):**
    ```json
    {
      "voyageId": "YOUR_VOYAGE_ID_FROM_DB",
      "actualFuelUsed": 99500,
      "actualTimeTaken": "2025-08-10T04:30:00Z",
      "notes": "Faster than expected due to favorable currents."
    }
    ```

### 4. Get Maintenance Alerts

Suggests proactive maintenance for ships that the AI has flagged as needing attention.

* **Endpoint:** `GET /api/maintenance-alerts`

---

## 🧠 The Planning Brain: AI & Intelligence

This system's intelligence comes from a set of simple, integrated models that work together.

### The AI Models

1.  **Route Optimizer:** This isn't just about the shortest distance. It's a logic-based model that calculates the most *efficient* route by applying penalties for factors like stormy weather and heavy cargo loads, which could increase time and fuel consumption.

2.  **Fuel Predictor:** We use a simple regression model built with TensorFlow.js. It's trained on the seeded `FuelLogs` data to find the relationship between speed, cargo, and weather conditions to predict the fuel burn rate for a given leg of a journey.

3.  **Maintenance Forecaster:** This is a hybrid model. It uses hard rules (e.g., flagging a ship if it exceeds a maximum number of hours since its last service) combined with a simple predictive model that estimates the "Remaining Useful Life" (RUL) of engine components based on total usage hours.

### How It Supports Planning Intelligence

This system provides "planning intelligence" by moving beyond simple, static calculations and embracing a data-driven, predictive approach.

The key is the **learning loop**. Every time a real voyage is completed and feedback is submitted via the `/api/feedback` endpoint, that new, real-world data point is used to enrich our historical dataset. The next time the AI models are trained, they learn from this new information, making their future predictions progressively more accurate. This allows the system to adapt to changing conditions and the specific performance characteristics of each ship in the fleet, turning historical data into actionable, forward-looking intelligence.
