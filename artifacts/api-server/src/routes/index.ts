import { Router, type IRouter } from "express";
import healthRouter from "./health";
import subscribersRouter from "./subscribers";
import analyticsRouter from "./analytics";
import confirmRouter from "./confirm";
import cronRouter from "./cron";
import earningsRouter from "./earnings";
import marketplaceRouter from "./marketplace-creator";
import creatorRouter from "./creator";
import teamSeatsRouter from "./team-seats";

const router: IRouter = Router();

router.use(healthRouter);
router.use(subscribersRouter);
router.use(analyticsRouter);
router.use(confirmRouter);
router.use(cronRouter);
router.use(earningsRouter);
router.use(marketplaceRouter);
router.use(creatorRouter);
router.use(teamSeatsRouter);

export default router;
