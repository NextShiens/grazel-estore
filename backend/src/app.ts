import express from "express";
import "reflect-metadata";
import routes from "./routes/index";
import { errorHandler } from "./middleware/errorMiddleware";
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();

// Middleware to enable CORS for all origins
app.use(cors());

// Middleware to parse raw JSON bodies
app.use(bodyParser.text({ type: "/" }));

// Middleware to parse URL-encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));

// Register routes
app.use("/api", routes);

// Error handling middleware
app.use(errorHandler);

export default app;
