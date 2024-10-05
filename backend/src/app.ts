import express from "express";
import "reflect-metadata";
import "./middleware/passport";
import routes from "./routes/index";
// import session from "express-session";
// import passport from "passport";
import { errorHandler } from "./middleware/errorMiddleware";
import { OAuth2Client } from "google-auth-library";
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const cookieSession = require("cookie-session");

// Middleware to enable CORS for all origins
app.use(cors());

// Middleware to parse raw JSON bodies
app.use(bodyParser.text({ type: "/" }));

// Middleware to parse URL-encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));

// Configure session middleware
app.use(
  cookieSession({
    maxAge: 24 * 60 * 60 * 1000, // 1 day
    keys: ["your-secret-key"],
  })
);

// Register routes
app.use("/api", routes);

// Error handling middleware
app.use(errorHandler);

export default app;
