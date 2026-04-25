import { Router, type IRouter } from "express";
import healthRouter from "./health";
import subscribersRouter from "./subscribers";
import analyticsRouter from "./analytics";
import confirmRouter from "./confirm";
import cronRouter from "./cron";
import earningsRouter from "./earnings";
import marketplaceRouter from "./marketplace-creator";

const router: IRouter = Router();

router.use(healthRouter);
router.use(subscribersRouter);
router.use(analyticsRouter);
router.use(confirmRouter);
router.use(cronRouter);
router.use(earningsRouter);
router.use(marketplaceRouter);

export default router;
