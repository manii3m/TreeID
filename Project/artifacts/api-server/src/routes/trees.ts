import { Router, type IRouter } from "express";
import {
  AnalyzeTreeBody,
  AskAssistantBody,
  CompareObservationsBody,
  CreateObservationBody,
  CreateObservationParams,
  CreateTreeBody,
  DeleteTreeParams,
  GetTreeParams,
  ListObservationsParams,
  ListTreesQueryParams,
  UpdateTreeBody,
  UpdateTreeParams,
} from "@workspace/api-zod";
import {
  addObservation,
  addTree,
  compareObservations,
  createDemoAnalysis,
  getObservation,
  getTree,
  getTreeObservations,
  observations,
  trees,
} from "../lib/tree-data";
import { analyzeWithGemini } from "../lib/gemini";

const router: IRouter = Router();

router.get("/trees", (req, res): void => {
  const parsed = ListTreesQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid tree filters." });
    return;
  }
  const { search, healthStatus, species, sort = "recent" } = parsed.data;
  let result = trees.filter((tree) => {
    const query = search?.toLowerCase().trim();
    const matchesSearch =
      !query ||
      [tree.treeIdentifier, tree.species, tree.commonName, tree.locationName]
        .join(" ")
        .toLowerCase()
        .includes(query);
    const matchesHealth =
      !healthStatus || tree.currentHealthStatus === healthStatus;
    const matchesSpecies = !species || tree.species === species;
    return matchesSearch && matchesHealth && matchesSpecies;
  });
  result = [...result].sort((a, b) => {
    if (sort === "oldest") return a.lastObserved.getTime() - b.lastObserved.getTime();
    if (sort === "species") return a.commonName.localeCompare(b.commonName);
    if (sort === "concern") {
      const priority = {
        "Inspection Recommended": 4,
        "Potential Concern": 3,
        "Needs Monitoring": 2,
        Healthy: 1,
      };
      return priority[b.currentHealthStatus] - priority[a.currentHealthStatus];
    }
    return b.lastObserved.getTime() - a.lastObserved.getTime();
  });
  res.json(result);
});

router.post("/trees/analyze", async (req, res): Promise<void> => {
  const parsed = AnalyzeTreeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Upload a supported JPG, PNG, or WebP image." });
    return;
  }
  const imageUrl = parsed.data.imageData.startsWith("data:image/")
    ? parsed.data.imageData
    : undefined;
  try {
    const providerResult = await analyzeWithGemini(
      parsed.data.imageData,
      parsed.data.mimeType,
      imageUrl ?? "",
    );
    res.json(providerResult ?? createDemoAnalysis(imageUrl));
  } catch (error) {
    req.log.warn({ err: error }, "Gemini analysis unavailable; using demo mode");
    res.json(createDemoAnalysis(imageUrl));
  }
});

router.post("/trees", (req, res): void => {
  const parsed = CreateTreeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Tree profile details are incomplete." });
    return;
  }
  res.status(201).json(addTree(parsed.data));
});

router.post("/trees/compare", (req, res): void => {
  const parsed = CompareObservationsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Choose two observations to compare." });
    return;
  }
  const comparison = compareObservations(
    parsed.data.previousObservationId,
    parsed.data.currentObservationId,
  );
  if (!comparison) {
    res.status(404).json({ error: "One or both observations were not found." });
    return;
  }
  res.json(comparison);
});

router.get("/trees/:id", (req, res): void => {
  const parsed = GetTreeParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid tree identifier." });
    return;
  }
  const tree = getTree(parsed.data.id);
  if (!tree) {
    res.status(404).json({ error: "Tree not found." });
    return;
  }
  res.json(tree);
});

router.patch("/trees/:id", (req, res): void => {
  const params = UpdateTreeParams.safeParse(req.params);
  const body = UpdateTreeBody.safeParse(req.body);
  if (!params.success || !body.success) {
    res.status(400).json({ error: "Invalid tree update." });
    return;
  }
  const tree = getTree(params.data.id);
  if (!tree) {
    res.status(404).json({ error: "Tree not found." });
    return;
  }
  Object.assign(tree, body.data, { updatedAt: new Date() });
  res.json(tree);
});

router.delete("/trees/:id", (req, res): void => {
  const parsed = DeleteTreeParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid tree identifier." });
    return;
  }
  const index = trees.findIndex((tree) => tree.id === parsed.data.id);
  if (index < 0) {
    res.status(404).json({ error: "Tree not found." });
    return;
  }
  trees.splice(index, 1);
  for (let observationIndex = observations.length - 1; observationIndex >= 0; observationIndex -= 1) {
    if (observations[observationIndex].treeId === parsed.data.id) {
      observations.splice(observationIndex, 1);
    }
  }
  res.sendStatus(204);
});

router.get("/trees/:id/observations", (req, res): void => {
  const parsed = ListObservationsParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid tree identifier." });
    return;
  }
  if (!getTree(parsed.data.id)) {
    res.status(404).json({ error: "Tree not found." });
    return;
  }
  res.json(getTreeObservations(parsed.data.id));
});

router.post("/trees/:id/observations", (req, res): void => {
  const params = CreateObservationParams.safeParse(req.params);
  const body = CreateObservationBody.safeParse(req.body);
  if (!params.success || !body.success) {
    res.status(400).json({ error: "Observation details are incomplete." });
    return;
  }
  const tree = getTree(params.data.id);
  if (!tree) {
    res.status(404).json({ error: "Tree not found." });
    return;
  }
  res.status(201).json(addObservation(tree, body.data.analysis, body.data.imageUrl));
});

export default router;