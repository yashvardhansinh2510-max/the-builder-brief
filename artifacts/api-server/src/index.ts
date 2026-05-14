import "dotenv/config";
import app from "./app";
import { logger } from "./lib/logger";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

// Validate critical secrets
const cronSecret = process.env["CRON_SECRET"];
if (!cronSecret || cronSecret === "changeme") {
  if (process.env["NODE_ENV"] === "production") {
    throw new Error("CRON_SECRET must be set to a strong secret in production.");
  } else {
    logger.warn("CRON_SECRET is not set or uses the insecure default 'changeme'. Set it before deploying.");
  }
}

const adminToken = process.env["ADMIN_TOKEN"];
if (!adminToken) {
  if (process.env["NODE_ENV"] === "production") {
    throw new Error("ADMIN_TOKEN must be set in production.");
  } else {
    logger.warn("ADMIN_TOKEN is not set. Admin routes will be inaccessible.");
  }
}

const clerkSecretKey = process.env["CLERK_SECRET_KEY"];
if (!clerkSecretKey) {
  if (process.env["NODE_ENV"] === "production") {
    throw new Error("CLERK_SECRET_KEY must be set in production.");
  } else {
    logger.warn("CLERK_SECRET_KEY is not set. Authentication will fail.");
  }
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
});
