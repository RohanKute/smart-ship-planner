import express, { Request, Response, NextFunction } from "express";
import shipRouter from "../routes/shipRoutes";

const app = express();
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Hey! Server is live!");
});

app.use("/api", shipRouter);

export default app;
