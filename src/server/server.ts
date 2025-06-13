
import express, { Request, Response, NextFunction } from "express";

const app = express();

app.get('/', (req : Request, res : Response)=>{
        res.send('Hey! Server is live!')
})

export default app;