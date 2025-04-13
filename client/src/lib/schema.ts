import { z } from 'zod';

// Define base schemas for our data models
export const recordingSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().optional(),
  date: z.string().datetime(),
  duration: z.number().optional(),
});

export const measurementSchema = z.object({
  id: z.number(),
  recordingId: z.number(),
  time: z.string(),
  intervalMs: z.number(),
  frequency: z.number(),
  deviation: z.number(),
  previousIntervalMs: z.number().optional(),
  changeFromPrevious: z.number().optional(),
});

// Define insert schemas (excluding auto-generated fields)
export const insertRecordingSchema = recordingSchema.omit({ id: true });
export const insertMeasurementSchema = measurementSchema.omit({ id: true });

// Export types
export type Recording = z.infer<typeof recordingSchema>;
export type InsertRecording = z.infer<typeof insertRecordingSchema>;
export type Measurement = z.infer<typeof measurementSchema>;
export type InsertMeasurement = z.infer<typeof insertMeasurementSchema>;

// Also define the DetectedSound interface used in the audio processing
export interface DetectedSound {
  type: "pulse"; // Using a single type for all clock sounds
  timestamp: number;
  magnitude: number;
}