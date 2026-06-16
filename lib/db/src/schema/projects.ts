import { pgTable, text, serial, integer, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const projectTypeEnum = pgEnum("project_type", [
  "landing_page",
  "ecommerce",
  "blog",
  "portfolio",
  "dashboard",
  "saas",
  "web_app",
]);

export const projectStatusEnum = pgEnum("project_status", [
  "draft",
  "generating",
  "ready",
  "published",
  "error",
]);

export const projectsTable = pgTable("projects", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  type: projectTypeEnum("type").notNull(),
  status: projectStatusEnum("status").notNull().default("draft"),
  prompt: text("prompt").notNull(),
  generatedCode: text("generated_code"),
  previewUrl: text("preview_url"),
  thumbnail: text("thumbnail"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertProjectSchema = createInsertSchema(projectsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projectsTable.$inferSelect;
