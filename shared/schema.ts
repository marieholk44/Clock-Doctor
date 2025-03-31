import { pgTable, text, serial, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Recording session schema
export const recordings = pgTable("recordings", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  date: timestamp("date").defaultNow().notNull(),
  duration: integer("duration").notNull(), // in seconds
  notes: text("notes"),
});

// Measurement schema (linked to recording sessions)
export const measurements = pgTable("measurements", {
  id: serial("id").primaryKey(),
  recordingId: integer("recording_id").notNull().references(() => recordings.id),
  tickToTock: integer("tick_to_tock").notNull(), // in milliseconds
  tockToTick: integer("tock_to_tick").notNull(), // in milliseconds
  fullCycle: integer("full_cycle").notNull(), // in milliseconds
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  rawData: jsonb("raw_data"), // optional raw measurement data
});

// Insert schemas
export const insertRecordingSchema = createInsertSchema(recordings).omit({ 
  id: true,
});

export const insertMeasurementSchema = createInsertSchema(measurements).omit({ 
  id: true,
});

// Types
export type Recording = typeof recordings.$inferSelect;
export type InsertRecording = z.infer<typeof insertRecordingSchema>;

export type Measurement = typeof measurements.$inferSelect;
export type InsertMeasurement = z.infer<typeof insertMeasurementSchema>;
