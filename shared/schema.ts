import { pgTable, text, serial, integer, decimal, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const properties = pgTable("properties", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'office', 'residential', 'restaurant'
  lat: decimal("lat", { precision: 10, scale: 8 }).notNull(),
  lng: decimal("lng", { precision: 11, scale: 8 }).notNull(),
  area: integer("area").notNull(), // in square meters
  pricePerSqm: integer("price_per_sqm").notNull(), // in THB
  description: text("description").notNull(),
  address: text("address").notNull(),
  nearestBts: text("nearest_bts"),
  btsDistance: integer("bts_distance"), // in meters
  yearBuilt: integer("year_built"),
  floors: integer("floors"),
});

export const aiQueries = pgTable("ai_queries", {
  id: serial("id").primaryKey(),
  query: text("query").notNull(),
  response: text("response").notNull(),
  propertyIds: text("property_ids"), // JSON array of property IDs
});

export const insertPropertySchema = createInsertSchema(properties).omit({
  id: true,
});

export const insertAIQuerySchema = createInsertSchema(aiQueries).omit({
  id: true,
});

export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type Property = typeof properties.$inferSelect;
export type InsertAIQuery = z.infer<typeof insertAIQuerySchema>;
export type AIQuery = typeof aiQueries.$inferSelect;

// Filter schemas
export const propertyFilterSchema = z.object({
  types: z.array(z.enum(["office", "residential", "restaurant"])).optional(),
  priceMin: z.number().optional(),
  priceMax: z.number().optional(),
  areaMin: z.number().optional(),
  areaMax: z.number().optional(),
  nearBts: z.array(z.string()).optional(),
});

export type PropertyFilter = z.infer<typeof propertyFilterSchema>;

// AI search schema
export const aiSearchSchema = z.object({
  query: z.string().min(1),
});

export type AISearchRequest = z.infer<typeof aiSearchSchema>;
