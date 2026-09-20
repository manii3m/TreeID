import type { AnalysisResult } from "@workspace/api-zod";
import { AnalyzeTreeResponse } from "@workspace/api-zod";

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
};

function extractJson(text: string) {
  const cleaned = text
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start < 0 || end <= start) return undefined;
  try {
    return JSON.parse(cleaned.slice(start, end + 1)) as unknown;
  } catch {
    return undefined;
  }
}

export async function analyzeWithGemini(
  imageData: string,
  mimeType: "image/jpeg" | "image/png" | "image/webp",
  imageUrl: string,
): Promise<AnalysisResult | undefined> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return undefined;

  const commaIndex = imageData.indexOf(",");
  const base64Data =
    commaIndex >= 0 ? imageData.slice(commaIndex + 1) : imageData;

  const prompt = `You are TreeID, an environmental monitoring assistant.
Analyze the tree image as an assisted visual assessment, not a definitive diagnosis.
Return JSON only with exactly these fields:
{
  "species": "scientific name",
  "commonName": "common name",
  "confidence": 0.0,
  "healthStatus": "Healthy | Needs Monitoring | Potential Concern | Inspection Recommended",
  "healthConfidence": 0.0,
  "visibleIndicators": ["what is visibly present"],
  "potentialConcerns": ["possible visible concern, never a confirmed disease"],
  "recommendations": ["practical next action"],
  "inspectionRequired": false,
  "limitations": "state that this is based only on visible features in one image",
  "imageUrl": "",
  "analyzedAt": "",
  "mode": "provider"
}
Use cautious language such as possible concern and visible indicator. If the image is not clearly a tree, identify the most likely visible subject but lower confidence and set inspectionRequired to false.`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(30_000),
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              { text: prompt },
              { inline_data: { mime_type: mimeType, data: base64Data } },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`Gemini analysis failed with status ${response.status}`);
  }

  const payload = (await response.json()) as GeminiResponse;
  const text = payload.candidates?.[0]?.content?.parts
    ?.map((part) => part.text ?? "")
    .join("")
    .trim();
  if (!text) throw new Error("Gemini returned an empty analysis.");

  const candidate = extractJson(text);
  if (candidate && typeof candidate === "object") {
    Object.assign(candidate, {
      imageUrl,
      analyzedAt: new Date().toISOString(),
      mode: "provider",
    });
  }
  const parsed = AnalyzeTreeResponse.safeParse(candidate);
  if (!parsed.success) throw new Error("Gemini returned an invalid analysis.");
  return parsed.data;
}