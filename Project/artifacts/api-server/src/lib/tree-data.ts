import type {
  AnalysisResult,
  AssistantResponse,
  ComparisonResult,
  DashboardStats,
  HealthStatusEnum,
  KnowledgeDocument,
  Observation,
  RecentObservation,
  Tree,
} from "@workspace/api-zod";

export type TreeRecord = Tree;
export type ObservationRecord = Observation;

const imageUrls = [
  "https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1473445361085-b9a07f55608b?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=85",
];

const healthStatuses: HealthStatusEnum[] = [
  "Healthy",
  "Healthy",
  "Needs Monitoring",
  "Healthy",
  "Potential Concern",
  "Healthy",
  "Inspection Recommended",
  "Healthy",
];

const baseTrees = [
  ["Neem", "Azadirachta indica", "North Quad"],
  ["Banyan", "Ficus benghalensis", "Heritage Walk"],
  ["Peepal", "Ficus religiosa", "Library Courtyard"],
  ["Gulmohar", "Delonix regia", "East Entrance"],
  ["Mango", "Mangifera indica", "Food Garden"],
  ["Ashoka", "Polyalthia longifolia", "Science Block"],
  ["Jamun", "Syzygium cumini", "Sports Field"],
  ["Arjun", "Terminalia arjuna", "Lake Edge"],
] as const;

const today = new Date("2026-09-20T09:00:00.000Z");

const daysAgo = (days: number) =>
  new Date(today.getTime() - days * 24 * 60 * 60 * 1000);

const imageFor = (index: number) => imageUrls[index % imageUrls.length];

const observationFor = (
  id: number,
  treeId: number,
  days: number,
  status: HealthStatusEnum,
  imageUrl: string,
  summary: string,
  indicators: string[],
  concerns: string[],
  recommendations: string[],
  confidence = 0.82,
): ObservationRecord => ({
  id,
  treeId,
  observedAt: daysAgo(days),
  healthStatus: status,
  aiConfidence: confidence,
  visibleIndicators: indicators,
  potentialConcerns: concerns,
  recommendations,
  imageUrl,
  summary,
});

export const trees: TreeRecord[] = baseTrees.map(
  ([commonName, species, locationName], index) => {
    const id = index + 1;
    const currentHealthStatus = healthStatuses[index];
    const createdAt = daysAgo(210 + index * 12);
    return {
      id,
      treeIdentifier: `TREE-${String(id).padStart(4, "0")}`,
      species,
      commonName,
      locationName,
      latitude: 12.9716 + (index - 3) * 0.0014,
      longitude: 77.5946 + (index - 3) * 0.0011,
      currentHealthStatus,
      createdAt,
      updatedAt: daysAgo(index === 6 ? 5 : index + 1),
      observationCount: 3,
      lastObserved: daysAgo(index === 6 ? 5 : index + 1),
      monitoringActive: true,
      currentImageUrl: imageFor(index),
    };
  },
);

export const observations: ObservationRecord[] = trees.flatMap((tree, index) => {
  const current = tree.currentHealthStatus;
  const previous =
    current === "Inspection Recommended"
      ? "Potential Concern"
      : current === "Potential Concern"
        ? "Needs Monitoring"
        : "Healthy";
  const initial = index === 2 ? "Healthy" : previous;
  return [
    observationFor(
      index * 3 + 1,
      tree.id,
      170 + index * 3,
      initial,
      imageFor(index + 2),
      "Baseline observation recorded for the monitoring profile.",
      ["Tree form and canopy were visible in the image."],
      [],
      ["Continue periodic observation on the same route."],
      0.74,
    ),
    observationFor(
      index * 3 + 2,
      tree.id,
      92 + index * 2,
      previous,
      imageFor(index + 1),
      previous === "Healthy"
        ? "Canopy appears consistent with a healthy seasonal observation."
        : "Some visible changes suggest this tree should stay on the watch list.",
      previous === "Healthy"
        ? ["Green foliage across most of the visible canopy."]
        : ["Patchy foliage and dry-looking leaf clusters are visible."],
      previous === "Healthy" ? [] : ["Possible localized canopy stress."],
      previous === "Healthy"
        ? ["Continue regular monitoring."]
        : ["Revisit with a closer image of the trunk and canopy."],
      0.79,
    ),
    observationFor(
      index * 3 + 3,
      tree.id,
      index === 6 ? 5 : index + 1,
      current,
      tree.currentImageUrl,
      current === "Healthy"
        ? "Visible indicators remain broadly consistent with a healthy tree."
        : current === "Inspection Recommended"
          ? "Visible indicators warrant a physical inspection by an appropriate person."
          : "Visible indicators suggest closer monitoring may be useful.",
      current === "Healthy"
        ? ["Healthy green foliage", "No obvious major damage visible"]
        : ["Reduced foliage density in the visible canopy", "Some dry leaf clusters"],
      current === "Healthy" ? [] : ["Possible stress visible in the canopy"],
      current === "Healthy"
        ? ["Continue regular monitoring", "Maintain adequate watering"]
        : ["Schedule a physical inspection", "Capture a closer image at the next visit"],
      0.8 + (index % 3) * 0.05,
    ),
  ];
});

let nextTreeId = trees.length + 1;
let nextObservationId = observations.length + 1;

export const knowledgeDocuments: KnowledgeDocument[] = [
  {
    id: 1,
    title: "Reading visible canopy indicators",
    excerpt:
      "Use repeated, well-lit observations to note foliage density, discoloration, and dieback without treating a single image as a diagnosis.",
    topic: "Tree monitoring",
  },
  {
    id: 2,
    title: "Urban biodiversity basics",
    excerpt:
      "A varied tree population supports shade, soil health, habitat, and resilience across a campus landscape.",
    topic: "Urban biodiversity",
  },
  {
    id: 3,
    title: "Responsible inspection workflows",
    excerpt:
      "Potential concerns from visual tools should be confirmed in person by an appropriate facilities, horticulture, or arborist team.",
    topic: "Tree care",
  },
];

export function getTree(id: number) {
  return trees.find((tree) => tree.id === id);
}

export function getObservation(id: number) {
  return observations.find((observation) => observation.id === id);
}

export function getTreeObservations(treeId: number) {
  return observations
    .filter((observation) => observation.treeId === treeId)
    .sort((a, b) => b.observedAt.getTime() - a.observedAt.getTime());
}

export function addTree(input: {
  species: string;
  commonName: string;
  locationName: string;
  latitude: number;
  longitude: number;
  imageUrl?: string;
  analysis: AnalysisResult;
}) {
  const now = new Date();
  const tree: TreeRecord = {
    id: nextTreeId++,
    treeIdentifier: `TREE-${String(nextTreeId - 1).padStart(4, "0")}`,
    species: input.species,
    commonName: input.commonName,
    locationName: input.locationName,
    latitude: input.latitude,
    longitude: input.longitude,
    currentHealthStatus: input.analysis.healthStatus,
    createdAt: now,
    updatedAt: now,
    observationCount: 1,
    lastObserved: now,
    monitoringActive: true,
    currentImageUrl: input.imageUrl || input.analysis.imageUrl,
  };
  trees.unshift(tree);
  observations.unshift({
    id: nextObservationId++,
    treeId: tree.id,
    observedAt: now,
    healthStatus: input.analysis.healthStatus,
    aiConfidence: input.analysis.healthConfidence,
    visibleIndicators: input.analysis.visibleIndicators,
    potentialConcerns: input.analysis.potentialConcerns,
    recommendations: input.analysis.recommendations,
    imageUrl: tree.currentImageUrl,
    summary: "Initial TreeID observation created from assisted analysis.",
  });
  return tree;
}

export function addObservation(
  tree: TreeRecord,
  analysis: AnalysisResult,
  imageUrl?: string,
) {
  const now = new Date();
  const observation: ObservationRecord = {
    id: nextObservationId++,
    treeId: tree.id,
    observedAt: now,
    healthStatus: analysis.healthStatus,
    aiConfidence: analysis.healthConfidence,
    visibleIndicators: analysis.visibleIndicators,
    potentialConcerns: analysis.potentialConcerns,
    recommendations: analysis.recommendations,
    imageUrl: imageUrl || analysis.imageUrl,
    summary: analysis.inspectionRequired
      ? "New observation is recommended for physical inspection."
      : "New observation added to the monitoring history.",
  };
  observations.unshift(observation);
  Object.assign(tree, {
    currentHealthStatus: analysis.healthStatus,
    currentImageUrl: observation.imageUrl,
    observationCount: tree.observationCount + 1,
    lastObserved: now,
    updatedAt: now,
  });
  return observation;
}

export function createDemoAnalysis(imageUrl = imageFor(0)): AnalysisResult {
  return {
    species: "Azadirachta indica",
    commonName: "Neem",
    confidence: 0.91,
    healthStatus: "Healthy",
    healthConfidence: 0.78,
    visibleIndicators: ["Healthy green foliage", "No obvious major damage visible"],
    potentialConcerns: [],
    recommendations: ["Continue regular monitoring", "Maintain adequate watering"],
    inspectionRequired: false,
    limitations:
      "Assessment is based only on visible features in the uploaded image.",
    imageUrl,
    analyzedAt: new Date(),
    mode: process.env.AI_API_KEY ? "provider" : "demo",
  };
}

export function makeDashboardStats(): DashboardStats {
  const count = (status: HealthStatusEnum) =>
    trees.filter((tree) => tree.currentHealthStatus === status).length;
  const speciesMap = new Map<string, number>();
  trees.forEach((tree) =>
    speciesMap.set(tree.commonName, (speciesMap.get(tree.commonName) ?? 0) + 1),
  );
  const monthMap = new Map<string, number>();
  observations.forEach((observation) => {
    const label = observation.observedAt.toLocaleString("en-US", {
      month: "short",
    });
    monthMap.set(label, (monthMap.get(label) ?? 0) + 1);
  });
  const recentObservations: RecentObservation[] = observations
    .slice(0, 7)
    .map((observation) => {
      const tree = getTree(observation.treeId)!;
      return {
        treeId: tree.id,
        treeIdentifier: tree.treeIdentifier,
        species: tree.commonName,
        locationName: tree.locationName,
        healthStatus: observation.healthStatus,
        observedAt: observation.observedAt,
      };
    });
  return {
    totalTrees: trees.length,
    healthy: count("Healthy"),
    needsMonitoring: count("Needs Monitoring"),
    potentialConcern: count("Potential Concern"),
    inspectionRecommended: count("Inspection Recommended"),
    speciesBreakdown: [...speciesMap.entries()].map(([label, value]) => ({
      label,
      value,
    })),
    observationsOverTime: [...monthMap.entries()].map(([label, value]) => ({
      label,
      value,
    })),
    recentObservations,
  };
}

export function compareObservations(
  previousObservationId: number,
  currentObservationId: number,
): ComparisonResult | undefined {
  const previous = getObservation(previousObservationId);
  const current = getObservation(currentObservationId);
  if (!previous || !current) return undefined;
  const concernChange =
    current.healthStatus === previous.healthStatus
      ? "No change in monitoring category is recorded."
      : `Monitoring category changed from ${previous.healthStatus} to ${current.healthStatus}.`;
  const visibleChanges =
    current.healthStatus === previous.healthStatus
      ? ["The two records use the same monitoring category."]
      : [concernChange, "Foliage density should be reviewed in person over time."];
  const recommendedAction =
    current.healthStatus === "Inspection Recommended"
      ? "Arrange a physical inspection by an appropriate person."
      : "Continue regular monitoring and capture the next observation under similar conditions.";
  return {
    previous,
    current,
    visibleChanges,
    assessment:
      "This comparison describes visible differences between uploaded images; it does not prove biological deterioration.",
    recommendedAction,
    limitation:
      "Image comparison is sensitive to season, lighting, framing, and occlusion.",
  };
}

export function answerAssistant(question: string): AssistantResponse {
  const normalized = question.toLowerCase();
  let relatedTrees = trees;
  let answer =
    "I can help with inspection priorities, species on campus, status changes, and observation gaps. Try asking about one of those monitoring questions.";

  if (normalized.includes("inspection") || normalized.includes("concern")) {
    relatedTrees = trees.filter(
      (tree) =>
        tree.currentHealthStatus === "Inspection Recommended" ||
        tree.currentHealthStatus === "Potential Concern",
    );
    answer =
      relatedTrees.length > 0
        ? `${relatedTrees.length} trees are currently flagged for closer attention: ${relatedTrees.map((tree) => `${tree.treeIdentifier} (${tree.commonName})`).join(", ")}.`
        : "No trees are currently flagged for inspection.";
  } else if (normalized.includes("species")) {
    relatedTrees = trees;
    answer = `TreeID has records for ${new Set(trees.map((tree) => tree.commonName)).size} species across ${trees.length} registered trees: ${trees.map((tree) => tree.commonName).join(", ")}.`;
  } else if (
    normalized.includes("changed") ||
    normalized.includes("status change")
  ) {
    relatedTrees = trees.filter((tree) => {
      const history = getTreeObservations(tree.id);
      return history.length > 1 && history[0].healthStatus !== history[1].healthStatus;
    });
    answer = `${relatedTrees.length} trees have a different monitoring category than their previous observation. Review the observation timeline before taking action.`;
  } else if (normalized.includes("3 months") || normalized.includes("three months")) {
    relatedTrees = trees.filter(
      (tree) => today.getTime() - tree.lastObserved.getTime() > 90 * 86400000,
    );
    answer = `${relatedTrees.length} trees have not been observed in more than three months.`;
  } else if (normalized.includes("tree-")) {
    const match = normalized.match(/tree-(\d+)/);
    const tree = match
      ? trees.find((item) => item.treeIdentifier.toLowerCase() === `tree-${match[1].padStart(4, "0")}`)
      : undefined;
    relatedTrees = tree ? [tree] : [];
    answer = tree
      ? `${tree.treeIdentifier} is ${tree.currentHealthStatus.toLowerCase()} with ${tree.observationCount} observations. ${tree.currentHealthStatus === "Healthy" ? "Continue regular monitoring." : "A closer review is recommended."}`
      : "I couldn't find that TreeID record.";
  }

  return {
    answer,
    context: `Based on ${trees.length} registered trees and ${observations.length} observations in the current TreeID workspace.`,
    relatedTrees,
  };
}