import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertRecordingSchema, insertMeasurementSchema } from "@shared/schema";
import { ZodError } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // API route prefix
  const apiRouter = app.route('/api');
  
  // Get all recordings
  app.get('/api/recordings', async (req, res) => {
    try {
      const recordings = await storage.getAllRecordings();
      res.json(recordings);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch recordings' });
    }
  });
  
  // Get a single recording by ID
  app.get('/api/recordings/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid ID format' });
      }
      
      const recording = await storage.getRecording(id);
      if (!recording) {
        return res.status(404).json({ error: 'Recording not found' });
      }
      
      res.json(recording);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch recording' });
    }
  });
  
  // Create a new recording
  app.post('/api/recordings', async (req, res) => {
    try {
      const recordingData = insertRecordingSchema.parse(req.body);
      const newRecording = await storage.createRecording(recordingData);
      res.status(201).json(newRecording);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: 'Invalid recording data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to create recording' });
    }
  });
  
  // Get measurements for a recording
  app.get('/api/recordings/:id/measurements', async (req, res) => {
    try {
      const recordingId = parseInt(req.params.id);
      if (isNaN(recordingId)) {
        return res.status(400).json({ error: 'Invalid ID format' });
      }
      
      const measurements = await storage.getMeasurementsByRecordingId(recordingId);
      res.json(measurements);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch measurements' });
    }
  });
  
  // Add measurements to a recording
  app.post('/api/recordings/:id/measurements', async (req, res) => {
    try {
      const recordingId = parseInt(req.params.id);
      if (isNaN(recordingId)) {
        return res.status(400).json({ error: 'Invalid ID format' });
      }
      
      const recording = await storage.getRecording(recordingId);
      if (!recording) {
        return res.status(404).json({ error: 'Recording not found' });
      }
      
      const measurementData = {
        ...req.body,
        recordingId
      };
      
      const validatedData = insertMeasurementSchema.parse(measurementData);
      const newMeasurement = await storage.createMeasurement(validatedData);
      
      res.status(201).json(newMeasurement);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: 'Invalid measurement data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to create measurement' });
    }
  });
  
  // Create HTTP server
  const httpServer = createServer(app);
  
  return httpServer;
}
