import { Router, type IRouter } from "express";
import { knowledgeDocuments } from "../lib/tree-data";

const router: IRouter = Router();

router.get("/knowledge", (_req, res): void => {
  res.json(knowledgeDocuments);
});

export default router;