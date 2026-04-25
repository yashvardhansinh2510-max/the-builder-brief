import { Router, type IRouter } from "express";
import healthRouter from "./health";
import subscribersRouter from "./subscribers";
import analyticsRouter from "./analytics";
import leadsRouter from "./leads";
import paymentsRouter from "./payments";
import engineRouter from "./engine";
import briefsRouter from "./briefs";

const router: IRouter = Router();

router.use(healthRouter);
router.use(subscribersRouter);
router.use(analyticsRouter);
router.use(leadsRouter);
router.use(paymentsRouter);
router.use(engineRouter);
router.use("/api/briefs", briefsRouter);

export default router;
