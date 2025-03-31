import { 
  type Recording, 
  type InsertRecording, 
  type Measurement, 
  type InsertMeasurement 
} from "@shared/schema";

// Interface for storage operations
export interface IStorage {
  // Recording operations
  getAllRecordings(): Promise<Recording[]>;
  getRecording(id: number): Promise<Recording | undefined>;
  createRecording(recording: InsertRecording): Promise<Recording>;
  
  // Measurement operations
  getMeasurementsByRecordingId(recordingId: number): Promise<Measurement[]>;
  createMeasurement(measurement: InsertMeasurement): Promise<Measurement>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private recordings: Map<number, Recording>;
  private measurements: Map<number, Measurement>;
  private recordingIdCounter: number;
  private measurementIdCounter: number;
  
  constructor() {
    this.recordings = new Map();
    this.measurements = new Map();
    this.recordingIdCounter = 1;
    this.measurementIdCounter = 1;
  }
  
  // Recording methods
  async getAllRecordings(): Promise<Recording[]> {
    return Array.from(this.recordings.values());
  }
  
  async getRecording(id: number): Promise<Recording | undefined> {
    return this.recordings.get(id);
  }
  
  async createRecording(recordingData: InsertRecording): Promise<Recording> {
    const id = this.recordingIdCounter++;
    const recording: Recording = { ...recordingData, id };
    this.recordings.set(id, recording);
    return recording;
  }
  
  // Measurement methods
  async getMeasurementsByRecordingId(recordingId: number): Promise<Measurement[]> {
    return Array.from(this.measurements.values()).filter(
      measurement => measurement.recordingId === recordingId
    );
  }
  
  async createMeasurement(measurementData: InsertMeasurement): Promise<Measurement> {
    const id = this.measurementIdCounter++;
    const measurement: Measurement = { ...measurementData, id };
    this.measurements.set(id, measurement);
    return measurement;
  }
}

// Export storage instance
export const storage = new MemStorage();
