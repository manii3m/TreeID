import { Router, type IRouter } from "express";
import { AskAssistantBody } from "@workspace/api-zod";
import { answerAssistant } from "../lib/tree-data";

const router: IRouter = Router();

router.post("/assistant", (req, res): void => {
  const parsed = AskAssistantBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Ask a TreeID monitoring question." });
    return;
  }
  res.json(answerAssistant(parsed.data.question));
});

export default router;