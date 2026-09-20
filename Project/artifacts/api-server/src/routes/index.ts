import { Router, type IRouter } from "express";
import healthRouter from "./health";
import treesRouter from "./trees";
import dashboardRouter from "./dashboard";
import assistantRouter from "./assistant";
import knowledgeRouter from "./knowledge";

const router: IRouter = Router();

router.use(healthRouter);
router.use(treesRouter);
router.use(dashboardRouter);
router.use(assistantRouter);
router.use(knowledgeRouter);

export default router;
