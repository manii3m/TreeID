import { createInsertSchema } from "drizzle-zod";
import {
  boolean,
  integer,
  jsonb,
  numeric,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  displayName: text("display_name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const treesTable = pgTable("trees", {
  id: serial("id").primaryKey(),
  treeIdentifier: text("tree_identifier").notNull().unique(),
  species: text("species").notNull(),
  commonName: text("common_name").notNull(),
  latitude: numeric("latitude", { precision: 9, scale: 6 }).notNull(),
  longitude: numeric("longitude", { precision: 9, scale: 6 }).notNull(),
  locationName: text("location_name").notNull(),
  currentHealthStatus: text("current_health_status").notNull(),
  monitoringActive: boolean("monitoring_active").default(true).notNull(),
  currentImageUrl: text("current_image_url").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const observationsTable = pgTable("observations", {
  id: serial("id").primaryKey(),
  treeId: integer("tree_id")
    .references(() => treesTable.id, { onDelete: "cascade" })
    .notNull(),
  imageUrl: text("image_url").notNull(),
  observedAt: timestamp("observed_at").defaultNow().notNull(),
  healthStatus: text("health_status").notNull(),
  aiConfidence: numeric("ai_confidence", { precision: 4, scale: 3 }).notNull(),
  visibleIndicators: jsonb("visible_indicators").$type<string[]>().notNull(),
  potentialConcerns: jsonb("potential_concerns").$type<string[]>().notNull(),
  recommendations: jsonb("recommendations").$type<string[]>().notNull(),
  aiRawResponse: jsonb("ai_raw_response"),
});

export const knowledgeDocumentsTable = pgTable("knowledge_documents", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  topic: text("topic").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(usersTable);
export const insertTreeSchema = createInsertSchema(treesTable);
export const insertObservationSchema = createInsertSchema(observationsTable);
export const insertKnowledgeDocumentSchema =
  createInsertSchema(knowledgeDocumentsTable);