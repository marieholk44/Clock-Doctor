import { z } from "zod";

// Recording schema
export const recordingSchema = z.object({
  id: z.number(),
  name: z.string(),
  date: z.string().or(z.date()),
  duration: z.number(), // in seconds
  notes: z.string().optional(),
});

// Measurement schema
export const measurementSchema = z.object({
  id: z.number(),
  recordingId: z.number(),
  tickToTock: z.number(), // in milliseconds
  tockToTick: z.number(), // in milliseconds
  fullCycle: z.number(),  // in milliseconds
  timestamp: z.string().or(z.date()),
  rawData: z.record(z.any()).optional(),
});

// Insert schemas (without ID for creation)
export const insertRecordingSchema = recordingSchema.omit({ id: true });
export const insertMeasurementSchema = measurementSchema.omit({ id: true });

// Types
export type Recording = z.infer<typeof recordingSchema>;
export type InsertRecording = z.infer<typeof insertRecordingSchema>;
export type Measurement = z.infer<typeof measurementSchema>;
export type InsertMeasurement = z.infer<typeof insertMeasurementSchema>;