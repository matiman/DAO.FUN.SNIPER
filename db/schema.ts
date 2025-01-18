import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").unique().notNull(),
  password: text("password").notNull(),
});

export const webhookLogs = pgTable("webhook_logs", {
  id: serial("id").primaryKey(),
  method: text("method").notNull(),
  headers: jsonb("headers").notNull(),
  body: jsonb("body").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  webhookId: text("webhook_id").notNull(),
});

export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export type InsertUser = typeof users.$inferInsert;
export type SelectUser = typeof users.$inferSelect;

export const insertWebhookLogSchema = createInsertSchema(webhookLogs);
export const selectWebhookLogSchema = createSelectSchema(webhookLogs);
export type InsertWebhookLog = typeof webhookLogs.$inferInsert;
export type SelectWebhookLog = typeof webhookLogs.$inferSelect;