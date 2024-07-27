import { DataSource } from "typeorm";
import dotenv from "dotenv";

dotenv.config();

const entitiesPathBuild = ["dist/entities/*.js"];
const EntitiesPathDev = ["src/entities/*.ts"];

const entitiesPath =
  process.env.NODE_ENV === "development" ? EntitiesPathDev : entitiesPathBuild;

const migrationsPath =
  process.env.NODE_ENV === "development"
    ? ["src/migrations/*{.js,.ts}"]
    : ["dist/migrations/*{.js,.ts}"];

const dbSyncStatus = process.env.NODE_ENV === "development" ? true : false;

export const appDataSource = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "3306"),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: entitiesPath,
  migrations: migrationsPath,
  synchronize: dbSyncStatus,
  logging: true,
});

appDataSource
  .initialize()
  .then(() => {
    console.log("Data Source has been initialized!");
  })
  .catch((err) => {
    console.error("Error during Data Source initialization:", err);
  });
