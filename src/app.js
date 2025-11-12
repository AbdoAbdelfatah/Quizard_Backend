import express from "express";
import { globalResponse } from "./middlewares/globalErrorHandler.middleware.js";
const app = express();

app.use(express.json());

// Define your routes here

// global error handler
app.use(globalResponse);

export default app;
