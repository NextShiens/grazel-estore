import { appDataSource } from "./config/db";
import app from "./app";
import express from "express";
import path from "path";
import "./cron/schedule";

const port = 8000;

// Serve static files from the 'bucket' directory
app.use("/bucket", express.static(path.join(__dirname, "bucket")));

app.use("/", (req: any, res: any) => {
  res.send({ message: "Hi Node!" });
});

appDataSource
  .initialize()
  .then(() => {
    console.log("Data Source has been initialized!");
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("Error during Data Source initialization", error);
  });
