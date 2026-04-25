import { Router, type IRouter } from "express";
import healthRouter from "./health";
import subscribersRouter from "./subscribers";
import analyticsRouter from "./analytics";
import leadsRouter from "./leads";
import paymentsRouter from "./payments";
import engineRouter from "./engine";
import briefsRouter from "./briefs";
import vaultsRouter from "./vaults";

const router: IRouter = Router();

router.use(healthRouter);
router.use(subscribersRouter);
router.use(analyticsRouter);
router.use(leadsRouter);
router.use(paymentsRouter);
router.use(engineRouter);
router.use("/api/briefs", briefsRouter);
router.use("/api/vaults", vaultsRouter);

export default router;
