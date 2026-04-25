import "dotenv/config";
import app from "./app";
import { logger } from "./lib/logger";
import { initSchedulers } from "./lib/scheduler";


const rawPort = process.env["PORT"] || "5000";
const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

initSchedulers();

app.listen(port, "0.0.0.0", () => {
  logger.info({ port }, "Server listening");
  logger.info("Schedulers active");
}).on('error', (err) => {
  logger.error({ err }, "Error listening on port");
  process.exit(1);
});
