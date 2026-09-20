import { Router, type IRouter } from "express";
import { makeDashboardStats } from "../lib/tree-data";

const router: IRouter = Router();

router.get("/dashboard/stats", (_req, res): void => {
  res.json(makeDashboardStats());
});

export default router;